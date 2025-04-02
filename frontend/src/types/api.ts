// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role: 'student' | 'admin';
  status: UserStatus;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  content: {
    posts: number;
    comments: number;
    communities: number;
    reports: number;
  };
  engagement: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface CommunityResponse {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: number;
  topics: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostResponse {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  likes: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  id: string;
  type: 'post_like' | 'post_comment' | 'follow' | 'community_invite';
  message: string;
  read: boolean;
  actor: {
    id: string;
    name: string;
    avatar?: string;
  };
  target?: {
    id: string;
    type: string;
    title?: string;
  };
  createdAt: string;
}

export interface ActivityResponse {
  id: string;
  type: 'post_created' | 'post_liked' | 'community_joined' | 'comment_added';
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  details: {
    targetId: string;
    targetType: string;
    title?: string;
    content?: string;
  };
  createdAt: string;
}
