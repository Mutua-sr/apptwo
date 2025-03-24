import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  Badge,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  School as EducationIcon,
  Star as AchievementsIcon,
  History as ActivityIcon,
  Bookmark as SavedIcon,
  Help as HelpIcon,
  ExitToApp as LogoutIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Notifications as NotificationsIcon,
  DarkMode as DarkModeIcon,
  Lock as LockIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  {
    icon: <EducationIcon />,
    text: 'My Learning',
    badge: '3 Active Courses',
    action: 'learning'
  },
  {
    icon: <GroupIcon />,
    text: 'Study Groups',
    badge: '4 Groups',
    action: 'groups'
  },
  {
    icon: <AchievementsIcon />,
    text: 'Achievements',
    badge: '12 Badges',
    action: 'achievements'
  },
  {
    icon: <NotificationsIcon />,
    text: 'Notifications',
    badge: '3 new',
    action: 'notifications'
  },
  {
    icon: <DarkModeIcon />,
    text: 'Dark Mode',
    isSwitch: true,
    action: 'darkMode'
  },
  {
    icon: <LockIcon />,
    text: 'Privacy',
    action: 'privacy'
  },
  {
    icon: <LanguageIcon />,
    text: 'Language',
    badge: 'English',
    action: 'language'
  },
  {
    icon: <SettingsIcon />,
    text: 'Settings',
    action: 'settings'
  },
  {
    icon: <HelpIcon />,
    text: 'Help & Support',
    action: 'help'
  },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleMenuClick = (action: string) => {
    switch(action) {
      case 'darkMode':
        setDarkMode(!darkMode);
        setSnackbar({
          open: true,
          message: `Dark mode ${!darkMode ? 'enabled' : 'disabled'}`,
          severity: 'success'
        });
        break;
      case 'privacy':
      case 'language':
      case 'settings':
        setDialogType(action);
        setOpenDialog(true);
        break;
      case 'learning':
        navigate('/classrooms');
        break;
      case 'groups':
        navigate('/communities');
        break;
      default:
        setSnackbar({
          open: true,
          message: 'Feature coming soon!',
          severity: 'info'
        });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        px: 2,
        py: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          Profile
        </Typography>
        <IconButton color="inherit" size="small" onClick={() => handleMenuClick('settings')}>
          <SettingsIcon />
        </IconButton>
      </Box>

      <Box sx={{ 
        bgcolor: 'primary.main',
        color: 'white',
        px: 2,
        py: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        position: 'relative'
      }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton 
              size="small" 
              sx={{ bgcolor: 'primary.light' }}
              onClick={() => setSnackbar({
                open: true,
                message: 'Profile photo update coming soon!',
                severity: 'info'
              })}
            >
              <EditIcon sx={{ fontSize: 12, color: 'white' }} />
            </IconButton>
          }
        >
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80,
              bgcolor: 'primary.dark',
              fontSize: '2rem',
            }}
          >
            JS
          </Avatar>
        </Badge>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            John Smith
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Computer Science Student
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            University of Technology • Year 3
          </Typography>
        </Box>
      </Box>

      <List sx={{ flex: 1, bgcolor: 'background.paper' }}>
        {menuItems.map((item, index) => (
          <React.Fragment key={item.text}>
            <ListItemButton onClick={() => handleMenuClick(item.action)}>
              <ListItemIcon sx={{ color: 'primary.main' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                secondary={item.badge}
              />
              {item.isSwitch && (
                <Switch
                  checked={darkMode}
                  onChange={() => handleMenuClick('darkMode')}
                  color="primary"
                />
              )}
            </ListItemButton>
            {index < menuItems.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>

      <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'privacy' && 'Privacy Settings'}
          {dialogType === 'language' && 'Select Language'}
          {dialogType === 'settings' && 'App Settings'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogType.charAt(0).toUpperCase() + dialogType.slice(1)} settings coming soon!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;