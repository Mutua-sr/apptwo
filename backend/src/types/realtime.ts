export enum UserPresence {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY'
}

export enum TypingStatus {
  STARTED = 'STARTED',
  STOPPED = 'STOPPED'
}

export interface UserStatus {
  userId: string;
  presence: UserPresence;
  lastSeen: string;
  isTyping: boolean;
  inCall: boolean;
  roomId?: string;
}

export interface TypingIndicator {
  userId: string;
  roomId: string;
  status: TypingStatus;
}

export interface ReadReceipt {
  userId: string;
  messageId: string;
  roomId: string;
  readAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  messageId: string;
  uploadedBy: string;
  uploadedAt: string;
}