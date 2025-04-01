export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin';
  status: UserStatus;
  profileId: string;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';

export interface Profile {
  id: string;
  userId: string;
  bio: string;
  location: string;
  website: string;
  avatar?: string;
  interests: string[];
  settings: ProfileSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  privacy: {
    profileVisibility: 'public' | 'private' | 'connections';
    showEmail: boolean;
    showLocation: boolean;
  };
}

export interface UpdateProfileData {
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  interests?: string[];
  settings?: ProfileSettings;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
