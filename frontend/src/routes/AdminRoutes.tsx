import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import UserManagement from '../pages/admin/UserManagement';
import ClassroomManagement from '../pages/admin/ClassroomManagement';
import CommunityManagement from '../pages/admin/CommunityManagement';
import ContentModeration from '../pages/admin/ContentModeration';
import Settings from '../pages/admin/Settings';
import { useAuth } from '../contexts/AuthContext';

const AdminRoutes: React.FC = () => {
  const { currentUser } = useAuth();

  // Check if user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="classrooms" element={<ClassroomManagement />} />
        <Route path="communities" element={<CommunityManagement />} />
        <Route path="moderation" element={<ContentModeration />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;