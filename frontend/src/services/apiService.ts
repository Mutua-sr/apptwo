import axios from 'axios';
import { Community, Classroom, User } from '../types/api';

const API_URL = 'http://localhost:8000/api';

interface ApiResponse<T> {
  data: T;
  message?: string;
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
    },

    communities: {
      getAll: () => 
        instance.get<{ data: Community[] }>('/communities', {
          params: { filter: 'all' }
        }),

      getUserCommunities: () =>
        instance.get<{ data: Community[] }>('/communities', {
          params: { filter: 'member' }
        }),

      getById: (id: string) =>
        instance.get<{ data: Community }>(`/communities/${id}`),

      create: (data: CreateRoomData) =>
        instance.post<{ data: Community }>('/communities', data),

      update: (id: string, data: UpdateRoomData) =>
        instance.put<{ data: Community }>(`/communities/${id}`, data),

      delete: (id: string) =>
        instance.delete<{ data: void }>(`/communities/${id}`),

      join: (id: string) =>
        instance.post<{ data: void }>(`/communities/${id}/join`),

      leave: (id: string) =>
        instance.post<{ data: void }>(`/communities/${id}/leave`),
    },

    classrooms: {
      getAll: () =>
        instance.get<{ data: Classroom[] }>('/classrooms', {
          params: { filter: 'all' }
        }),

      getUserClassrooms: () =>
        instance.get<{ data: Classroom[] }>('/classrooms', {
          params: { filter: 'student' }
        }),

      getTeacherClassrooms: () =>
        instance.get<{ data: Classroom[] }>('/classrooms', {
          params: { filter: 'teacher' }
        }),

      getById: (id: string) =>
        instance.get<{ data: Classroom }>(`/classrooms/${id}`),

      create: (data: CreateRoomData) =>
        instance.post<{ data: Classroom }>('/classrooms', data),

      update: (id: string, data: UpdateRoomData) =>
        instance.put<{ data: Classroom }>(`/classrooms/${id}`, data),

      delete: (id: string) =>
        instance.delete<{ data: void }>(`/classrooms/${id}`),

      join: (id: string) =>
        instance.post<{ data: void }>(`/classrooms/join`, { code: id }),

      leave: (id: string) =>
        instance.post<{ data: void }>(`/classrooms/${id}/leave`),
    },
  };
};

const apiService = createApiService();
export default apiService;
