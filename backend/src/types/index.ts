import { Request } from 'express';

// Base document types
export interface CouchDBDocument {
  _id: string;
  _rev: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export type CreateDocument<T extends CouchDBDocument> = Omit<T, '_id' | '_rev' | 'createdAt' | 'updatedAt'>;

// User types
export interface User extends CouchDBDocument {
  type: 'user';
  email: string;
  name: string;
  password: string;
  avatar?: string;
  role: UserRole;
}

export type CreateUser = CreateDocument<User>;

export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    role?: UserRole;
  };
}

// Classroom types
export interface Classroom extends CouchDBDocument {
  type: 'classroom';
  name: string;
  description?: string;
  instructor: string;
  students: string[];
  topics: string[];
  progress?: number;
  assignments?: number;
  nextClass?: string;
}

export type CreateClassroom = CreateDocument<Classroom>;

// Community types
export interface Community extends CouchDBDocument {
  type: 'community';
  name: string;
  description?: string;
  topics: string[];
  members: string[];
  moderators: string[];
}

export type CreateCommunity = CreateDocument<Community>;

// Post types
export interface Post extends CouchDBDocument {
  type: 'post';
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  likes: number;
  comments: Comment[];
  likedBy: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
  };
}

export type CreatePost = CreateDocument<Post>;

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  likes: number;
}

// Chat types
export interface ChatMessage extends CouchDBDocument {
  type: 'message';
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  roomId: string;
  timestamp: string;
}

export type CreateChatMessage = CreateDocument<ChatMessage>;

export interface ChatRoom extends CouchDBDocument {
  type: 'direct' | 'classroom' | 'community';
  name: string;
  description?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export type CreateChatRoom = CreateDocument<ChatRoom>;