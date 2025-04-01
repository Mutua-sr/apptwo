import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  School as SchoolIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Message as MessageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'Classrooms',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      path: '/admin/classrooms',
      color: '#4caf50'
    },
    {
      title: 'Communities',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      path: '/admin/communities',
      color: '#2196f3'
    },
    {
      title: 'Users',
      icon: <PersonIcon sx={{ fontSize: 40 }} />,
      path: '/admin/users',
      color: '#ff9800'
    },
    {
      title: 'Messages',
      icon: <MessageIcon sx={{ fontSize: 40 }} />,
      path: '/admin/messages',
      color: '#9c27b0'
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3}>
        {dashboardItems.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.title}>
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <Box sx={{ color: item.color, mb: 2 }}>
                {item.icon}
              </Box>
              <Typography variant="h6">
                {item.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Stats Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              {/* Add activity list here */}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              {/* Add status information here */}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;