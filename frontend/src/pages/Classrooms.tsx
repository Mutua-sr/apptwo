import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatabaseService } from '../services/databaseService';

interface Classroom {
  _id: string;
  type: string;
  name: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    avatar: string;
  };
  students: number;
  progress: number;
  nextClass?: string;
  assignments: number;
  topics: string[];
}

const ClassroomCard: React.FC<{ classroom: Classroom }> = ({ classroom }) => {
  const navigate = useNavigate();

  return (
    <Box 
      onClick={() => navigate(`/classroom/${classroom._id}`)}
      sx={{
        p: 2,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.04)',
        },
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontSize: '1.25rem'
            }}
          >
            {classroom.name.charAt(0)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle1" fontWeight={500}>
              {classroom.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {classroom.description}
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={1}>
          <LinearProgress 
            variant="determinate" 
            value={classroom.progress} 
            sx={{ height: 6, borderRadius: 1 }}
          />
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {classroom.students} students
            </Typography>

            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <AssignmentIcon sx={{ fontSize: 16, mr: 0.5 }} />
              {classroom.assignments} assignments
            </Typography>

            {classroom.nextClass && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                Next: {new Date(classroom.nextClass).toLocaleDateString()}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

const Classrooms: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        setLoading(true);
        const data = await DatabaseService.find<Classroom>({ type: 'classroom' });
        setClassrooms(data);
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError('Failed to load classrooms');
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classroom.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classroom.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="h6">
          Classrooms
        </Typography>
        <IconButton color="inherit" size="small">
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1, bgcolor: 'background.paper' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search classrooms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'action.hover',
            }
          }}
        />
      </Box>

      <Box sx={{ 
        flex: 1, 
        overflow: 'auto',
        bgcolor: 'background.paper'
      }}>
        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredClassrooms.length > 0 ? (
          filteredClassrooms.map((classroom) => (
            <ClassroomCard key={classroom._id} classroom={classroom} />
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
            {searchQuery ? 'No classrooms found matching your search' : 'No classrooms available'}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Classrooms;