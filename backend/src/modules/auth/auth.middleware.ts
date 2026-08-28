import type { NextFunction, Response } from 'express';
import { fromNodeHeaders } from 'better-auth/node';
import type { AuthRequest, UserRole } from './types.js';
export type { AuthRequest, UserRole };
import { sendError } from '../../utils/response.js';
import { auth } from './better-auth.js';
import pool from '../../config/database.js';

// Validates the Better Auth session cookie and projects it onto req.user with
// the same contract the rest of the app already consumes (userId, role, email).
export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authInstance = await auth;
    const session = await authInstance.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session?.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }

    // Runtime fields provided by Better Auth's mapped TransitOps user model;
    // not always present in the static type inference.
    const sessionUser = session.user as typeof session.user & {
      role?: string | null;
      is_active?: boolean | null;
    };

    if (sessionUser.is_active === false) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Account has been deactivated');
    }

    req.user = {
      userId: sessionUser.id,
      role: sessionUser.role as UserRole,
      email: sessionUser.email,
    };
    next();
  } catch {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired session');
  }
}

export function authorize(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions');
    }

    next();
  };
}

export function authorizeModule(moduleName: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
    }

    const { role } = req.user;

    // Admin role bypasses all checks (has access to everything)
    if (role === 'admin') {
      return next();
    }

    // Safe onboarding role has no module access until an admin assigns one.
    if (role === 'pending') {
      return sendError(res, 403, 'FORBIDDEN', 'Your account is awaiting role assignment');
    }

    try {
      // Fetch role permissions from database
      const settingsResult = await pool.query('SELECT role_permissions FROM admin_settings LIMIT 1');
      if (settingsResult.rowCount === 0) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Admin settings not initialized');
      }

      const rolePermissions = settingsResult.rows[0].role_permissions;
      const allowedModules = rolePermissions[role] || [];

      // Driver role is always granted access to trips (to view assigned trips & start/complete journey)
      if (role === 'driver' && moduleName === 'trips') {
        return next();
      }

      if (allowedModules.includes('all') || allowedModules.includes(moduleName)) {
        return next();
      }

      return sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions to access this module');
    } catch (error: any) {
      return sendError(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
    }
  };
}
