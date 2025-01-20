import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">AI Portrait Studio</Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-purple-200">Home</Link>
          {user ? (
            <>
              <Link to="/create" className="hover:text-purple-200">Create Portrait</Link>
              <Link to="/gallery" className="hover:text-purple-200">My Gallery</Link>
              <button onClick={signOut} className="hover:text-purple-200">Sign Out</button>
            </>
          ) : (
            <Link to="/login" className="hover:text-purple-200">Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;