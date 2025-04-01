import axios from 'axios';
import { Profile, UpdateProfileData, ApiResponse } from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const profileService = {
  getProfile: async (profileId: string): Promise<Profile> => {
    try {
      const response = await axios.get<ApiResponse<Profile>>(
        `${API_BASE_URL}/profile/${profileId}`
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
        `${API_BASE_URL}/profile/${profileId}`,
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
        `${API_BASE_URL}/profile/media`,
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

  getActivities: async (userId: string, page: number = 1, limit: number = 10): Promise<Activity[]> => {
    try {
      const response = await axios.get<ApiResponse<Activity[]>>(
        `${API_BASE_URL}/profile/${userId}/activities`,
        {
          params: { page, limit }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  },

  getNotifications: async (
    page: number = 1, 
    limit: number = 10, 
    unreadOnly: boolean = false
  ): Promise<Notification[]> => {
    try {
      const response = await axios.get<ApiResponse<Notification[]>>(
        `${API_BASE_URL}/profile/notifications`,
        {
          params: { page, limit, unreadOnly }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await axios.put<ApiResponse<Notification>>(
        `${API_BASE_URL}/profile/notifications/${notificationId}/read`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  markAllNotificationsRead: async (): Promise<{ message: string }> => {
    try {
      const response = await axios.put<ApiResponse<{ message: string }>>(
        `${API_BASE_URL}/profile/notifications/read-all`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  deleteProfile: async (profileId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/profile/${profileId}`);
    } catch (error) {
      console.error('Error deleting profile:', error);
      throw error;
    }
  }
};

interface Activity {
  _id: string;
  type: 'activity';
  userId: string;
  activityType: 'post' | 'comment' | 'like' | 'share' | 'join' | 'assignment' | 'material';
  action: 'created' | 'updated' | 'deleted' | 'completed';
  targetType: 'post' | 'community' | 'classroom' | 'assignment' | 'material';
  targetId: string;
  metadata?: {
    title?: string;
    description?: string;
    grade?: number;
    status?: string;
  };
  timestamp: string;
}

interface Notification {
  _id: string;
  type: 'notification';
  userId: string;
  notificationType: 'mention' | 'reply' | 'like' | 'follow' | 'assignment' | 'grade' | 'announcement';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  readAt?: string;
}

export default profileService;