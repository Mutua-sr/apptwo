import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import ChatLayout from '../components/layout/ChatLayout';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Classroom } from '../types/api';

const Classrooms: React.FC = () => {
  const { currentUser } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const response = await apiService.classrooms.getAll();
        setClassrooms(response.data.map((classroom: Classroom) => ({
          ...classroom,
          type: 'classroom' as const,
          participants: classroom.participants || []
        })));
      } catch (err) {
        console.error('Failed to fetch classrooms:', err);
        setError('Failed to load classrooms');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchClassrooms();
    }
  }, [currentUser]);

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
      currentUser={currentUser}
    />
  );
};

export default Classrooms;