import { Response, NextFunction } from 'express';
import { verifyToken } from './jwt.js';
import { sendError } from '../../utils/response.js';
import type { AuthRequest, UserRole } from './types.js';
import pool from '../../config/database.js';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.access_token;

  if (!token) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Authentication required');
  }

  try {
    const decoded = verifyToken(token);
    req.user = { userId: decoded.userId, role: decoded.role, email: decoded.email };
    next();
  } catch {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or expired token');
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

    try {
      // Fetch role permissions from database
      const settingsResult = await pool.query('SELECT role_permissions FROM admin_settings LIMIT 1');
      if (settingsResult.rowCount === 0) {
        return sendError(res, 500, 'INTERNAL_SERVER_ERROR', 'Admin settings not initialized');
      }

      const rolePermissions = settingsResult.rows[0].role_permissions;
      const allowedModules = rolePermissions[role] || [];

      if (allowedModules.includes('all') || allowedModules.includes(moduleName)) {
        return next();
      }

      return sendError(res, 403, 'FORBIDDEN', 'Insufficient permissions to access this module');
    } catch (error: any) {
      return sendError(res, 500, 'INTERNAL_SERVER_ERROR', error.message);
    }
  };
}
