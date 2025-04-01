import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { Community, UpdateCommunityData } from '../../types/api';
import apiService from '../../services/apiService';

const CommunityDetail: React.FC<{}> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editData, setEditData] = useState<UpdateCommunityData>({
    name: '',
    description: ''
  });

  const fetchCommunity = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await apiService.communities.getById(id);
      const communityData = response.data.data; // Extract data from ApiResponse
      setCommunity(communityData);
      setEditData({
        name: communityData.name,
        description: communityData.description || ''
      });
    } catch (err) {
      setError('Failed to fetch community details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunity();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdate = async () => {
    if (!id) return;
    try {
      await apiService.communities.update(id, editData);
      setEditMode(false);
      fetchCommunity();
    } catch (err) {
      setError('Failed to update community');
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await apiService.communities.delete(id);
      navigate('/communities');
    } catch (err) {
      setError('Failed to delete community');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!community) {
    return (
      <Container>
        <Alert severity="error">Community not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {community.name}
          </Typography>
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => setEditMode(true)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          {community.description}
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Created at: {new Date(community.createdAt).toLocaleDateString()}
        </Typography>
      </Paper>

      <Dialog open={editMode} onClose={() => setEditMode(false)} fullWidth>
        <DialogTitle>Edit Community</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommunityDetail;