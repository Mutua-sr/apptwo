import axios from 'axios';
import { UserProfile } from '../types/profile';

const API_BASE_URL = 'http://localhost:3000/api';

export const profileService = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/profiles/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/profiles/${userId}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadProfileImage: async (userId: string, imageFile: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await axios.post(`${API_BASE_URL}/profiles/${userId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.imageUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
};