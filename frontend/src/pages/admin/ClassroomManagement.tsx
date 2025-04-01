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
import { Classroom } from '../../types/api';
import apiService from '../../services/apiService';

interface ClassroomDialogProps {
  open: boolean;
  classroom: Classroom | null;
  onClose: () => void;
  onSave: (classroom: Partial<Classroom>) => Promise<void>;
}

const ClassroomDialog: React.FC<ClassroomDialogProps> = ({
  open,
  classroom,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<Classroom>>(classroom || {});

  useEffect(() => {
    setFormData(classroom || {});
  }, [classroom]);

  const handleSubmit = async () => {
    await onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{classroom ? 'Edit Classroom' : 'Create Classroom'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Name"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="Description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={3}
            fullWidth
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings?.allowStudentChat ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        allowStudentChat: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Allow Student Chat"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings?.allowStudentPosts ?? true}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        allowStudentPosts: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Allow Student Posts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.settings?.requirePostApproval ?? false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      settings: {
                        ...formData.settings,
                        requirePostApproval: e.target.checked,
                      },
                    })
                  }
                />
              }
              label="Require Post Approval"
            />
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

const ClassroomManagement: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [totalClassrooms, setTotalClassrooms] = useState(0);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await apiService.classrooms.getAll();
      setClassrooms(response.data.data);
      setTotalClassrooms(response.data.data.length);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError('Failed to load classrooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCreateNew = () => {
    setSelectedClassroom(null);
    setDialogOpen(true);
  };

  const handleEdit = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setDialogOpen(true);
  };

  const handleDelete = async (classroomId: string) => {
    if (!window.confirm('Are you sure you want to delete this classroom?')) {
      return;
    }

    try {
      await apiService.classrooms.delete(classroomId);
      fetchClassrooms();
    } catch (err) {
      console.error('Error deleting classroom:', err);
      setError('Failed to delete classroom');
    }
  };

  const handleSave = async (classroomData: Partial<Classroom>) => {
    try {
      if (selectedClassroom) {
        await apiService.classrooms.update(selectedClassroom._id, classroomData);
      } else {
        await apiService.classrooms.create(classroomData);
      }
      fetchClassrooms();
    } catch (err) {
      console.error('Error saving classroom:', err);
      setError('Failed to save classroom');
    }
  };

  const filteredClassrooms = classrooms.filter((classroom) =>
    classroom.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedClassrooms = filteredClassrooms.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
        <Typography variant="h4">Classroom Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search classrooms..."
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
              <TableCell>Students</TableCell>
              <TableCell>Teachers</TableCell>
              <TableCell>Settings</TableCell>
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
              paginatedClassrooms.map((classroom) => (
                <TableRow key={classroom._id}>
                  <TableCell>{classroom.name}</TableCell>
                  <TableCell>{classroom.description}</TableCell>
                  <TableCell>{classroom.students.length}</TableCell>
                  <TableCell>{classroom.teachers.length}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {classroom.settings?.allowStudentChat && (
                        <Chip label="Chat" size="small" color="primary" />
                      )}
                      {classroom.settings?.allowStudentPosts && (
                        <Chip label="Posts" size="small" color="primary" />
                      )}
                      {classroom.settings?.requirePostApproval && (
                        <Chip label="Approval" size="small" color="warning" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(classroom)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(classroom._id)}
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
          count={filteredClassrooms.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      <ClassroomDialog
        open={dialogOpen}
        classroom={selectedClassroom}
        onClose={() => {
          setDialogOpen(false);
          setSelectedClassroom(null);
        }}
        onSave={handleSave}
      />
    </Box>
  );
};

export default ClassroomManagement;