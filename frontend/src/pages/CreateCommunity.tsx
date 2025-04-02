import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  IconButton,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { CreateCommunityData } from '../types/room';
import apiService from '../services/apiService';

const CreateCommunity: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCommunityData>({
    type: 'community',
    name: '',
    description: '',
    settings: {
      isPrivate: false,
      allowMemberPosts: true,
      allowMemberInvites: true,
      requirePostApproval: false
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.communities.create(formData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create community');
      }
      
      // Navigate to the new community's chat
      navigate(`/chat/community/${response.data.data._id}`);
    } catch (err) {
      console.error('Error creating community:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to create community. Please try again.'
      );
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
          <IconButton 
            onClick={() => navigate('/communities')}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Create New Community
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Community Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 50 }}
              helperText={`${formData.name.length}/50 characters`}
            />

            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              sx={{ mb: 3 }}
              inputProps={{ maxLength: 500 }}
              helperText={`${formData.description.length}/500 characters`}
            />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Community Settings
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.isPrivate}
                    onChange={handleInputChange}
                    name="settings.isPrivate"
                  />
                }
                label="Private Community"
              />
              <FormHelperText>
                Private communities are only visible to members
              </FormHelperText>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowMemberPosts}
                    onChange={handleInputChange}
                    name="settings.allowMemberPosts"
                  />
                }
                label="Allow Member Posts"
              />
              <FormHelperText>
                Let members create new posts in the community
              </FormHelperText>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowMemberInvites}
                    onChange={handleInputChange}
                    name="settings.allowMemberInvites"
                  />
                }
                label="Allow Member Invites"
              />
              <FormHelperText>
                Let members invite others to join the community
              </FormHelperText>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.requirePostApproval}
                    onChange={handleInputChange}
                    name="settings.requirePostApproval"
                  />
                }
                label="Require Post Approval"
              />
              <FormHelperText>
                Posts must be approved by moderators before appearing
              </FormHelperText>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/communities')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Create Community'
                )}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default CreateCommunity;