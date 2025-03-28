import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Chip,
  Box,
  IconButton,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { PostInput } from '../../types/feed';
import { DatabaseService } from '../../services/databaseService';

interface CreatePostProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ open, onClose, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const postInput: PostInput = {
        title: title.trim(),
        content: content.trim(),
        tags
      };

      console.log('Post Input:', postInput); // Log the post input
      const response = await DatabaseService.createPost(postInput);
      onPostCreated();
      handleClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setTagInput('');
    setTags([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Post</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!error && !title.trim()}
            helperText={error && !title.trim() ? 'Title is required' : ''}
          />
          
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            error={!!error && !content.trim()}
            helperText={error && !content.trim() ? 'Content is required' : ''}
          />

          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="Add Tags"
                size="small"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <IconButton onClick={handleAddTag} size="small">
                <AddIcon />
              </IconButton>
            </Stack>
            
            {tags.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map(tag => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
            )}
          </Box>

          {error && <Box color="error.main">{error}</Box>}
        </Stack>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Post'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePost;