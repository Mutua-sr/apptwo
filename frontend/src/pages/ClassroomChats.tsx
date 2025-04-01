import React from 'react';
import ClassroomChatList from '../components/chat/ClassroomChatList';

const ClassroomChats: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <ClassroomChatList />
    </div>
  );
};

export default ClassroomChats;