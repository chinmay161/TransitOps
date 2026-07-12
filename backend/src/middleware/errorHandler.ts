import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(res, 422, 'VALIDATION_ERROR', 'Validation failed', details);
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'UNAUTHORIZED', 'Token expired');
  }

  console.error('Unhandled error:', err);
  return sendError(res, 500, 'INTERNAL_ERROR', 'An unexpected error occurred');
}
