import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import ChatLayout from '../components/layout/ChatLayout';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Classroom } from '../types/api';

const Classrooms: React.FC = () => {
  const { currentUser } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [availableClassrooms, setAvailableClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const [userClassroomsRes, allClassroomsRes] = await Promise.all([
        apiService.classrooms.getUserClassrooms(),
        apiService.classrooms.getAll()
      ]);

      const userClassrooms = userClassroomsRes.data.data.map((classroom: Classroom) => ({
        ...classroom,
        type: 'classroom' as const,
        participants: classroom.participants || []
      }));
      setClassrooms(userClassrooms);

      // Filter out classrooms the user is already a member of
      const userClassroomIds = new Set(userClassrooms.map((c: Classroom) => c._id));
      const available = allClassroomsRes.data.data.filter(
        (classroom: Classroom) => !userClassroomIds.has(classroom._id)
      );
      setAvailableClassrooms(available);
    } catch (err) {
      console.error('Failed to fetch classrooms:', err);
      setError('Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchClassrooms();
    }
  }, [currentUser]);

  const handleJoinClassroom = async (classroomId: string) => {
    try {
      await apiService.classrooms.join(classroomId);
      // Refresh the classrooms lists
      fetchClassrooms();
    } catch (err) {
      console.error('Failed to join classroom:', err);
      // You might want to show an error message to the user
    }
  };

  const handleCreateClassroom = async (name: string, description: string) => {
    try {
      await apiService.classrooms.create({ name, description });
      // Refresh the classrooms lists
      fetchClassrooms();
    } catch (err) {
      console.error('Failed to create classroom:', err);
      // You might want to show an error message to the user
    }
  };

  if (!currentUser) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <Box textAlign="center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
          <p className="mt-2 text-gray-600">
            You need to be logged in to view classrooms
          </p>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
      >
        <Box textAlign="center" color="error.main">
          {error}
        </Box>
      </Box>
    );
  }

  return (
    <ChatLayout 
      type="classroom"
      rooms={classrooms}
      availableRooms={availableClassrooms}
      currentUser={currentUser}
      onJoinRoom={handleJoinClassroom}
      onCreateRoom={handleCreateClassroom}
    />
  );
};

export default Classrooms;