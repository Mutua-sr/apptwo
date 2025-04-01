import React, { useState, useEffect } from 'react';
import { groupService } from '../../services/groupService';
import { Classroom as ApiClassroom, Community as ApiCommunity } from '../../types/api';
import { GroupForm } from './GroupForm';

// Define display-specific types that contain only the properties we need
interface DisplayGroup {
  _id: string;
  name: string;
  description?: string;
  type: 'classroom' | 'community';
  displayDate?: string;
}

interface GroupListProps {
  type: 'classroom' | 'community';
  userId?: string;
  className?: string;
  onGroupSelect?: (group: ApiClassroom | ApiCommunity) => void;
}

export const GroupList: React.FC<GroupListProps> = ({ 
  type, 
  userId, 
  className = '',
  onGroupSelect 
}) => {
  const [groups, setGroups] = useState<DisplayGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      if (type === 'classroom') {
        const classrooms = await groupService.getClassrooms(userId);
        setGroups(classrooms.map(classroom => ({
          _id: classroom._id,
          name: classroom.name,
          description: classroom.description,
          type: 'classroom' as const,
          displayDate: classroom.createdAt
        })));
      } else {
        const communities = await groupService.getCommunities(userId);
        setGroups(communities.map(community => ({
          _id: community._id,
          name: community.name,
          description: community.description,
          type: 'community' as const,
          displayDate: community.createdAt
        })));
      }
    } catch (err: any) {
      setError(err.message || `Failed to load ${type}s`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [type, userId]);

  const handleGroupClick = async (group: DisplayGroup) => {
    setSelectedGroup(group._id);
    if (onGroupSelect) {
      try {
        const originalGroup = type === 'classroom'
          ? await groupService.getClassroom(group._id)
          : await groupService.getCommunity(group._id);
        onGroupSelect(originalGroup);
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    }
  };

  const handleGroupCreated = (newGroup: ApiClassroom | ApiCommunity) => {
    setGroups(prev => [...prev, {
      _id: newGroup._id,
      name: newGroup.name,
      description: newGroup.description,
      type: type,
      displayDate: type === 'community' && 'createdAt' in newGroup ? newGroup.createdAt : undefined
    }]);
    setShowCreateForm(false);
  };

  if (showCreateForm) {
    return (
      <GroupForm
        type={type}
        onSuccess={handleGroupCreated}
        onCancel={() => setShowCreateForm(false)}
        className={className}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          {type === 'classroom' ? 'Classrooms' : 'Communities'}
        </h2>
      </div>
      
      <div className="divide-y">
        {groups.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No {type}s found
          </div>
        ) : (
          groups.map(group => (
            <div
              key={group._id}
              onClick={() => handleGroupClick(group)}
              className={`
                p-4 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors
                ${selectedGroup === group._id ? 'bg-blue-50' : ''}
              `}
            >
              {/* Group Avatar */}
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">
                  {group.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {group.name}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {group.displayDate ? new Date(group.displayDate).toLocaleDateString() : ''}
                  </span>
                </div>
                {group.description && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create New Group Button */}
      <div className="p-4 border-t">
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Create New {type === 'classroom' ? 'Classroom' : 'Community'}</span>
        </button>
      </div>
    </div>
  );
};