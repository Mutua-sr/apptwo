import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, IconButton, Avatar, CircularProgress, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ChatInterface from '../components/chat/ChatInterface';
import { chatService } from '../services/chatService';
import { ChatParticipant, type ChatRoom } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const eventHandlersRef = useRef<{
    handleUserJoined?: (participant: ChatParticipant) => void;
    handleUserLeft?: (participant: ChatParticipant) => void;
  }>({});
  

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Validate required data
        if (!roomId) {
          throw new Error('Chat room ID is required');
        }
        if (!currentUser) {
          throw new Error('You must be logged in to join a chat room');
        }

        // Connect to chat service
        await chatService.connect();
        
        // Get chat room details
        const roomResponse = await chatService.getRoom(roomId);
        setRoom(roomResponse);
        
        // Join the chat room and get participants
        chatService.joinRoom(roomId);
        const participantsData = await chatService.getRoomParticipants(roomId);
        setParticipants(participantsData);
        
        // Mark messages as read
        await chatService.markAsRead(roomId);

        // Setup event handlers with stable references
        const handlers = {
          handleUserJoined: (participant: ChatParticipant) => {
            setParticipants(prev => {
              // Avoid duplicate participants
              if (prev.some(p => p.id === participant.id)) {
                return prev;
              }
              return [...prev, participant];
            });
          },
          handleUserLeft: (participant: ChatParticipant) => {
            setParticipants(prev => prev.filter(p => p.id !== participant.id));
          }
        };

        // Set up event listeners
        chatService.onUserJoined(handlers.handleUserJoined);
        chatService.onUserLeft(handlers.handleUserLeft);
        eventHandlersRef.current = handlers;
      } catch (err: any) {
        console.error('Failed to initialize chat:', err);
        const errorMessage = err.message?.includes('connect') 
          ? 'Unable to connect to chat service. Please try again later.'
          : err.response?.data?.message || err.message || 'Failed to load chat room';
        
        // Cleanup on any error
        chatService.disconnect();
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    // Cleanup function
    return () => {
      if (roomId) {
        try {
          // First remove event listeners if they were set up
          const handlers = eventHandlersRef.current;
          if (handlers.handleUserJoined && handlers.handleUserLeft) {
            // Remove event listeners by using a shared no-op function
            const noop = () => {};
            chatService.onUserJoined(noop);
            chatService.onUserLeft(noop);
          }
          
          // Then leave the room
          chatService.leaveRoom(roomId);
        } catch (err) {
          console.error('Error during cleanup:', err);
        } finally {
          chatService.disconnect();
        }
      }
    };
  }, [roomId, currentUser]);

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)' 
        }}>
          <CircularProgress sx={{ color: 'primary.main' }} />
        </Box>
      );
    }

    if (error || !currentUser) {
      return (
        <Box sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: 3,
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: 2
        }}>
          <Typography 
            variant="h6" 
            color="error"
            sx={{ 
              textAlign: 'center',
              fontWeight: 500,
              textShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {error || 'Please log in to access this chat room'}
          </Typography>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              padding: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
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
        <Box sx={{ 
          p: 4, 
          display: 'flex', 
          justifyContent: 'center',
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)',
          borderRadius: 2
        }}>
          <Typography sx={{ 
            color: 'text.secondary',
            fontWeight: 500
          }}>
            Loading chat room...
          </Typography>
        </Box>
      );
    }

    return null;
  };

  // Render loading, error, or empty states
  const content = renderContent();
  if (content || !room) {
    return content ?? null;
  }

  const memberCount = participants.length;

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
          <Box 
            key={participant.id} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              px: 1 
            }}
          >
            <Tooltip
              title={`${participant.name} • ${participant.status}`}
              placement="top"
              arrow
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={participant.avatar}
                  alt={participant.name}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    border: '2px solid',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      borderColor: 'rgba(255, 255, 255, 0.4)'
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: participant.status === 'online' ? '#10B981' : '#6B7280',
                    border: '2px solid rgba(30, 41, 59, 0.7)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </Box>
            </Tooltip>
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 0.5,
                color: participant.status === 'online' ? 'text.primary' : 'text.secondary',
                transition: 'color 0.2s ease-in-out'
              }}
            >
              {participant.name.split(' ')[0]}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Chat Interface */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {roomId && currentUser?.id && (
          <ChatInterface roomId={roomId} userId={currentUser.id} />
        )}
      </Box>
    </Paper>
  );
};

export default ChatRoom;
