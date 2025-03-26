import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class DatabaseError extends Error implements ApiError {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'DATABASE_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error values
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = (err as DatabaseError).code || 'INTERNAL_ERROR';
  const details = (err as DatabaseError).details;

  // Log the error
  logger.error(`Error [${code}]: ${message}`);
  if (err.stack) {
    logger.error(err.stack);
  }
  if (details) {
    logger.error('Error details:', details);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ApiError;
  error.statusCode = 404;
  next(error);
};

// Validation error handler
export const validationError = (message: string, details?: any) => {
  const error = new Error(message) as ApiError;
  error.statusCode = 400;
  (error as DatabaseError).code = 'VALIDATION_ERROR';
  (error as DatabaseError).details = details;
  return error;
};

// Authentication error handler
export const authenticationError = (message: string = 'Authentication required') => {
  const error = new Error(message) as ApiError;
  error.statusCode = 401;
  (error as DatabaseError).code = 'AUTHENTICATION_ERROR';
  return error;
};

// Authorization error handler
export const authorizationError = (message: string = 'Not authorized') => {
  const error = new Error(message) as ApiError;
  error.statusCode = 403;
  (error as DatabaseError).code = 'AUTHORIZATION_ERROR';
  return error;
};

// Database error handler
export const databaseError = (
  message: string,
  statusCode: number = 500,
  details?: any
) => {
  return new DatabaseError(message, statusCode, 'DATABASE_ERROR', details);
};

// Not found error handler
export const notFoundError = (resource: string) => {
  const error = new Error(`${resource} not found`) as ApiError;
  error.statusCode = 404;
  (error as DatabaseError).code = 'NOT_FOUND_ERROR';
  return error;
};

// Conflict error handler
export const conflictError = (message: string, details?: any) => {
  const error = new Error(message) as ApiError;
  error.statusCode = 409;
  (error as DatabaseError).code = 'CONFLICT_ERROR';
  (error as DatabaseError).details = details;
  return error;
};