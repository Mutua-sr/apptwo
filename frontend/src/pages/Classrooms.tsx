import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert, Grid, Paper } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Classroom as RoomClassroom, CreateClassroomData } from '../types/room';
import { Classroom as UIClassroom } from '../types/classroom';
import ClassroomChat from '../components/chat/ClassroomChat';

const transformClassroom = (classroom: RoomClassroom): UIClassroom => ({
  _id: classroom._id,
  name: classroom.name,
  description: classroom.description,
  type: 'classroom',
  teacher: classroom.teachers[0] || {
    id: classroom.createdById,
    name: classroom.createdBy.name,
    avatar: classroom.createdBy.avatar
  },
  teachers: classroom.teachers,
  students: classroom.students,
  settings: {
    isPrivate: classroom.settings.isPrivate,
    allowStudentChat: classroom.settings.allowStudentChat,
    allowStudentPosts: classroom.settings.allowStudentPosts,
    allowStudentComments: classroom.settings.allowStudentComments,
    requirePostApproval: classroom.settings.requirePostApproval,
    notifications: classroom.settings.notifications
  },
  assignments: classroom.assignments.map(id => ({
    id,
    title: '',
    description: '',
    dueDate: '',
    attachments: [],
    submissions: []
  })),
  materials: classroom.materials.map(id => ({
    id,
    title: '',
    description: '',
    type: '',
    url: '',
    uploadedAt: '',
    tags: []
  })),
  createdAt: classroom.createdAt,
  updatedAt: classroom.updatedAt
});

const Classrooms: React.FC = () => {
  const { currentUser } = useAuth();
  const [classrooms, setClassrooms] = useState<UIClassroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.classrooms.getAll();
      setClassrooms(response.data.data.map(transformClassroom));
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to load classrooms',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleCreateClassroom = async (name: string, description: string) => {
    try {
      const newClassroom: CreateClassroomData = {
        type: 'classroom',
        name,
        description,
        settings: {
          isPrivate: false,
          allowStudentPosts: true,
          allowStudentComments: true,
          allowStudentChat: true,
          requirePostApproval: false,
          notifications: {
            assignments: true,
            materials: true,
            announcements: true
          }
        }
      };

      await apiService.classrooms.create(newClassroom);
      await fetchClassrooms();
      setSnackbar({
        open: true,
        message: 'Classroom created successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to create classroom',
        severity: 'error'
      });
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Please log in to view classrooms.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography>Loading classrooms...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Classrooms
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => handleCreateClassroom('New Classroom', 'A new classroom')}
        >
          Create Classroom
        </Button>
      </Box>

      {classrooms.length === 0 ? (
        <Typography>No classrooms found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {classrooms.map(classroom => (
            <Grid item xs={12} key={classroom._id}>
              <Paper 
                elevation={3}
                sx={{
                  p: 3,
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 3
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {classroom.name}
                  </Typography>
                  <Typography color="text.secondary" paragraph>
                    {classroom.description}
                  </Typography>
                  <Typography variant="subtitle2" gutterBottom>
                    Teachers: {classroom.teachers.map(t => t.name).join(', ')}
                  </Typography>
                  <Typography variant="subtitle2">
                    Students: {classroom.students?.length || 0}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Assignments: {classroom.assignments.length}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Materials: {classroom.materials.length}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: { xs: '100%', md: '400px' },
                  height: { xs: '300px', md: '400px' },
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}>
                  <ClassroomChat classroom={classroom} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Classrooms;