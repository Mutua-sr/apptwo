export interface Classroom {
  _id: string;
  name: string;
  description?: string;
  teacher: {
    id: string;
    name: string;
    avatar?: string;
  };
  students: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  settings: {
    allowStudentChat: boolean;
    allowStudentPosts: boolean;
    requirePostApproval: boolean;
  };
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

export interface ClassroomSettings {
  allowStudentChat: boolean;
  allowStudentPosts: boolean;
  requirePostApproval: boolean;
}