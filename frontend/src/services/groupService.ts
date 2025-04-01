import axios from 'axios';
import apiService from './apiService';
import { Classroom, Community, CreateClassroomData, CreateCommunityData, UpdateClassroomData, UpdateCommunityData } from '../types/api';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with auth headers from apiService
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

const groupService = {
  // Classroom Operations
  createClassroom: async (data: CreateClassroomData): Promise<Classroom> => {
    try {
      const response = await apiService.classrooms.create(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating classroom:', error);
      throw error;
    }
  },

  getClassroom: async (classroomId: string): Promise<Classroom> => {
    try {
      const response = await apiService.classrooms.getById(classroomId);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching classroom:', error);
      throw error;
    }
  },

  getClassrooms: async (userId?: string): Promise<Classroom[]> => {
    try {
      const response = await apiService.classrooms.getAll();
      const classrooms = response.data.data;
      return userId ? classrooms.filter(classroom => classroom.createdBy === userId) : classrooms;
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }
  },

  updateClassroom: async (classroomId: string, data: UpdateClassroomData): Promise<Classroom> => {
    try {
      const response = await apiService.classrooms.update(classroomId, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating classroom:', error);
      throw error;
    }
  },

  deleteClassroom: async (classroomId: string): Promise<void> => {
    try {
      await apiService.classrooms.delete(classroomId);
    } catch (error) {
      console.error('Error deleting classroom:', error);
      throw error;
    }
  },

  // Community Operations
  createCommunity: async (data: CreateCommunityData): Promise<Community> => {
    try {
      const response = await apiService.communities.create(data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  },

  getCommunity: async (communityId: string): Promise<Community> => {
    try {
      const response = await apiService.communities.getById(communityId);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching community:', error);
      throw error;
    }
  },

  getCommunities: async (userId?: string): Promise<Community[]> => {
    try {
      const response = await apiService.communities.getAll();
      const communities = response.data.data;
      return userId ? communities.filter(community => community.createdBy === userId) : communities;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  },

  updateCommunity: async (communityId: string, data: UpdateCommunityData): Promise<Community> => {
    try {
      const response = await apiService.communities.update(communityId, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  },

  deleteCommunity: async (communityId: string): Promise<void> => {
    try {
      await apiService.communities.delete(communityId);
    } catch (error) {
      console.error('Error deleting community:', error);
      throw error;
    }
  },

  // Member Operations
  joinGroup: async (groupId: string, groupType: 'classroom' | 'community'): Promise<void> => {
    try {
      await api.post(`/${groupType}s/${groupId}/join`);
    } catch (error) {
      console.error(`Error joining ${groupType}:`, error);
      throw error;
    }
  },

  leaveGroup: async (groupId: string, groupType: 'classroom' | 'community'): Promise<void> => {
    try {
      await api.post(`/${groupType}s/${groupId}/leave`);
    } catch (error) {
      console.error(`Error leaving ${groupType}:`, error);
      throw error;
    }
  },

  getMembers: async (groupId: string, groupType: 'classroom' | 'community'): Promise<string[]> => {
    try {
      const response = await api.get(`/${groupType}s/${groupId}/members`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ${groupType} members:`, error);
      throw error;
    }
  }
};

export { groupService };