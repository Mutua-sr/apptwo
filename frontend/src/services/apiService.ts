import axios, { InternalAxiosRequestConfig } from 'axios';
import { Community, CreateRoomData, UpdateRoomData } from '../types/room';
import { User, ApiResponse, LoginResponse, RegisterResponse, UserStatus } from '../types/api';
import { Report, AdminSettings, PaginatedResponse } from '../types/admin';
import { AdminDashboardStats } from '../types/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const apiService = {
  auth: {
    login: (email: string, password: string) => 
      api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password }),
    
    register: (data: { name: string; email: string; password: string }) =>
      api.post<ApiResponse<RegisterResponse>>('/auth/register', data),
    
    logout: () => api.post('/auth/logout'),
    
    getCurrentUser: () => api.get<ApiResponse<User>>('/auth/me'),
    
    resetPassword: (email: string) => 
      api.post('/auth/reset-password', { email }),
    
    verifyResetToken: (token: string) => 
      api.get(`/auth/reset-password/${token}`),
    
    updatePassword: (token: string, password: string) => 
      api.post('/auth/update-password', { token, password })
  },

  users: {
    getProfile: (userId: string) => 
      api.get<ApiResponse<User>>(`/users/${userId}`),
    
    updateProfile: (userId: string, data: Partial<User>) => 
      api.put<ApiResponse<User>>(`/users/${userId}`, data),
    
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post<ApiResponse<{ url: string }>>('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  },

  communities: {
    list: (page = 1, limit = 10) => 
      api.get<ApiResponse<Community[]>>('/communities', { params: { page, limit } }),
    
    get: (id: string) => 
      api.get<ApiResponse<Community>>(`/communities/${id}`),
    
    create: (data: CreateRoomData) => 
      api.post<ApiResponse<Community>>('/communities', data),
    
    update: (id: string, data: UpdateRoomData) => 
      api.put<ApiResponse<Community>>(`/communities/${id}`, data),
    
    delete: (id: string) => 
      api.delete(`/communities/${id}`),
    
    join: (id: string) => 
      api.post(`/communities/${id}/join`),
    
    leave: (id: string) => 
      api.post(`/communities/${id}/leave`)
  },

  chat: {
    getMessages: (roomId: string, params?: { limit?: number; before?: string }) =>
      api.get(`/chat/rooms/${roomId}/messages`, { params }),

    sendMessage: (roomId: string, data: { content: string }) =>
      api.post(`/chat/rooms/${roomId}/messages`, data),

    getParticipants: (roomId: string) =>
      api.get(`/chat/rooms/${roomId}/participants`),

    markAsRead: (roomId: string) =>
      api.put(`/chat/rooms/${roomId}/read`),

    addReaction: (messageId: string, reaction: string) =>
      api.post(`/chat/messages/${messageId}/reactions`, { reaction }),

    removeReaction: (messageId: string, reaction: string) =>
      api.delete(`/chat/messages/${messageId}/reactions/${reaction}`),

    updateMessage: (messageId: string, data: { content: string }) =>
      api.put(`/chat/messages/${messageId}`, data),

    deleteMessage: (messageId: string) =>
      api.delete(`/chat/messages/${messageId}`),

    getRoom: (roomId: string) =>
      api.get(`/chat/rooms/${roomId}`)
  },

  admin: {
    getStats: () => 
      api.get<ApiResponse<AdminDashboardStats>>('/admin/stats'),
    
    getDashboardStats: () =>
      api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard/stats'),

    getUsers: (params?: { page?: number; limit?: number; status?: UserStatus }) => 
      api.get<ApiResponse<PaginatedResponse<User>>>('/admin/users', { params }),
    
    updateUserStatus: (userId: string, data: { status?: UserStatus; role?: User['role'] }) => 
      api.put<ApiResponse<User>>(`/admin/users/${userId}`, data),
    
    getCommunities: (params?: { page?: number; limit?: number }) => 
      api.get<ApiResponse<PaginatedResponse<Community>>>('/admin/communities', { params }),
    
    getReports: (params?: { page?: number; limit?: number; status?: string }) => 
      api.get<ApiResponse<PaginatedResponse<Report>>>('/admin/reports', { params }),
    
    handleReport: (reportId: string, action: 'approve' | 'reject') => 
      api.put<ApiResponse<Report>>(`/admin/reports/${reportId}`, { action }),

    updateReport: (reportId: string, status: 'approved' | 'rejected') =>
      api.put<ApiResponse<Report>>(`/admin/reports/${reportId}`, { status }),

    getSettings: () =>
      api.get<ApiResponse<AdminSettings>>('/admin/settings'),

    updateSettings: (settings: Partial<AdminSettings>) =>
      api.put<ApiResponse<AdminSettings>>('/admin/settings', settings)
  }
};

export default apiService;
