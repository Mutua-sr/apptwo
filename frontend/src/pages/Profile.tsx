import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Help as HelpIcon,
  ExitToApp as LogoutIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DatabaseService } from '../services/databaseService';

interface UserProfile {
  _id: string;
  type: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  classroomsCount: number;
  communitiesCount: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const currentUser = await DatabaseService.read<UserProfile>('currentUser');
        if (currentUser) {
          // Get counts
          const [classrooms, communities] = await Promise.all([
            DatabaseService.find({ type: 'classroom', userId: currentUser._id }),
            DatabaseService.find({ type: 'community', userId: currentUser._id })
          ]);
          
          setProfile({
            ...currentUser,
            classroomsCount: classrooms.length,
            communitiesCount: communities.length
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning">Profile not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', bgcolor: 'background.paper' }}>
      {/* Profile Header */}
      <Box sx={{ 
        bgcolor: 'primary.main',
        color: 'white',
        p: 3,
        position: 'relative'
      }}>
        <IconButton 
          sx={{ 
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white'
          }}
        >
          <EditIcon />
        </IconButton>
        
        <Stack alignItems="center" spacing={2}>
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80,
              bgcolor: 'primary.light',
              fontSize: '2rem'
            }}
          >
            {profile.avatar || profile.name.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">
              {profile.name}
            </Typography>
            <Typography variant="body2">
              {profile.email}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: 'primary.light',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                mt: 1,
                display: 'inline-block'
              }}
            >
              {profile.role}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Stats */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={2}>
          <Box flex={1} sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="h6">{profile.classroomsCount}</Typography>
            <Typography variant="body2" color="text.secondary">Classrooms</Typography>
          </Box>
          <Box flex={1} sx={{ textAlign: 'center', p: 1 }}>
            <Typography variant="h6">{profile.communitiesCount}</Typography>
            <Typography variant="body2" color="text.secondary">Communities</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List>
        <ListItemButton>
          <ListItemIcon>
            <SchoolIcon />
          </ListItemIcon>
          <ListItemText primary="My Classrooms" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <GroupIcon />
          </ListItemIcon>
          <ListItemText primary="My Communities" />
        </ListItemButton>

        <Divider />

        <ListItemButton>
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary="Notifications" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        <ListItemButton>
          <ListItemIcon>
            <HelpIcon />
          </ListItemIcon>
          <ListItemText primary="Help & Support" />
        </ListItemButton>

        <Divider />

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Profile;