import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';
import { ApiError } from '../utils/api.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (res.headersSent) {
    return _next(err);
  }

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

  if (err instanceof ApiError) {
    return sendError(res, err.statusCode, 'BAD_REQUEST', err.message);
  }

  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'UNAUTHORIZED', 'Authentication token has expired');
  }

  if (err.code && typeof err.code === 'string') {
    switch (err.code) {
      case '23505':
        return sendError(res, 409, 'DUPLICATE_KEY', 'A record with this information already exists.');
      case '23503':
        return sendError(res, 409, 'FOREIGN_KEY_VIOLATION', 'Referenced record does not exist or is currently in use.');
      case '22P02':
        return sendError(res, 400, 'INVALID_SYNTAX', 'Invalid data format or ID parameter provided.');
      case '23514':
        return sendError(res, 422, 'CHECK_VIOLATION', 'The operation violates a data constraint.');
    }
  }

  console.error('[Unhandled Error]', err);
  const message = err.message || 'An unexpected error occurred';
  return sendError(res, 500, 'INTERNAL_ERROR', message);
}
