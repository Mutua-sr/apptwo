import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import theme from './theme/theme';
import mobileTheme from './theme/mobileTheme';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Classrooms from './pages/Classrooms';
import ClassroomChats from './pages/ClassroomChats';
import Communities from './pages/Communities';
import CreateCommunity from './pages/CreateCommunity';
import ChatRoom from './pages/ChatRoom';
import AdminDashboard from './pages/admin/AdminDashboard';
import ClassroomManagement from './pages/admin/ClassroomManagement';
import CommunityManagement from './pages/admin/CommunityManagement';
import UserManagement from './pages/admin/UserManagement';

const App: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const currentTheme = isMobile ? mobileTheme : theme;

  return (
    <ThemeProvider theme={currentTheme}>
      <AuthProvider>
      <Router>
        <CssBaseline />
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
              <Route path="/" element={<Feed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/classrooms" element={<Classrooms />} />
              <Route path="/classrooms/chat" element={<ClassroomChats />} />
              <Route path="/communities" element={<Communities />} />
              <Route path="/create-community" element={<CreateCommunity />} />
              <Route path="/chat/classroom/:roomId" element={<ChatRoom />} />
              <Route path="/chat/community/:roomId" element={<ChatRoom />} />

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/classrooms" element={<ClassroomManagement />} />
                <Route path="/admin/communities" element={<CommunityManagement />} />
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Box>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
