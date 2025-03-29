import axios from 'axios';
import { UserProfile } from '../types/profile';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.token;
};

// Create axios instance with default headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const profileService = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await api.get(`/profile/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await api.put(`/profile/${userId}`, profileData);
      return response.data.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadProfileImage: async (userId: string, imageFile: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await api.post(`/profile/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.data.url;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
};