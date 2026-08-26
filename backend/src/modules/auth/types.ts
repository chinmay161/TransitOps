import { Request } from 'express';

export type UserRole = 'admin' | 'fleet_manager' | 'dispatcher' | 'driver' | 'pending';

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  email: string;
  driver_id?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Shape returned by Better Auth session lookups for the TransitOps user model.
export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive?: boolean | null;
}

// Public projection of a users row (no credentials/secrets). Legacy password
// and email-verification columns are deliberately excluded from the API.
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  email_verified: boolean;
  is_active: boolean;
  last_login: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
