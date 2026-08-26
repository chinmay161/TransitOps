import type { NextFunction, Response } from 'express';
import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';
import type { AuthRequest } from './types.js';

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
