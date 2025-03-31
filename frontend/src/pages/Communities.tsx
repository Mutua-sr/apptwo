import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
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

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const [userCommunitiesRes, allCommunitiesRes] = await Promise.all([
        apiService.communities.getUserCommunities(),
        apiService.communities.getAll()
      ]);

      const userCommunities = userCommunitiesRes.data.data.map((community: Community) => ({
        ...community,
        type: 'community' as const,
        participants: community.participants || []
      }));
      setCommunities(userCommunities);

      // Filter out communities the user is already a member of
      const userCommunityIds = new Set(userCommunities.map((c: Community) => c._id));
      const available = allCommunitiesRes.data.data.filter(
        (community: Community) => !userCommunityIds.has(community._id)
      );
      setAvailableCommunities(available);
    } catch (err) {
      console.error('Failed to fetch communities:', err);
      setError('Failed to load communities');
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
      // Refresh the communities lists
      fetchCommunities();
    } catch (err) {
      console.error('Failed to join community:', err);
      // You might want to show an error message to the user
    }
  };

  const handleCreateCommunity = async (name: string, description: string) => {
    try {
      await apiService.communities.create({ name, description });
      // Refresh the communities lists
      fetchCommunities();
    } catch (err) {
      console.error('Failed to create community:', err);
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
      availableRooms={availableCommunities}
      currentUser={currentUser}
      onJoinRoom={handleJoinCommunity}
      onCreateRoom={handleCreateCommunity}
    />
  );
};

export default Communities;