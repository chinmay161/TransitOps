import { Response, NextFunction } from 'express';
import { verifyToken } from './jwt.js';
import { sendError } from '../../utils/response.js';
import type { AuthRequest, UserRole } from './types.js';

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
