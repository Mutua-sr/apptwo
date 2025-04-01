import * as ApiTypes from '../types/api';
import * as RoomTypes from '../types/room';

import { ExtendedRoom, ChatRoomInfo } from '../types/chat';

const defaultChatInfo: ChatRoomInfo = {
  unreadCount: 0,
  lastMessage: undefined
};

export const adaptClassroom = (apiClassroom: ApiTypes.Classroom): ExtendedRoom => ({
  _id: apiClassroom._id,
  name: apiClassroom.name,
  description: apiClassroom.description,
  type: 'classroom',
  avatar: apiClassroom.avatar,
  createdById: apiClassroom.teacher.id,
  createdBy: {
    id: apiClassroom.teacher.id,
    name: apiClassroom.teacher.name,
    avatar: apiClassroom.teacher.avatar
  },
  createdAt: apiClassroom.createdAt || new Date().toISOString(),
  updatedAt: apiClassroom.updatedAt || new Date().toISOString(),
  settings: {
    isPrivate: apiClassroom.settings.isArchived,
    allowStudentPosts: apiClassroom.settings.allowStudentPosts,
    allowStudentComments: apiClassroom.settings.allowStudentComments,
    allowStudentChat: false,
    requirePostApproval: false,
    notifications: apiClassroom.settings.notifications
  },
  materials: apiClassroom.materials.map(m => m.id),
  // Optional properties
  teachers: [{
    id: apiClassroom.teacher.id,
    name: apiClassroom.teacher.name,
    avatar: apiClassroom.teacher.avatar
  }],
  students: apiClassroom.students.map(s => ({
    id: s.id,
    name: s.name,
    avatar: s.avatar,
    status: s.status,
    joinedAt: s.joinedAt
  })),
  assignments: apiClassroom.assignments.map(a => a.id)
});

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
  members: apiCommunity.members.map(m => ({
    id: m.id,
    name: m.name,
    avatar: m.avatar,
    role: m.role,
    joinedAt: m.joinedAt
  })),
  admins: apiCommunity.members
    .filter(m => m.role === 'admin')
    .map(m => ({
      id: m.id,
      name: m.name,
      avatar: m.avatar
    })),
  creator: apiCommunity.creator,
  stats: apiCommunity.stats,
  tags: apiCommunity.tags
});

export const adaptCreateClassroomData = (data: RoomTypes.CreateClassroomData): ApiTypes.CreateClassroomData => ({
  name: data.name,
  description: data.description
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