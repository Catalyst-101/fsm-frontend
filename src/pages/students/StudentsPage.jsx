import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchStudents = async (searchQuery = '', inactive = showInactive) => {
    setLoading(true);
    try {
      const res = await api.get('/students', { params: { search: searchQuery, showInactive: inactive } });
      setStudents(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(search);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete student ${name}?`)) {
      return;
    }
    setMsg('');
    setError('');
    try {
      const res = await api.delete(`/students/${id}`);
      setMsg(res.data.message || 'Student deleted successfully.');
      fetchStudents(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    }
  };

  const handleToggleActive = async (s) => {
    setMsg('');
    setError('');
    try {
      const updatedStatus = !s.isActive;
      await api.put(`/students/${s._id}`, { isActive: updatedStatus });
      setMsg(`Student ${s.name} ${updatedStatus ? 'activated' : 'deactivated'} successfully.`);
      fetchStudents(search, showInactive);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Student Management</h2>
          <p className="text-sm text-slate-400">View and manage student records</p>
        </div>
        <Link
          to="/students/create"
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all text-center"
        >
          + Add New Student
        </Link>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg">{msg}</div>}
      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search by student name or roll #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
        />
        <label className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => {
              setShowInactive(e.target.checked);
              fetchStudents(search, e.target.checked);
            }}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-slate-800"
          />
          <span className="text-sm text-slate-300">Show Only Inactive</span>
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-lg transition-all"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading students...</div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Grade/Class</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-xs text-slate-400">{s.rollNumber && `Roll: Rs. {s.rollNumber}`}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {s.parentId ? (
                        <Link to={`/parents/${s.parentId._id}`} className="text-indigo-300 hover:underline">
                          {s.parentId.name} <span className="text-xs text-slate-400 font-mono">({s.parentId.cnic})</span>
                        </Link>
                      ) : (
                        <span className="text-rose-400 text-xs">No Parent</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {s.grade} {s.section && `(Rs. {s.section})`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{s.gender}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${s.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/students/${s._id}`}
                        className="px-2.5 py-1 text-xs font-medium bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded transition-all inline-block"
                      >
                        View
                      </Link>
                      <Link
                        to={`/students/edit/${s._id}`}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-all inline-block"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`px-2.5 py-1 text-xs font-medium rounded border transition-all cursor-pointer ${
                          s.isActive 
                            ? 'bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white border-amber-500/30'
                            : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border-emerald-500/30'
                        }`}
                      >
                        {s.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.name)}
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

export default StudentsPage;
