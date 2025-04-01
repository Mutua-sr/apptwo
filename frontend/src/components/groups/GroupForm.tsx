import React, { useState, useEffect } from 'react';
import { groupService } from '../../services/groupService';
import { Classroom, Community, CreateClassroomData, CreateCommunityData } from '../../types/room';

interface GroupFormProps {
  type: 'classroom' | 'community';
  group?: Classroom | Community;
  onSuccess?: (group: Community | Classroom) => void;
  onCancel?: () => void;
  className?: string;
}

export const GroupForm: React.FC<GroupFormProps> = ({
  type,
  group,
  onSuccess,
  onCancel,
  className = ''
}) => {
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || '');
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      let result;
      if (group) {
        // Update existing group
        const updateData = {
          name: name.trim(),
          description: description.trim() || ''
        };
        
        result = type === 'classroom'
          ? await groupService.updateClassroom(group._id, updateData)
          : await groupService.updateCommunity(group._id, updateData);
      } else {
        // Create new group with default settings
        if (type === 'classroom') {
          const classroomData: CreateClassroomData = {
            name: name.trim(),
            description: description.trim() || '',
            type: 'classroom',
            settings: {
              isPrivate: false,
              allowStudentPosts: true,
              allowStudentComments: true,
              allowStudentChat: true,
              requirePostApproval: false,
              notifications: {
                assignments: true,
                materials: true,
                announcements: true
              }
            }
          };
          result = await groupService.createClassroom(classroomData);
        } else {
          const communityData: CreateCommunityData = {
            name: name.trim(),
            description: description.trim() || '',
            type: 'community',
            settings: {
              isPrivate: false,
              allowMemberPosts: true,
              allowMemberInvites: true,
              requirePostApproval: false
            }
          };
          result = await groupService.createCommunity(communityData);
        }
      }

      // Type assertion since we know the result matches our Room types
      onSuccess?.(result as Community | Classroom);
    } catch (err: any) {
      setError(err.message || `Failed to ${group ? 'update' : 'create'} ${type}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {group ? 'Edit' : 'Create'} {type === 'classroom' ? 'Classroom' : 'Community'}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Enter ${type} name`}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder={`Describe your ${type}...`}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`
              px-4 py-2 rounded-md text-white font-medium
              ${isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {group ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              group ? 'Update' : 'Create'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};