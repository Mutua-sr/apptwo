import { Community, Classroom, CreateClassroomData, CreateCommunityData, UpdateClassroomData, UpdateCommunityData } from './room';

export type { Community, Classroom, CreateClassroomData, CreateCommunityData, UpdateClassroomData, UpdateCommunityData };

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  status: UserStatus;
  lastActive?: string;
  profileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface ApiComment {
  _id: string;
  content: string;
  author: ApiUser;
  likes: number;
  createdAt: string;
}

export interface Post {
  _id: string;
  content: string;
  author: ApiUser;
  createdBy: string;
  tags?: string[];
  likedBy?: string[];
  comments?: ApiComment[];
  createdAt: string;
  updatedAt?: string;
  likes: number;
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
}

export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
  interests?: string[];
  education?: {
    school: string;
    degree: string;
    fieldOfStudy: string;
    from: string;
    to?: string;
  }[];
  experience?: {
    title: string;
    company: string;
    location: string;
    from: string;
    to?: string;
    current: boolean;
    description?: string;
  }[];
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    privacy: {
      profileVisibility: 'public' | 'private' | 'connections';
      showEmail: boolean;
      showLocation: boolean;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
  interests?: string[];
  education?: Profile['education'];
  experience?: Profile['experience'];
  socialLinks?: Profile['socialLinks'];
  settings?: Partial<Profile['settings']>;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}
