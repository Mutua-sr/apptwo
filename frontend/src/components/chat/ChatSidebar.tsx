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
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { Info as InfoIcon, Add as AddIcon } from '@mui/icons-material';
import { Community, Classroom } from '../../types/api';
import EmptyRoomList from './EmptyRoomList';

// Create a union type that combines all required properties
type RoomBase = {
  _id: string;
  name: string;
  type: 'classroom' | 'community';
  unreadCount?: number;
  avatar?: string;
  lastMessage?: string;
};

// Extend the base type with API types
type ExtendedRoom = RoomBase & (Community | Classroom);

interface ChatSidebarProps {
  type: 'classroom' | 'community';
  rooms: ExtendedRoom[];
  availableRooms: ExtendedRoom[];
  selectedRoomId?: string;
  onRoomSelect: (room: ExtendedRoom) => void;
  onInfoClick: (room: ExtendedRoom) => void;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (name: string, description: string) => void;
}

const ChatSidebar: FC<ChatSidebarProps> = ({
  type,
  rooms,
  availableRooms,
  selectedRoomId,
  onRoomSelect,
  onInfoClick,
  onJoinRoom,
  onCreateRoom,
}) => {
  if (rooms.length === 0) {
    return (
      <EmptyRoomList
        type={type}
        availableRooms={availableRooms}
        onJoin={onJoinRoom}
        onCreate={onCreateRoom}
      />
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: '100%',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {type === 'classroom' ? 'Classrooms' : 'Communities'}
          </Typography>
          <Button
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => onCreateRoom('', '')}
          >
            New
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
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
                  <IconButton 
                    edge="end" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onInfoClick(room);
                    }}
                  >
                    <InfoIcon />
                  </IconButton>
                }
                onClick={() => onRoomSelect(room)}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={room.unreadCount || 0}
                    color="primary"
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right'
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
                      {room.lastMessage || `${room.type === 'classroom' ? 'Classroom' : 'Community'} chat`}
                    </Typography>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ChatSidebar;