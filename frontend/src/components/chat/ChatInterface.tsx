import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Stack,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Videocam as VideocamIcon,
  Call as CallIcon,
  MoreVert as MoreVertIcon,
  EmojiEmotions as EmojiIcon,
} from '@mui/icons-material';
import { chatInterfaceStyles as styles } from '../../styles/components/ChatInterface.styles';
import { ChatMessage } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';
import apiService from '../../services/apiService';

interface ChatInterfaceProps {
  roomId: string;
  title: string;
  subtitle?: string;
  avatar: string;
  isLive?: boolean;
  onStartVideoCall?: () => void;
  onStartVoiceCall?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  roomId,
  title,
  subtitle,
  avatar,
  isLive,
  onStartVideoCall,
  onStartVoiceCall,
}) => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        const response = await apiService.chat.getMessages(roomId);
        setMessages(response.data.data);
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      loadMessages();
    }
  }, [roomId]);

  // Handle real-time messages
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      if (message.roomId === roomId) {
        setMessages(prev => [...prev, message]);
      }
    };

    chatService.onMessage(handleNewMessage);
    chatService.joinRoom(roomId);

    return () => {
      chatService.offMessage(handleNewMessage);
      chatService.leaveRoom(roomId);
    };
  }, [roomId]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (message.trim() && currentUser) {
      try {
        await chatService.sendMessage(message.trim(), roomId);
        setMessage('');
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={styles.container}>
      {/* Header */}
      <Paper elevation={2} sx={styles.header}>
        <Stack sx={styles.headerContent}>
          <Stack sx={styles.userInfo}>
            <Avatar src={avatar} alt={title} />
            <Box>
              <Typography variant="subtitle1" fontWeight={500}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack sx={styles.actions}>
            {onStartVoiceCall && (
              <IconButton onClick={onStartVoiceCall}>
                <CallIcon />
              </IconButton>
            )}
            {onStartVideoCall && (
              <IconButton 
                onClick={onStartVideoCall}
                color={isLive ? "error" : "default"}
              >
                <VideocamIcon />
              </IconButton>
            )}
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Messages */}
      <Box sx={styles.messageContainer}>
        <Stack spacing={2}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 2, textAlign: 'center', color: 'error.main' }}>
              <Typography>{error}</Typography>
            </Box>
          ) : (
            messages.map((msg) => (
              <Box
                key={msg._id}
                sx={styles.messageWrapper(msg.sender.id === currentUser?.id)}
              >
                <Paper sx={styles.messageContent(msg.sender.id === currentUser?.id)}>
                  {msg.sender.id !== currentUser?.id && (
                    <Typography variant="caption" fontWeight={500}>
                      {msg.sender.name}
                    </Typography>
                  )}
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography sx={styles.timestamp}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </Typography>
                </Paper>
              </Box>
            ))
          )}
          <div ref={messagesEndRef} />
        </Stack>
      </Box>

      {/* Input */}
      <Paper elevation={3} sx={styles.inputContainer}>
        <Stack sx={styles.inputWrapper}>
          <IconButton size="small" sx={styles.emojiButton}>
            <EmojiIcon />
          </IconButton>
          <IconButton size="small" sx={styles.attachButton}>
            <AttachFileIcon />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message"
            variant="outlined"
            size="small"
            sx={styles.messageField}
          />
          <IconButton 
            color="primary"
            onClick={handleSend}
            disabled={!message.trim()}
            sx={styles.sendButton}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ChatInterface;