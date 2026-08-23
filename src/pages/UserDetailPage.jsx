import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

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

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const confirmDeleteUser = async () => {
    setMsg('');
    setError('');
    setDeleteModalOpen(false);
    try {
      await api.delete(`/users/${id}`);
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading user details...</div>;
  if (error && !user) return <div className="m-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm flex items-start gap-2"><span className="material-symbols-outlined text-[20px]">error</span><span>{error}</span></div>;

  if (isSelf) {
    return (
      <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center space-y-4">
        <span className="material-symbols-outlined text-gray-300 text-5xl mb-2">lock</span>
        <h2 className="text-xl font-bold text-[var(--color-primary)]">Self Edit Restricted</h2>
        <p className="text-sm font-medium text-gray-500">You cannot edit your own details or change your password from the user list.</p>
        <div className="pt-4">
          <Link to="/profile">
            <Button variant="primary" className="w-full">
              Go to My Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">Edit User Settings</h2>
            <p className="text-xs text-gray-500 font-mono font-medium mt-1">ID: {user?._id}</p>
          </div>
        </div>
        <Link to="/users">
          <Button variant="outline">
             <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Users
          </Button>
        </Link>
      </div>

      {msg && <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-lg text-sm flex items-start gap-2 shadow-sm font-medium"><span className="material-symbols-outlined text-[20px]">check_circle</span><span>{msg}</span></div>}
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg text-sm flex items-start gap-2 shadow-sm font-medium"><span className="material-symbols-outlined text-[20px]">error</span><span>{error}</span></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Update details */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4 h-fit">
          <h3 className="text-lg font-bold text-[var(--color-primary)] border-b border-gray-100 pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-secondary)]">manage_accounts</span> General Information
          </h3>
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <InputField
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Role</label>
              <select
                value={role}
                disabled={isAdmin}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all font-medium"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="ACCOUNTANT">ACCOUNTANT</option>
              </select>
              {isAdmin && <span className="text-xs text-[var(--color-accent)] font-medium block mt-2 flex items-start gap-1"><span className="material-symbols-outlined text-[14px]">info</span> Admins cannot change user roles.</span>}
            </div>
            <div className="pt-2 border-t border-gray-100">
              <Button type="submit" variant="primary" className="w-full shadow-sm">
                Save User Details
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          {/* Section 2: Admin Password Override */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-primary)] border-b border-gray-100 pb-2 flex items-center gap-2">
               <span className="material-symbols-outlined text-[var(--color-secondary)]">password</span> Reset Password
            </h3>
            <p className="text-xs font-medium text-gray-500">(Admin Override)</p>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <InputField
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
              <Button type="submit" variant="secondary" className="w-full shadow-sm">
                Force Reset Password
              </Button>
            </form>
          </div>

          {/* Section 3: Status & Permanent Deletion */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
            <h3 className="text-lg font-bold text-[var(--color-primary)] border-b border-gray-100 pb-2 flex items-center gap-2">
               <span className="material-symbols-outlined text-[var(--color-secondary)]">admin_panel_settings</span> Account Actions
            </h3>
            <div className="pt-2 space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Current Status</span>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-xs font-bold uppercase rounded-full border ${
                      user?.isActive
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    {user?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleToggleStatus}
                >
                  {user?.isActive ? 'Deactivate' : 'Activate'} User
                </Button>
              </div>

              <div className="border-t border-gray-200 pt-4">
                 <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wider">Danger Zone</p>
                 <button
                   onClick={() => setDeleteModalOpen(true)}
                   className="w-full py-3 px-4 bg-white hover:bg-red-50 text-red-600 font-bold border-2 border-red-200 hover:border-red-500 rounded-lg transition-all cursor-pointer shadow-sm text-sm"
                 >
                   Permanently Delete User
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={deleteModalOpen} 
        onClose={() => setDeleteModalOpen(false)} 
        title="Permanently Delete User"
        type="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteUser}>Yes, Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete user <strong>{user?.email}</strong>?</p>
        <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-4 flex items-start gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span>Warning: This action is irreversible. The user will immediately lose access.</span>
        </p>
      </Modal>
    </div>
  );
};

export default UserDetailPage;
