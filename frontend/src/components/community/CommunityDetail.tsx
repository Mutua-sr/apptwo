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
      sx={(theme) => ({ 
        cursor: 'pointer', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 15px 45px rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }
      })}
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
          <Typography 
            variant="h6" 
            component="div" 
            sx={(theme) => ({ 
              flex: 1,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #818CF8 0%, #34D399 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            })}
          >
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
              sx={{
                background: 'rgba(99, 102, 241, 0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  background: 'rgba(99, 102, 241, 0.25)',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }
              }}
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
              mt: 'auto',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Open Chat
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};