import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import UnifiedChatRoom from '../components/chat/UnifiedChatRoom';
import { ChatProvider } from '../contexts/ChatContext';
import { unifiedChatService } from '../services/unifiedChatService';
import { UnifiedChatRoom as UnifiedChatRoomType } from '../types/unifiedChat';

const Communities: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [communities, setCommunities] = useState<UnifiedChatRoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        await unifiedChatService.connect();
        const fetchedCommunities = await unifiedChatService.getRooms('community');
        setCommunities(fetchedCommunities);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch communities');
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchCommunities();
    }

    return () => {
      unifiedChatService.disconnect();
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Please log in to access communities</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <ChatProvider>
      <Grid container spacing={2} sx={{ height: '100vh', p: 2 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Communities
              </Typography>
              {communities.length === 0 ? (
                <Typography color="text.secondary">
                  No communities available
                </Typography>
              ) : (
                communities.map((community) => (
                  <Box
                    key={community.id}
                    onClick={() => setSelectedCommunity(community.id)}
                    sx={{
                      p: 2,
                      mb: 1,
                      cursor: 'pointer',
                      borderRadius: 1,
                      bgcolor: selectedCommunity === community.id ? 'primary.main' : 'background.paper',
                      color: selectedCommunity === community.id ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: selectedCommunity === community.id ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  >
                    <Typography variant="subtitle1">
                      {community.name}
                    </Typography>
                    <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                      {community.participants.length} members
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '100%' }}>
            {selectedCommunity ? (
              <UnifiedChatRoom
                roomId={selectedCommunity}
                type="community"
              />
            ) : (
              <Box sx={{ 
                p: 4, 
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default'
              }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                  Select a community to start chatting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a community from the list to view and participate in discussions
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </ChatProvider>
  );
};

export default Communities;