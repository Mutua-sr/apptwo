import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { useChat } from '../../contexts/ChatContext';
import ChatInterface from './ChatInterface';
import { useAuth } from '../../contexts/AuthContext';

interface UnifiedChatRoomProps {
  roomId: string;
  type: 'community' | 'classroom';
}

const UnifiedChatRoom: React.FC<UnifiedChatRoomProps> = ({ roomId, type }) => {
  const {
    currentRoom,
    loading,
    error,
    joinRoom,
    leaveRoom
  } = useChat();
  const { currentUser } = useAuth();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && roomId && currentUser) {
      initialized.current = true;
      joinRoom(roomId);
    }

    return () => {
      if (initialized.current && roomId) {
        leaveRoom(roomId);
        initialized.current = false;
      }
    };
  }, [roomId, currentUser]);

  if (!currentUser) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Please log in to access chat</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
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

  if (!currentRoom) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No chat room selected</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <Typography variant="h6">
          {currentRoom.name}
          {type === 'classroom' && ' (Classroom)'}
          {type === 'community' && ' (Community)'}
        </Typography>
        <Typography variant="caption">
          {currentRoom.participants.length} participants
        </Typography>
      </Box>
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatInterface 
          roomId={currentRoom.id} 
          userId={currentUser.id}
          type={type}
        />
      </Box>
    </Paper>
  );
};

export default UnifiedChatRoom;