import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress,
  Chip,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Chat as ChatIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { ExtendedRoom } from '../../types/chat';
import { Classroom } from '../../types/room';
import apiService from '../../services/apiService';
import EmptyRoomList from './EmptyRoomList';
import { useAuth } from '../../contexts/AuthContext';

const ClassroomChatList: React.FC = () => {
  const [rooms, setRooms] = useState<ExtendedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const mapClassroomToExtendedRoom = (classroom: Classroom): ExtendedRoom => ({
    _id: classroom._id,
    name: classroom.name,
    description: classroom.description,
    type: classroom.type,
    chatRoomId: classroom.chatRoomId,
    avatar: classroom.avatar,
    createdById: classroom.createdById,
    createdBy: classroom.createdBy,
    createdAt: classroom.createdAt,
    updatedAt: classroom.updatedAt,
    settings: classroom.settings,
    teachers: classroom.teachers,
    students: classroom.students,
    assignments: classroom.assignments,
    materials: classroom.materials,
    unreadCount: 0,
    lastMessage: undefined
  });

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.classrooms.getUserClassrooms();
      if (response.data.success) {
        const extendedRooms = response.data.data.map(mapClassroomToExtendedRoom);
        setRooms(extendedRooms);
      } else {
        throw new Error(response.data.error?.message || 'Failed to fetch classrooms');
      }
    } catch (err: any) {
      console.error('Error fetching classrooms:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to load classrooms';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchRooms();
    }
  }, [currentUser]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await apiService.classrooms.join(roomId);
      const response = await apiService.classrooms.getUserClassrooms();
      if (response.data.success) {
        const extendedRooms = response.data.data.map(mapClassroomToExtendedRoom);
        setRooms(extendedRooms);
      }
    } catch (err) {
      console.error('Error joining classroom:', err);
      setError('Failed to join classroom. Please try again.');
    }
  };

  const handleCreateRoom = async (name: string, description: string) => {
    try {
      const response = await apiService.classrooms.create({
        type: 'classroom',
        name,
        description,
        settings: {
          allowStudentChat: true,
          allowStudentPosts: true,
          allowStudentComments: true,
          isPrivate: false,
          requirePostApproval: false,
          notifications: {
            assignments: true,
            materials: true,
            announcements: true
          }
        }
      });
      
      if (response.data.success) {
        const newExtendedRoom = mapClassroomToExtendedRoom(response.data.data);
        setRooms([...rooms, newExtendedRoom]);
      }
    } catch (err) {
      console.error('Error creating classroom:', err);
      setError('Failed to create classroom. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 200 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 4, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center'
      }}>
        <Typography color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={fetchRooms}
          startIcon={<RefreshIcon />}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyRoomList
        type="classroom"
        availableRooms={[]}
        onJoin={handleJoinRoom}
        onCreate={handleCreateRoom}
      />
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
        {currentUser?.role === 'teacher' ? 'Your Teaching Classrooms' : 'Your Enrolled Classrooms'}
      </Typography>
      
      <Grid container spacing={3}>
        {rooms.map((room) => (
          <Grid item xs={12} md={6} lg={4} key={room._id}>
            <Paper
              component={Link}
              to={`/chat/${room.chatRoomId || room._id}`}
              sx={{
                p: 3,
                display: 'block',
                textDecoration: 'none',
                transition: 'box-shadow 0.2s',
                '&:hover': {
                  boxShadow: 6
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: 'text.primary' }}>
                    {room.name}
                  </Typography>
                  {room.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {room.description}
                    </Typography>
                  )}
                </Box>
                {room.unreadCount && room.unreadCount > 0 && (
                  <Chip 
                    label={room.unreadCount}
                    color="primary"
                    size="small"
                  />
                )}
              </Box>

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                  <PeopleIcon sx={{ fontSize: 'small', mr: 0.5 }} />
                  <Typography variant="body2">
                    {room.students?.length || 0} students
                  </Typography>
                </Box>

                {room.settings?.allowStudentChat && (
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                    <ChatIcon sx={{ fontSize: 'small', mr: 0.5 }} />
                    <Typography variant="body2">
                      Chat enabled
                    </Typography>
                  </Box>
                )}
              </Box>

              {room.lastMessage && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {room.lastMessage}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ClassroomChatList;