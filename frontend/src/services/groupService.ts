import { Classroom, Community, CreateClassroomData, CreateCommunityData, UpdateClassroomData, UpdateCommunityData } from '../types/room';
import { ApiResponse } from '../types/api';
import apiService from './apiService';

class GroupService {
  async getClassroom(id: string): Promise<Classroom> {
    try {
      const response = await apiService.classrooms.getUserClassrooms();
      const classroom = response.data.data.find(c => c._id === id);
      if (!classroom) {
        throw new Error('Classroom not found');
      }
      return classroom;
    } catch (error) {
      console.error('Error fetching classroom:', error);
      throw error;
    }
  }

  async getClassrooms(userId?: string): Promise<Classroom[]> {
    try {
      const response = await apiService.classrooms.getAll();
      const classrooms: Classroom[] = response.data.data;
      return userId 
        ? classrooms.filter(classroom => classroom.createdById === userId || 
            classroom.teachers.some(teacher => teacher.id === userId))
        : classrooms;
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }
  }

  async createClassroom(data: CreateClassroomData): Promise<Classroom> {
    try {
      const response = await apiService.classrooms.create(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  }

  async updateClassroom(id: string, data: UpdateClassroomData): Promise<Classroom> {
    try {
      const response = await apiService.classrooms.update(id, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  }

  async deleteClassroom(id: string): Promise<void> {
    try {
      await apiService.classrooms.delete(id);
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  }

  async getCommunity(id: string): Promise<Community> {
    try {
      const response = await apiService.communities.getUserCommunities();
      const community = response.data.data.find(c => c._id === id);
      if (!community) {
        throw new Error('Community not found');
      }
      return community;
    } catch (error) {
      console.error('Error fetching community:', error);
      throw error;
    }
  }

  async getCommunities(userId?: string): Promise<Community[]> {
    try {
      const response = await apiService.communities.getAll();
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

  async joinGroup(type: 'classroom' | 'community', id: string): Promise<void> {
    try {
      if (type === 'classroom') {
        await apiService.classrooms.join(id);
      } else {
        await apiService.communities.join(id);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    }
  }

  async leaveGroup(type: 'classroom' | 'community', id: string): Promise<void> {
    try {
      if (type === 'classroom') {
        await apiService.classrooms.leave(id);
      } else {
        await apiService.communities.leave(id);
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      throw error;
    }
  }
}

export const groupService = new GroupService();