import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, IconButton, Avatar, Divider } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import ChatInterface from '../components/chat/ChatInterface';
import { chatService } from '../services/chatService';
import { ChatRoom as ChatRoomType, ChatParticipant } from '../types/chat';

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);

  useEffect(() => {
    const initializeChat = async () => {
      if (!roomId) return;

      try {
        // Connect to chat service
        await chatService.connect();
        
        // Join the room
        chatService.joinRoom(roomId);
        
        // Get room details
        const roomData = await chatService.getRoom(roomId);
        setRoom(roomData);
        
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

      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Failed to load chat room');
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
  }, [roomId]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
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
        <Typography variant="h6" sx={{ flex: 1 }}>{room.name}</Typography>
        <Typography variant="body2">
          {participants.length} members
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
                borderColor: 'primary.main'
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
        {roomId && room.id && (
          <ChatInterface roomId={roomId} userId={room.id} />
        )}
      </Box>
    </Paper>
  );
};

export default ChatRoom;