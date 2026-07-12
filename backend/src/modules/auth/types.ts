import { Request } from 'express';

export type UserRole = 'admin' | 'fleet_manager' | 'dispatcher' | 'driver';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  must_change_password: boolean;
  password_changed_at: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  email_verification_token: string | null;
  email_verification_expires_at: string | null;
  is_active: boolean;
  last_login: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash' | 'email_verification_token' | 'email_verification_expires_at'>;
  mustChangePassword: boolean;
}
