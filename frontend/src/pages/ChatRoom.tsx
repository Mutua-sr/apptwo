import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Stack,
  Avatar,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { chatService, connectionService, videoCallService } from '../services/apiService';
import VideoCall from '../components/video/VideoCall';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  InsertEmoticon as InsertEmoticonIcon,
  Videocam as VideocamIcon,
} from '@mui/icons-material';
// Temporarily removed emoji-mart imports

interface ChatRoomProps {
  type?: 'direct' | 'classroom' | 'community';
}

interface RoomData {
  name: string;
  members: number;
}

interface RoomDetails {
  name: string;
  members: number;
  icon: React.ReactNode;
}

const mockClassrooms: Record<string, RoomData> = {
  '1': { name: 'Data Structures', members: 25 },
  '2': { name: 'Web Development', members: 30 },
};

const mockCommunities: Record<string, RoomData> = {
  '1': { name: 'Computer Science Hub', members: 150 },
  '2': { name: 'Math Enthusiasts', members: 120 },
};

const ChatRoom: React.FC<ChatRoomProps> = ({ type = 'direct' }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Get room type from location state or props
  const roomType = location.state?.type || type;

  const getRoomDetails = (): RoomDetails | null => {
    if (!roomId) return null;

    if (roomType === 'classroom' && mockClassrooms[roomId]) {
      return {
        name: mockClassrooms[roomId].name,
        members: mockClassrooms[roomId].members,
        icon: <SchoolIcon />,
      };
    } else if (roomType === 'community' && mockCommunities[roomId]) {
      return {
        name: mockCommunities[roomId].name,
        members: mockCommunities[roomId].members,
        icon: <GroupIcon />,
      };
    }
    return null;
  };

  const handleBack = () => {
    if (roomType === 'classroom') {
      navigate('/classrooms');
    } else if (roomType === 'community') {
      navigate('/communities');
    } else {
      navigate('/');
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setEmojiPickerOpen(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    setFileUploadOpen(false);
  };

  const [messages, setMessages] = useState<Array<{content: string, timestamp: Date}>>([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [participants, setParticipants] = useState<Array<{
    id: string;
    name: string;
    avatar: string;
    isSpeaking: boolean;
    isVideoOn: boolean;
    isAudioOn: boolean;
  }>>([
    {
      id: '1',
      name: 'You',
      avatar: 'https://ui-avatars.com/api/?name=You&background=random',
      isSpeaking: false,
      isVideoOn: true,
      isAudioOn: true,
    }
  ]);

  const handleStartVideoCall = () => {
    setIsVideoCallActive(true);
    // Initialize video call connection
    if (roomType === 'classroom' || roomType === 'community') {
      try {
        videoCallService.sendOffer({ type: 'offer', sdp: '' }, roomId || '');
        // Add self to participants if not already present
        setParticipants(prev => {
          const selfExists = prev.some(p => p.id === '1');
          if (!selfExists) {
            return [{
              id: '1',
              name: 'You',
              avatar: 'https://ui-avatars.com/api/?name=You&background=random',
              isSpeaking: false,
              isVideoOn: true,
              isAudioOn: true,
            }, ...prev];
          }
          return prev;
        });
      } catch (error) {
        console.error('Failed to start video call:', error);
        setIsVideoCallActive(false);
      }
    }
  };

  const handleEndVideoCall = () => {
    setIsVideoCallActive(false);
    if (roomId) {
      videoCallService.sendHangup(roomId);
    }
  };

  useEffect(() => {
    // Set up video call event listeners
    videoCallService.onVideoOffer((data) => {
      console.log('Received video offer:', data);
      // Handle incoming video call
      setIsVideoCallActive(true);
      setParticipants(prev => {
        const participantExists = prev.some(p => p.id === data.targetId);
        if (!participantExists) {
          return [...prev, {
            id: data.targetId,
            name: `Participant ${prev.length}`,
            avatar: `https://ui-avatars.com/api/?name=Participant${prev.length}&background=random`,
            isSpeaking: false,
            isVideoOn: true,
            isAudioOn: true,
          }];
        }
        return prev;
      });
    });

    videoCallService.onHangup(() => {
      setIsVideoCallActive(false);
      setParticipants(prev => prev.slice(0, 1)); // Keep only the current user
    });

    return () => {
      // Clean up video call if active
      if (isVideoCallActive && roomId) {
        videoCallService.sendHangup(roomId);
      }
    };
  }, [roomId, isVideoCallActive]);

  useEffect(() => {
    // Connect to socket when component mounts
    connectionService.connect();

    // Set up message listener
    const handleNewMessage = (message: {content: string, timestamp: Date}) => {
      setMessages(prev => [...prev, message]);
    };

    chatService.onMessage(handleNewMessage);

    // Cleanup on unmount
    return () => {
      chatService.offMessage(handleNewMessage);
      connectionService.disconnect();
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFiles.length > 0) {
      // Send message based on room type
      if (roomType === 'classroom' && roomId) {
        chatService.sendMessage(message, undefined, roomId);
      } else if (roomType === 'community' && roomId) {
        chatService.sendMessage(message, roomId);
      } else {
        chatService.sendMessage(message);
      }

      // TODO: Implement file sending when backend supports it
      if (selectedFiles.length > 0) {
        console.log('Files to be implemented:', selectedFiles);
      }

      setMessage('');
      setSelectedFiles([]);
    }
  };

  const roomDetails = getRoomDetails();

  if (!roomDetails) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Room not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      {/* Chat Header */}
      <Paper sx={{ 
        p: 2, 
        borderRadius: '0',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton 
            color="inherit" 
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              roomDetails.icon
            }
          >
            <Avatar 
              sx={{ 
                bgcolor: 'primary.dark',
                width: 40,
                height: 40
              }}
            >
              {roomDetails.name.substring(0, 2)}
            </Avatar>
          </Badge>
          <Box 
            sx={{ cursor: 'pointer', flex: 1 }} 
            onClick={() => setDetailsDialogOpen(true)}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {roomDetails.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {roomDetails.members} members
            </Typography>
          </Box>
          {(roomType === 'classroom' || roomType === 'community') && (
            <IconButton
              color="inherit"
              onClick={handleStartVideoCall}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                },
                transition: 'background-color 0.2s'
              }}
            >
              <VideocamIcon />
            </IconButton>
          )}
        </Stack>
      </Paper>

      {/* Video Call */}
      {isVideoCallActive && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'background.default',
            zIndex: 1300,
          }}
        >
          <Paper 
            sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              p: 1,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              zIndex: 1301,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Typography variant="body2">
              {roomType === 'classroom' ? 'Class Video Call' : 'Community Video Call'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </Typography>
          </Paper>
          <VideoCall
            participants={participants}
            onEndCall={handleEndVideoCall}
            onToggleChat={() => setIsVideoCallActive(false)}
          />
        </Box>
      )}

      {/* Chat Messages */}
      <Box sx={{ 
        flexGrow: 1, 
        p: 2, 
        overflowY: 'auto',
        bgcolor: 'background.default',
        height: 'calc(100vh - 140px)' // Adjust for header and input heights
      }}>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 2 }}>
          Welcome to the {roomDetails.name} chat room!
        </Typography>
        
        {/* Display Messages */}
        {messages.map((msg, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              my: 1,
              maxWidth: '80%',
              bgcolor: 'primary.light',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="body1">{msg.content}</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </Typography>
          </Paper>
        ))}

        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Selected Files:
            </Typography>
            {selectedFiles.map((file, index) => (
              <Typography key={index} variant="body2">
                {file.name}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* Message Input */}
      <Paper 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 2,
          borderRadius: '0',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%'
        }}
        elevation={3}
      >
        <IconButton 
          size="small"
          onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
        >
          <EmojiIcon />
        </IconButton>
        <IconButton 
          size="small"
          onClick={() => fileInputRef.current?.click()}
        >
          <AttachFileIcon />
        </IconButton>
        <IconButton 
          size="small"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon />
        </IconButton>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />
        <TextField
          fullWidth
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          size="small"
          sx={{ mx: 1 }}
          InputProps={{
            endAdornment: selectedFiles.length > 0 && (
              <InputAdornment position="end">
                <Typography variant="caption" color="primary">
                  {selectedFiles.length} file(s)
                </Typography>
              </InputAdornment>
            ),
          }}
        />
        <IconButton 
          color="primary"
          type="submit"
          disabled={!message.trim() && selectedFiles.length === 0}
        >
          <SendIcon />
        </IconButton>
      </Paper>

      {/* Emoji Picker Dialog - temporarily disabled */}
      <Dialog
        open={emojiPickerOpen}
        onClose={() => setEmojiPickerOpen(false)}
        PaperProps={{
          sx: { maxWidth: 'none' }
        }}
      >
        <DialogContent>
          <Typography>Emoji picker temporarily disabled</Typography>
        </DialogContent>
      </Dialog>

      {/* Community Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={roomDetails.icon}
            >
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.dark',
                  width: 56,
                  height: 56
                }}
              >
                {roomDetails.name.substring(0, 2)}
              </Avatar>
            </Badge>
            <Box>
              <Typography variant="h6">{roomDetails.name}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {roomType.charAt(0).toUpperCase() + roomType.slice(1)}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>About</Typography>
          <Typography variant="body1" paragraph>
            {roomType === 'classroom' 
              ? 'A virtual classroom for collaborative learning and discussion.'
              : 'A community space for sharing knowledge and connecting with peers.'}
          </Typography>

          <Typography variant="h6" gutterBottom>Members</Typography>
          <Typography variant="body1" paragraph>
            {roomDetails.members} active members
          </Typography>

          {roomType === 'classroom' && (
            <>
              <Typography variant="h6" gutterBottom>Course Information</Typography>
              <Typography variant="body1">
                Course Code: {roomId}<br />
                Semester: Current<br />
                Schedule: Mon, Wed, Fri
              </Typography>
            </>
          )}

          {roomType === 'community' && (
            <>
              <Typography variant="h6" gutterBottom>Community Guidelines</Typography>
              <Typography variant="body1">
                • Be respectful and supportive<br />
                • Share knowledge and experiences<br />
                • Keep discussions relevant to the topic<br />
                • No spam or self-promotion
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChatRoom;