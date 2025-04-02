import { CouchDBDocument } from './index';
import { FileAttachment } from './realtime';

export interface ChatMessage extends CouchDBDocument {
  type: 'message';
  content: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string;
  attachments?: FileAttachment[];
  reactions?: {
    [emoji: string]: string[]; // Array of userIds who reacted with this emoji
  };
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
    senderName: string;
  };
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface ChatRoom extends CouchDBDocument {
  type: 'chatroom' | 'community' | 'classroom';
  name: string;
  description?: string;
  avatar?: string;
  participants: ChatParticipant[];
  lastMessage?: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: string;
  };
  settings: {
    isPrivate: boolean;
    allowReactions: boolean;
    allowAttachments: boolean;
    allowReplies: boolean;
    allowEditing: boolean;
    allowDeletion: boolean;
  };
}

export interface ChatParticipant {
  userId: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
  lastReadTimestamp?: string;
  unreadCount?: number;
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