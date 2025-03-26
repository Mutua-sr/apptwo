import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { Community, CreateCommunityData } from '../types/api';
import apiService from '../services/apiService';

export const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [open, setOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState<CreateCommunityData>({
    name: '',
    description: ''
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await apiService.communities.getAll();
      setCommunities(response.data);
    } catch (err) {
      setError('Failed to fetch communities');
      console.error(err);
    }
  };

  const handleCreateCommunity = async () => {
    try {
      await apiService.communities.create(newCommunity);
      setOpen(false);
      setNewCommunity({ name: '', description: '' });
      fetchCommunities();
    } catch (err) {
      setError('Failed to create community');
      console.error(err);
    }
  };

  const handleDeleteCommunity = async (id: string) => {
    try {
      await apiService.communities.delete(id);
      fetchCommunities();
    } catch (err) {
      setError('Failed to delete community');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1" gutterBottom>
            Communities
          </Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => setOpen(true)}
          >
            Create Community
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        {communities.map((community) => (
          <Grid item xs={12} sm={6} md={4} key={community._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2">
                  {community.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {community.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary" 
                  href={`/communities/${community._id}`}
                >
                  View
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  onClick={() => handleDeleteCommunity(community._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create New Community</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newCommunity.name}
            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newCommunity.description}
            onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateCommunity} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Communities;