import { CouchDBDocument } from './index';
import { FileAttachment } from './realtime';

export interface ChatMessage extends CouchDBDocument {
  type: 'message';
  content: string;
  roomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  attachments?: FileAttachment[];
  replyTo?: string; // ID of the message being replied to
  reactions?: {
    [emoji: string]: string[]; // emoji -> array of userIds who reacted
  };
  isEdited?: boolean;
  editedAt?: string;
  deletedAt?: string;
}

export interface ChatRoom extends CouchDBDocument {
  type: 'room';
  name: string;
  roomType: 'direct' | 'group';
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
    joinedAt: string;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
    };
    sentAt: string;
  };
  settings?: {
    isEncrypted: boolean;
    allowReactions: boolean;
    allowReplies: boolean;
    allowEditing: boolean;
    allowDeletion: boolean;
  };
}

export interface CreateChatMessage {
  type: 'message';
  content: string;
  roomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  attachments?: FileAttachment[];
  replyTo?: string;
}

export interface CreateChatRoom {
  type: 'room';
  name: string;
  roomType: 'direct' | 'group';
  participants: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
  }[];
  settings?: {
    isEncrypted: boolean;
    allowReactions: boolean;
    allowReplies: boolean;
    allowEditing: boolean;
    allowDeletion: boolean;
  };
}

export interface UpdateChatMessage {
  content?: string;
  attachments?: FileAttachment[];
  reactions?: {
    [emoji: string]: string[];
  };
  isEdited?: boolean;
  editedAt?: string;
  deletedAt?: string;
}

export interface UpdateChatRoom {
  name?: string;
  participants?: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'member';
    joinedAt: string;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    sender: {
      id: string;
      name: string;
    };
    sentAt: string;
  };
  settings?: {
    isEncrypted: boolean;
    allowReactions: boolean;
    allowReplies: boolean;
    allowEditing: boolean;
    allowDeletion: boolean;
  };
}