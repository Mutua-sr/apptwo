export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'admin' | 'moderator' | 'member';
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
  members: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
  }[];
  settings: {
    isPrivate: boolean;
    requiresApproval: boolean;
    allowPosts: boolean;
    allowEvents: boolean;
    allowPolls: boolean;
  };
  stats: {
    memberCount: number;
    postCount: number;
    activeMembers: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommunityData {
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowPosts?: boolean;
    allowEvents?: boolean;
    allowPolls?: boolean;
  };
  tags?: string[];
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowPosts?: boolean;
    allowEvents?: boolean;
    allowPolls?: boolean;
  };
  tags?: string[];
}

export interface Classroom {
  _id: string;
  type: 'classroom';
  name: string;
  description: string;
  code: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  students: ClassroomStudent[];
  assignments: Assignment[];
  materials: Material[];
  schedule: ScheduleEvent[];
  settings: ClassroomSettings;
}

export interface ClassroomSettings {
  allowStudentPosts: boolean;
  allowStudentComments: boolean;
  isArchived: boolean;
  notifications: {
    assignments: boolean;
    materials: boolean;
    announcements: boolean;
  };
}

export interface CreateClassroomData {
  name: string;
  description: string;
}

export interface ClassroomStudent {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'inactive';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  studentId: string;
  submittedAt: string;
  files: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  grade?: number;
  feedback?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'other';
  url: string;
  uploadedAt: string;
  tags: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  recurring?: {
    frequency: 'daily' | 'weekly';
    days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  };
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
  createdAt: string;
  updatedAt: string;
  likes: number;
  likedBy?: string[];
  comments: Comment[];
  tags: string[];
  sharedTo?: {
    type: 'classroom' | 'community';
    id: string;
    name: string;
  };
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
  likes: number;
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

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
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

export interface AdminDashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  content: {
    posts: number;
    comments: number;
    reports: number;
  };
  engagement: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
}

export interface AdminSettings {
  general: {
    siteName: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireEmailVerification: boolean;
  };
  content: {
    allowUserUploads: boolean;
    maxUploadSize: number;
    allowedFileTypes: string[];
  };
}

export interface Report {
  _id: string;
  type: 'post' | 'comment' | 'user' | 'community';
  targetId: string;
  reportedBy: string;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    contentPreview?: string;
    reportedUserName?: string;
    communityName?: string;
  };
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
    reports: number;
  };
  engagement: {
    dailyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
}

export interface AdminSettings {
  general: {
    siteName: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    requireEmailVerification: boolean;
  };
  content: {
    allowUserUploads: boolean;
    maxUploadSize: number;
    allowedFileTypes: string[];
  };
}

export interface Report {
  _id: string;
  type: 'post' | 'comment' | 'user' | 'community';
  targetId: string;
  reportedBy: string;
  reason: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  metadata?: {
    contentPreview?: string;
    reportedUserName?: string;
    communityName?: string;
  };
}

export interface ReportFilters {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  type?: 'post' | 'comment' | 'user' | 'community' | 'all';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}
