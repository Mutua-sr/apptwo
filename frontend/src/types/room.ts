import { User } from './api';

interface BaseRoom {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  unreadCount?: number;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface CommunitySettings {
  isPrivate: boolean;
  allowMemberPosts: boolean;
  allowMemberInvites: boolean;
  requirePostApproval: boolean;
}

export interface ClassroomSettings {
  isPrivate?: boolean;
  allowStudentPosts: boolean;
  allowStudentComments: boolean;
  allowStudentChat: boolean;
  requirePostApproval: boolean;
  notifications: {
    assignments: boolean;
    materials: boolean;
    announcements: boolean;
  };
}

export interface Community extends BaseRoom {
  type: 'community';
  coverImage?: string;
  members: User[];
  admins: User[];
  isPrivate: boolean;
  tags: string[];
  rules?: string[];
  settings: CommunitySettings;
}

export interface Classroom extends BaseRoom {
  type: 'classroom';
  code: string;
  teachers: User[];
  students: User[];
  isArchived: boolean;
  settings: ClassroomSettings;
}

export interface CreateCommunityData {
  type: 'community';
  name: string;
  description: string;
  settings: CommunitySettings;
  tags?: string[];
  rules?: string[];
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  settings?: Partial<CommunitySettings>;
  tags?: string[];
  rules?: string[];
  avatar?: string;
  coverImage?: string;
}

export interface CreateClassroomData {
  type: 'classroom';
  name: string;
  description: string;
  settings: ClassroomSettings;
}

export interface UpdateClassroomData {
  name?: string;
  description?: string;
  isArchived?: boolean;
  settings?: Partial<ClassroomSettings>;
}

export type Room = Community | Classroom;
export type CreateRoomData = CreateCommunityData | CreateClassroomData;
export type UpdateRoomData = UpdateCommunityData | UpdateClassroomData;

export interface RoomParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface ChatRoom extends BaseRoom {
  type: 'classroom' | 'community';
  participants: RoomParticipant[];
}
