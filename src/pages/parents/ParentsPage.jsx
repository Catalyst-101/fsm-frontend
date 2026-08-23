import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';

const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [parentToDelete, setParentToDelete] = useState(null);

  const fetchParents = async (searchQuery = '', inactive = showInactive) => {
    setLoading(true);
    try {
      const res = await api.get('/parents', { params: { search: searchQuery, showInactive: inactive } });
      setParents(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch parents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchParents(search);
  };

  const requestDelete = (p) => {
    setParentToDelete(p);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!parentToDelete) return;
    setMsg('');
    setError('');
    setModalOpen(false);
    try {
      const res = await api.delete(`/parents/${parentToDelete._id}`);
      setMsg(res.data.message || 'Parent deleted successfully.');
      fetchParents(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete parent.');
    } finally {
      setParentToDelete(null);
    }
  };

  const handleToggleActive = async (p) => {
    setMsg('');
    setError('');
    try {
      const updatedStatus = !p.isActive;
      await api.put(`/parents/${p._id}`, { isActive: updatedStatus });
      setMsg(`Parent ${p.name} ${updatedStatus ? 'activated' : 'deactivated'} successfully.`);
      fetchParents(search, showInactive);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update parent status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Parent Management</h2>
          <p className="text-sm text-gray-500 font-medium">View and manage parent accounts</p>
        </div>
        <Link to="/parents/create">
          <Button variant="primary">
            <span className="material-symbols-outlined text-sm">add</span> Add New Parent
          </Button>
        </Link>
      </div>

      {msg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <span>{msg}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
        <InputField
          type="text"
          placeholder="Search by name, CNIC, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          containerClassName="flex-1 min-w-[250px]"
        />
        <label className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => {
              setShowInactive(e.target.checked);
              fetchParents(search, e.target.checked);
            }}
            className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
          />
          <span className="text-sm text-gray-700 font-medium select-none">Show Only Inactive</span>
        </label>
        <Button type="submit" variant="secondary" className="py-3 px-6 h-[46px]">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading parents...</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 whitespace-nowrap">Name</th>
                  <th className="py-4 px-6 whitespace-nowrap">CNIC</th>
                  <th className="py-4 px-6 whitespace-nowrap">Phone</th>
                  <th className="py-4 px-6 whitespace-nowrap">Occupation</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {parents.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      No parent records found.
                    </td>
                  </tr>
                ) : (
                  parents.map((p) => (
                    <tr key={p._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[var(--color-primary)]">{p.name}</div>
                        <div className="text-xs text-gray-500 font-medium">{p.email || 'No email'}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-gray-600">{p.cnic}</td>
                      <td className="py-4 px-6 text-gray-700 font-medium">{p.phone}</td>
                      <td className="py-4 px-6 text-gray-600">{p.occupation || '-'}</td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/parents/${p._id}`}>
                          <Button variant="outline" className="inline-flex px-3 py-1.5 text-xs">View</Button>
                        </Link>
                        <Link to={`/parents/edit/${p._id}`}>
                          <Button variant="secondary" className="inline-flex px-3 py-1.5 text-xs bg-gray-100">Edit</Button>
                        </Link>
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer border ${
                            p.isActive 
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {p.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => requestDelete(p)}
                          className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Confirm Deletion"
        type="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to delete parent <strong>{parentToDelete?.name}</strong>?</p>
        <p className="text-sm text-gray-500 mt-2">This action cannot be undone and may affect linked student records.</p>
      </Modal>
    </div>
  );
};

export default ParentsPage;
