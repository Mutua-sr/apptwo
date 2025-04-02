import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  List,
  ListItem,
  CircularProgress,
} from '@mui/material';
import { 
  Send as SendIcon, 
  EmojiEmotions as EmojiIcon,
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import { ChatMessage } from '../../types/chat';
import { chatService } from '../../services/chatService';

interface ChatInterfaceProps {
  roomId: string;
  userId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ roomId, userId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await chatService.getMessages(roomId);
      setMessages(fetchedMessages);
      setIsLoading(false);
      scrollToBottom();
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to load messages';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to new messages
    chatService.onMessageReceived((message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(roomId, newMessage);
      setNewMessage('');
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to send message';
      setError(errorMessage);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        flexDirection: 'column',
        gap: 2
      }}>
        <Typography color="error" align="center">
          {error}
        </Typography>
        <IconButton 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchMessages();
          }}
          sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          backgroundColor: 'background.default',
        }}
      >
        <List>
          {messages.map((message, index) => (
            <ListItem
              key={message.id || index}
              sx={{
                display: 'flex',
                flexDirection: message.senderId === userId ? 'row-reverse' : 'row',
                gap: 1,
                mb: 1,
              }}
            >
              <Avatar src={message.senderAvatar} alt={message.senderName} />
              <Box
                sx={{
                  backgroundColor: message.senderId === userId ? 'primary.main' : 'grey.200',
                  color: message.senderId === userId ? 'primary.contrastText' : 'text.primary',
                  p: 2,
                  borderRadius: 2,
                  maxWidth: '70%',
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {message.senderName}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>
      
      <Box sx={{ p: 2, backgroundColor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" sx={{ alignSelf: 'flex-end' }}>
            <EmojiIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton 
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;