import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const UserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Update user fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ACCOUNTANT');

  // Change password field
  const [newPassword, setNewPassword] = useState('');

  const isSelf = currentUser?.id === id;
  const isAdmin = currentUser?.role === 'ADMIN';

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/${id}`);
      const userData = res.data.data;
      setUser(userData);
      setName(userData.name);
      setEmail(userData.email);
      setRole(userData.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.put(`/users/${id}`, { name, email, role });
      setMsg('User details updated successfully.');
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await api.patch(`/users/${id}/change-password`, { newPassword });
      setMsg('User password changed successfully.');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change user password.');
    }
  };

  const handleToggleStatus = async () => {
    setMsg('');
    setError('');
    try {
      await api.patch(`/users/${id}/status`, { isActive: !user.isActive });
      setMsg(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully.`);
      fetchUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete user ${user.email}?`)) {
      return;
    }
    setMsg('');
    setError('');
    try {
      await api.delete(`/users/${id}`);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) return <div className="text-slate-400 text-sm">Loading user details...</div>;
  if (error && !user) return <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>;

  if (isSelf) {
    return (
      <div className="max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Self Edit Restricted</h2>
        <p className="text-sm text-slate-400">You cannot edit your own details or change your password from the user list.</p>
        <Link to="/profile" className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg">
          Go to My Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Edit User Settings</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {user?._id}</p>
        </div>
        <Link to="/users" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
          ← Back to Users
        </Link>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg">{msg}</div>}
      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

      {/* Section 1: Update details */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-semibold text-white">General Information</h3>
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Role</label>
            <select
              value={role}
              disabled={isAdmin}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="ACCOUNTANT">ACCOUNTANT</option>
            </select>
            {isAdmin && <span className="text-[11px] text-slate-400 block mt-1">Admins cannot change user roles.</span>}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer"
          >
            Save User Details
          </button>
        </form>
      </div>

      {/* Section 2: Admin Password Override */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-semibold text-white">Reset User Password (Admin Override)</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer"
          >
            Set Password
          </button>
        </form>
      </div>

      {/* Section 3: Status & Permanent Deletion */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-semibold text-white">Account Management Actions</h3>
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs text-slate-400 block">Account Status</span>
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold uppercase rounded ${
                user?.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {user?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleToggleStatus}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              {user?.isActive ? 'Deactivate User' : 'Activate User'}
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              Permanently Delete User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
