import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, IconButton } from '@mui/material';
import { Send as SendIcon, EmojiEmotions as EmojiIcon } from '@mui/icons-material';
import { useChat } from '../../contexts/ChatContext';
import { ChatMessage } from '../../types/chat';

interface ChatInterfaceProps {
  roomId: string;
  userId: string;
  type: 'community' | 'classroom';
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ roomId, userId, type }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    messages,
    sendMessage,
    markAsRead,
    addReaction,
    removeReaction
  } = useChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      try {
        await sendMessage(newMessage);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing event through socket
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit stopped typing event
    }, 1000);
  };

  const handleReaction = async (messageId: string, reaction: string, hasReacted: boolean) => {
    try {
      if (hasReacted) {
        await removeReaction(messageId, reaction);
      } else {
        await addReaction(messageId, reaction);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const isOwnMessage = (message: ChatMessage) => message.senderId === userId;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: isOwnMessage(message) ? 'flex-end' : 'flex-start',
              mb: 2
            }}
          >
            <Paper
              sx={{
                p: 1,
                backgroundColor: isOwnMessage(message) ? 'primary.main' : 'grey.200',
                color: isOwnMessage(message) ? 'white' : 'black',
                maxWidth: '70%',
                borderRadius: 2
              }}
            >
              {!isOwnMessage(message) && (
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {message.senderName}
                </Typography>
              )}
              <Typography variant="body1">{message.content}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Typography variant="caption" sx={{ mr: 1 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
                {message.reactions && Object.entries(message.reactions).map(([reaction, users]) => (
                  <Typography
                    key={reaction}
                    variant="caption"
                    sx={{
                      mr: 0.5,
                      cursor: 'pointer',
                      opacity: users.includes(userId) ? 1 : 0.6
                    }}
                    onClick={() => handleReaction(message.id, reaction, users.includes(userId))}
                  >
                    {reaction} {users.length}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>
      <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="small" sx={{ mr: 1 }}>
            <EmojiIcon />
          </IconButton>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            multiline
            maxRows={4}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            sx={{ ml: 1 }}
            disabled={!newMessage.trim()}
          >
            <SendIcon />
          </Button>
        </Box>
        {isTyping && (
          <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
            Someone is typing...
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChatInterface;