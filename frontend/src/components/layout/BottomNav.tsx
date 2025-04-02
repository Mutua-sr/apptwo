import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentValue = () => {
    const path = location.pathname;
    if (path === '/' || path === '/feed') return 0;
    if (path === '/communities') return 1;
    if (path === '/profile') return 2;
    return 0;
  };

  // Hide bottom nav in chat rooms
  if (location.pathname.includes('/chat')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-white border-t border-gray-200 shadow-lg backdrop-blur-lg bg-white/90">
        <div className="grid grid-cols-3 h-16 px-2">
          <button
            onClick={() => navigate('/feed')}
            className={`flex flex-col items-center justify-center transition-all duration-200 relative ${
              getCurrentValue() === 0 
                ? 'text-blue-600 scale-110 before:absolute before:h-1 before:w-6 before:-top-2 before:rounded-full before:bg-blue-600' 
                : 'text-gray-600 hover:text-blue-500 hover:scale-105 active:scale-95'
            }`}
          >
            <i className="fas fa-home text-xl mb-1"></i>
            <span className="text-xs font-medium">Feed</span>
          </button>

          <button
            onClick={() => navigate('/communities')}
            className={`flex flex-col items-center justify-center transition-all duration-200 relative ${
              getCurrentValue() === 1 
                ? 'text-blue-600 scale-110 before:absolute before:h-1 before:w-6 before:-top-2 before:rounded-full before:bg-blue-600' 
                : 'text-gray-600 hover:text-blue-500 hover:scale-105 active:scale-95'
            }`}
          >
            <i className="fas fa-users text-xl mb-1"></i>
            <span className="text-xs font-medium">Groups</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center justify-center transition-all duration-200 relative ${
              getCurrentValue() === 2 
                ? 'text-blue-600 scale-110 before:absolute before:h-1 before:w-6 before:-top-2 before:rounded-full before:bg-blue-600' 
                : 'text-gray-600 hover:text-blue-500 hover:scale-105 active:scale-95'
            }`}
          >
            <i className="fas fa-user text-xl mb-1"></i>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;