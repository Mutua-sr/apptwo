import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  Classroom,
  CreateClassroomData,
  UpdateClassroomData,
  Post,
  CreatePostData,
  UpdatePostData,
  Community,
  CreateCommunityData,
  UpdateCommunityData
} from '../types/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Services
export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', credentials);
    if (response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Classroom Services
export const classroomService = {
  getAll: async (): Promise<ApiResponse<Classroom[]>> => {
    const response = await api.get<ApiResponse<Classroom[]>>('/classrooms');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Classroom>> => {
    const response = await api.get<ApiResponse<Classroom>>(`/classrooms/${id}`);
    return response.data;
  },

  create: async (data: CreateClassroomData): Promise<ApiResponse<Classroom>> => {
    const response = await api.post<ApiResponse<Classroom>>('/classrooms', data);
    return response.data;
  },

  update: async (id: string, data: UpdateClassroomData): Promise<ApiResponse<Classroom>> => {
    const response = await api.put<ApiResponse<Classroom>>(`/classrooms/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/classrooms/${id}`);
    return response.data;
  }
};

// Post Services
export const postService = {
  getAll: async (): Promise<ApiResponse<Post[]>> => {
    const response = await api.get<ApiResponse<Post[]>>('/posts');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
    return response.data;
  },

  create: async (data: CreatePostData): Promise<ApiResponse<Post>> => {
    const response = await api.post<ApiResponse<Post>>('/posts', data);
    return response.data;
  },

  update: async (id: string, data: UpdatePostData): Promise<ApiResponse<Post>> => {
    const response = await api.put<ApiResponse<Post>>(`/posts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/posts/${id}`);
    return response.data;
  }
};

// Community Services
export const communityService = {
  getAll: async (): Promise<ApiResponse<Community[]>> => {
    const response = await api.get<ApiResponse<Community[]>>('/communities');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<Community>> => {
    const response = await api.get<ApiResponse<Community>>(`/communities/${id}`);
    return response.data;
  },

  create: async (data: CreateCommunityData): Promise<ApiResponse<Community>> => {
    const response = await api.post<ApiResponse<Community>>('/communities', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCommunityData): Promise<ApiResponse<Community>> => {
    const response = await api.put<ApiResponse<Community>>(`/communities/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/communities/${id}`);
    return response.data;
  }
};

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  auth: authService,
  classrooms: classroomService,
  posts: postService,
  communities: communityService
};
