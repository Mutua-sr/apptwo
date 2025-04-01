import React from 'react';
import LoginComponent from '../../components/auth/Login';
import { Box, Container } from '@mui/material';

const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Container maxWidth="sm">
        <LoginComponent />
      </Container>
    </Box>
  );
};

export default LoginPage;