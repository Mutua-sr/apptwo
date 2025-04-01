import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Grid, Typography, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CommunityDetail } from '../components/community/CommunityDetail';
import { Community as UICommuntiy } from '../types/community';
import { Community as ApiCommunity } from '../types/room';
import { chatService } from '../services/chatService';
import apiService from '../services/apiService';

const transformCommunity = (apiCommunity: ApiCommunity): UICommuntiy => {
  return {
    _id: apiCommunity._id,
    name: apiCommunity.name,
    description: apiCommunity.description,
    coverImage: apiCommunity.avatar,
    creator: {
      id: apiCommunity.createdById,
      name: apiCommunity.createdBy.name,
      avatar: apiCommunity.createdBy.avatar,
    },
    members: apiCommunity.members.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      role: member.role,
    })),
    settings: {
      isPrivate: apiCommunity.settings.isPrivate,
      requiresApproval: apiCommunity.settings.requirePostApproval,
      allowInvites: apiCommunity.settings.allowMemberInvites,
    },
    createdAt: apiCommunity.createdAt,
    updatedAt: apiCommunity.updatedAt,
  };
};

const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<UICommuntiy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Connect to chat service for real-time updates
        await chatService.connect();
        
        // Fetch communities
        const response = await apiService.communities.getAll();
        const communityData = response.data.data as ApiCommunity[];
        
        // Transform API response to match UI Community type
        const transformedCommunities = communityData.map(transformCommunity);
        setCommunities(transformedCommunities);
        setLoading(false);

        // Subscribe to community updates
        chatService.onMessageReceived(() => {
          // Refresh communities to get updated unread counts
          apiService.communities.getAll().then(response => {
            const updatedData = response.data.data as ApiCommunity[];
            setCommunities(updatedData.map(transformCommunity));
          });
        });
      } catch (error) {
        console.error('Error fetching communities:', error);
        setError(error instanceof Error ? error.message : 'Failed to load communities');
        setLoading(false);
      }
    };

    fetchCommunities();

    // Cleanup chat connection
    return () => {
      chatService.disconnect();
    };
  }, []);

  const handleCommunityClick = (community: UICommuntiy) => {
    navigate(`/chat/community/${community._id}`);
  };

  const handleCreateCommunity = () => {
    navigate('/create-community');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Communities
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateCommunity}
          >
            Create New Community
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          {communities.map((community) => (
            <Grid item xs={12} sm={6} md={4} key={community._id}>
              <CommunityDetail
                community={community}
                onClick={() => handleCommunityClick(community)}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Communities;