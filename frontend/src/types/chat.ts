export interface Message {
  _id?: string;
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
  type: 'direct' | 'classroom' | 'community';
  name: string;
  description?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

export interface ChatMessage extends Message {
  _id: string;  // Required for existing messages
}

export interface NewChatMessage extends Omit<Message, '_id'> {
  _id?: string;  // Optional for new messages
}