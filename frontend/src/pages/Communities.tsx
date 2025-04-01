import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Community, CreateCommunityData } from '../types/room';

const Communities: React.FC = () => {
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await apiService.communities.getAll();
      setCommunities(response.data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load communities',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleCreateCommunity = async (name: string, description: string) => {
    try {
      const newCommunity: CreateCommunityData = {
        type: 'community',
        name,
        description,
        settings: {
          isPrivate: false,
          allowMemberPosts: true,
          allowMemberInvites: true,
          requirePostApproval: false
        }
      };

      await apiService.communities.create(newCommunity);
      await fetchCommunities();
      setSnackbar({
        open: true,
        message: 'Community created successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create community',
        severity: 'error'
      });
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Please log in to view communities.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading communities...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Communities
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => handleCreateCommunity('New Community', 'A new community')}
        >
          Create Community
        </Button>
      </Box>

      {communities.length === 0 ? (
        <Typography>No communities found.</Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {communities.map(community => (
            <Box
              key={community._id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6">{community.name}</Typography>
              <Typography color="text.secondary">{community.description}</Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                {community.settings.isPrivate && (
                  <Typography variant="caption" color="primary">Private</Typography>
                )}
                {community.settings.requirePostApproval && (
                  <Typography variant="caption" color="warning.main">Approval Required</Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {community.members.length} members
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Communities;