import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { Classroom, CreateClassroomData } from '../types/room';

const Classrooms: React.FC = () => {
  const { currentUser } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
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
      setClassrooms(response.data.data);
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
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {classrooms.map(classroom => (
            <Box
              key={classroom._id}
              sx={{
                p: 2,
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="h6">{classroom.name}</Typography>
              <Typography color="text.secondary">{classroom.description}</Typography>
            </Box>
          ))}
        </Box>
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