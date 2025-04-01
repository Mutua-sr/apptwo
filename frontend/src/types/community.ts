export interface Community {
  _id: string;
  name: string;
  description?: string;
  creator: {
    id: string;
    name: string;
    avatar?: string;
  };
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: 'member' | 'moderator' | 'admin';
  }>;
  settings: {
    isPrivate: boolean;
    requiresApproval: boolean;
    allowInvites: boolean;
  };
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    sender: {
      id: string;
      name: string;
    };
    timestamp: string;
  };
  unreadCount?: number;
}

export interface CommunitySettings {
  isPrivate: boolean;
  requiresApproval: boolean;
  allowInvites: boolean;
}