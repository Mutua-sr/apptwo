import React, { useState, useEffect } from 'react';
import { groupService } from '../../services/groupService';
import { Room, Community } from '../../types/room';
import { User } from '../../types/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Chip,
  CircularProgress
} from '@mui/material';

interface GroupDetailsProps {
  type: 'community';
  groupId: string;
  onClose: () => void;
}

export const GroupDetails: React.FC<GroupDetailsProps> = ({
  type,
  groupId,
  onClose
}) => {
  const { currentUser } = useAuth();
  const [group, setGroup] = useState<Room | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const fetchedGroup = await groupService.getCommunity(groupId);
      setGroup(fetchedGroup);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group');
    } finally {
      setLoading(false);
    }
  };

  const getMembers = (group: Community): User[] => {
    return group.members.map(member => ({
      id: member.id,
      name: member.name,
      email: '', // These fields are required by User type
      role: member.role,
      status: 'active',
      profileId: member.id,
      avatar: member.avatar,
      createdAt: member.joinedAt,
      updatedAt: member.joinedAt
    }));
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !group) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">{error || 'Group not found'}</Typography>
      </Box>
    );
  }

  const members = getMembers(group);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          {group.name}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {group.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {group.settings.isPrivate && (
            <Chip label="Private" size="small" color="primary" />
          )}
          {group.settings.allowMemberPosts && (
            <Chip label="Member Posts" size="small" color="success" />
          )}
          {group.settings.requirePostApproval && (
            <Chip label="Post Approval" size="small" color="warning" />
          )}
        </Box>
      </Box>

      {/* Members List */}
      <Typography variant="h6" gutterBottom>
        Members
      </Typography>
      <List>
        {members.map((member) => (
          <ListItem key={member.id}>
            <ListItemAvatar>
              <Avatar src={member.avatar}>{member.name.charAt(0)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{member.name}</span>
                  {member.id === group.createdById && (
                    <Chip label="Admin" size="small" color="primary" />
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Actions */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {currentUser?.id === group.createdById && (
          <>
            <Button
              variant="outlined"
              onClick={() => setIsEditing(true)}
            >
              Edit Community
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={onClose}
            >
              Delete
            </Button>
          </>
        )}
        <Button onClick={onClose}>
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default GroupDetails;