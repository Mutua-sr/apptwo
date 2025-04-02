import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, IconButton, Avatar, CircularProgress, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ChatInterface from '../components/chat/ChatInterface';
import { chatService } from '../services/chatService';
import { ChatParticipant, ChatRoom as ChatRoomType } from '../types/chat';
import { useAuth } from '../contexts/AuthContext';

const ChatRoomComponent: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [room, setRoom] = useState<ChatRoomType | null>(null);
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
        if (!roomId) {
          throw new Error('Chat room ID is required');
        }
        if (!currentUser) {
          throw new Error('You must be logged in to join a chat room');
        }

        // First try to connect to chat service
        try {
          await chatService.connect();
        } catch (err) {
          throw new Error('Unable to connect to chat service. Please try again later.');
        }

        // Then try to get room data
        let roomResponse;
        try {
          roomResponse = await chatService.getRoom(roomId);
        } catch (err) {
          if (err instanceof Error && err.message.includes('404')) {
            throw new Error(`Chat room with ID ${roomId} was not found. It may have been deleted or you may not have access to it.`);
          }
          throw err;
        }

        setRoom(roomResponse);
        chatService.joinRoom(roomId);

        // Get participants after successfully joining
        try {
          const participantsData = await chatService.getRoomParticipants(roomId);
          setParticipants(participantsData);
        } catch (err) {
          console.error('Failed to get participants:', err);
          // Don't throw here, as we already have the room
        }

        try {
          await chatService.markAsRead(roomId);
        } catch (err) {
          console.error('Failed to mark as read:', err);
          // Don't throw here, as it's not critical
        }

        const handlers = {
          handleUserJoined: (participant: ChatParticipant) => {
            setParticipants((prev: ChatParticipant[]) => {
              if (prev.some((p: ChatParticipant) => p.id === participant.id)) {
                return prev;
              }
              return [...prev, participant];
            });
          },
          handleUserLeft: (participant: ChatParticipant) => {
            setParticipants((prev: ChatParticipant[]) => 
              prev.filter((p: ChatParticipant) => p.id !== participant.id)
            );
          }
        };

        chatService.onUserJoined(handlers.handleUserJoined);
        chatService.onUserLeft(handlers.handleUserLeft);
        eventHandlersRef.current = handlers;

      } catch (err) {
        console.error('Failed to initialize chat:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load chat room';
        chatService.disconnect();
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (roomId) {
        try {
          const handlers = eventHandlersRef.current;
          if (handlers.handleUserJoined && handlers.handleUserLeft) {
            const noop = () => {};
            chatService.onUserJoined(noop);
            chatService.onUserLeft(noop);
          }
          
          chatService.leaveRoom(roomId);
        } catch (err) {
          console.error('Error during cleanup:', err);
        } finally {
          chatService.disconnect();
        }
      }
    };
  }, [roomId, currentUser]);

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
          {participants.length} online
        </Typography>
      </Box>

      <Box sx={{ 
        p: 1, 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', 
        display: 'flex', 
        gap: 1, 
        overflowX: 'auto',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(12px)'
      }}>
        {participants.map((participant: ChatParticipant) => (
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

      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {roomId && currentUser?.id && (
          <ChatInterface roomId={roomId} userId={currentUser.id} type="community" />
        )}
      </Box>
    </Paper>
  );
};

export default ChatRoomComponent;
