import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Button, Chip } from '@mui/material';
import { ChatBubble as ChatIcon, Public, Lock } from '@mui/icons-material';
import { Community } from '../../types/community';

interface CommunityDetailProps {
  community: Community;
  onClick: () => void;
}

export const CommunityDetail: React.FC<CommunityDetailProps> = ({ community, onClick }) => {
  return (
    <Card 
      onClick={onClick} 
      sx={{ 
        cursor: 'pointer', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      {community.coverImage && (
        <CardMedia
          component="img"
          height="140"
          image={community.coverImage}
          alt={community.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
            {community.name}
          </Typography>
          {community.settings.isPrivate ? (
            <Lock fontSize="small" color="action" />
          ) : (
            <Public fontSize="small" color="action" />
          )}
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {community.description}
        </Typography>

        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip 
              label={`${community.members.length} members`}
              size="small"
              variant="outlined"
            />
            {community.unreadCount ? (
              <Chip 
                label={`${community.unreadCount} unread`}
                color="primary"
                size="small"
              />
            ) : null}
          </Box>

          {community.lastMessage && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Last: {community.lastMessage.content}
            </Typography>
          )}

          <Button
            variant="contained"
            startIcon={<ChatIcon />}
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            sx={{
              mt: 'auto'
            }}
          >
            Open Chat
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};