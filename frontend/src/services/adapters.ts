import * as ApiTypes from '../types/api';
import * as RoomTypes from '../types/room';

export const adaptClassroom = (apiClassroom: ApiTypes.Classroom): RoomTypes.Classroom => ({
  _id: apiClassroom._id,
  name: apiClassroom.name,
  description: apiClassroom.description,
  type: 'classroom',
  avatar: apiClassroom.avatar,
  createdById: apiClassroom.teacher.id,
  createdBy: {
    id: apiClassroom.teacher.id,
    name: apiClassroom.teacher.name,
    email: '',
    role: 'teacher',
    status: 'active',
    profileId: '',
    createdAt: '',
    updatedAt: ''
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
  teachers: [apiClassroom.teacher].map(t => ({
    id: t.id,
    name: t.name,
    email: '',
    role: 'teacher',
    status: 'active',
    profileId: '',
    createdAt: '',
    updatedAt: ''
  })),
  students: apiClassroom.students.map(s => ({
    id: s.id,
    name: s.name,
    email: '',
    role: 'student',
    status: s.status,
    profileId: '',
    createdAt: s.joinedAt,
    updatedAt: ''
  })),
  assignments: apiClassroom.assignments.map(a => a.id),
  materials: apiClassroom.materials.map(m => m.id)
});

export const adaptCommunity = (apiCommunity: ApiTypes.Community): RoomTypes.Community => ({
  _id: apiCommunity._id,
  name: apiCommunity.name,
  description: apiCommunity.description,
  type: 'community',
  avatar: apiCommunity.avatar,
  createdById: apiCommunity.creator.id,
  createdBy: {
    id: apiCommunity.creator.id,
    name: apiCommunity.creator.name,
    email: '',
    role: 'admin',
    status: 'active',
    profileId: '',
    createdAt: '',
    updatedAt: ''
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
    email: '',
    role: m.role,
    status: 'active',
    profileId: '',
    createdAt: m.joinedAt,
    updatedAt: ''
  })),
  admins: apiCommunity.members
    .filter(m => m.role === 'admin')
    .map(m => ({
      id: m.id,
      name: m.name,
      email: '',
      role: 'admin',
      status: 'active',
      profileId: '',
      createdAt: m.joinedAt,
      updatedAt: ''
    }))
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