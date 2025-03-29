import axios from 'axios';
import apiService from './apiService';
import { UserProfile } from '../types/profile';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with auth headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
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