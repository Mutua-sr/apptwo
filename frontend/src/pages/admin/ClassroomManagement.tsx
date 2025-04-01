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
import { Classroom, ClassroomSettings, CreateClassroomData } from '../../types/room';
import apiService from '../../services/apiService';

interface FormData {
  name: string;
  description: string;
  settings: ClassroomSettings;
}

const defaultSettings: ClassroomSettings = {
  allowStudentChat: true,
  allowStudentPosts: true,
  allowStudentComments: true,
  requirePostApproval: false,
  isPrivate: false,
  notifications: {
    assignments: true,
    materials: true,
    announcements: true
  }
};

const ClassroomManagement: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    settings: defaultSettings
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.classrooms.getAll();
      setClassrooms(response.data.data);
    } catch (error) {
      setError('Failed to fetch classrooms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleEdit = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setFormData({
      name: classroom.name,
      description: classroom.description,
      settings: classroom.settings
    });
    setDialogOpen(true);
  };

  const handleDelete = async (classroom: Classroom) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) {
      return;
    }

    try {
      await apiService.classrooms.delete(classroom._id);
      fetchClassrooms();
    } catch (error) {
      setError('Failed to delete classroom');
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      const roomData: CreateClassroomData = {
        type: 'classroom',
        name: formData.name.trim(),
        description: formData.description || '', // Ensure description is never undefined
        settings: formData.settings
      };

      if (selectedClassroom) {
        await apiService.classrooms.update(selectedClassroom._id, roomData);
      } else {
        await apiService.classrooms.create(roomData);
      }
      fetchClassrooms();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      setError('Failed to save classroom');
      console.error(error);
    }
  };

  const resetForm = () => {
    setSelectedClassroom(null);
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
        <Typography variant="h5">Classroom Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          Create Classroom
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
            {classrooms.map((classroom) => (
              <TableRow key={classroom._id}>
                <TableCell>{classroom.name}</TableCell>
                <TableCell>{classroom.description}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {classroom.settings.isPrivate && (
                      <Chip label="Private" size="small" color="primary" />
                    )}
                    {classroom.settings.requirePostApproval && (
                      <Chip label="Approval" size="small" color="warning" />
                    )}
                    {classroom.settings.allowStudentChat && (
                      <Chip label="Chat" size="small" color="success" />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      src={classroom.createdBy.avatar} 
                      alt={classroom.createdBy.name}
                      sx={{ width: 24, height: 24 }}
                    >
                      {classroom.createdBy.name.charAt(0)}
                    </Avatar>
                    <Typography>{classroom.createdBy.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(classroom)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(classroom)} size="small" color="error">
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
          {selectedClassroom ? 'Edit Classroom' : 'Create Classroom'}
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
                label="Private Classroom"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowStudentPosts}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          allowStudentPosts: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label="Allow Student Posts"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowStudentComments}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          allowStudentComments: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label="Allow Student Comments"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.settings.allowStudentChat}
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          allowStudentChat: e.target.checked
                        }
                      }))
                    }
                  />
                }
                label="Allow Student Chat"
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
            {selectedClassroom ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassroomManagement;