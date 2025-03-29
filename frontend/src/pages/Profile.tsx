import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types/profile';
import { User } from '../types/api';

const defaultSettings: UserProfile['settings'] = {
  notifications: { email: false, push: false, inApp: false },
  privacy: { showEmail: false, showActivity: false, allowMessages: false },
  theme: 'light',
  language: 'en'
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateData, setUpdateData] = useState<Partial<UserProfile>>({
    settings: defaultSettings
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Get current user from localStorage
  const currentUser: User | null = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!currentUser?.id || !currentUser?.profileId) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [currentUser]);

  const loadProfile = async () => {
    try {
      if (!currentUser?.profileId) {
        throw new Error('No profile ID found');
      }
      setLoading(true);
      const profileData = await profileService.getProfile(currentUser.profileId);
      setProfile(profileData);
      // Initialize updateData with current profile settings
      setUpdateData({
        settings: profileData.settings
      });
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (
    name: string,
    value: boolean,
    section: keyof UserProfile['settings']
  ) => {
    setUpdateData(prev => {
      const currentSettings = prev.settings || defaultSettings;
      if (section === 'notifications' || section === 'privacy') {
        return {
          ...prev,
          settings: {
            ...currentSettings,
            [section]: {
              ...currentSettings[section],
              [name]: value
            }
          }
        };
      }
      return prev;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section?: string
  ) => {
    const { name, value } = e.target;
    
    if (section === 'social') {
      setUpdateData(prev => ({
        ...prev,
        social: {
          ...prev.social,
          [name]: value
        }
      }));
    } else {
      setUpdateData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        if (!currentUser?.profileId) {
          throw new Error('No profile ID found');
        }
        const imageUrl = await profileService.uploadProfileImage(currentUser.profileId, file);
        setUpdateData(prev => ({
          ...prev,
          avatar: imageUrl
        }));
      } catch (err: any) {
        setError(err.message || 'Failed to upload avatar');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!currentUser?.profileId) {
        throw new Error('No profile ID found');
      }
      const updatedProfile = await profileService.updateProfile(currentUser.profileId, updateData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <img
                  src={profile?.avatar || 'https://via.placeholder.com/150'}
                  alt={profile?.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer shadow-lg">
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <i className="fas fa-camera text-white"></i>
                  </label>
                )}
              </div>
            </div>
            <div className="absolute bottom-4 right-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:bg-blue-50 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={profile?.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      name="username"
                      defaultValue={profile?.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    name="bio"
                    rows={3}
                    defaultValue={profile?.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Social Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <i className="fab fa-github mr-2"></i>GitHub
                    </label>
                    <input
                      type="text"
                      name="github"
                      defaultValue={profile?.social?.github}
                      onChange={(e) => handleInputChange(e, 'social')}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      <i className="fab fa-linkedin mr-2"></i>LinkedIn
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      defaultValue={profile?.social?.linkedin}
                      onChange={(e) => handleInputChange(e, 'social')}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Activity</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile?.stats.posts}</div>
                    <div className="text-sm text-gray-500">Posts</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile?.stats.communities}</div>
                    <div className="text-sm text-gray-500">Communities</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{profile?.stats.classrooms}</div>
                    <div className="text-sm text-gray-500">Classrooms</div>
                  </div>
                </div>
              </div>

              {/* Settings */}
              {isEditing && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="email"
                            defaultChecked={profile?.settings.notifications.email}
                            onChange={(e) => handleSettingsChange('email', e.target.checked, 'notifications')}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2">Email Notifications</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="push"
                            defaultChecked={profile?.settings.notifications.push}
                            onChange={(e) => handleSettingsChange('push', e.target.checked, 'notifications')}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2">Push Notifications</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Privacy</h3>
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="showEmail"
                            defaultChecked={profile?.settings.privacy.showEmail}
                            onChange={(e) => handleSettingsChange('showEmail', e.target.checked, 'privacy')}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2">Show Email</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="showActivity"
                            defaultChecked={profile?.settings.privacy.showActivity}
                            onChange={(e) => handleSettingsChange('showActivity', e.target.checked, 'privacy')}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          />
                          <span className="ml-2">Show Activity</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;