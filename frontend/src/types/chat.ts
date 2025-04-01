import { User } from './api';

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  roomId: string;
  createdAt: string;
  updatedAt?: string;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }[];
  reactions?: {
    type: string;
    users: string[];
  }[];
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastSeen?: string;
  isOnline?: boolean;
}

export interface ChatRoom {
  _id: string;
  name: string;
  description?: string;
  type: 'classroom' | 'community';
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
  participants: ChatParticipant[];
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
  addReaction(messageId: string, reaction: string): Promise<void>;
  removeReaction(messageId: string, reaction: string): Promise<void>;
  updateMessage(messageId: string, content: string): Promise<ChatMessage>;
  deleteMessage(messageId: string): Promise<void>;
}

export interface ChatState {
  connected: boolean;
  loading: boolean;
  error: string | null;
  messages: ChatMessage[];
  participants: ChatParticipant[];
  unreadCount: number;
}