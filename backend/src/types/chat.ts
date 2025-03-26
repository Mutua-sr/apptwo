import { CouchDBDocument } from './index';

export interface ChatMessage extends CouchDBDocument {
  type: 'message';
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  roomId: string;
  timestamp: string;
  deleted?: boolean;
}

export interface ChatRoom extends CouchDBDocument {
  type: 'direct' | 'classroom' | 'community';
  name: string;
  description?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export type CreateChatMessage = Omit<ChatMessage, '_id' | '_rev' | 'createdAt' | 'updatedAt'>;
export type CreateChatRoom = Omit<ChatRoom, '_id' | '_rev' | 'createdAt' | 'updatedAt'>;