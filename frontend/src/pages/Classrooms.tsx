import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Classroom {
  id: string;
  name: string;
  instructor: string;
  description: string;
  students: number;
  progress: number;
  nextClass: string;
  assignments: number;
  topics: string[];
  avatar: string;
}

const mockClassrooms: Classroom[] = [
  {
    id: '1',
    name: 'Data Structures',
    instructor: 'Dr. Sarah Johnson',
    description: 'Learn fundamental data structures and algorithmic techniques.',
    students: 25,
    progress: 65,
    nextClass: 'Tomorrow, 10:00 AM',
    assignments: 2,
    topics: ['Arrays', 'Linked Lists', 'Trees'],
    avatar: 'DS',
  },
  {
    id: '2',
    name: 'Web Development',
    instructor: 'Prof. Michael Chen',
    description: 'Master modern web development technologies and practices.',
    students: 30,
    progress: 45,
    nextClass: 'Today, 2:00 PM',
    assignments: 1,
    topics: ['HTML/CSS', 'JavaScript', 'React'],
    avatar: 'WD',
  },
];

const ClassroomCard: React.FC<{ classroom: Classroom }> = ({ classroom }) => {
  const navigate = useNavigate();

  return (
    <Box 
      onClick={() => navigate(`/classroom-chat/${classroom.id}`, { state: { type: 'classroom' } })}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        p: 2,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'rgba(0, 0, 0, 0.04)',
        },
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          bgcolor: 'primary.main',
          fontSize: '1.25rem',
          mr: 2
        }}
      >
        {classroom.avatar}
      </Avatar>
      <Box flex={1} overflow="hidden">
        <Typography variant="subtitle1" noWrap>
          {classroom.name}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          noWrap
        >
          {classroom.instructor}
        </Typography>
        <Stack 
          direction="row" 
          spacing={2} 
          sx={{ mt: 0.5 }}
        >
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.75rem'
            }}
          >
            <ScheduleIcon sx={{ fontSize: 14, mr: 0.5 }} />
            {classroom.nextClass}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontSize: '0.75rem'
            }}
          >
            <AssignmentIcon sx={{ fontSize: 14, mr: 0.5 }} />
            {classroom.assignments} assignments
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
};

const Classrooms: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredClassrooms = mockClassrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classroom.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        {filteredClassrooms.map((classroom) => (
          <ClassroomCard key={classroom.id} classroom={classroom} />
        ))}
      </Box>
    </Box>
  );
};

export default Classrooms;