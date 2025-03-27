import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

// Base document type for CouchDB
export interface CouchDBDocument {
  _id: string;
  _rev: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface User extends CouchDBDocument {
  type: 'user';
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
}

export interface CreateUser {
  type: 'user';
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JWTPayload extends JwtPayload {
  userId: string;
  role: UserRole;
}

// Database query types
export interface MangoQuery {
  selector: {
    [key: string]: any;
  };
  limit?: number;
  skip?: number;
  sort?: SortOrder[];
}

export interface SortOrder {
  [key: string]: 'asc' | 'desc';
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  skip?: number;
  sort?: SortOrder[];
  search?: string;
}

// GraphQL Context
export interface Context {
  user?: AuthUser;
}

// Re-export types from other files
export * from './classroom';
export * from './community';
export * from './feed';
export * from './chat';
export * from './profile';
export * from './video';
export * from './webrtc';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Error types
export interface ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Role type
export type UserRole = 'student' | 'teacher' | 'admin';

// Role enum
export const UserRole = {
  STUDENT: 'student' as UserRole,
  TEACHER: 'teacher' as UserRole,
  ADMIN: 'admin' as UserRole
};