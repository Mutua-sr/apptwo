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
    <Paper 
      sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.9) 100%)',
        backdropFilter: 'blur(12px)',
        color: '#FFFFFF'
      }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ 
            color: 'inherit',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h6" 
            sx={{
              fontWeight: 600,
              background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            {room.name}
          </Typography>
          <Typography 
            variant="body2"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: 500
            }}
          >
            {room.description}
          </Typography>
        </Box>
        <Typography variant="body2">
          {memberCount} members • {participants.length} online
        </Typography>
      </Box>

      {/* Active Participants */}
      <Box sx={{ 
        p: 1, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        gap: 1, 
        overflowX: 'auto',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(12px)'
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
              borderColor: participant.status === 'online' ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
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