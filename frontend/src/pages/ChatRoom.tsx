import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, IconButton, Avatar, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ChatInterface from '../components/chat/ChatInterface';
import { chatService } from '../services/chatService';
import { ChatParticipant } from '../types/chat';
import { Room, Community } from '../types/room';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!roomId || !currentUser) {
        setError('Unable to join chat room');
        setLoading(false);
        return;
      }

      try {
        // Connect to chat service
        await chatService.connect();
        
        // Get community details
        const response = await apiService.communities.getById(roomId);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to load community');
        }
        
        setRoom(response.data.data);
        
        // Join the chat room
        chatService.joinRoom(roomId);
        
        // Get participants
        const participantsData = await chatService.getRoomParticipants(roomId);
        setParticipants(participantsData);

        // Mark messages as read
        await chatService.markAsRead(roomId);

        // Setup event listeners
        chatService.onUserJoined((participant) => {
          setParticipants(prev => [...prev, participant]);
        });

        chatService.onUserLeft((participant) => {
          setParticipants(prev => prev.filter(p => p.id !== participant.id));
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to initialize chat:', err);
        setError(
          err.response?.data?.message || 
          err.message || 
          'Failed to load chat room'
        );
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (roomId) {
        chatService.leaveRoom(roomId);
        chatService.disconnect();
      }
    };
  }, [roomId, currentUser]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !currentUser) {
    return (
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: 2 
      }}>
        <Typography variant="h6" color="error">
          {error || 'Please log in to access this chat room'}
        </Typography>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              bgcolor: 'primary.dark',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
    );
  }

  if (!room) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Loading chat room...</Typography>
      </Box>
    );
  }

  const isCommunity = room.type === 'community';
  const memberCount = isCommunity 
    ? (room as Community).members.length 
    : participants.length;

  return (
    <Paper sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'inherit' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">{room.name}</Typography>
          <Typography variant="body2">{room.description}</Typography>
        </Box>
        <Typography variant="body2">
          {memberCount} members • {participants.length} online
        </Typography>
      </Box>

      {/* Active Participants */}
      <Box sx={{ 
        p: 1, 
        borderBottom: 1, 
        borderColor: 'divider', 
        display: 'flex', 
        gap: 1, 
        overflowX: 'auto',
        bgcolor: 'background.paper'
      }}>
        {participants.map((participant) => (
          <Box key={participant.id} sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            px: 1 
          }}>
            <Avatar
              src={participant.avatar}
              alt={participant.name}
              sx={{ 
                width: 32, 
                height: 32,
                border: '2px solid',
                borderColor: participant.status === 'online' ? 'success.main' : 'grey.300'
              }}
            />
            <Typography variant="caption" sx={{ mt: 0.5 }}>
              {participant.name.split(' ')[0]}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Chat Interface */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {roomId && currentUser && (
          <ChatInterface roomId={roomId} userId={currentUser.id} />
        )}
      </Box>
    </Paper>
  );
};

export default ChatRoom;