import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { Multer } from 'multer';

export interface CouchDBDocument {
  _id: string;
  _rev: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

// Extend Express Request to include Multer's file
declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
    }
  }
}

export interface JWTPayload extends JwtPayload {
  userId: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface MangoQuery {
  selector: {
    [key: string]: any;
  };
  limit?: number;
  skip?: number;
  sort?: { [key: string]: 'asc' | 'desc' }[];
}

export interface SortOrder {
  [key: string]: 'asc' | 'desc';
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

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

// Database service types
export interface DatabaseConfig {
  url: string;
  dbName: string;
  username?: string;
  password?: string;
}

export interface QueryOptions {
  skip?: number;
  limit?: number;
  sort?: SortOrder[];
}

// WebSocket types
export interface WebSocketEvent<T = any> {
  type: string;
  payload: T;
  timestamp: string;
  sender?: {
    id: string;
    name: string;
  };
}

export interface WebSocketRoom {
  id: string;
  name: string;
  type: 'chat' | 'classroom' | 'community';
  participants: string[];
}

// File handling types
export interface FileMetadata {
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  destination: string;
  originalname: string;
  encoding: string;
}

export interface UploadedFile extends FileMetadata {
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Error handling types
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