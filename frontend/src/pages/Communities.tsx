import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  CircularProgress,
  Alert,
  TextField,
  InputAdornment
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { CommunityDetail } from '../components/community/CommunityDetail';
import { Community } from '../types/community';
import { Community as ApiCommunity } from '../types/room';
import { chatService } from '../services/chatService';
import apiService from '../services/apiService';

const transformCommunity = (apiCommunity: ApiCommunity): Community => {
  return {
    _id: apiCommunity._id,
    name: apiCommunity.name,
    description: apiCommunity.description || '',
    coverImage: apiCommunity.avatar,
    creator: {
      id: apiCommunity.createdBy.id,
      name: apiCommunity.createdBy.name,
      avatar: apiCommunity.createdBy.avatar
    },
    members: apiCommunity.members.map(member => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      role: member.role
    })),
    settings: {
      isPrivate: apiCommunity.settings.isPrivate,
      requiresApproval: apiCommunity.settings.requirePostApproval,
      allowInvites: apiCommunity.settings.allowMemberInvites
    },
    createdAt: apiCommunity.createdAt,
    updatedAt: apiCommunity.updatedAt
  };
};

const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        // Connect to chat service for real-time updates
        await chatService.connect();
        
        // Fetch communities
        const response = await apiService.communities.getAll();
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch communities');
        }
        
        const transformedCommunities = response.data.data.map(transformCommunity);
        setCommunities(transformedCommunities);
        setLoading(false);

        // Subscribe to community updates
        chatService.onMessageReceived(() => {
          // Refresh communities to get updated unread counts
          apiService.communities.getAll().then(response => {
            if (response.data.success) {
              const updatedCommunities = response.data.data.map(transformCommunity);
              setCommunities(updatedCommunities);
            }
          }).catch(error => {
            console.error('Error refreshing communities:', error);
          });
        });
      } catch (error) {
        console.error('Error fetching communities:', error);
        setError(
          error instanceof Error 
            ? error.message 
            : typeof error === 'string'
              ? error
              : 'Failed to load communities'
        );
        setLoading(false);
      }
    };

    fetchCommunities();

    // Cleanup chat connection
    return () => {
      chatService.disconnect();
    };
  }, []);

  const handleCommunityClick = (community: Community) => {
    navigate(`/chat/community/${community._id}`);
  };

  const handleCreateCommunity = () => {
    navigate('/create-community');
  };

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (community.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Typography variant="h4" component="h1">
            Communities
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateCommunity}
          >
            Create New Community
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        {filteredCommunities.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {searchTerm ? 'No communities found matching your search' : 'No communities available'}
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredCommunities.map((community) => (
              <Grid item xs={12} sm={6} md={4} key={community._id}>
                <CommunityDetail
                  community={community}
                  onClick={() => handleCommunityClick(community)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Communities;