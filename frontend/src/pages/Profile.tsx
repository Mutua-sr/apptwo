import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button, TextField, Avatar, Alert, CircularProgress } from '@mui/material';
import { Profile, UpdateProfileData } from '../types/api';
import { profileService } from '../services/profileService';

const defaultProfileData: UpdateProfileData = {
  bio: '',
  location: '',
  website: '',
  interests: [],
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showLocation: true
    }
  }
};

const ProfilePage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateData, setUpdateData] = useState<UpdateProfileData>(defaultProfileData);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      if (!currentUser?.profileId) {
        throw new Error('No profile ID found');
      }
      setLoading(true);
      const profileData = await profileService.getProfile(currentUser.profileId);
      setProfile(profileData);
      setUpdateData({
        bio: profileData.bio || '',
        location: profileData.location || '',
        website: profileData.website || '',
        interests: profileData.interests || [],
        settings: profileData.settings
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.profileId]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (currentUser?.profileId) {
      loadProfile();
    }
  }, [currentUser, loadProfile, isAuthenticated, navigate]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!currentUser?.profileId) {
        throw new Error('No profile ID found');
      }
      const imageUrl = await profileService.uploadProfileImage(currentUser.profileId, file);
      setUpdateData(prev => ({
        ...prev,
        avatar: imageUrl
      }));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      if (!currentUser?.profileId) {
        throw new Error('No profile ID found');
      }
      const updatedProfile = await profileService.updateProfile(currentUser.profileId, updateData);
      setProfile(updatedProfile);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="error">Profile not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Avatar
            src={profile.avatar}
            alt={currentUser?.name}
            sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
          />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="avatar-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="avatar-upload">
            <Button variant="outlined" component="span">
              Change Avatar
            </Button>
          </label>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Bio"
            multiline
            rows={4}
            value={updateData.bio}
            onChange={(e) => setUpdateData({ ...updateData, bio: e.target.value })}
          />

          <TextField
            label="Location"
            value={updateData.location}
            onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })}
          />

          <TextField
            label="Website"
            value={updateData.website}
            onChange={(e) => setUpdateData({ ...updateData, website: e.target.value })}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default ProfilePage;