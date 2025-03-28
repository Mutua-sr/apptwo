import axios from 'axios';
import { Classroom, Community, CreateClassroomData, CreateCommunityData, UpdateClassroomData, UpdateCommunityData } from '../types/api';

const API_BASE_URL = 'http://localhost:3000/api';

export const groupService = {
  // Classroom Operations
  createClassroom: async (data: CreateClassroomData): Promise<Classroom> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/classrooms`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  getClassroom: async (classroomId: string): Promise<Classroom> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/classrooms/${classroomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching classroom:', error);
      throw error;
    }
  },

  getClassrooms: async (userId?: string): Promise<Classroom[]> => {
    try {
      const url = userId 
        ? `${API_BASE_URL}/classrooms?userId=${userId}`
        : `${API_BASE_URL}/classrooms`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }
  },

  updateClassroom: async (classroomId: string, data: UpdateClassroomData): Promise<Classroom> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/classrooms/${classroomId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  },

  deleteClassroom: async (classroomId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/classrooms/${classroomId}`);
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  },

  // Community Operations
  createCommunity: async (data: CreateCommunityData): Promise<Community> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/communities`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  },

  getCommunity: async (communityId: string): Promise<Community> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/communities/${communityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching community:', error);
      throw error;
    }
  },

  getCommunities: async (userId?: string): Promise<Community[]> => {
    try {
      const url = userId 
        ? `${API_BASE_URL}/communities?userId=${userId}`
        : `${API_BASE_URL}/communities`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  },

  updateCommunity: async (communityId: string, data: UpdateCommunityData): Promise<Community> => {
    try {
      const response = await axios.put(`${API_BASE_URL}/communities/${communityId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  },

  deleteCommunity: async (communityId: string): Promise<void> => {
    try {
      await axios.delete(`${API_BASE_URL}/communities/${communityId}`);
    } catch (error) {
      console.error('Error deleting community:', error);
      throw error;
    }
  },

  // Member Operations
  joinGroup: async (groupId: string, groupType: 'classroom' | 'community'): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/${groupType}s/${groupId}/join`);
    } catch (error) {
      console.error(`Error joining ${groupType}:`, error);
      throw error;
    }
  },

  leaveGroup: async (groupId: string, groupType: 'classroom' | 'community'): Promise<void> => {
    try {
      await axios.post(`${API_BASE_URL}/${groupType}s/${groupId}/leave`);
    } catch (error) {
      console.error(`Error leaving ${groupType}:`, error);
      throw error;
    }
  },

  getMembers: async (groupId: string, groupType: 'classroom' | 'community'): Promise<string[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${groupType}s/${groupId}/members`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${groupType} members:`, error);
      throw error;
    }
  }
};