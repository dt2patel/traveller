
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/auth';
import SyncBadge from '../SyncBadge';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully.');
    } catch (error) {
      toast.error('Failed to sign out.');
      console.error(error);
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-brand-primary">
          India Log
        </Link>
        <div className="flex items-center space-x-4">
          <SyncBadge />
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
              >
                {user.email?.charAt(0).toUpperCase()}
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    Signed in as <br />
                    <span className="font-medium truncate">{user.email}</span>
                  </div>
                  <NavLink to="/" className={({isActive}) => `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                  <NavLink to="/history" className={({isActive}) => `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`} onClick={() => setIsMenuOpen(false)}>History</NavLink>
                  <NavLink to="/summary" className={({isActive}) => `block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${isActive ? 'bg-gray-100' : ''}`} onClick={() => setIsMenuOpen(false)}>Summary</NavLink>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
