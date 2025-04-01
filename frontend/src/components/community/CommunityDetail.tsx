import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Box, Button } from '@mui/material';
import { ChatBubble as ChatIcon } from '@mui/icons-material';
import { Community } from '../../types/community';

interface CommunityDetailProps {
  community: Community;
  onClick: () => void;
}

export const CommunityDetail: React.FC<CommunityDetailProps> = ({ community, onClick }) => {
  const navigate = useNavigate();

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/community/${community._id}`);
  };

  return (
    <Card onClick={onClick} sx={{ cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {community.coverImage && (
        <CardMedia
          component="img"
          height="140"
          image={community.coverImage}
          alt={community.name}
        />
      )}
      <CardContent sx={{ flex: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {community.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {community.description}
        </Typography>
        <Box sx={{ mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Members: {community.members?.length || 0}
          </Typography>
          {community.lastMessage && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Last message: {community.lastMessage.content.substring(0, 50)}...
            </Typography>
          )}
          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            onClick={handleChatClick}
            fullWidth
          >
            Open Chat {community.unreadCount ? `(${community.unreadCount})` : ''}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};