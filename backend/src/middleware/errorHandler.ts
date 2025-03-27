import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message, statusCode, code || 'DATABASE_ERROR', details);
    this.name = 'DatabaseError';
  }
}

export const notFound = (req: Request, _: Response, next: NextFunction) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

export const errorHandler = (err: ApiError, req: Request, res: Response, _: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const details = err.details;

  // Log error
  logger.error('Error:', {
    path: req.path,
    statusCode,
    message,
    code,
    details,
    stack: err.stack
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};