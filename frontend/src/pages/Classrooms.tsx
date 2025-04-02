import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon, ArrowForward as ArrowForwardIcon, Chat as ChatIcon, Edit as EditIcon } from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import { Classroom } from '../types/room';
import apiService from '../services/apiService';

interface ClassroomCardProps {
  classroom: Classroom;
  onEnter: (id: string) => void;
}

const ClassroomCard = ({ classroom, onEnter }: ClassroomCardProps) => (
  <Paper 
    elevation={1} 
    className="p-6 hover:shadow-lg transition-smooth animate-fade-in"
    sx={{ 
      '&:hover': { 
        transform: 'translateY(-2px)',
        transition: 'all 0.2s ease-in-out'
      }
    }}
  >
    <Box className="flex items-start justify-between">
      <Box className="flex-1">
        <Typography variant="h6" className="mb-2 text-gradient">
          {classroom.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" className="mb-4">
          {classroom.description}
        </Typography>
        
        <Box className="flex items-center space-x-4 text-sm" color="text.secondary">
          <Box className="flex items-center">
            <i className="fas fa-user-tie mr-2 text-indigo-500" />
            <Typography variant="body2">{classroom.createdBy.name}</Typography>
          </Box>
          <Box className="flex items-center">
            <i className="fas fa-users mr-2 text-indigo-500" />
            <Typography variant="body2">{classroom.students.length} students</Typography>
          </Box>
        </Box>
      </Box>
    </Box>

    <Box className="mt-6 flex items-center justify-between">
      <Box className="flex flex-wrap gap-2">
        {classroom.settings.allowStudentChat && (
          <Box className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-medium flex items-center">
            <ChatIcon fontSize="small" className="mr-1" />
            Chat
          </Box>
        )}
        {classroom.settings.allowStudentPosts && (
          <Box className="px-3 py-1 bg-green-50 text-green-600 text-xs rounded-full font-medium flex items-center">
            <EditIcon fontSize="small" className="mr-1" />
            Posts
          </Box>
        )}
      </Box>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => onEnter(classroom._id)}
        endIcon={<ArrowForwardIcon />}
      >
        Enter
      </Button>
    </Box>
  </Paper>
);

const EmptyState = ({ onCreateClick }: { onCreateClick: () => void }) => (
  <Paper className="text-center py-16 animate-slide-up">
    <Box className="text-6xl text-indigo-200 mb-4">
      <i className="fas fa-chalkboard-teacher" />
    </Box>
    <Typography variant="h5" gutterBottom>No Classrooms Yet</Typography>
    <Typography variant="body1" color="text.secondary" gutterBottom>
      Create or join a classroom to get started
    </Typography>
    <Button
      variant="outlined"
      color="primary"
      onClick={onCreateClick}
      startIcon={<AddIcon />}
      sx={{ mt: 3 }}
    >
      Create Your First Classroom
    </Button>
  </Paper>
);

const ClassroomsContent = () => {
  const navigate = useNavigate();
  const [classrooms, setClassrooms] = React.useState<Classroom[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await apiService.classrooms.getUserClassrooms();
        setClassrooms(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch classrooms');
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const handleEnterClassroom = (id: string) => {
    navigate(`/classroom/${id}`);
  };

  const handleCreateClassroom = () => {
    navigate('/classroom/create');
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center" sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex items-center justify-center" sx={{ minHeight: 'calc(100vh - 64px)' }}>
        <Alert severity="error" sx={{ minWidth: 300 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <Box className="flex justify-between items-center mb-8">
        <Box>
          <Typography variant="h4" gutterBottom>
            My Classrooms
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and access your virtual classrooms
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateClassroom}
          startIcon={<AddIcon />}
        >
          Create Classroom
        </Button>
      </Box>

      {classrooms.length === 0 ? (
        <EmptyState onCreateClick={handleCreateClassroom} />
      ) : (
        <Box 
          className="grid gap-6"
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            }
          }}
        >
          {classrooms.map((classroom) => (
            <ClassroomCard 
              key={classroom._id} 
              classroom={classroom} 
              onEnter={handleEnterClassroom}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const Classrooms = () => {
  return (
    <MainLayout>
      <ClassroomsContent />
    </MainLayout>
  );
};

export default Classrooms;