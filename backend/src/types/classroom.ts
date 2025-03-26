import { CouchDBDocument } from './index';

export interface Classroom extends CouchDBDocument {
  type: 'classroom';
  name: string;
  description: string;
  code: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  students: {
    id: string;
    name: string;
    avatar?: string;
    joinedAt: string;
    status: 'active' | 'inactive';
  }[];
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

export interface CreateClassroom {
  type: 'classroom';
  name: string;
  description: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  settings?: {
    allowStudentPosts?: boolean;
    allowStudentComments?: boolean;
    notifications?: {
      assignments?: boolean;
      materials?: boolean;
      announcements?: boolean;
    };
  };
}

export interface UpdateClassroom {
  name?: string;
  description?: string;
  settings?: {
    allowStudentPosts?: boolean;
    allowStudentComments?: boolean;
    isArchived?: boolean;
    notifications?: {
      assignments?: boolean;
      materials?: boolean;
      announcements?: boolean;
    };
  };
}

export interface CreateAssignment {
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
}

export interface CreateMaterial {
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'other';
  url: string;
  tags: string[];
}

export interface CreateScheduleEvent {
  title: string;
  startTime: string;
  endTime: string;
  recurring?: {
    frequency: 'daily' | 'weekly';
    days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
  };
}

export interface ClassroomStudent {
  id: string;
  name: string;
  avatar?: string;
  joinedAt: string;
  status: 'active' | 'inactive';
}

export interface JoinClassroomRequest {
  classroomId: string;
  studentId: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}