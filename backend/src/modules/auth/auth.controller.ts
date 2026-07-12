import { Response, NextFunction, Request } from 'express';
import {
  loginSchema,
  changePasswordSchema,
  verifyEmailSchema,
  createFleetManagerSchema,
  registerDriverSchema,
  registerDispatcherSchema,
} from './auth.validation.js';
import * as authService from './auth.service.js';
import { signToken } from './jwt.js';
import { sendSuccess } from '../../utils/response.js';
import type { AuthRequest } from './types.js';
import { AppError } from '../../utils/AppError.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000,
};

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await authService.login(email, password);

    if ('mustChangePassword' in result) {
      return sendSuccess(res, { mustChangePassword: true });
    }

    const token = signToken(result.user);

    res.cookie('access_token', token, COOKIE_OPTIONS);

    return sendSuccess(res, {
      user: result.response.user,
      mustChangePassword: false,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: AuthRequest, res: Response) {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return sendSuccess(res, { message: 'Logged out successfully' });
}

export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    await authService.changePassword(req.user!.userId, currentPassword, newPassword);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return sendSuccess(res, { message: 'Password changed successfully. Please log in again.' });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { token } = verifyEmailSchema.parse(req.query);

    await authService.verifyEmail(token);

    return sendSuccess(res, { message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId);
    return sendSuccess(res, { user });
  } catch (err) {
    next(err);
  }
}

// Admin creates Fleet Manager account with temporary password
export async function createFleetManager(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const input = createFleetManagerSchema.parse(req.body);
    const result = await authService.createFleetManager(input, req.user!.userId);
    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// Driver self-registration
export async function registerDriver(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    console.log('[1] Register request received');
    const input = registerDriverSchema.parse(req.body);
    const result = await authService.registerDriver(input);
    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// Dispatcher self-registration
export async function registerDispatcher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    console.log('[1] Register request received');
    const input = registerDispatcherSchema.parse(req.body);
    const result = await authService.registerDispatcher(input);
    return sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// Development-only email verification simulator
export async function devVerifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      throw new AppError(403, 'FORBIDDEN', 'This endpoint is only available in development mode');
    }
    const { email } = req.body;
    if (!email) {
      throw new AppError(400, 'BAD_REQUEST', 'Email is required');
    }
    await authService.devVerifyEmail(email);
    return sendSuccess(res, { message: 'Email verified (Development Mode)' }, 200);
  } catch (err) {
    next(err);
  }
}
