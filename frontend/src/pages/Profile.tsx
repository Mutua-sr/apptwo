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
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-400 rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
              <img
                src={profile?.avatar || 'https://via.placeholder.com/128'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Logout
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="bg-gray-800 rounded-3xl p-8 mt-16 shadow-2xl backdrop-blur-lg bg-opacity-50">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{currentUser?.name}</h1>
            <p className="text-gray-400">{currentUser?.email}</p>
            {profile?.location && (
              <p className="text-gray-400 mt-2 flex items-center">
                <i className="fas fa-map-marker-alt mr-2 text-primary-500"></i>
                {profile.location}
              </p>
            )}
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-user-circle mr-2 text-primary-500"></i>
              About
            </h2>
            <p className="text-gray-300 bg-gray-700 rounded-lg p-4">
              {profile?.bio || 'No bio added yet'}
            </p>
          </div>

          {/* Interests */}
          {profile?.interests && profile.interests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-heart mr-2 text-primary-500"></i>
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-primary-500 bg-opacity-20 text-primary-300 rounded-full text-sm flex items-center hover:bg-opacity-30 transition-all duration-300"
                  >
                    <i className="fas fa-hashtag mr-1 text-xs"></i>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {profile?.website && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-globe mr-2 text-primary-500"></i>
                Website
              </h2>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 flex items-center group transition-all duration-300"
              >
                <span className="mr-2">{profile.website}</span>
                <i className="fas fa-external-link-alt text-sm transform group-hover:translate-x-1 transition-transform duration-300"></i>
              </a>
            </div>
          )}

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-xl p-6 backdrop-blur-lg bg-opacity-50 hover:bg-opacity-70 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-bell mr-2 text-primary-500"></i>
                Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email Notifications</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${profile?.settings.emailNotifications ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'}`}>
                    {profile?.settings.emailNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Push Notifications</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${profile?.settings.pushNotifications ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'}`}>
                    {profile?.settings.pushNotifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-xl p-6 backdrop-blur-lg bg-opacity-50 hover:bg-opacity-70 transition-all duration-300">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <i className="fas fa-lock mr-2 text-primary-500"></i>
                Privacy
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Profile Visibility</span>
                  <span className="px-3 py-1 bg-primary-500 bg-opacity-20 text-primary-300 rounded-full text-sm capitalize">
                    {profile?.settings.privacy.profileVisibility}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Show Location</span>
                  <span className={`px-3 py-1 rounded-full text-sm ${profile?.settings.privacy.showLocation ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'}`}>
                    {profile?.settings.privacy.showLocation ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="mt-8 bg-gray-700 rounded-xl p-6 backdrop-blur-lg bg-opacity-50">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-info-circle mr-2 text-primary-500"></i>
              Account Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Member Since</p>
                <p className="text-gray-200">
                  {new Date(profile?.createdAt || '').toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Last Updated</p>
                <p className="text-gray-200">
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