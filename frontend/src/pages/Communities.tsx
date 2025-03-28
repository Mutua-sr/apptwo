import React, { useState } from 'react';
import { GroupList, GroupDetails } from '../components/groups';
import { Community } from '../types/api';
import { useAuth } from '../contexts/AuthContext';

const Communities: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Please log in</h2>
          <p className="mt-2 text-gray-600">You need to be logged in to view communities</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with community list */}
      <div className="w-full md:w-1/3 border-r bg-white">
        <GroupList
          type="community"
          userId={currentUser.id}
          onGroupSelect={(community) => setSelectedCommunity(community as Community)}
          className="h-full"
        />
      </div>

      {/* Main content area */}
      <div className="hidden md:block md:w-2/3">
        {selectedCommunity ? (
          <GroupDetails
            group={selectedCommunity}
            currentUser={currentUser}
            onGroupUpdated={(community) => setSelectedCommunity(community as Community)}
            onClose={() => setSelectedCommunity(null)}
            className="h-full"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <i className="fas fa-users text-6xl mb-4"></i>
              <p>Select a community to view details</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile view for selected community */}
      {selectedCommunity && (
        <div className="fixed inset-0 z-50 md:hidden">
          <GroupDetails
            group={selectedCommunity}
            currentUser={currentUser}
            onGroupUpdated={(community) => setSelectedCommunity(community as Community)}
            onClose={() => setSelectedCommunity(null)}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
};

export default Communities;