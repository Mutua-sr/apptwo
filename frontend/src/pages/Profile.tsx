import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { Profile } from '../types/api';

const ProfilePage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (currentUser?.profileId) {
          const data = await profileService.getProfile(currentUser.profileId);
          setProfile(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-primary-400">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
              <img
                src={profile?.avatar || 'https://via.placeholder.com/128'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{currentUser?.name}</h1>
              <p className="text-gray-600">{currentUser?.email}</p>
              {profile?.location && (
                <p className="text-gray-600 mt-1">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {profile.location}
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{profile?.bio || 'No bio added yet'}</p>
          </div>

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {profile?.website && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Website</h2>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 flex items-center"
              >
                <i className="fas fa-globe mr-2"></i>
                {profile.website}
              </a>
            </div>
          )}

          {/* Settings Preview */}
          <div className="border-t mt-6 pt-6">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-gray-600">
                  {profile?.settings.emailNotifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-gray-600">
                  {profile?.settings.pushNotifications ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Profile Visibility</h3>
                <p className="text-gray-600 capitalize">
                  {profile?.settings.privacy.profileVisibility}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Show Location</h3>
                <p className="text-gray-600">
                  {profile?.settings.privacy.showLocation ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="border-t mt-6 pt-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Member Since</h3>
                <p className="text-gray-600">
                  {new Date(profile?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">Last Updated</h3>
                <p className="text-gray-600">
                  {new Date(profile?.updatedAt || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;