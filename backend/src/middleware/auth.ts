import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { AuthRequest, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const auth = async (
  req: AuthRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      const error = new Error('Authentication required') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };

    req.user = decoded;
    next();
  } catch (error) {
    const apiError = new Error('Please authenticate') as ApiError;
    apiError.statusCode = 401;
    next(apiError);
  }
};