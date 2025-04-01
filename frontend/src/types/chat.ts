import { Room } from './room';

export interface ChatMessage {
  _id: string;  // Changed back to _id to be consistent with BaseRoom
  roomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  reactions: {
    [key: string]: string[];  // emoji: userId[]
  };
  createdAt: string;
  updatedAt: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'offline';
  lastSeen?: string;
}

export type ChatRoom = Room & {
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ChatRoomInfo {
  unreadCount?: number;
  lastMessage?: string;
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
  getRoom(roomId: string): Promise<ChatRoom>;
  onMessageReceived(callback: (message: ChatMessage) => void): void;
  onMessageUpdated(callback: (message: ChatMessage) => void): void;
  onMessageDeleted(callback: (messageId: string) => void): void;
  onReactionAdded(callback: (data: { messageId: string; reaction: string; userId: string }) => void): void;
  onReactionRemoved(callback: (data: { messageId: string; reaction: string; userId: string }) => void): void;
  onUserJoined(callback: (participant: ChatParticipant) => void): void;
  onUserLeft(callback: (participant: ChatParticipant) => void): void;
}

export type ExtendedRoom = Room & ChatRoomInfo;
