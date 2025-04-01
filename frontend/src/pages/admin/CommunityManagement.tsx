import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Community } from '../../types/api';
import apiService from '../../services/apiService';

import { CreateCommunityData, CommunitySettings } from '../../types/room';

interface CommunityFormData {
  name: string;
  description?: string;
  settings: CommunitySettings;
}

interface CommunityDialogProps {
  open: boolean;
  community: Community | null;
  onClose: () => void;
  onSave: (data: CommunityFormData) => Promise<void>;
}

const CommunityDialog: React.FC<CommunityDialogProps> = ({
  open,
  community,
  onClose,
  onSave,
}) => {
  const defaultSettings: CommunitySettings = {
    isPrivate: false,
    requiresApproval: false,
    allowInvites: true
  };

  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    description: '',
    settings: defaultSettings
  });

  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name,
        description: community.description,
        settings: {
          isPrivate: community.settings.isPrivate,
          requiresApproval: community.settings.requiresApproval,
          allowInvites: community.settings.allowInvites
        }
      });
    } else {
      setFormData({
        name: '',
        description: '',
        settings: defaultSettings
      });
    }
  }, [community]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }
    await onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{community ? 'Edit Community' : 'Create Community'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            multiline
            rows={3}
            fullWidth
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.isPrivate}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          isPrivate: e.target.checked,
                        },
                      }))
                    }
                  />
                }
                label="Private Community"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.requiresApproval}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          requiresApproval: e.target.checked,
                        },
                      }))
                    }
                  />
                }
                label="Require Approval"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowInvites}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          allowInvites: e.target.checked,
                        },
                      }))
                    }
                  />
                }
                label="Allow Invites"
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CommunityManagement: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await apiService.communities.getAll();
      setCommunities(response.data.data);
    } catch (err) {
      console.error('Error fetching communities:', err);
      setError('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateNew = () => {
    setSelectedCommunity(null);
    setDialogOpen(true);
  };

  const handleEdit = (community: Community) => {
    setSelectedCommunity(community);
    setDialogOpen(true);
  };

  const handleDelete = async (communityId: string) => {
    if (!window.confirm('Are you sure you want to delete this community?')) {
      return;
    }

    try {
      await apiService.communities.delete(communityId);
      fetchCommunities();
    } catch (err) {
      console.error('Error deleting community:', err);
      setError('Failed to delete community');
    }
  };

  const handleSave = async (formData: CommunityFormData): Promise<void> => {
    if (!formData.name.trim()) {
      return;
    }

    try {
      const roomData: CreateCommunityData = {
        name: formData.name.trim(),
        description: formData.description?.trim(),
        type: 'community',
        settings: formData.settings
      };

      if (selectedCommunity) {
        await apiService.communities.update(selectedCommunity._id, roomData);
      } else {
        await apiService.communities.create(roomData);
      }
      fetchCommunities();
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving community:', err);
      setError('Failed to save community');
    }
  };

  const filteredCommunities = React.useMemo(() => 
    communities.filter((community) =>
      community.name.toLowerCase().includes(search.toLowerCase())
    ), [communities, search]);

  const paginatedCommunities = React.useMemo(() => 
    filteredCommunities.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    ), [filteredCommunities, page, rowsPerPage]);

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Community Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search communities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Create New
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Settings</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              paginatedCommunities.map((community) => (
                <TableRow key={community._id}>
                  <TableCell>{community.name}</TableCell>
                  <TableCell>{community.description}</TableCell>
                  <TableCell>{community.members.length}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {community.settings?.isPrivate && (
                        <Chip label="Private" size="small" color="primary" />
                      )}
                      {community.settings?.requiresApproval && (
                        <Chip label="Approval" size="small" color="warning" />
                      )}
                      {community.settings?.allowInvites && (
                        <Chip label="Invites" size="small" color="success" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{community.createdBy}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(community)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(community._id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredCommunities.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <CommunityDialog
        open={dialogOpen}
        community={selectedCommunity}
        onClose={() => {
          setDialogOpen(false);
          setSelectedCommunity(null);
        }}
        onSave={handleSave}
      />
    </Box>
  );
};

export default CommunityManagement;