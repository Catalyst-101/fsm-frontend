import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const fetchParents = async (searchQuery = '') => {
    setLoading(true);
    try {
      const res = await api.get('/parents', { params: { search: searchQuery } });
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

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete parent ${name}?`)) {
      return;
    }
    setMsg('');
    setError('');
    try {
      const res = await api.delete(`/parents/${id}`);
      setMsg(res.data.message || 'Parent deleted successfully.');
      fetchParents(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete parent.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Parent Management</h2>
          <p className="text-sm text-slate-400">View and manage parent accounts</p>
        </div>
        <Link
          to="/parents/create"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-center"
        >
          + Add New Parent
        </Link>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg">{msg}</div>}
      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name, CNIC, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-all"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading parents...</div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">CNIC</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Occupation</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {parents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No parent records found.
                  </td>
                </tr>
              ) : (
                parents.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.email || 'No email'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-300">{p.cnic}</td>
                    <td className="py-3.5 px-4 text-slate-300">{p.phone}</td>
                    <td className="py-3.5 px-4 text-slate-400">{p.occupation || '-'}</td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/parents/${p._id}`}
                        className="px-2.5 py-1 text-xs font-medium bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded transition-all inline-block"
                      >
                        View & Students
                      </Link>
                      <Link
                        to={`/parents/edit/${p._id}`}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-all inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="px-2.5 py-1 text-xs font-medium bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded border border-rose-500/30 transition-all cursor-pointer"
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
      )}
    </div>
  );
};

export default ParentsPage;
