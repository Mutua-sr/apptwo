import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
import { DatabaseService } from '../services/databaseService';
import { chatService } from '../services/apiService';

interface Message {
  _id: string;
  type: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: string;
  roomId: string;
}

interface ChatRoom {
  _id: string;
  type: string;
  name: string;
  description: string;
  participants: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
}

const ChatRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roomData, messagesData, userData] = await Promise.all([
          DatabaseService.read<ChatRoom>(id!),
          DatabaseService.find<Message>({ type: 'message', roomId: id }),
          DatabaseService.read('currentUser')
        ]);

        if (!roomData) {
          throw new Error('Chat room not found');
        }

        setRoom(roomData);
        setMessages(messagesData.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ));
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Subscribe to new messages
    chatService.onMessage((message: any) => {
      if (message.roomId === id) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      // Cleanup subscription
      chatService.offMessage((message: any) => {
        console.log('Unsubscribed from messages');
      });
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      const message = {
        type: 'message',
        content: newMessage.trim(),
        sender: {
          id: currentUser._id,
          name: currentUser.name,
          avatar: currentUser.avatar
        },
        roomId: id,
        timestamp: new Date().toISOString()
      };

      await DatabaseService.create(message);
      chatService.sendMessage(newMessage, id);
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
            {room.name}
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
                flexDirection: currentUser?._id === message.sender.id ? 'row-reverse' : 'row',
                gap: 1,
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: currentUser?._id === message.sender.id ? 'primary.main' : 'secondary.main'
                }}
              >
                {message.sender.avatar || message.sender.name.charAt(0)}
              </Avatar>
              <Box
                sx={{
                  maxWidth: '70%',
                  bgcolor: currentUser?._id === message.sender.id ? 'primary.main' : 'background.paper',
                  color: currentUser?._id === message.sender.id ? 'white' : 'text.primary',
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