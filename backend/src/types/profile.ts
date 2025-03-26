import { CouchDBDocument } from './index';

export interface UserProfile extends CouchDBDocument {
  type: 'profile';
  userId: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  role: 'student' | 'teacher' | 'admin';
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
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  stats: {
    posts: number;
    communities: number;
    classrooms: number;
    lastActive: string;
  };
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  education?: {
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
  }[];
  skills?: string[];
  interests?: string[];
  achievements?: {
    id: string;
    title: string;
    description: string;
    date: string;
    badge?: string;
  }[];
}

export interface Activity extends CouchDBDocument {
  type: 'activity';
  userId: string;
  activityType: 'post' | 'comment' | 'like' | 'share' | 'join' | 'assignment' | 'material';
  action: 'created' | 'updated' | 'deleted' | 'completed';
  targetType: 'post' | 'community' | 'classroom' | 'assignment' | 'material';
  targetId: string;
  metadata?: {
    title?: string;
    description?: string;
    grade?: number;
    status?: string;
  };
  timestamp: string;
}

export interface Notification extends CouchDBDocument {
  type: 'notification';
  userId: string;
  notificationType: 'mention' | 'reply' | 'like' | 'follow' | 'assignment' | 'grade' | 'announcement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
}

export interface MediaUpload extends CouchDBDocument {
  type: 'media';
  userId: string;
  mediaType: 'image' | 'document' | 'video';
  filename: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
  uploadedAt: string;
}

export interface UpdateProfile {
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  settings?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
    privacy?: {
      showEmail?: boolean;
      showActivity?: boolean;
      allowMessages?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
    language?: string;
  };
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  education?: {
    institution: string;
    degree: string;
    field: string;
    startYear: number;
    endYear?: number;
  }[];
  skills?: string[];
  interests?: string[];
}

export interface FileUploadRequest {
  file: Express.Multer.File;
  userId: string;
  type: 'avatar' | 'attachment' | 'material';
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
  };
}

export interface FileUploadResponse {
  success: boolean;
  data: MediaUpload;
  error?: string;
}