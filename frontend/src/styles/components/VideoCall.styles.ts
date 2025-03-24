import { Theme } from '@mui/material';

export const videoCallStyles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },

  videoGrid: {
    flex: 1,
    p: 2,
    overflowY: 'auto',
    display: 'grid',
    gap: 2,
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(auto-fit, minmax(300px, 1fr))',
    },
    alignContent: 'center',
    justifyContent: 'center',
  },

  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: 0,
    paddingBottom: '56.25%', // 16:9 aspect ratio
    borderRadius: 2,
    overflow: 'hidden',
    bgcolor: 'grey.900',
    border: '1px solid',
    borderColor: 'grey.800',
  },

  videoPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: (theme: Theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
  },

  participantAvatar: {
    width: 80,
    height: 80,
  },

  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  participantInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    p: 1.5,
    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'opacity 0.2s ease-in-out',
    '&:hover': {
      opacity: 1,
    },
  },

  participantName: {
    color: 'white',
    display: 'flex',
    alignItems: 'center',
  },

  speakingIndicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    bgcolor: 'success.main',
  },

  controlBar: {
    py: 3,
    px: 4,
    bgcolor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid',
    borderColor: 'grey.800',
    transition: 'all 0.3s ease-in-out',
  },

  controls: {
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    '& .control-group': {
      display: 'flex',
      gap: 2,
      padding: 1,
      borderRadius: 2,
      transition: 'all 0.2s ease-in-out',
    },
    '& .MuiIconButton-root': {
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        transform: 'scale(1.1)',
      },
    },
    '@media (max-width: 600px)': {
      gap: 3,
      justifyContent: 'center',
      '& .control-group': {
        flex: '0 0 auto',
        justifyContent: 'center',
      },
    },
  },

  controlButton: (active: boolean) => ({
    width: 56,
    height: 56,
    bgcolor: active ? 'primary.main' : 'error.main',
    color: 'white',
    '&:hover': {
      bgcolor: active ? 'primary.dark' : 'error.dark',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  }),

  endCallButton: {
    width: 56,
    height: 56,
    bgcolor: 'error.main',
    color: 'white',
    '&:hover': {
      bgcolor: 'error.dark',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 8px rgba(255,0,0,0.3)',
    },
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 2px 4px rgba(255,0,0,0.2)',
  },

  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      opacity: 1,
    },
    '50%': {
      transform: 'scale(1.2)',
      opacity: 0.7,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
};