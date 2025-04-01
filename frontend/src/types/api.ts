export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  lastActive?: string;
  profileId: string;
  bio?: string;
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      inApp: boolean;
    };
    privacy: {
      showEmail: boolean;
      showActivity: boolean;
      allowMessages: boolean;
    };
    theme: 'light' | 'dark';
    language: string;
  };
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  stats?: {
    posts: number;
    communities: number;
    classrooms: number;
    lastActive: string;
  };
}

export interface Post {
  _id: string;
  content: string;
  createdBy: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  likedBy: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface Classroom {
  _id: string;
  name: string;
  type: 'classroom';
  description?: string;
  teachers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  settings: {
    allowStudentChat: boolean;
    allowStudentPosts: boolean;
    requirePostApproval: boolean;
    isPrivate?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface Community {
  _id: string;
  name: string;
  type: 'community';
  description?: string;
  createdBy: string;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'member' | 'moderator' | 'admin';
  }>;
  settings: {
    isPrivate: boolean;
    requiresApproval: boolean;
    allowInvites: boolean;
    allowStudentChat?: boolean;
    allowStudentPosts?: boolean;
    requirePostApproval?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount?: number;
}

import { CreateRoomData, UpdateRoomData } from './room';
export type { CreateRoomData, UpdateRoomData };
