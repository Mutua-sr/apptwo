import { Community, Classroom, User } from './api';

export interface ChatParticipant extends User {
  isOnline?: boolean;
  lastSeen?: string;
  typing?: boolean;
}

export interface ChatRoom {
  unreadCount?: number;
  lastMessage?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  content: string;
  sender: User;
  createdAt: string;
  readBy: string[];
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
}

export type ChatCommunity = Community & ChatRoom;
export type ChatClassroom = Classroom & ChatRoom;

export type ChatRoomType = ChatCommunity | ChatClassroom;

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
