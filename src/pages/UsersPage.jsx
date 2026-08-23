import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    setActionMsg('');
    try {
      await api.patch(`/users/${id}/status`, { isActive: !currentStatus });
      setActionMsg(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully.`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const requestDelete = (u) => {
    setUserToDelete(u);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setActionMsg('');
    setError('');
    setModalOpen(false);
    try {
      await api.delete(`/users/${userToDelete._id}`);
      setActionMsg('User deleted permanently.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setUserToDelete(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading users list...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">User Management</h2>
          <p className="text-sm text-gray-500 font-medium">
            {currentUser?.role === 'ADMIN' ? 'Manage Accountant accounts' : 'System user accounts and access controls'}
          </p>
        </div>
        <Link to="/users/create">
          <Button variant="primary">
            <span className="material-symbols-outlined text-sm">add</span> Create User (OTP Flow)
          </Button>
        </Link>
      </div>

      {actionMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700 flex items-start gap-2 rounded-r-lg shadow-sm">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <span>{actionMsg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg shadow-sm">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6 whitespace-nowrap">User</th>
                <th className="py-4 px-6 whitespace-nowrap">Role</th>
                <th className="py-4 px-6 whitespace-nowrap">Status</th>
                <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {users.map((u) => {
                const isSelf = u._id === currentUser?.id;
                return (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[var(--color-primary)]">
                        {u.name} {isSelf && <span className="text-xs text-[var(--color-secondary)] font-semibold ml-2">(You)</span>}
                      </div>
                      <div className="text-xs text-gray-500 font-medium mt-0.5">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {!isSelf ? (
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/users/${u._id}`}>
                            <Button variant="secondary" className="px-3 py-1.5 text-xs">
                              View / Edit
                            </Button>
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(u._id, u.isActive)}
                            className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer border ${
                              u.isActive 
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => requestDelete(u)}
                            className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium italic">Manage via Profile page</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Delete User"
        type="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete Permanently</Button>
          </>
        }
      >
        <p>Are you sure you want to permanently delete user <strong>{userToDelete?.email}</strong>?</p>
        <p className="text-sm text-gray-500 mt-2">This action cannot be undone and the user will immediately lose access to the system.</p>
      </Modal>
    </div>
  );
};

export default UsersPage;
