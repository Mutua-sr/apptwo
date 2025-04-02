import React, { useState } from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { ClassroomChatList } from '../components/chat/ClassroomChatList';
import UnifiedChatRoom from '../components/chat/UnifiedChatRoom';
import { ChatProvider } from '../contexts/ChatContext';

const Classrooms: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Please log in to access classrooms</Typography>
      </Box>
    );
  }

  return (
    <ChatProvider>
      <Grid container spacing={2} sx={{ height: '100vh', p: 2 }}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <ClassroomChatList
              onSelectClassroom={(id) => setSelectedClassroom(id)}
              selectedClassroom={selectedClassroom}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '100%' }}>
            {selectedClassroom ? (
              <UnifiedChatRoom
                roomId={selectedClassroom}
                type="classroom"
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
                  Select a classroom to start chatting
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose a classroom from the list to view and participate in discussions
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </ChatProvider>
  );
};

export default Classrooms;