import { Community } from './community';
import { Classroom } from './classroom';

export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  reactions?: {
    [key: string]: string[];  // emoji: userId[]
  };
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export interface ChatRoomInfo {
  unreadCount: number;
  lastMessage?: string;
}

export interface ExtendedRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'community' | 'classroom';
  chatRoomId?: string;
  avatar?: string;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  settings: {
    isPrivate: boolean;
    allowStudentPosts?: boolean;
    allowStudentComments?: boolean;
    allowStudentChat?: boolean;
    allowMemberPosts?: boolean;
    allowMemberInvites?: boolean;
    requirePostApproval: boolean;
    notifications?: {
      assignments: boolean;
      materials: boolean;
      announcements: boolean;
    };
  };
  unreadCount?: number;
  lastMessage?: string;
  // Classroom specific properties
  teachers?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  students?: Array<{
    id: string;
    name: string;
    avatar?: string;
    status?: string;
    joinedAt?: string;
  }>;
  assignments?: string[];
  materials?: string[];
  // Community specific properties
  members?: Array<{
    id: string;
    name: string;
    avatar?: string;
    role?: string;
    joinedAt?: string;
  }>;
  admins?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  creator?: {
    id: string;
    name: string;
    avatar?: string;
  };
  stats?: {
    memberCount: number;
    postCount: number;
    activeMembers: number;
  };
  tags?: string[];
}

export interface ChatRoom {
  id: string;
  name: string;
  type: 'community' | 'classroom';
  description?: string;
  currentUserId: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatService {
  connect(): Promise<void>;
  disconnect(): void;
  joinRoom(roomId: string): void;
  leaveRoom(roomId: string): void;
  sendMessage(roomId: string, content: string): Promise<ChatMessage>;
  getMessages(roomId: string, limit?: number, before?: string): Promise<ChatMessage[]>;
  markAsRead(roomId: string): Promise<void>;
  getRoomParticipants(roomId: string): Promise<ChatParticipant[]>;
  getRoom(roomId: string): Promise<ChatRoom>;
  addReaction(messageId: string, reaction: string): Promise<void>;
  removeReaction(messageId: string, reaction: string): Promise<void>;
  onMessageReceived(callback: (message: ChatMessage) => void): void;
  onUserJoined(callback: (participant: ChatParticipant) => void): void;
  onUserLeft(callback: (participant: ChatParticipant) => void): void;
}
