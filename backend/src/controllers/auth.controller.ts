import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../services/database';
import { ApiError } from '../middleware/errorHandler';
import { AuthRequest, User, CreateUser, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    const users = await DatabaseService.find<User>({
      selector: {
        type: 'user',
        email
      }
    });

    const user = users[0];

    if (!user || user.password !== password) {
      const error = new Error('Invalid email or password') as ApiError;
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      const error = new Error('Email, password, and name are required') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    const existingUsers = await DatabaseService.find<User>({
      selector: {
        type: 'user',
        email
      }
    });

    if (existingUsers.length > 0) {
      const error = new Error('Email already exists') as ApiError;
      error.statusCode = 400;
      throw error;
    }

    const userData: CreateUser = {
      type: 'user',
      email,
      password,
      name,
      role: UserRole.STUDENT // Default role for new users
    };

    const user = await DatabaseService.create<User>(userData);

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};