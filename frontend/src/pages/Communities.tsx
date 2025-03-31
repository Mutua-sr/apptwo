import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import ChatLayout from '../components/layout/ChatLayout';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Community } from '../types/api';

const Communities: React.FC = () => {
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [availableCommunities, setAvailableCommunities] = useState<Community[]>([]);
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

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user's communities
      const userCommunitiesRes = await apiService.communities.getUserCommunities();
      const userCommunities = userCommunitiesRes.data.data || [];
      setCommunities(userCommunities.map(community => ({
        ...community,
        type: 'community' as const,
        participants: community.members
      })));

      // Get all communities
      const allCommunitiesRes = await apiService.communities.getAll();
      const allCommunities = allCommunitiesRes.data.data || [];

      // Filter out communities the user is already a member of
      const userCommunityIds = new Set(userCommunities.map(c => c._id));
      const available = allCommunities.filter(
        community => !userCommunityIds.has(community._id)
      );
      setAvailableCommunities(available);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
      setError('Failed to load communities');
      setCommunities([]);
      setAvailableCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchCommunities();
    }
  }, [currentUser]);

  const handleJoinCommunity = async (communityId: string) => {
    try {
      await apiService.communities.join(communityId);
      await fetchCommunities();
      setSnackbar({
        open: true,
        message: 'Successfully joined community',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to join community:', err);
      setSnackbar({
        open: true,
        message: 'Failed to join community',
        severity: 'error'
      });
    }
  };

  const handleCreateCommunity = async (name: string, description: string) => {
    try {
      await apiService.communities.create({ name, description });
      await fetchCommunities();
      setSnackbar({
        open: true,
        message: 'Successfully created community',
        severity: 'success'
      });
    } catch (err) {
      console.error('Failed to create community:', err);
      setSnackbar({
        open: true,
        message: 'Failed to create community',
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
    <>
      <ChatLayout 
        type="community"
        rooms={communities}
        availableRooms={availableCommunities}
        currentUser={currentUser}
        onJoinRoom={handleJoinCommunity}
        onCreateRoom={handleCreateCommunity}
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

export default Communities;