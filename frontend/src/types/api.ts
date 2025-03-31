export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Member {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface Student {
  id: string;
  name: string;
  avatar?: string;
  status: 'active' | 'inactive';
  joinedAt: string;
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
  members: Member[];
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
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  points: number;
  attachments: string[];
  submissions: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  studentId: string;
  submittedAt: string;
  files: string[];
  grade?: number;
  feedback?: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: string;
  url: string;
  uploadedAt: string;
  tags: string[];
}

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  recurring?: boolean;
}

export interface Classroom {
  _id: string;
  type: 'classroom';
  name: string;
  description: string;
  code: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  students: Student[];
  assignments: Assignment[];
  materials: Material[];
  schedule: ScheduleEvent[];
  settings: {
    allowStudentPosts: boolean;
    allowStudentComments: boolean;
    isArchived: boolean;
    notifications: {
      assignments: boolean;
      materials: boolean;
      announcements: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreateRoomData {
  name: string;
  description: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowPosts?: boolean;
    allowEvents?: boolean;
    allowPolls?: boolean;
  };
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  settings?: {
    isPrivate?: boolean;
    requiresApproval?: boolean;
    allowPosts?: boolean;
    allowEvents?: boolean;
    allowPolls?: boolean;
  };
}