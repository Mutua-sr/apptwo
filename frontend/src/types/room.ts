// Base interfaces for settings
interface BaseSettings {
  isPrivate?: boolean;
}

export interface ClassroomSettings extends BaseSettings {
  allowStudentChat: boolean;
  allowStudentPosts: boolean;
  requirePostApproval: boolean;
}

export interface CommunitySettings extends BaseSettings {
  isPrivate: boolean;
  requiresApproval: boolean;
  allowInvites: boolean;
}

// Base interfaces for room data
interface BaseRoomData {
  name: string;
  description?: string;
}

// Create interfaces
export interface CreateClassroomData extends BaseRoomData {
  type: 'classroom';
  settings: ClassroomSettings;
}

export interface CreateCommunityData extends BaseRoomData {
  type: 'community';
  settings: CommunitySettings;
}

export type CreateRoomData = CreateClassroomData | CreateCommunityData;

// Update interfaces
export interface UpdateClassroomData extends Partial<BaseRoomData> {
  type?: 'classroom';
  settings?: Partial<ClassroomSettings>;
}

export interface UpdateCommunityData extends Partial<BaseRoomData> {
  type?: 'community';
  settings?: Partial<CommunitySettings>;
}

export type UpdateRoomData = UpdateClassroomData | UpdateCommunityData;
