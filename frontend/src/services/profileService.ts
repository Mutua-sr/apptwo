import axios from 'axios';
import { Profile, UpdateProfileData, ApiResponse } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const profileService = {
  getProfile: async (profileId: string): Promise<Profile> => {
    try {
      const response = await axios.get<ApiResponse<Profile>>(
        `${API_BASE_URL}/profiles/${profileId}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  updateProfile: async (profileId: string, data: UpdateProfileData): Promise<Profile> => {
    try {
      const response = await axios.put<ApiResponse<Profile>>(
        `${API_BASE_URL}/profiles/${profileId}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadProfileImage: async (profileId: string, file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post<ApiResponse<{ imageUrl: string }>>(
        `${API_BASE_URL}/profiles/${profileId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data.imageUrl;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  deleteProfile: async (profileId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/profiles/${profileId}`);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
};

export default profileService;