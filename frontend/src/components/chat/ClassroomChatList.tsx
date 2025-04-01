import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExtendedRoom } from '../../types/chat';
import { chatService } from '../../services/chatService';
import EmptyRoomList from './EmptyRoomList';

const ClassroomChatList: React.FC = () => {
  const [rooms, setRooms] = useState<ExtendedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // Get classroom type rooms
        const response = await chatService.getRoom('classroom');
        const chatRooms = Array.isArray(response) ? response : [response];
        setRooms(chatRooms as ExtendedRoom[]);
      } catch (err) {
        setError('Failed to load chat rooms');
        console.error('Error fetching classroom chat rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleJoinRoom = async (roomId: string) => {
    try {
      await chatService.joinRoom(roomId);
      // Refresh rooms list after joining
      const response = await chatService.getRoom('classroom');
      const chatRooms = Array.isArray(response) ? response : [response];
      setRooms(chatRooms as ExtendedRoom[]);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
    }
  };

  const handleCreateRoom = async (name: string, description: string) => {
    try {
      // Implementation would depend on your API
      console.log('Creating room:', { name, description });
      // Refresh rooms list after creation
      const response = await chatService.getRoom('classroom');
      const chatRooms = Array.isArray(response) ? response : [response];
      setRooms(chatRooms as ExtendedRoom[]);
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room');
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
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Classroom Chats</h2>
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