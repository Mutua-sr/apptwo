import React, { FC, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  PersonAdd as JoinIcon,
} from '@mui/icons-material';
import { Community, Classroom } from '../../types/api';

interface EmptyRoomListProps {
  type: 'classroom' | 'community';
  availableRooms: (Community | Classroom)[];
  onJoin: (roomId: string) => void;
  onCreate: (name: string, description: string) => void;
}

const EmptyRoomList: FC<EmptyRoomListProps> = ({
  type,
  availableRooms,
  onJoin,
  onCreate,
}) => {
  const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');

  const handleCreate = () => {
    if (newRoomName.trim()) {
      onCreate(newRoomName.trim(), newRoomDescription.trim());
      setCreateDialogOpen(false);
      setNewRoomName('');
      setNewRoomDescription('');
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        textAlign: 'center',
      }}
    >
      <i className={`fas fa-${type === 'classroom' ? 'chalkboard' : 'users'} text-6xl mb-4 text-gray-400`} />
      <Typography variant="h6" color="textSecondary" gutterBottom>
        No {type}s joined yet
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Join an existing {type} or create a new one
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<JoinIcon />}
          onClick={() => setJoinDialogOpen(true)}
        >
          Join {type}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create New
        </Button>
      </Box>

      {/* Join Dialog */}
      <Dialog
        open={isJoinDialogOpen}
        onClose={() => setJoinDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Available {type}s
        </DialogTitle>
        <DialogContent>
          {availableRooms.length === 0 ? (
            <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
              No available {type}s to join
            </Typography>
          ) : (
            <List>
              {availableRooms.map((room) => (
                <ListItem key={room._id}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{room.name}</Typography>
                        {room.settings?.isPrivate && (
                          <Typography variant="caption" color="text.secondary">
                            (Private)
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" component="div">
                          {room.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                          {room.type === 'classroom' 
                            ? `${room.students?.length || 0} students`
                            : `${room.members?.length || 0} members`} · 
                          Created {new Date(room.createdAt).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => {
                        onJoin(room._id);
                        setJoinDialogOpen(false);
                      }}
                      title="Join"
                    >
                      <JoinIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Create New {type}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={newRoomDescription}
            onChange={(e) => setNewRoomDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!newRoomName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmptyRoomList;