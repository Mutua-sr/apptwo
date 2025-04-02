import { ChatMessage, ChatParticipant } from './chat';

export interface UnifiedChatRoom {
  id: string;
  name: string;
  type: 'community' | 'classroom';
  description?: string;
  avatar?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  settings?: {
    isPrivate: boolean;
    allowReactions: boolean;
    allowAttachments: boolean;
    allowReplies: boolean;
    allowEditing: boolean;
    allowDeletion: boolean;
  };
}

export interface UnifiedChatMessage extends ChatMessage {
  roomId: string;
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
    senderName: string;
  };
  attachments?: Array<{
    type: string;
    url: string;
    name: string;
    size: number;
  }>;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface UnifiedChatParticipant extends ChatParticipant {
  role: 'admin' | 'member';
  joinedAt: string;
  lastReadTimestamp?: string;
}

export interface UnifiedChatService {
  connect(): Promise<void>;
  disconnect(): void;
  joinRoom(roomId: string): Promise<void>;
  leaveRoom(roomId: string): void;
  sendMessage(roomId: string, content: string): Promise<UnifiedChatMessage>;
  getMessages(roomId: string, limit?: number, before?: string): Promise<UnifiedChatMessage[]>;
  getRooms(type: 'community' | 'classroom'): Promise<UnifiedChatRoom[]>;
  getRoom(roomId: string): Promise<UnifiedChatRoom>;
  getRoomParticipants(roomId: string): Promise<UnifiedChatParticipant[]>;
  markAsRead(roomId: string, messageId: string): Promise<void>;
  addReaction(messageId: string, reaction: string): Promise<void>;
  removeReaction(messageId: string, reaction: string): Promise<void>;
  onMessageReceived(callback: (message: UnifiedChatMessage) => void): void;
  onUserJoined(callback: (participant: UnifiedChatParticipant) => void): void;
  onUserLeft(callback: (participant: UnifiedChatParticipant) => void): void;
  onTypingStart(callback: (data: { roomId: string; userId: string }) => void): void;
  onTypingEnd(callback: (data: { roomId: string; userId: string }) => void): void;
}