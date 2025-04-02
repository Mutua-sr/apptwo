import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-primary-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          App
        </Link>
        <div className="flex space-x-4">
          <Link to="/feed" className="hover:text-gray-300 transition-colors">
            <i className="fas fa-home mr-1"></i>
            Feed
          </Link>
          <Link to="/communities" className="hover:text-gray-300 transition-colors">
            <i className="fas fa-users mr-1"></i>
            Communities
          </Link>
          <Link to="/classrooms" className="hover:text-gray-300 transition-colors">
            <i className="fas fa-chalkboard mr-1"></i>
            Classrooms
          </Link>
          <Link 
            to="/profile" 
            className="hover:text-gray-300 transition-colors flex items-center"
          >
            <i className="fas fa-user-circle mr-1"></i>
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;