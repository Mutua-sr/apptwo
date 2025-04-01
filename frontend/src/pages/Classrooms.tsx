import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's classrooms
      const userClassroomsRes = await apiService.classrooms.getUserClassrooms();
      const userClassrooms = userClassroomsRes.data.data || [];
      setClassrooms(userClassrooms.map(classroom => ({
        ...classroom,
        type: 'classroom' as const,
        participants: classroom.students
      })));

      // Get all public classrooms
      const allClassroomsRes = await apiService.classrooms.getAll();
      const allClassrooms = allClassroomsRes.data.data || [];

      // Filter out:
      // 1. Classrooms the user is already a member of
      // 2. Private classrooms where user is not a member
      const userClassroomIds = new Set(userClassrooms.map(c => c._id));
      const available = allClassrooms.filter(classroom => {
        if (!currentUser) return false;
        
        // Don't show classrooms user is already in
        if (userClassroomIds.has(classroom._id)) return false;
        
        // Show if classroom is not private or if user is in students list
        return !classroom.settings?.isPrivate || 
               classroom.students?.some(student => student.id === currentUser.id);
      });

      // Sort available classrooms by:
      // 1. Recently created first
      // 2. Most members
      const sortedAvailable = available.sort((a, b) => {
        // First by creation date (newest first)
        const dateCompare = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // Then by number of members (most first)
        return (b.students?.length || 0) - (a.students?.length || 0);
      });

      setAvailableClassrooms(sortedAvailable);
    } catch (err) {
      console.error('Failed to fetch classrooms:', err);
      setError('Failed to load classrooms');
      setClassrooms([]);
      setAvailableClassrooms([]);
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
      await fetchClassrooms();
      setSnackbar({
        open: true,
        message: 'Successfully joined classroom',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to join classroom:', err);
      setSnackbar({
        open: true,
        message: 'Failed to join classroom',
        severity: 'error'
      });
    }
  };

  const handleCreateClassroom = async (name: string, description: string) => {
    try {
      await apiService.classrooms.create({ name, description });
      await fetchClassrooms();
      setSnackbar({
        open: true,
        message: 'Successfully created classroom',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to create classroom:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create classroom',
        severity: 'error'
      });
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
    <>
      <ChatLayout 
        type="classroom"
        rooms={classrooms}
        availableRooms={availableClassrooms}
        currentUser={currentUser}
        onJoinRoom={handleJoinClassroom}
        onCreateRoom={handleCreateClassroom}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Classrooms;