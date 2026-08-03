import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span>!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Account ID</span>
          <p className="text-sm font-mono font-semibold text-slate-200 mt-2 truncate">{user?.id}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Email Address</span>
          <p className="text-sm font-semibold text-slate-200 mt-2 truncate">{user?.email}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Role</span>
          <div className="mt-2">
            <span className="inline-block px-2.5 py-1 text-xs font-bold uppercase rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Account Status</span>
          <div className="mt-2">
            <span
              className={`inline-block px-2.5 py-1 text-xs font-bold uppercase rounded-md ${
                user?.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Quick Management Links</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/parents"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-600/20 transition-all"
          >
            Manage Parents
          </Link>
          <Link
            to="/students"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-emerald-600/20 transition-all"
          >
            Manage Students
          </Link>
          <Link
            to="/profile"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-all"
          >
            Manage Profile
          </Link>
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
            <Link
              to="/users"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-all"
            >
              User Accounts
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
