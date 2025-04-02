import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExtendedRoom } from '../../types/chat';
import { Classroom } from '../../types/room';
import apiService from '../../services/apiService';
import EmptyRoomList from './EmptyRoomList';
import { useAuth } from '../../contexts/AuthContext';

const ClassroomChatList: React.FC = () => {
  const [rooms, setRooms] = useState<ExtendedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const mapClassroomToExtendedRoom = (classroom: Classroom): ExtendedRoom => ({
    _id: classroom._id,
    name: classroom.name,
    description: classroom.description,
    type: classroom.type,
    avatar: classroom.avatar,
    createdById: classroom.createdById,
    createdBy: classroom.createdBy,
    createdAt: classroom.createdAt,
    updatedAt: classroom.updatedAt,
    settings: classroom.settings,
    teachers: classroom.teachers,
    students: classroom.students,
    assignments: classroom.assignments,
    materials: classroom.materials,
    unreadCount: 0,
    lastMessage: undefined
  });

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await apiService.classrooms.getUserClassrooms();
        if (response.data.success) {
          const extendedRooms = response.data.data.map(mapClassroomToExtendedRoom);
          setRooms(extendedRooms);
        } else {
          throw new Error('Failed to fetch classrooms');
        }
      } catch (err) {
        console.error('Error fetching classrooms:', err);
        setError('Failed to load classrooms. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchRooms();
    }
  }, [currentUser]);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await apiService.classrooms.join(roomId);
      const response = await apiService.classrooms.getUserClassrooms();
      if (response.data.success) {
        const extendedRooms = response.data.data.map(mapClassroomToExtendedRoom);
        setRooms(extendedRooms);
      }
    } catch (err) {
      console.error('Error joining classroom:', err);
      setError('Failed to join classroom. Please try again.');
    }
  };

  const handleCreateRoom = async (name: string, description: string) => {
    try {
      const response = await apiService.classrooms.create({
        type: 'classroom',
        name,
        description,
        settings: {
          allowStudentChat: true,
          allowStudentPosts: true,
          allowStudentComments: true,
          isPrivate: false,
          requirePostApproval: false,
          notifications: {
            assignments: true,
            materials: true,
            announcements: true
          }
        }
      });
      
      if (response.data.success) {
        const newExtendedRoom = mapClassroomToExtendedRoom(response.data.data);
        setRooms([...rooms, newExtendedRoom]);
      }
    } catch (err) {
      console.error('Error creating classroom:', err);
      setError('Failed to create classroom. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <EmptyRoomList
        type="classroom"
        availableRooms={[]}
        onJoin={handleJoinRoom}
        onCreate={handleCreateRoom}
      />
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {currentUser?.role === 'teacher' ? 'Your Teaching Classrooms' : 'Your Enrolled Classrooms'}
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Link
            to={`/chat/${room._id}`}
            key={room._id}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                {room.description && (
                  <p className="text-gray-600 mt-1 text-sm">{room.description}</p>
                )}
              </div>
              {room.unreadCount && room.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {room.unreadCount}
                </span>
              )}
            </div>
            
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <i className="fas fa-users mr-2"></i>
              <span>{room.students?.length || 0} students</span>
              
              {room.settings?.allowStudentChat && (
                <span className="ml-4 text-green-600 flex items-center">
                  <i className="fas fa-comments mr-1"></i>
                  Chat enabled
                </span>
              )}
            </div>

            {room.lastMessage && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 truncate">
                  <span className="font-medium">{room.lastMessage}</span>
                </p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ClassroomChatList;