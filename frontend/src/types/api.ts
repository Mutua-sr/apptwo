import axios from 'axios';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  profileId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface Student extends Member {
  grade?: string;
  enrollmentDate?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  status: 'draft' | 'published' | 'archived';
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link';
  url: string;
  uploadedAt: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'assignment' | 'event';
}

export interface Community {
  _id: string;
  type: 'community';
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdBy: string;
  createdAt: string;
  unreadCount?: number;
  lastMessage?: string;
  members: Member[];
  settings: {
    isPrivate: boolean;
    requiresApproval: boolean;
    allowPosts: boolean;
    allowEvents: boolean;
    allowPolls: boolean;
  };
}

export interface Classroom {
  _id: string;
  type: 'classroom';
  name: string;
  description: string;
  code: string;
  avatar?: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdBy: string;
  createdAt: string;
  unreadCount?: number;
  lastMessage?: string;
  students: Student[];
  assignments: Assignment[];
  materials: Material[];
  schedule: ScheduleEvent[];
  settings: {
    allowStudentPosts: boolean;
    allowStudentComments: boolean;
    notifications: {
      assignments: boolean;
      materials: boolean;
      announcements: boolean;
    };
  };
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  createdBy: string;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  likes: number;
  comments: Comment[];
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  likedBy: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface CreateClassroomData {
  name: string;
  description: string;
  code?: string;
  settings?: {
    allowStudentPosts?: boolean;
    allowStudentComments?: boolean;
    notifications?: {
      assignments?: boolean;
      materials?: boolean;
      announcements?: boolean;
    };
  };
}

export interface CreateCommunityData {
  name: string;
  description: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowPosts?: boolean;
    allowEvents?: boolean;
    allowPolls?: boolean;
  };
}

export interface UpdateClassroomData {
  name?: string;
  description?: string;
  settings?: {
    allowStudentPosts?: boolean;
    allowStudentComments?: boolean;
    notifications?: {
      assignments?: boolean;
      materials?: boolean;
      announcements?: boolean;
    };
  };
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowPosts?: boolean;
    allowEvents?: boolean;
    allowPolls?: boolean;
  };
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowPosts?: boolean;
    allowEvents?: boolean;
    allowPolls?: boolean;
  };
}