import crypto from 'node:crypto';
import { hashPassword, comparePassword } from './password.js';
import { sendVerificationEmail } from './resend.js';
import { AppError } from '../../utils/AppError.js';
import type { User, AuthenticatedUser, LoginResponse } from './types.js';
import * as repo from './auth.repository.js';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateVerificationToken(): { raw: string; hash: string; expiresAt: Date } {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = hashToken(raw);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { raw, hash, expiresAt };
}

function safeUser(user: User): Omit<User, 'password_hash' | 'email_verification_token' | 'email_verification_expires_at'> {
  const { password_hash: _, email_verification_token: __, email_verification_expires_at: ___, ...safe } = user;
  return safe;
}

export async function login(
  email: string,
  password: string
): Promise<{ response: LoginResponse; user: AuthenticatedUser } | { mustChangePassword: true }> {
  const user = await repo.findUserByEmail(email);

  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  if (!user.is_active) {
    throw new AppError(401, 'UNAUTHORIZED', 'Account has been deactivated');
  }

  if (!user.email_verified) {
    throw new AppError(401, 'UNAUTHORIZED', 'Email not verified. Please check your inbox.');
  }

  const passwordValid = await comparePassword(password, user.password_hash);
  if (!passwordValid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid email or password');
  }

  if (user.must_change_password) {
    return { mustChangePassword: true };
  }

  await repo.updateLastLogin(user.id);

  return {
    response: { user: safeUser(user), mustChangePassword: false },
    user: { userId: user.id, role: user.role, email: user.email },
  };
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  const passwordValid = await comparePassword(currentPassword, user.password_hash);
  if (!passwordValid) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Current password is incorrect');
  }

  const samePassword = await comparePassword(newPassword, user.password_hash);
  if (samePassword) {
    throw new AppError(400, 'VALIDATION_ERROR', 'New password must be different from current password');
  }

  const newHash = await hashPassword(newPassword);
  await repo.updatePassword(userId, newHash);
}

export async function createEmailVerification(userId: string): Promise<string> {
  const { raw, hash, expiresAt } = generateVerificationToken();
  await repo.updateVerificationToken(userId, hash, expiresAt.toISOString());
  return raw;
}

export async function verifyEmail(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  const user = await repo.findUserByVerificationToken(tokenHash);

  if (!user) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid or expired verification token');
  }

  await repo.verifyUserEmail(user.id);
}

export async function getMe(userId: string): Promise<Omit<User, 'password_hash' | 'email_verification_token' | 'email_verification_expires_at'>> {
  const user = await repo.findUserById(userId);
  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }
  return safeUser(user);
}

// Admin creates account — user receives temp password, must change on first login
async function createUserAccount(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string | null;
  role: string;
  createdById: string;
}): Promise<{ user: User; rawVerificationToken: string }> {
  const existing = await repo.findUserByEmail(params.email);
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'A user with this email already exists');
  }

  const passwordHash = await hashPassword(params.password);
  const { raw, hash, expiresAt } = generateVerificationToken();

  const user = await repo.insertUser({
    email: params.email,
    passwordHash,
    fullName: params.fullName,
    phone: params.phone,
    role: params.role,
    createdBy: params.createdById,
    mustChangePassword: true,
    verificationTokenHash: hash,
    verificationExpiresAt: expiresAt,
  });

  return { user, rawVerificationToken: raw };
}

export async function createFleetManager(
  input: { email: string; password: string; fullName: string; phone: string | null },
  createdById: string
): Promise<{ user: Omit<User, 'password_hash' | 'email_verification_token' | 'email_verification_expires_at'> }> {
  const { user, rawVerificationToken } = await createUserAccount({
    ...input,
    role: 'fleet_manager',
    createdById,
  });

  await sendVerificationEmail({
    to: user.email,
    fullName: user.full_name,
    token: rawVerificationToken,
  });

  return { user: safeUser(user) };
}

// Self-registration — user provides their own password, must verify email before login
async function selfRegisterAccount(params: {
  email: string;
  password: string;
  fullName: string;
  phone: string | null;
  role: string;
}): Promise<{ user: User; rawVerificationToken: string }> {
  const existing = await repo.findUserByEmail(params.email);
  if (existing) {
    throw new AppError(409, 'CONFLICT', 'A user with this email already exists');
  }

  const passwordHash = await hashPassword(params.password);
  const { raw, hash, expiresAt } = generateVerificationToken();

  const user = await repo.insertUser({
    email: params.email,
    passwordHash,
    fullName: params.fullName,
    phone: params.phone,
    role: params.role,
    createdBy: null,
    mustChangePassword: false,
    verificationTokenHash: hash,
    verificationExpiresAt: expiresAt,
  });

  return { user, rawVerificationToken: raw };
}

export async function registerDispatcher(
  input: { email: string; password: string; fullName: string; phone: string | null }
): Promise<{ user: Omit<User, 'password_hash' | 'email_verification_token' | 'email_verification_expires_at'> }> {
  const { user, rawVerificationToken } = await selfRegisterAccount({
    ...input,
    role: 'dispatcher',
  });

  await sendVerificationEmail({
    to: user.email,
    fullName: user.full_name,
    token: rawVerificationToken,
  });

  return { user: safeUser(user) };
}

export async function registerDriver(
  input: { email: string; password: string; fullName: string; phone: string | null }
): Promise<{ user: Omit<User, 'password_hash' | 'email_verification_token' | 'email_verification_expires_at'> }> {
  const { user, rawVerificationToken } = await selfRegisterAccount({
    ...input,
    role: 'driver',
  });

  const licenseNumber = `TEMP-${user.id.substring(0, 8).toUpperCase()}`;
  const licenseExpiry = new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const hireDate = new Date().toISOString().split('T')[0];

  await repo.insertDriver({
    userId: user.id,
    licenseNumber,
    licenseExpiry,
    licenseType: 'Standard',
    hireDate,
  });

  await sendVerificationEmail({
    to: user.email,
    fullName: user.full_name,
    token: rawVerificationToken,
  });

  return { user: safeUser(user) };
}
