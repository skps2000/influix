import { Request, Response, NextFunction } from 'express';
import type { ApiError } from '@influix/types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Error]', err);

  if (err instanceof AppError) {
    const errorResponse: { success: false; error: ApiError } = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(errorResponse);
    return;
  }

  // Unknown error
  const errorResponse: { success: false; error: ApiError } = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  };
  res.status(500).json(errorResponse);
}

// Common error factories
export const Errors = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message = 'Forbidden') =>
    new AppError(message, 403, 'FORBIDDEN'),
  
  notFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, 404, 'NOT_FOUND'),
  
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError(message, 400, 'BAD_REQUEST', details),
  
  conflict: (message: string) =>
    new AppError(message, 409, 'CONFLICT'),
  
  validation: (errors: Record<string, string>) =>
    new AppError('Validation failed', 400, 'VALIDATION_ERROR', { errors }),
  
  rateLimit: () =>
    new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED'),
};
