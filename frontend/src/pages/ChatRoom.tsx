import React, { useState } from 'react';
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
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  EmojiEmotions as EmojiIcon,
  Group as GroupIcon,
  School as SchoolIcon,
  ArrowBack as ArrowBackIcon,
  InsertEmoticon as InsertEmoticonIcon,
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFiles.length > 0) {
      // TODO: Implement message sending with files
      console.log('Sending message:', message);
      console.log('With files:', selectedFiles);
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
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {roomDetails.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {roomDetails.members} members
            </Typography>
          </Box>
        </Stack>
      </Paper>

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
    </Box>
  );
};

export default ChatRoom;