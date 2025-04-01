import axios from 'axios';
import { Community, Classroom, User, Post, ApiResponse } from '../types/api';
import { PostInput, PostUpdate } from '../types/feed';

const API_URL = 'http://localhost:8000/api';

interface LoginResponse {
  token: string;
  user: User;
}

interface CreateRoomData {
  name: string;
  description?: string;
}

interface UpdateRoomData {
  name?: string;
  description?: string;
}

const createApiService = () => {
  const instance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  // Add token to requests
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return {
    auth: {
      getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
      },
      login: (credentials: { email: string; password: string }) =>
        instance.post<ApiResponse<LoginResponse>>('/auth/login', credentials),
      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
      handleError: (error: any): string => {
        if (error.response) {
          return error.response.data.message || 'An error occurred';
        }
        return error.message || 'Network error';
      }
    },

    communities: {
      getAll: () => 
        instance.get<ApiResponse<Community[]>>('/communities', {
          params: { filter: 'all' }
        }),

      getUserCommunities: () =>
        instance.get<ApiResponse<Community[]>>('/communities', {
          params: { filter: 'member' }
        }),

      getById: (id: string) =>
        instance.get<ApiResponse<Community>>(`/communities/${id}`),

      create: (data: CreateRoomData) =>
        instance.post<ApiResponse<Community>>('/communities', data),

      update: (id: string, data: UpdateRoomData) =>
        instance.put<ApiResponse<Community>>(`/communities/${id}`, data),

      delete: (id: string) =>
        instance.delete<ApiResponse<void>>(`/communities/${id}`),

      join: (id: string) =>
        instance.post<ApiResponse<void>>(`/communities/${id}/join`),

      leave: (id: string) =>
        instance.post<ApiResponse<void>>(`/communities/${id}/leave`),
    },

    posts: {
      getAll: () =>
        instance.get<ApiResponse<Post[]>>('/posts'),
      
      create: (data: PostInput) =>
        instance.post<ApiResponse<Post>>('/posts', data),
      
      update: (id: string, data: PostUpdate) =>
        instance.put<ApiResponse<Post>>(`/posts/${id}`, data),
      
      delete: (id: string) =>
        instance.delete<ApiResponse<void>>(`/posts/${id}`),
    },

    classrooms: {
      getAll: () =>
        instance.get<ApiResponse<Classroom[]>>('/classrooms', {
          params: { filter: 'all' }
        }),

      getUserClassrooms: () =>
        instance.get<ApiResponse<Classroom[]>>('/classrooms', {
          params: { filter: 'student' }
        }),

      getTeacherClassrooms: () =>
        instance.get<ApiResponse<Classroom[]>>('/classrooms', {
          params: { filter: 'teacher' }
        }),

      getById: (id: string) =>
        instance.get<ApiResponse<Classroom>>(`/classrooms/${id}`),

      create: (data: CreateRoomData) =>
        instance.post<ApiResponse<Classroom>>('/classrooms', data),

      update: (id: string, data: UpdateRoomData) =>
        instance.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data),

      delete: (id: string) =>
        instance.delete<ApiResponse<void>>(`/classrooms/${id}`),

      join: (id: string) =>
        instance.post<ApiResponse<void>>(`/classrooms/join`, { code: id }),

      leave: (id: string) =>
        instance.post<ApiResponse<void>>(`/classrooms/${id}/leave`),
    },
  };
};

const apiService = createApiService();
export default apiService;
