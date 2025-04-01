// Basic user type for room members
export interface RoomUser {
  id: string;
  name: string;
  avatar?: string;
}

interface BaseRoom {
  _id: string;
  name: string;
  description: string;
  type: 'classroom' | 'community';
  avatar?: string;
  createdById: string;
  createdBy: RoomUser;
  createdAt: string;
  updatedAt: string;
}

export interface ClassroomSettings {
  isPrivate: boolean;
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

export interface CommunitySettings {
  isPrivate: boolean;
  allowMemberPosts: boolean;
  allowMemberInvites: boolean;
  requirePostApproval: boolean;
}

export interface Classroom extends BaseRoom {
  type: 'classroom';
  settings: ClassroomSettings;
  teachers: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  students: {
    id: string;
    name: string;
    avatar?: string;
    status: 'active' | 'inactive';
    joinedAt: string;
  }[];
  assignments: string[];
  materials: string[];
}

export interface Community extends BaseRoom {
  type: 'community';
  settings: CommunitySettings;
  members: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
  }[];
  admins: RoomUser[];
}

export type Room = Classroom | Community;

export interface CreateClassroomData {
  type: 'classroom';
  name: string;
  description: string;
  settings: ClassroomSettings;
}

export interface CreateCommunityData {
  type: 'community';
  name: string;
  description: string;
  settings: CommunitySettings;
}

export type CreateRoomData = CreateClassroomData | CreateCommunityData;

export interface UpdateClassroomData {
  name?: string;
  description?: string;
  settings?: Partial<ClassroomSettings>;
  teachers?: string[];
  students?: string[];
}

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  settings?: Partial<CommunitySettings>;
  admins?: string[];
  members?: string[];
}

export type UpdateRoomData = UpdateClassroomData | UpdateCommunityData;
