import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DatabaseService } from '../services/database';
import { ApiError } from '../middleware/errorHandler';
import { User, CreateUser, UserRole } from '../types';
import { UserProfile } from '../types/profile';

interface AuthenticatedRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RegisterRequest extends AuthenticatedRequest {
  body: {
    email: string;
    password: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (
  req: AuthenticatedRequest,
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

    // Find or create profile
    const profiles = await DatabaseService.find<any>({
      selector: {
        type: 'profile',
        userId: user._id
      }
    });

    let profile = profiles[0];
    
    if (!profile) {
      // Create profile if it doesn't exist
      const newProfileData: Omit<UserProfile, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
        type: 'profile',
        userId: user._id,
        username: email.split('@')[0],
        email: user.email,
        name: user.name,
        role: user.role,
        settings: {
          notifications: {
            email: true,
            push: true,
            inApp: true
          },
          privacy: {
            showEmail: false,
            showActivity: true,
            allowMessages: true
          },
          theme: 'light',
          language: 'en'
        },
        stats: {
          posts: 0,
          communities: 0,
          classrooms: 0,
          lastActive: new Date().toISOString()
        }
      };
      profile = await DatabaseService.create<UserProfile>(newProfileData);
    }

    const token = jwt.sign(
      {
        id: user._id,
        profileId: profile._id,
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
          profileId: profile._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: profile.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: RegisterRequest,
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

    // Create associated profile document
    const newProfileData: Omit<UserProfile, '_id' | '_rev' | 'createdAt' | 'updatedAt'> = {
      type: 'profile',
      userId: user._id,
      username: email.split('@')[0],
      email,
      name,
      role: UserRole.STUDENT,
      settings: {
        notifications: {
          email: true,
          push: true,
          inApp: true
        },
        privacy: {
          showEmail: false,
          showActivity: true,
          allowMessages: true
        },
        theme: 'light',
        language: 'en'
      },
      stats: {
        posts: 0,
        communities: 0,
        classrooms: 0,
        lastActive: new Date().toISOString()
      }
    };

    const profile = await DatabaseService.create<UserProfile>(newProfileData);

    const token = jwt.sign(
      {
        id: user._id,
        profileId: profile._id,
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
          profileId: profile._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: profile.avatar
        }
      }
    });
  } catch (error) {
    next(error);
  }
};