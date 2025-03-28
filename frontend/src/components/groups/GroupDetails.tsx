import React, { useState, useEffect } from 'react';
import { groupService } from '../../services/groupService';
import { Classroom, Community, User } from '../../types/api';
import { GroupForm } from './GroupForm';

interface GroupDetailsProps {
  group: Classroom | Community;
  currentUser: User;
  onGroupUpdated?: (group: Classroom | Community) => void;
  onClose?: () => void;
  className?: string;
}

export const GroupDetails: React.FC<GroupDetailsProps> = ({
  group,
  currentUser,
  onGroupUpdated,
  onClose,
  className = ''
}) => {
  const [members, setMembers] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const membersList = await groupService.getMembers(group._id, group.type);
      setMembers(membersList);
    } catch (err: any) {
      setError(err.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [group._id]);

  const handleLeaveGroup = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) {
      return;
    }

    try {
      await groupService.leaveGroup(group._id, group.type);
      onClose?.();
    } catch (err: any) {
      setError(err.message || 'Failed to leave group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      if (group.type === 'classroom') {
        await groupService.deleteClassroom(group._id);
      } else {
        await groupService.deleteCommunity(group._id);
      }
      onClose?.();
    } catch (err: any) {
      setError(err.message || 'Failed to delete group');
    }
  };

  if (isEditing) {
    return (
      <GroupForm
        type={group.type}
        group={group}
        onSuccess={(updatedGroup) => {
          setIsEditing(false);
          onGroupUpdated?.(updatedGroup);
        }}
        onCancel={() => setIsEditing(false)}
        className={className}
      />
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times"></i>
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Group Info</h2>
          <div className="w-6"></div> {/* Spacer for alignment */}
        </div>

        {/* Group Avatar */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-semibold">
              {group.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Group Name and Description */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
          {group.description && (
            <p className="mt-2 text-gray-600">{group.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Created {new Date(group.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Members Section */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Members ({members.length})
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-4">{error}</div>
        ) : (
          <div className="space-y-2">
            {members.map(memberId => (
              <div
                key={memberId}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-gray-500"></i>
                  </div>
                  <span className="text-gray-900">{memberId}</span>
                </div>
                {memberId === group.createdBy && (
                  <span className="text-sm text-gray-500">Admin</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3">
        {group.createdBy === currentUser.id ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-edit"></i>
              <span>Edit Group</span>
            </button>
            <button
              onClick={handleDeleteGroup}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <i className="fas fa-trash"></i>
              <span>Delete Group</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleLeaveGroup}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Leave Group</span>
          </button>
        )}
      </div>
    </div>
  );
};