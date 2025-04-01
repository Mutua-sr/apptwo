import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
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

  useEffect(() => {
    const connectToChat = async () => {
      try {
        await chatService.connect();
        chatService.joinRoom(classroom._id);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to chat:', error);
      }
    };

    connectToChat();

    return () => {
      if (isConnected) {
        chatService.leaveRoom(classroom._id);
        chatService.disconnect();
      }
    };
  }, [classroom._id, isConnected]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setActiveTab(newValue);
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Please log in to access chat.</Typography>
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