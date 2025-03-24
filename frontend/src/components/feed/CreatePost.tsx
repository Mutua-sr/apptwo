import React, { useState } from 'react';
import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Stack,
  Avatar,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider
} from '@mui/material';
import {
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
  Close as CloseIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { CreatePostProps, CreatePostData } from '../../types/feed';

const mockClassrooms = [
  { id: 'class1', name: 'Data Structures' },
  { id: 'class2', name: 'Web Development' },
];

const mockCommunities = [
  { id: 'comm1', name: 'Computer Science Hub' },
  { id: 'comm2', name: 'Math Enthusiasts' },
];

const CreatePost: React.FC<CreatePostProps> = ({ open, onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [shareType, setShareType] = useState<'none' | 'classroom' | 'community'>('none');
  const [selectedDestination, setSelectedDestination] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const post: CreatePostData = {
      type: 'post',
      author: 'Demo User', // TODO: Get from auth context
      avatar: 'DU',
      title: '',
      content,
      tags,
      ...(shareType !== 'none' && selectedDestination && {
        sharedTo: {
          type: shareType,
          id: selectedDestination,
          name: shareType === 'classroom' 
            ? mockClassrooms.find(c => c.id === selectedDestination)?.name || ''
            : mockCommunities.find(c => c.id === selectedDestination)?.name || ''
        }
      })
    };
    await onSubmit(post);
    resetForm();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const resetForm = () => {
    setContent('');
    setTags([]);
    setCurrentTag('');
    setShareType('none');
    setSelectedDestination('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Create Post
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>DU</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton size="small">
                    <ImageIcon />
                  </IconButton>
                  <IconButton size="small">
                    <VideoIcon />
                  </IconButton>
                  <IconButton size="small">
                    <LinkIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShareIcon fontSize="small" />
                Share to
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={shareType}
                  onChange={(e) => {
                    setShareType(e.target.value as 'none' | 'classroom' | 'community');
                    setSelectedDestination('');
                  }}
                >
                  <MenuItem value="none">Don't share</MenuItem>
                  <MenuItem value="classroom">Share to Classroom</MenuItem>
                  <MenuItem value="community">Share to Community</MenuItem>
                </Select>
              </FormControl>

              {shareType !== 'none' && (
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <Select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      {shareType === 'classroom' ? 'Select Classroom' : 'Select Community'}
                    </MenuItem>
                    {shareType === 'classroom' 
                      ? mockClassrooms.map(classroom => (
                          <MenuItem key={classroom.id} value={classroom.id}>
                            {classroom.name}
                          </MenuItem>
                        ))
                      : mockCommunities.map(community => (
                          <MenuItem key={community.id} value={community.id}>
                            {community.name}
                          </MenuItem>
                        ))
                    }
                  </Select>
                </FormControl>
              )}
            </Box>

            <TextField
              fullWidth
              size="small"
              placeholder="Add tags (press Enter)"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={handleAddTag}
            />

            {tags.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    onDelete={() => handleRemoveTag(tag)}
                    color="primary"
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={!content.trim()}
          >
            Post
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreatePost;