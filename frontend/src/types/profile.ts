// Profile Types
export interface UserProfile {
  _id: string;
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

export interface UpdateProfileData {
  username?: string;
  name?: string;
  avatar?: string;
  bio?: string;
  settings?: {
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

export interface MediaUpload {
  _id: string;
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