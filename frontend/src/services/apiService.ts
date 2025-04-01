import axios, { InternalAxiosRequestConfig } from 'axios';
import { Community, Classroom, CreateRoomData, UpdateRoomData } from '../types/room';
import { User, ApiResponse, UserStatus } from '../types/api';
import { PostInput, PostUpdate } from '../types/feed';
import { ChatMessage, ChatParticipant, ChatRoom } from '../types/chat';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

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
  }
};

export default apiService;
