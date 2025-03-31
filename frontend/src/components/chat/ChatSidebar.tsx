import React, { FC } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Badge,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Community, Classroom } from '../../types/api';

interface ChatSidebarProps {
  rooms: (Community | Classroom)[];
  selectedRoomId?: string;
  onRoomSelect: (room: Community | Classroom) => void;
  onInfoClick: (room: Community | Classroom) => void;
}

const ChatSidebar: FC<ChatSidebarProps> = ({
  rooms,
  selectedRoomId,
  onRoomSelect,
  onInfoClick,
}) => {
  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      bgcolor: 'background.paper',
      borderRight: 1,
      borderColor: 'divider'
    }}>
      <List sx={{ p: 0 }}>
        {rooms.map((room) => (
          <React.Fragment key={room._id}>
            <ListItem
              sx={{
                cursor: 'pointer',
                bgcolor: selectedRoomId === room._id ? 'action.selected' : 'transparent',
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
              secondaryAction={
                <IconButton edge="end" onClick={(e) => {
                  e.stopPropagation();
                  onInfoClick(room);
                }}>
                  <InfoIcon />
                </IconButton>
              }
              onClick={() => onRoomSelect(room)}
            >
              <ListItemAvatar>
                <Badge
                  badgeContent={room.unreadCount}
                  color="primary"
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                >
                  <Avatar src={room.avatar}>
                    {room.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Badge>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" noWrap>
                    {room.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ fontSize: '0.875rem' }}
                  >
                    {room.lastMessage || `${room.type} chat`}
                  </Typography>
                }
              />
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default ChatSidebar;