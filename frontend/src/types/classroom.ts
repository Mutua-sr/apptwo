export interface ClassroomUser {
  id: string;
  name: string;
  avatar?: string;
}

export interface ClassroomSettings {
  isPrivate: boolean;
  allowStudentChat: boolean;
  allowStudentPosts: boolean;
  allowStudentComments: boolean;
  requirePostApproval: boolean;
  notifications: {
    assignments: boolean;
    materials: boolean;
    announcements: boolean;
  };
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  attachments: string[];
  submissions: Array<{
    studentId: string;
    submittedAt: string;
    files: string[];
    grade?: number;
    feedback?: string;
  }>;
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

export interface Classroom {
  _id: string;
  name: string;
  description: string;
  type: 'classroom';
  teacher: ClassroomUser;
  teachers: ClassroomUser[];
  students: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: 'active' | 'inactive';
    joinedAt: string;
  }>;
  settings: ClassroomSettings;
  assignments: Assignment[];
  materials: Material[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    sender: {
      id: string;
      name: string;
    };
    timestamp: string;
  };
  unreadCount?: number;
}

export interface CreateClassroomInput {
  name: string;
  description: string;
  settings: ClassroomSettings;
}

export interface UpdateClassroomInput {
  name?: string;
  description?: string;
  settings?: Partial<ClassroomSettings>;
  teachers?: string[];
  students?: string[];
}