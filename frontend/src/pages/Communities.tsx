import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import ChatLayout from '../components/layout/ChatLayout';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Community } from '../types/api';

const Communities: React.FC = () => {
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await apiService.communities.getAll();
        setCommunities(response.data.map((community: Community) => ({
          ...community,
          type: 'community' as const,
          participants: community.participants || []
        })));
      } catch (err) {
        console.error('Failed to fetch communities:', err);
        setError('Failed to load communities');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCommunities();
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
            You need to be logged in to view communities
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
      type="community"
      rooms={communities}
      currentUser={currentUser}
    />
  );
};

export default Communities;