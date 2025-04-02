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
  type: 'community';
  avatar?: string;
  createdById: string;
  createdBy: RoomUser;
  createdAt: string;
  updatedAt: string;
}

export interface CommunitySettings {
  isPrivate: boolean;
  allowMemberPosts: boolean;
  allowMemberInvites: boolean;
  requirePostApproval: boolean;
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

export type Room = Community;

export interface CreateCommunityData {
  type: 'community';
  name: string;
  description: string;
  settings: CommunitySettings;
}

export type CreateRoomData = CreateCommunityData;

export interface UpdateCommunityData {
  name?: string;
  description?: string;
  settings?: Partial<CommunitySettings>;
  admins?: string[];
  members?: string[];
}

export type UpdateRoomData = UpdateCommunityData;
