import { AxiosRequestConfig } from 'axios';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

// Post Types
export interface Post {
  _id: string;
  type: 'post';
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  likes?: number;
  likedBy?: string[];
  comments?: Comment[];
  tags?: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar?: string;
  likes?: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
  likes?: number;
  comments?: Comment[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

// Classroom Types
export interface Classroom {
  _id: string;
  type: 'classroom';
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  members?: string[];
}

export interface CreateClassroomData {
  name: string;
  description?: string;
}

export interface UpdateClassroomData {
  name?: string;
  description?: string;
}

// Community Types
export interface Community {
  _id: string;
  type: 'community';
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  members?: string[];
}

export interface CreateCommunityData {
  name: string;
  description?: string;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
}

// Query Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SearchQuery extends PaginationQuery {
  q: string;
}