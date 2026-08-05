import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data.data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-600 dark:text-gray-300">Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-white tracking-tight">Fee Management Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back, <span className="text-indigo-400 font-semibold">{user?.name}</span>!</p>
      </div>

      {!stats ? (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-center text-slate-300">
          No active academic year found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-blue-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Expected Tuition (AY)</h2>
            <p className="text-2xl font-bold text-white mt-2">${stats.expectedTuition}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-green-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Collected This Month</h2>
            <p className="text-2xl font-bold text-white mt-2">${stats.collectedThisMonth}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-red-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Outstanding Balance</h2>
            <p className="text-2xl font-bold text-white mt-2">${stats.totalOutstanding}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-yellow-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Advance Balance</h2>
            <p className="text-2xl font-bold text-white mt-2">${stats.totalAdvance}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-indigo-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Today's Collection</h2>
            <p className="text-2xl font-bold text-white mt-2">${stats.todayCollection}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-purple-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Current AY Collection</h2>
            <p className="text-2xl font-bold text-white mt-2">${stats.currentAcademicYearCollection}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-pink-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Students Paid This Month</h2>
            <p className="text-2xl font-bold text-white mt-2">{stats.studentsPaidThisMonth}</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl border-l-4 border-l-orange-500">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Students Pending</h2>
            <p className="text-2xl font-bold text-white mt-2">{stats.studentsPending}</p>
          </div>
        </div>
      )}

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
            to="/fee-payment"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-600/20 transition-all"
          >
            Process Fee
          </Link>
          <Link
            to="/fee-ledger"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-all"
          >
            Fee Ledger
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
