import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  topics: string[];
  avatar: string;
}

const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'Computer Science Hub',
    description: 'A community for CS students and professionals',
    members: 150,
    topics: ['Programming', 'Algorithms', 'Web Development'],
    avatar: 'CS',
  },
  {
    id: '2',
    name: 'Math Enthusiasts',
    description: 'Explore the fascinating world of mathematics',
    members: 120,
    topics: ['Calculus', 'Linear Algebra', 'Statistics'],
    avatar: 'ME',
  },
];

const CommunityCard: React.FC<{ community: Community }> = ({ community }) => {
  const navigate = useNavigate();

  return (
    <Box 
      onClick={() => navigate(`/community-chat/${community.id}`, { state: { type: 'community' } })}
      sx={{
        display: 'flex',
        alignItems: 'center',
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
        {community.avatar}
      </Avatar>
      <Box flex={1} overflow="hidden">
        <Typography variant="subtitle1" noWrap>
          {community.name}
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          noWrap 
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <PeopleIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {community.members} members
        </Typography>
      </Box>
    </Box>
  );
};

const Communities: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredCommunities = mockCommunities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.topics.some(topic => topic.toLowerCase().includes(searchQuery.toLowerCase()))
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
          Communities
        </Typography>
        <IconButton color="inherit" size="small">
          <AddIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1, bgcolor: 'background.paper' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search communities..."
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
        {filteredCommunities.map((community) => (
          <CommunityCard key={community.id} community={community} />
        ))}
      </Box>
    </Box>
  );
};

export default Communities;