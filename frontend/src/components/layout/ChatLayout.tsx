import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { ChatRoom } from '../../types/chat';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';

interface ChatLayoutProps {
  type: 'classroom' | 'community';
  selectedRoomId?: string;
  onRoomSelect?: (roomId: string) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  type,
  selectedRoomId,
  onRoomSelect
}) => {
  const { roomId } = useParams<{ roomId: string }>();
  const { currentUser } = useAuth();
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRoomSelect = (roomId: string) => {
    if (onRoomSelect) {
      onRoomSelect(roomId);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>Loading chat...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex' }}>
      <Grid container sx={{ height: '100%' }}>
        {/* Chat List */}
        <Grid item xs={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              {type === 'classroom' ? 'Classroom Chats' : 'Community Chats'}
            </Typography>
          </Box>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={9}>
          {selectedRoomId ? (
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">
                  {room?.name || 'Chat Room'}
                </Typography>
              </Box>

              {/* Messages Area */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {/* Messages will be rendered here */}
              </Box>

              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                {/* Message input component will be here */}
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Typography color="textSecondary">
                Select a chat to start messaging
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ChatLayout;