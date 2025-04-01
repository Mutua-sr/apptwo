export interface RoomSettings {
  allowStudentChat: boolean;
  allowStudentPosts: boolean;
  requirePostApproval: boolean;
  isPrivate?: boolean;
  requiresApproval?: boolean;
  allowInvites?: boolean;
}

export interface CreateRoomData {
  name: string;
  description?: string;
  type: 'classroom' | 'community';
  settings: RoomSettings;
}

export interface UpdateRoomData {
  name?: string;
  description?: string;
  type?: 'classroom' | 'community';
  settings?: Partial<RoomSettings>;
}
