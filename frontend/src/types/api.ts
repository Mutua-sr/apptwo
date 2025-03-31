export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Community {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  type: 'community';
  lastMessage?: string;
  unreadCount?: number;
  avatar?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface Classroom {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  type: 'classroom';
  lastMessage?: string;
  unreadCount?: number;
  avatar?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
}