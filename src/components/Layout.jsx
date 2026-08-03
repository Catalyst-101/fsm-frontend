import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const canManageUsers = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
                F
              </div>
              <span className="font-bold text-lg text-white tracking-tight">Fee Management</span>
            </div>
            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/parents"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/parents')
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Parents
              </Link>
              <Link
                to="/students"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/students')
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Students
              </Link>
              <Link
                to="/academic-years"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/academic-years')
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Academic Years
              </Link>
              <Link
                to="/fee-structures"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/fee-structures')
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Fee Structures
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-slate-900 text-white shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Profile
              </Link>
              {canManageUsers && (
                <Link
                  to="/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/users')
                      ? 'bg-slate-900 text-white shadow-inner'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  Users List
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-700/60">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-900 text-indigo-200 flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="text-xs">
                <p className="font-semibold text-slate-200 leading-none">{user?.name}</p>
                <p className="text-indigo-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                  {user?.role}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      <footer className="bg-slate-950 border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        Fee Management System &copy; {new Date().getFullYear()} — All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
