import React, { FC, useState } from 'react';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import ChatSidebar from '../chat/ChatSidebar';
import ChatInterface from '../chat/ChatInterface';
import { GroupDetails } from '../groups/GroupDetails';
import { Community, Classroom, User } from '../../types/api';

interface ChatLayoutProps {
  type: 'classroom' | 'community';
  rooms: (Community | Classroom)[];
  availableRooms: (Community | Classroom)[];
  currentUser: User;
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (name: string, description: string) => void;
  children?: React.ReactNode;
}

const ChatLayout: FC<ChatLayoutProps> = ({
  type,
  rooms,
  availableRooms,
  currentUser,
  onJoinRoom,
  onCreateRoom,
  children
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedRoom, setSelectedRoom] = useState<Community | Classroom | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const handleRoomSelect = (room: Community | Classroom) => {
    setSelectedRoom(room);
    if (isMobile) {
      setIsInfoOpen(false);
    }
  };

  const handleInfoClick = (room: Community | Classroom) => {
    setIsInfoOpen(true);
  };

  const handleStartVideoCall = () => {
    // Video call implementation
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar with chat rooms list */}
      <Box
        component="nav"
        sx={{
          width: { xs: '100%', md: 320 },
          display: { xs: !selectedRoom ? 'block' : 'none', md: 'block' },
          borderRight: 1,
          borderColor: 'divider'
        }}
      >
        <ChatSidebar
          type={type}
          rooms={rooms}
          availableRooms={availableRooms}
          selectedRoomId={selectedRoom?._id}
          onRoomSelect={handleRoomSelect}
          onInfoClick={handleInfoClick}
          onJoinRoom={onJoinRoom}
          onCreateRoom={onCreateRoom}
        />
      </Box>

      {/* Main chat area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: { xs: selectedRoom ? 'block' : 'none', md: 'block' },
          height: '100%'
        }}
      >
        {selectedRoom ? (
          <ChatInterface
            title={selectedRoom.name}
            subtitle={`${type} chat`}
            avatar={selectedRoom.avatar || ''}
            onStartVideoCall={handleStartVideoCall}
            roomId={selectedRoom._id}
            roomType={type}
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default'
            }}
          >
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <i className={`fas fa-${type === 'classroom' ? 'chalkboard' : 'users'} text-6xl mb-4`} />
              <p>Select a {type} to start chatting</p>
            </Box>
          </Box>
        )}
      </Box>

      {/* Info drawer (slides in from right) */}
      <Drawer
        anchor="right"
        open={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        variant={isMobile ? 'temporary' : 'persistent'}
        keepMounted={false}
        ModalProps={{
          keepMounted: false
        }}
        sx={{
          width: { xs: '100%', sm: 320 },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 320 },
          },
        }}
      >
        {selectedRoom && (
          <GroupDetails
            group={selectedRoom}
            currentUser={currentUser}
            onClose={() => setIsInfoOpen(false)}
          />
        )}
      </Drawer>

      {children}
    </Box>
  );
};

export default ChatLayout;