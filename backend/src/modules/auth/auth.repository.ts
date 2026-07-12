import pool from '../../config/database.js';
import type { User } from './types.js';

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    'SELECT * FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function updateLastLogin(userId: string): Promise<void> {
  await pool.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [userId]
  );
}

export async function updatePassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  await pool.query(
    `UPDATE users
        SET password_hash = $1,
            must_change_password = FALSE,
            password_changed_at = NOW(),
            updated_at = NOW()
      WHERE id = $2`,
    [passwordHash, userId]
  );
}

export async function updateVerificationToken(
  userId: string,
  tokenHash: string,
  expiresAt: string
): Promise<void> {
  await pool.query(
    `UPDATE users
        SET email_verification_token = $1,
            email_verification_expires_at = $2,
            updated_at = NOW()
      WHERE id = $3`,
    [tokenHash, expiresAt, userId]
  );
}

export async function findUserByVerificationToken(tokenHash: string): Promise<User | null> {
  const result = await pool.query<User>(
    `SELECT * FROM users
      WHERE email_verification_token = $1
        AND email_verification_expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

export async function verifyUserEmail(userId: string): Promise<void> {
  await pool.query(
    `UPDATE users
        SET email_verified = TRUE,
            email_verified_at = NOW(),
            email_verification_token = NULL,
            email_verification_expires_at = NULL,
            updated_at = NOW()
      WHERE id = $1`,
    [userId]
  );
}

export async function insertUser(params: {
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
  role: string;
  createdBy: string | null;
  mustChangePassword: boolean;
  verificationTokenHash: string | null;
  verificationExpiresAt: Date | null;
}): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash, full_name, phone, role, created_by,
                        must_change_password,
                        email_verification_token, email_verification_expires_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      params.email,
      params.passwordHash,
      params.fullName,
      params.phone,
      params.role,
      params.createdBy,
      params.mustChangePassword,
      params.verificationTokenHash,
      params.verificationExpiresAt,
    ]
  );
  return result.rows[0];
}

export async function insertDriver(params: {
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseType: string;
  hireDate: string;
}): Promise<void> {
  await pool.query(
    `INSERT INTO drivers (user_id, license_number, license_expiry, license_type, status, hire_date)
     VALUES ($1, $2, $3, $4, 'available', $5)`,
    [
      params.userId,
      params.licenseNumber,
      params.licenseExpiry,
      params.licenseType,
      params.hireDate,
    ]
  );
}


