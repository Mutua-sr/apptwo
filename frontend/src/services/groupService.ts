import { ApiResponse } from '../types/api';
import { Community, CreateCommunityData, UpdateCommunityData } from '../types/room';
import apiService from './apiService';

class GroupService {
  async getCommunity(id: string): Promise<Community> {
    try {
      const response = await apiService.communities.get(id);
      if (!response.data.data) {
        throw new Error('Community not found');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching community:', error);
      throw error;
    }
  }

  async getCommunities(userId?: string): Promise<Community[]> {
    try {
      const response = await apiService.communities.list();
      const communities: Community[] = response.data.data;
      return userId 
        ? communities.filter(community => community.createdById === userId || 
            community.admins.some(admin => admin.id === userId))
        : communities;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  }

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    try {
      const response = await apiService.communities.create(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  async updateCommunity(id: string, data: UpdateCommunityData): Promise<Community> {
    try {
      const response = await apiService.communities.update(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  }

  async deleteCommunity(id: string): Promise<void> {
    try {
      await apiService.communities.delete(id);
    } catch (error) {
      console.error('Error deleting community:', error);
      throw error;
    }
  }

  async joinGroup(id: string): Promise<void> {
    try {
      await apiService.communities.join(id);
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  async leaveGroup(id: string): Promise<void> {
    try {
      await apiService.communities.leave(id);
    } catch (error) {
      console.error('Error leaving community:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService();