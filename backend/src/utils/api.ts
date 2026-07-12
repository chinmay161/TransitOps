import { Response } from "express";

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: Record<string, unknown>,
) {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(res: Response, statusCode: number, message: string) {
  res.status(statusCode).json({
    success: false,
    message,
  });
}
