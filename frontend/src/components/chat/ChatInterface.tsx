import React from 'react';
import type { FC, ChangeEvent, ReactElement } from 'react';
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

interface MessageType extends ChatMessage {
  isDeleted?: boolean;
  isEdited?: boolean;
}

const ChatInterface = ({ roomId, userId }: ChatInterfaceProps): ReactElement => {

  const [messages, setMessages] = React.useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const fetchedMessages = await chatService.getMessages(roomId);
      setMessages(fetchedMessages);
      setIsLoading(false);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching messages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMessages();

    // Subscribe to all chat events
    const messageHandler = (message: MessageType) => {
      setMessages((prev: MessageType[]) => [...prev, message]);
      scrollToBottom();
    };

    const updateHandler = (updatedMessage: MessageType) => {
      setMessages((prev: MessageType[]) => prev.map(msg => 
        msg.id === updatedMessage.id ? updatedMessage : msg
      ));
    };

    const deleteHandler = (messageId: string) => {
      setMessages((prev: MessageType[]) => prev.map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true } : msg
      ));
    };

    chatService.onMessageReceived(messageHandler);
    chatService.onMessageUpdated(updateHandler);
    chatService.onMessageDeleted(deleteHandler);

    // Cleanup event listeners
    return () => {
      chatService.onMessageReceived(() => {});
      chatService.onMessageUpdated(() => {});
      chatService.onMessageDeleted(() => {});
    };
  }, [roomId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(roomId, newMessage);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          {messages.map((message: MessageType) => (
            <ListItem
              key={message.id}
              sx={{
                display: 'flex',
                flexDirection: message.senderId === userId ? 'row-reverse' : 'row',
                gap: 1,
                mb: 1,
              }}
            >
              {!message.isDeleted && (
                <Avatar 
                  src={message.senderAvatar} 
                  alt={message.senderName}
                  sx={{ 
                    width: 32, 
                    height: 32,
                    opacity: message.isDeleted ? 0.5 : 1 
                  }}
                />
              )}
              <Box
                sx={{
                  backgroundColor: message.senderId === userId ? 'primary.main' : 'grey.200',
                  color: message.senderId === userId ? 'primary.contrastText' : 'text.primary',
                  p: 2,
                  borderRadius: 2,
                  maxWidth: '70%',
                }}
              >
                {message.isDeleted ? (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                    This message has been deleted
                  </Typography>
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      {message.senderName}
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </Typography>
                    <Typography variant="caption" color="inherit" sx={{ opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                      {message.isEdited && ' (edited)'}
                    </Typography>
                  </>
                )}
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
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
            InputProps={{
              onKeyDown: handleKeyDown
            }}
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