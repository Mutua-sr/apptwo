import { CouchDBDocument } from './index';

export interface ClassroomSettings {
  allowStudentPosts: boolean;
  allowStudentComments: boolean;
  allowStudentChat: boolean;
  isArchived: boolean;
  notifications: {
    assignments: boolean;
    materials: boolean;
    announcements: boolean;
  };
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
  recurring: boolean;
}

export interface Classroom extends CouchDBDocument {
  type: 'classroom';
  name: string;
  description: string;
  code: string;
  chatRoomId?: string;
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
  unreadCount?: number;
  lastMessage?: {
    content: string;
    sender: {
      id: string;
      name: string;
    };
    timestamp: string;
  };
}

export interface CreateClassroom {
  type?: 'classroom';
  name: string;
  description: string;
  teacher?: {
    id: string;
    name: string;
    avatar?: string;
  };
  settings?: Partial<ClassroomSettings>;
}

export interface UpdateClassroomInput {
  name?: string;
  description?: string;
  settings?: Partial<ClassroomSettings>;
}
