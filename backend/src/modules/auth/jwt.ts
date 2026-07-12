import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import type { JwtPayload, AuthenticatedUser } from './types.js';

const EXPIRES_IN = '24h';

export function signToken(user: AuthenticatedUser): string {
  return jwt.sign(
    { userId: user.userId, role: user.role, email: user.email },
    env.JWT_SECRET_KEY,
    { expiresIn: EXPIRES_IN }
  );
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET_KEY) as JwtPayload;
}
