export interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
  social: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
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
  stats: {
    posts: number;
    communities: number;
    classrooms: number;
    lastActive: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  username?: string;
  bio?: string;
  avatar?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
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
}

export interface ProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}