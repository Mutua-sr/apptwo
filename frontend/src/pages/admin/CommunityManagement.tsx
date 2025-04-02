import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Typography,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Community, CommunitySettings, CreateCommunityData } from '../../types/room';
import apiService from '../../services/apiService';

interface FormData {
  name: string;
  description: string;
  settings: CommunitySettings;
}

const defaultSettings: CommunitySettings = {
  isPrivate: false,
  allowMemberPosts: true,
  allowMemberInvites: true,
  requirePostApproval: false
};

const CommunityManagement: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    settings: defaultSettings
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await apiService.communities.list();
      setCommunities(response.data.data);
    } catch (error) {
      setError('Failed to fetch communities');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleEdit = (community: Community) => {
    setSelectedCommunity(community);
    setFormData({
      name: community.name,
      description: community.description,
      settings: community.settings
    });
    setDialogOpen(true);
  };

  const handleDelete = async (community: Community) => {
    if (!window.confirm('Are you sure you want to delete this community?')) {
      return;
    }

    try {
      await apiService.communities.delete(community._id);
      fetchCommunities();
    } catch (error) {
      setError('Failed to delete community');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const roomData: CreateCommunityData = {
        type: 'community',
        name: formData.name.trim(),
        description: formData.description || '', // Ensure description is never undefined
        settings: formData.settings
      };

      if (selectedCommunity) {
        await apiService.communities.update(selectedCommunity._id, roomData);
      } else {
        await apiService.communities.create(roomData);
      }
      fetchCommunities();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      setError('Failed to save community');
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedCommunity(null);
    setFormData({
      name: '',
      description: '',
      settings: defaultSettings
    });
    setError(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Community Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Create Community
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Settings</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {communities.map((community) => (
              <TableRow key={community._id}>
                <TableCell>{community.name}</TableCell>
                <TableCell>{community.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {community.settings.isPrivate && (
                      <Chip label="Private" size="small" color="primary" />
                    )}
                    {community.settings.requirePostApproval && (
                      <Chip label="Approval" size="small" color="warning" />
                    )}
                    {community.settings.allowMemberInvites && (
                      <Chip label="Invites" size="small" color="success" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      src={community.createdBy.avatar} 
                      alt={community.createdBy.name}
                      sx={{ width: 24, height: 24 }}
                    >
                      {community.createdBy.name.charAt(0)}
                    </Avatar>
                    <Typography>{community.createdBy.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(community)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(community)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCommunity ? 'Edit Community' : 'Create Community'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!formData.name.trim()}
              helperText={!formData.name.trim() && 'Name is required'}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2">Settings</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.isPrivate}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          isPrivate: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label="Private Community"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowMemberPosts}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          allowMemberPosts: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label="Allow Member Posts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowMemberInvites}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          allowMemberInvites: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label="Allow Member Invites"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.requirePostApproval}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          requirePostApproval: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label="Require Post Approval"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.name.trim()}
          >
            {selectedCommunity ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunityManagement;