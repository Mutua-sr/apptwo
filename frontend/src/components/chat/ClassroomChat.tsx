import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Typography, 
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Refresh as RefreshIcon 
} from '@mui/icons-material';
import ChatInterface from './ChatInterface';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import { Classroom } from '../../types/classroom';
import { User } from '../../types/api';

interface ClassroomChatProps {
  classroom: Classroom;
}

interface AuthContextType {
  currentUser: User | null;
}

const ClassroomChat: React.FC<ClassroomChatProps> = ({ classroom }) => {
  const { currentUser } = useAuth() as AuthContextType;
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const connectToChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await chatService.connect();
        chatService.joinRoom(classroom._id);
        setIsConnected(true);
      } catch (err: any) {
        console.error('Failed to connect to chat:', err);
        const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to connect to chat';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    connectToChat();

    return () => {
      if (isConnected) {
        try {
          chatService.leaveRoom(classroom._id);
          chatService.disconnect();
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      }
    };
  }, [classroom._id]);

  const handleRetryConnection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await chatService.connect();
      chatService.joinRoom(classroom._id);
      setIsConnected(true);
    } catch (err: any) {
      console.error('Failed to reconnect to chat:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to reconnect to chat';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">
          Please log in to access chat.
        </Typography>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        alignItems: 'center'
      }}>
        <Typography color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleRetryConnection}
          startIcon={<RefreshIcon />}
        >
          Retry Connection
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Class Chat" />
          {classroom.teacher.id === currentUser.id && <Tab label="Teacher's Announcements" />}
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeTab === 0 && (
          <ChatInterface
            roomId={`classroom-${classroom._id}`}
            userId={currentUser.id}
          />
        )}
        {activeTab === 1 && classroom.teacher.id === currentUser.id && (
          <ChatInterface
            roomId={`classroom-announcements-${classroom._id}`}
            userId={currentUser.id}
          />
        )}
      </Box>

      {classroom.settings.allowStudentChat === false && currentUser.id !== classroom.teacher.id && (
        <Box sx={{ p: 2, bgcolor: 'warning.light' }}>
          <Typography>Chat is currently disabled for students.</Typography>
        </Box>
      )}
    </Box>
  );
};

export default ClassroomChat;