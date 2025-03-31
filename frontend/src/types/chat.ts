export interface ChatMessage {
  _id: string;
  type: 'message';
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  roomId: string;
  timestamp: string;
}

export interface ChatRoom {
  _id: string;
  name: string;
  type: 'classroom' | 'community';
  description?: string;
  createdBy: string;
  createdAt: string;
  lastMessage?: string;
  unreadCount?: number;
  avatar?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface NewChatMessage {
  type: 'message';
  content: string;
  roomId: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: string;
}