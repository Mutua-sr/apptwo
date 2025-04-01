import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import apiService from '../services/apiService';
import chatService from '../services/chatService';
import { ChatRoom as ChatRoomType, ChatMessage } from '../types/chat';

export interface ChatRoomProps {
  chatType: 'direct' | 'classroom' | 'community';
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatType }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [room, setRoom] = useState<ChatRoomType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get current user from auth service
        const user = apiService.auth.getCurrentUser();
        setCurrentUser(user);

        // Get room data based on chat type
        let roomData;
        switch (chatType) {
          case 'classroom':
            const classroomResponse = await apiService.classrooms.getById(roomId!);
            const classroomData = classroomResponse.data.data;
            roomData = {
              _id: classroomData._id,
              name: classroomData.name,
              type: 'classroom' as const,
              participants: classroomData.students || [],
              createdBy: classroomData.createdBy,
              createdAt: classroomData.createdAt
            };
            break;
          case 'community':
            const communityResponse = await apiService.communities.getById(roomId!);
            const communityData = communityResponse.data.data;
            roomData = {
              _id: communityData._id,
              name: communityData.name,
              type: 'community' as const,
              participants: communityData.members || [],
              createdBy: communityData.createdBy,
              createdAt: communityData.createdAt
            };
            break;
          default:
            throw new Error('Direct chat not implemented yet');
        }

        if (!roomData) {
          throw new Error('Chat room not found');
        }

        setRoom(roomData as ChatRoomType);
        
        // Join the chat room
        chatService.joinRoom(roomId!);

        // Subscribe to new messages
        const messageHandler = (message: ChatMessage) => {
          if (message.roomId === roomId) {
            setMessages(prev => [...prev, message]);
          }
        };

        chatService.onMessage(messageHandler);

        return () => {
          chatService.offMessage(messageHandler);
        };

      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup on unmount
    return () => {
      if (roomId) {
        chatService.leaveRoom(roomId);
      }
    };
  }, [roomId, chatType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !roomId) return;

    try {
      chatService.sendMessage(newMessage.trim(), roomId);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !room) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error || 'Chat room not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper 
        elevation={1} 
        sx={{ 
          px: 2, 
          py: 1,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 0
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton 
            color="inherit" 
            edge="start"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            {room.name} ({chatType})
          </Typography>
        </Stack>
      </Paper>

      {/* Messages */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        bgcolor: 'background.default',
        p: 2
      }}>
        <Stack spacing={2}>
          {messages.map((message) => (
            <Box
              key={message._id}
              sx={{
                display: 'flex',
                flexDirection: currentUser?.id === message.sender.id ? 'row-reverse' : 'row',
                gap: 1,
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: currentUser?.id === message.sender.id ? 'primary.main' : 'secondary.main'
                }}
              >
                {message.sender.avatar || message.sender.name.charAt(0)}
              </Avatar>
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: currentUser?.id === message.sender.id ? 'primary.main' : 'background.paper',
                  color: currentUser?.id === message.sender.id ? 'white' : 'text.primary',
                  p: 1.5,
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {message.content}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mt: 0.5,
                    opacity: 0.8
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Message Input */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 2,
          borderRadius: 0
        }}
      >
        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            size="small"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <IconButton 
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChatRoom;