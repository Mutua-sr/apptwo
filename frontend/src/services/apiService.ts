import axios, { InternalAxiosRequestConfig } from 'axios';
import { Community, Classroom, CreateRoomData, UpdateRoomData } from '../types/room';
import { User, ApiResponse, UserStatus } from '../types/api';
import { PostInput, PostUpdate } from '../types/feed';
import { ChatMessage, ChatParticipant, ChatRoom } from '../types/chat';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Add auth token to requests
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const apiService = {
  auth: {
    login: (email: string, password: string) => 
      axios.post<ApiResponse<{ token: string; user: User }>>(`${API_URL}/auth/login`, { email, password }),
    register: (data: { email: string; password: string; name: string }) =>
      axios.post<ApiResponse<{ token: string; user: User }>>(`${API_URL}/auth/register`, data),
    logout: () => axios.post(`${API_URL}/auth/logout`),
    getCurrentUser: () => axios.get<ApiResponse<User>>(`${API_URL}/auth/me`),
    getAllUsers: () => axios.get<ApiResponse<User[]>>(`${API_URL}/admin/users`),
    updateUser: (userId: string, data: { role?: string; status?: UserStatus }) =>
      axios.put<ApiResponse<User>>(`${API_URL}/admin/users/${userId}`, data),
    updateUserStatus: (userId: string, status: UserStatus) =>
      axios.put<ApiResponse<User>>(`${API_URL}/admin/users/${userId}/status`, { status }),
    deleteUser: (userId: string) =>
      axios.delete(`${API_URL}/admin/users/${userId}`)
  },

  classrooms: {
    getAll: () => axios.get<ApiResponse<Classroom[]>>(`${API_URL}/classrooms`),
    getUserClassrooms: () => axios.get<ApiResponse<Classroom[]>>(`${API_URL}/classrooms/me`),
    create: (data: CreateRoomData) => axios.post<ApiResponse<Classroom>>(`${API_URL}/classrooms`, data),
    update: (id: string, data: UpdateRoomData) => axios.put<ApiResponse<Classroom>>(`${API_URL}/classrooms/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/classrooms/${id}`),
    join: (id: string) => axios.post(`${API_URL}/classrooms/${id}/join`),
    leave: (id: string) => axios.post(`${API_URL}/classrooms/${id}/leave`)
  },

  communities: {
    getAll: () => axios.get<ApiResponse<Community[]>>(`${API_URL}/communities`),
    getUserCommunities: () => axios.get<ApiResponse<Community[]>>(`${API_URL}/communities/me`),
    getById: (id: string) => axios.get<ApiResponse<Community>>(`${API_URL}/communities/${id}`),
    create: (data: CreateRoomData) => axios.post<ApiResponse<Community>>(`${API_URL}/communities`, data),
    update: (id: string, data: UpdateRoomData) => axios.put<ApiResponse<Community>>(`${API_URL}/communities/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/communities/${id}`),
    join: (id: string) => axios.post(`${API_URL}/communities/${id}/join`),
    leave: (id: string) => axios.post(`${API_URL}/communities/${id}/leave`)
  },

  posts: {
    getAll: () => axios.get<ApiResponse<PostInput[]>>(`${API_URL}/posts`),
    create: (data: PostInput) => axios.post<ApiResponse<PostInput>>(`${API_URL}/posts`, data),
    update: (id: string, data: PostUpdate) => axios.put<ApiResponse<PostInput>>(`${API_URL}/posts/${id}`, data),
    delete: (id: string) => axios.delete(`${API_URL}/posts/${id}`),
    like: (id: string) => axios.post(`${API_URL}/posts/${id}/like`),
    unlike: (id: string) => axios.post(`${API_URL}/posts/${id}/unlike`)
  },

  chat: {
    getRoom: (roomId: string) => axios.get<ApiResponse<ChatRoom>>(`${API_URL}/chat/rooms/${roomId}`),
    getMessages: (roomId: string, params?: { limit?: number; before?: string }) => 
      axios.get<ApiResponse<ChatMessage[]>>(`${API_URL}/chat/rooms/${roomId}/messages`, { params }),
    sendMessage: (roomId: string, data: { content: string }) => 
      axios.post<ApiResponse<ChatMessage>>(`${API_URL}/chat/rooms/${roomId}/messages`, data),
    updateMessage: (messageId: string, data: { content: string }) => 
      axios.put<ApiResponse<ChatMessage>>(`${API_URL}/chat/messages/${messageId}`, data),
    deleteMessage: (messageId: string) => 
      axios.delete(`${API_URL}/chat/messages/${messageId}`),
    getParticipants: (roomId: string) => 
      axios.get<ApiResponse<ChatParticipant[]>>(`${API_URL}/chat/rooms/${roomId}/participants`),
    markAsRead: (roomId: string) => 
      axios.post(`${API_URL}/chat/rooms/${roomId}/read`),
    addReaction: (messageId: string, reaction: string) => 
      axios.post(`${API_URL}/chat/messages/${messageId}/reactions`, { reaction }),
    removeReaction: (messageId: string, reaction: string) => 
      axios.delete(`${API_URL}/chat/messages/${messageId}/reactions/${reaction}`)
  },

  admin: {
    getDashboardStats: () => 
      axios.get<ApiResponse<{
        users: {
          total: number;
          active: number;
          newThisMonth: number;
        };
        content: {
          posts: number;
          comments: number;
          reports: number;
        };
        engagement: {
          dailyActiveUsers: number;
          monthlyActiveUsers: number;
          averageSessionDuration: number;
        };
      }>>(`${API_URL}/admin/dashboard/stats`),
    
    getSettings: () => 
      axios.get<ApiResponse<{
        general: {
          siteName: string;
          maintenanceMode: boolean;
          allowRegistration: boolean;
        };
        security: {
          maxLoginAttempts: number;
          sessionTimeout: number;
          requireEmailVerification: boolean;
        };
        content: {
          allowUserUploads: boolean;
          maxUploadSize: number;
          allowedFileTypes: string[];
        };
      }>>(`${API_URL}/admin/settings`),
    
    updateSettings: (settings: {
      general: {
        siteName: string;
        maintenanceMode: boolean;
        allowRegistration: boolean;
      };
      security: {
        maxLoginAttempts: number;
        sessionTimeout: number;
        requireEmailVerification: boolean;
      };
      content: {
        allowUserUploads: boolean;
        maxUploadSize: number;
        allowedFileTypes: string[];
      };
    }) => 
      axios.put<ApiResponse<typeof settings>>(`${API_URL}/admin/settings`, settings),
    
    getReports: (filters?: {
      status?: 'pending' | 'approved' | 'rejected' | 'all';
      type?: 'post' | 'comment' | 'user' | 'community' | 'all';
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }) => 
      axios.get<ApiResponse<{
        data: Array<{
          _id: string;
          type: 'post' | 'comment' | 'user' | 'community';
          targetId: string;
          reportedBy: string;
          reason: string;
          description?: string;
          status: 'pending' | 'approved' | 'rejected';
          createdAt: string;
          updatedAt: string;
          metadata?: {
            contentPreview?: string;
            reportedUserName?: string;
            communityName?: string;
          };
        }>;
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>>(`${API_URL}/admin/reports`, { params: filters }),
    
    updateReport: (reportId: string, status: 'approved' | 'rejected') => 
      axios.put<ApiResponse<{
        _id: string;
        status: 'approved' | 'rejected';
        updatedAt: string;
      }>>(`${API_URL}/admin/reports/${reportId}`, { status }),
    
    deleteContent: (type: 'post' | 'comment' | 'user' | 'community', id: string) => 
      axios.delete(`${API_URL}/admin/content/${type}/${id}`),
    
    getUserStats: () => 
      axios.get<ApiResponse<{ total: number; active: number; banned: number }>>(`${API_URL}/admin/users/stats`),
    
    getContentStats: () => 
      axios.get<ApiResponse<{ posts: number; comments: number; communities: number }>>(`${API_URL}/admin/content/stats`)
  }
};

export default apiService;
