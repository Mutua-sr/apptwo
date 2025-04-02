import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Typography, Box, ListItemAvatar, Avatar } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import { chatService } from '../../services/chatService';
import { ChatRoom } from '../../types/chat';

interface ClassroomChatListProps {
  onSelectClassroom: (id: string) => void;
  selectedClassroom: string | null;
}

const ClassroomChatList: React.FC<ClassroomChatListProps> = ({
  onSelectClassroom,
  selectedClassroom
}) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const fetchedRooms = await chatService.getRoom('classroom');
        setRooms(Array.isArray(fetchedRooms) ? fetchedRooms : [fetchedRooms]);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch classrooms');
        setLoading(false);
        console.error(err);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading classrooms...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (rooms.length === 0) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center' 
      }}>
        <SchoolIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
          No Classrooms Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Join a classroom to start chatting
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {rooms.map((room) => (
        <ListItem
          key={room.id}
          button
          selected={selectedClassroom === room.id}
          onClick={() => onSelectClassroom(room.id)}
          sx={{
            borderRadius: 1,
            mb: 0.5,
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                backgroundColor: 'primary.dark',
              }
            }
          }}
        >
          <ListItemAvatar>
            <Avatar 
              src={room.avatar} 
              alt={room.name}
              sx={{ 
                bgcolor: selectedClassroom === room.id ? 'primary.contrastText' : 'primary.main'
              }}
            >
              <SchoolIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={room.name}
            secondary={
              <Typography
                variant="body2"
                sx={{
                  color: selectedClassroom === room.id ? 'primary.contrastText' : 'text.secondary',
                  opacity: 0.8
                }}
              >
                {room.participants?.length || 0} participants
              </Typography>
            }
          />
          {room.unreadCount > 0 && (
            <Box
              sx={{
                bgcolor: 'error.main',
                color: 'error.contrastText',
                borderRadius: '50%',
                minWidth: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {room.unreadCount}
            </Box>
          )}
        </ListItem>
      ))}
    </List>
  );
};

export default ClassroomChatList;