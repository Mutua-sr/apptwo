import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Stack,
  IconButton,
  Typography,
  Paper,
  Grid,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  PeopleAlt as PeopleIcon,
  CallEnd as CallEndIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { videoCallStyles as styles } from '../../styles/components/VideoCall.styles';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isSpeaking: boolean;
  isVideoOn: boolean;
  isAudioOn: boolean;
}

interface VideoCallProps {
  participants: Participant[];
  onEndCall: () => void;
  onToggleChat: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  participants,
  onEndCall,
  onToggleChat,
}) => {
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize media devices
  const initializeMedia = React.useCallback(async () => {
    try {
      setIsInitializing(true);
      setInitError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setLocalStream(stream);
    } catch (error) {
      console.error('Failed to get media devices:', error);
      setInitError('Failed to access camera and microphone. Please ensure they are connected and you have granted permission to use them.');
      setIsVideoOn(false);
      setIsAudioOn(false);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      if (mounted) {
        await initializeMedia();
      }
    };
    init();
    return () => {
      mounted = false;
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [initializeMedia]);

  // Handle audio toggle
  const handleAudioToggle = React.useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioOn;
        setIsAudioOn(prev => !prev);
      }
    }
  }, [localStream]);

  // Handle video toggle
  const handleVideoToggle = React.useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(prev => !prev);
      }
    }
  }, [localStream]);

  // Handle screen sharing
  const handleScreenShare = React.useCallback(async () => {
    try {
      if (isScreenSharing) {
        if (screenStream) {
          screenStream.getTracks().forEach(track => track.stop());
        }
        setScreenStream(null);
        if (videoRef.current && localStream) {
          videoRef.current.srcObject = localStream;
        }
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });
        setScreenStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        // Handle stream end (user stops sharing)
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(prev => false);
          if (videoRef.current && localStream) {
            videoRef.current.srcObject = localStream;
          }
        };
      }
      setIsScreenSharing(prev => !prev);
    } catch (error) {
      console.error('Failed to share screen:', error);
      setIsScreenSharing(prev => false);
    }
  }, [localStream, screenStream]);

  return (
    <Box sx={styles.container}>
      {/* Main Video Grid */}
      <Box sx={{
        ...styles.videoGrid,
        bgcolor: 'black',
        position: 'relative',
      }}>
        {isInitializing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1,
            }}
          >
            <Stack spacing={2} alignItems="center" sx={{ maxWidth: '80%', textAlign: 'center' }}>
              {initError ? (
                <>
                  <Typography variant="h6" color="error.main">
                    Unable to Join Call
                  </Typography>
                  <Typography variant="body1" color="white" sx={{ opacity: 0.9, mb: 2 }}>
                    {initError}
                  </Typography>
                  <Tooltip title="Retry" placement="top" arrow>
                    <IconButton
                      onClick={initializeMedia}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <CircularProgress 
                    size={48} 
                    thickness={4}
                    sx={{ 
                      color: 'primary.main',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }} 
                  />
                  <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
                    Initializing video call...
                  </Typography>
                </>
              )}
            </Stack>
          </Box>
        )}
        <Grid container spacing={2}>
          {participants.map((participant) => (
            <Grid item xs={12} sm={6} md={4} key={participant.id}>
              <Paper sx={styles.videoWrapper}>
                {!participant.isVideoOn ? (
                  <Box sx={styles.videoPlaceholder}>
                    <Avatar
                      src={participant.avatar}
                      sx={styles.participantAvatar}
                    />
                  </Box>
                ) : (
                  <Box
                    component="video"
                    ref={participant.id === '1' ? videoRef : undefined}
                    autoPlay
                    playsInline
                    muted={participant.id === '1'}
                    sx={{
                      ...styles.video,
                      transform: isScreenSharing ? 'none' : 'scaleX(-1)', // Mirror self view
                    }}
                  />
                )}
                <Box sx={styles.participantInfo}>
                  <Typography variant="body2" sx={styles.participantName}>
                    {participant.name}
                    {participant.isSpeaking && (
                      <Box
                        component="span"
                        sx={styles.speakingIndicator}
                        ml={1}
                      />
                    )}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {!participant.isAudioOn && (
                      <Tooltip 
                        title={`${participant.name} is muted`}
                        placement="top"
                        arrow
                      >
                        <span>
                          <MicOffIcon fontSize="small" sx={{ color: 'error.main', cursor: 'help' }} />
                        </span>
                      </Tooltip>
                    )}
                    {!participant.isVideoOn && (
                      <Tooltip 
                        title={`${participant.name}'s camera is off`}
                        placement="top"
                        arrow
                      >
                        <span>
                          <VideocamOffIcon fontSize="small" sx={{ color: 'error.main', cursor: 'help' }} />
                        </span>
                      </Tooltip>
                    )}
                  </Stack>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Control Bar */}
      <Paper elevation={3} sx={styles.controlBar}>
        <Stack 
          direction="row" 
          sx={styles.controls}
        >
          <Stack direction="row" spacing={2} className="control-group">
            <Tooltip 
              title={isAudioOn ? "Turn off microphone" : "Turn on microphone"}
              placement="top"
              arrow
            >
              <IconButton
                onClick={handleAudioToggle}
                sx={{
                  ...styles.controlButton(isAudioOn),
                  bgcolor: isAudioOn ? 'primary.main' : 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: isAudioOn ? 'primary.dark' : 'error.dark',
                  }
                }}
              >
                {isAudioOn ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title={isVideoOn ? "Turn off camera" : "Turn on camera"}
              placement="top"
              arrow
            >
              <IconButton
                onClick={handleVideoToggle}
                sx={{
                  ...styles.controlButton(isVideoOn),
                  bgcolor: isVideoOn ? 'primary.main' : 'error.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: isVideoOn ? 'primary.dark' : 'error.dark',
                  }
                }}
              >
                {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
              placement="top"
              arrow
            >
              <IconButton
                onClick={handleScreenShare}
                sx={{
                  ...styles.controlButton(true),
                  bgcolor: isScreenSharing ? 'warning.main' : 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: isScreenSharing ? 'warning.dark' : 'primary.dark',
                  }
                }}
              >
                {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={2} className="control-group">
            <Tooltip 
              title="Open chat"
              placement="top"
              arrow
            >
              <IconButton
                onClick={onToggleChat}
                sx={styles.controlButton(true)}
              >
                <ChatIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip 
              title="Show participants"
              placement="top"
              arrow
            >
              <IconButton
                sx={styles.controlButton(true)}
              >
                <PeopleIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <Box className="control-group">
            <Tooltip 
              title="End call"
              placement="top"
              arrow
            >
              <IconButton
                onClick={onEndCall}
                sx={styles.endCallButton}
              >
                <CallEndIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default VideoCall;