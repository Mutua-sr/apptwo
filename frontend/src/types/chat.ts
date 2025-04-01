export interface ChatMessage {
  _id: string;
  roomId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
  };
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role?: 'student' | 'teacher' | 'member' | 'admin';
  lastSeen?: string;
  isOnline?: boolean;
}

export interface ChatRoom {
  _id: string;
  name: string;
  type: 'classroom' | 'community';
  description?: string;
  avatar?: string;
  participants: ChatParticipant[];
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  settings?: {
    allowFiles: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    isPrivate?: boolean;
    requiresApproval?: boolean;
  };
}

export interface ChatRoomResponse {
  _id: string;
  name: string;
  type: 'classroom' | 'community';
  participants: ChatParticipant[];
  createdBy: string;
  createdAt: string;
}

export interface NewChatMessage {
  content: string;
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    imageUrl?: string;
  };
}

export interface ChatRoomMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'student' | 'teacher' | 'member' | 'admin';
  joinedAt: string;
  lastActive?: string;
  status: 'active' | 'inactive' | 'banned';
}

export interface ChatRoomSettings {
  allowFiles: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  isPrivate?: boolean;
  requiresApproval?: boolean;
  allowAnonymous?: boolean;
  moderators?: string[];
}

export interface ChatRoomInvite {
  _id: string;
  roomId: string;
  invitedBy: {
    id: string;
    name: string;
  };
  invitedUser: {
    id: string;
    name: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  expiresAt?: string;
}

export interface ChatRoomEvent {
  _id: string;
  roomId: string;
  type: 'member_joined' | 'member_left' | 'room_created' | 'settings_updated';
  user: {
    id: string;
    name: string;
  };
  metadata?: any;
  timestamp: string;
}

export interface ChatNotification {
  _id: string;
  type: 'message' | 'mention' | 'invite' | 'system';
  roomId: string;
  message?: string;
  from?: {
    id: string;
    name: string;
    avatar?: string;
  };
  read: boolean;
  createdAt: string;
}