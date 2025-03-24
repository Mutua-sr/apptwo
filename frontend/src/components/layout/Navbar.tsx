import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="inherit" elevation={1}>
      <Toolbar>
        <div className="flex-1 flex items-center">
          <Typography
            variant="h6"
            component="div"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/feed')}
          >
            <i className="fas fa-graduation-cap text-2xl text-indigo-600 mr-2" />
            EduApp
          </Typography>
        </div>

      </Toolbar>
    </AppBar>
  );
};

export default Navbar;