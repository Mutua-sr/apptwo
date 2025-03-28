import React, { useState } from 'react';
import { GroupList, GroupDetails } from '../components/groups';
import { Classroom } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const Classrooms: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to view classrooms</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with classroom list */}
      <div className="w-full md:w-1/3 border-r bg-white">
        <GroupList
          type="classroom"
          userId={currentUser.id}
          onGroupSelect={(classroom) => setSelectedClassroom(classroom as Classroom)}
          className="h-full"
        />
      </div>

      {/* Main content area */}
      <div className="hidden md:block md:w-2/3">
        {selectedClassroom ? (
          <GroupDetails
            group={selectedClassroom}
            currentUser={currentUser}
            onGroupUpdated={(classroom) => setSelectedClassroom(classroom as Classroom)}
            onClose={() => setSelectedClassroom(null)}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <i className="fas fa-chalkboard text-6xl mb-4"></i>
              <p>Select a classroom to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile view for selected classroom */}
      {selectedClassroom && (
        <div className="fixed inset-0 z-50 md:hidden">
          <GroupDetails
            group={selectedClassroom}
            currentUser={currentUser}
            onGroupUpdated={(classroom) => setSelectedClassroom(classroom as Classroom)}
            onClose={() => setSelectedClassroom(null)}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};

export default Classrooms;