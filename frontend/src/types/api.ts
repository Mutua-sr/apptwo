// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  status: UserStatus;
  profileId?: string;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

export interface Profile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  avatar?: string;
  interests: string[];
  location?: string;
  website?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    github?: string;
  };
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    privacy: {
      profileVisibility: string;
      showLocation: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  token: string;
  user: User;
}

export interface Community {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
  }>;
  settings: {
    isPrivate: boolean;
    allowPosts: boolean;
    requiresApproval: boolean;
  };
  stats: {
    members: number;
    posts: number;
    activeMembers: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  settings: {
    isPrivate: boolean;
    requiresApproval: boolean;
    allowPosts: boolean;
    allowEvents: boolean;
    allowPolls: boolean;
  };
}

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    banned: number;
    suspended: number;
  };
  content: {
    posts: number;
    comments: number;
    communities: number;
    reports: {
      total: number;
      pending: number;
      resolved: number;
    };
  };
  engagement: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    totalInteractions: number;
  };
  system: {
    lastBackup: string;
    storageUsed: number;
    cpuUsage: number;
    memoryUsage: number;
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
  likes: number;
  comments: Array<{
    _id: string;
    content: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    likes: number;
    createdAt: string;
  }>;
  likedBy: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt?: string;
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
