import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler';
import { AuthRequest, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 's3cureR@nd0mStr1ngF0rJWT';

export const auth = async (
  req: AuthRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Received token:', token); // Log the received token

    if (!token) {
      const error = new Error('Authentication required') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      profileId: string;
      email: string;
      name: string;
      role: UserRole;
    };

    req.user = {
      id: decoded.id,
      profileId: decoded.profileId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role
    };
    next();
  } catch (error) {
    const apiError = new Error('Please authenticate') as ApiError;
    apiError.statusCode = 401;
    next(apiError);
  }
};