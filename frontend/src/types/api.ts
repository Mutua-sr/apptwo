export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
  lastActive?: string;
  status: 'active' | 'suspended' | 'banned';
}

export interface Community {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  type: 'community';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  members: string[];
  settings?: {
    isPrivate: boolean;
    requiresApproval: boolean;
    allowInvites: boolean;
  };
}

export interface Classroom {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  type: 'classroom';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  students: string[];
  teachers: string[];
  settings?: {
    allowStudentChat: boolean;
    allowStudentPosts: boolean;
    requirePostApproval: boolean;
  };
}

export interface Post {
  _id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  roomId: string;
  roomType: 'classroom' | 'community';
  createdAt: string;
  updatedAt: string;
  likes: string[];
  comments: Comment[];
  attachments?: {
    type: 'image' | 'video' | 'file';
    url: string;
    name: string;
  }[];
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
  likes: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface CreateClassroomData {
  name: string;
  description?: string;
  settings?: {
    allowStudentChat: boolean;
    allowStudentPosts: boolean;
    requirePostApproval: boolean;
  };
}

export interface UpdateClassroomData {
  name?: string;
  description?: string;
  settings?: {
    allowStudentChat?: boolean;
    allowStudentPosts?: boolean;
    requirePostApproval?: boolean;
  };
}

export interface CreateCommunityData {
  name: string;
  description?: string;
  settings?: {
    isPrivate: boolean;
    requiresApproval: boolean;
    allowInvites: boolean;
  };
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowInvites?: boolean;
  };
}