import * as ApiTypes from '../types/api';
import * as RoomTypes from '../types/room';
import { ExtendedRoom, ChatRoomInfo } from '../types/chat';

interface CommunityMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

const defaultChatInfo: ChatRoomInfo = {
  unreadCount: 0,
  lastMessage: undefined
};

export const adaptCommunity = (apiCommunity: ApiTypes.Community): RoomTypes.Community & {
  creator: ApiTypes.Community['creator'];
  stats: ApiTypes.Community['stats'];
  tags: string[];
} => ({
  _id: apiCommunity._id,
  name: apiCommunity.name,
  description: apiCommunity.description,
  type: 'community',
  avatar: apiCommunity.avatar,
  createdById: apiCommunity.creator.id,
  createdBy: {
    id: apiCommunity.creator.id,
    name: apiCommunity.creator.name,
    avatar: apiCommunity.creator.avatar
  },
  createdAt: apiCommunity.createdAt,
  updatedAt: apiCommunity.updatedAt,
  settings: {
    isPrivate: apiCommunity.settings.isPrivate,
    allowMemberPosts: apiCommunity.settings.allowPosts,
    allowMemberInvites: false,
    requirePostApproval: apiCommunity.settings.requiresApproval
  },
  members: apiCommunity.members.map((member: CommunityMember) => ({
    id: member.id,
    name: member.name,
    avatar: member.avatar,
    role: member.role,
    joinedAt: member.joinedAt
  })),
  admins: apiCommunity.members
    .filter((member: CommunityMember) => member.role === 'admin')
    .map((member: CommunityMember) => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar
    })),
  creator: apiCommunity.creator,
  stats: apiCommunity.stats,
  tags: apiCommunity.tags
});

export const adaptCreateCommunityData = (data: RoomTypes.CreateCommunityData): ApiTypes.CreateCommunityData => ({
  name: data.name,
  description: data.description,
  settings: {
    isPrivate: data.settings.isPrivate,
    requiresApproval: data.settings.requirePostApproval,
    allowPosts: data.settings.allowMemberPosts,
    allowEvents: true,
    allowPolls: true
  }
});