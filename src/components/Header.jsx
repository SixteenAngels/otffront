import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { toast } from 'react-toastify';

export const Header = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    // Clear authentication
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (!user) return null; // Don't show header if not logged in

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Concert Ticket System</h1>
          <p className="text-sm text-gray-600">
            Logged in as: <span className="font-semibold">{user.username}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium transition"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
