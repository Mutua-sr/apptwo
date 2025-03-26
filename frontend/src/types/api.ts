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

// Classroom Types
export interface Classroom {
  _id: string;
  type: 'classroom';
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateClassroomData {
  name: string;
  description?: string;
}

export interface UpdateClassroomData {
  name?: string;
  description?: string;
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
}

export interface CreatePostData {
  title: string;
  content: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
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
}

export interface CreateCommunityData {
  name: string;
  description?: string;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
}