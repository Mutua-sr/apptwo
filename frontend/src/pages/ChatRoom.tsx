import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, TextField, Button } from '@mui/material';
import { ChatMessage, ChatParticipant } from '../types/chat';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<ChatParticipant[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!roomId) return;

    const loadRoom = async () => {
      try {
        setLoading(true);
        await chatService.connect();
        chatService.joinRoom(roomId);

        // Load messages and participants
        const [roomMessages, roomParticipants] = await Promise.all([
          chatService.getMessages(roomId),
          chatService.getRoomParticipants(roomId)
        ]);

        setMessages(roomMessages);
        setParticipants(roomParticipants);

        // Set up socket event listeners
        chatService.onMessageReceived((message) => {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        });

        chatService.onMessageUpdated((updatedMessage) => {
          setMessages(prev => prev.map(msg => 
            msg._id === updatedMessage._id ? updatedMessage : msg
          ));
        });

        chatService.onMessageDeleted((messageId) => {
          setMessages(prev => prev.filter(msg => msg._id !== messageId));
        });

        chatService.onUserJoined((participant) => {
          setParticipants(prev => [...prev, participant]);
        });

        chatService.onUserLeft((participant) => {
          setParticipants(prev => prev.filter(p => p.id !== participant.id));
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat room');
      } finally {
        setLoading(false);
      }
    };

    loadRoom();

    return () => {
      if (roomId) {
        chatService.leaveRoom(roomId);
        chatService.disconnect();
      }
    };
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !newMessage.trim()) return;

    try {
      await chatService.sendMessage(roomId, newMessage.trim());
      setNewMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <Box
            key={message._id}
            sx={{
              mb: 2,
              display: 'flex',
              flexDirection: message.sender.id === currentUser?.id ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                bgcolor: message.sender.id === currentUser?.id ? 'primary.main' : 'grey.100',
                color: message.sender.id === currentUser?.id ? 'white' : 'text.primary',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                {message.sender.name}
              </Typography>
              <Typography>{message.content}</Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
                {new Date(message.createdAt).toLocaleTimeString()}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message Input */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={!newMessage.trim()}
          >
            Send
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatRoom;