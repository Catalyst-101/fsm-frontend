import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const AcademicYearsPage = () => {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await api.get('/academic-years');
      setYears(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch academic years.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setSubmitting(true);

    const payload = {
      name,
      startDate,
      endDate,
      is_current: isCurrent,
    };

    try {
      if (editId) {
        await api.put(`/academic-years/${editId}`, payload);
        setMsg('Academic Year updated successfully.');
      } else {
        await api.post('/academic-years', payload);
        setMsg('Academic Year created successfully.');
      }
      resetForm();
      fetchYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };



  const handleEdit = (y) => {
    setEditId(y._id);
    setName(y.name);
    setStartDate(y.startDate ? new Date(y.startDate).toISOString().split('T')[0] : '');
    setEndDate(y.endDate ? new Date(y.endDate).toISOString().split('T')[0] : '');
    setIsCurrent(y.is_current);
  };

  const handleDelete = async (id, yearName) => {
    if (!window.confirm(`WARNING: Deleting Academic Year ${yearName} will PERMANENTLY delete all related fee structures and payment receipts! You cannot do this if there are students currently enrolled in this year.\n\nAre you sure you want to proceed?`)) {
      return;
    }
    setMsg('');
    setError('');
    try {
      await api.delete(`/academic-years/${id}`);
      setMsg('Academic Year deleted.');
      fetchYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete academic year.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setStartDate('');
    setEndDate('');
    setIsCurrent(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white tracking-tight">Academic Year Management</h2>
        <p className="text-sm text-slate-400">Configure active school academic sessions</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg">{msg}</div>}
      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white">
            {editId ? 'Edit Academic Year' : 'Create Academic Year'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Year Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 2026-2027"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                Mark as Current Active Year
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
              
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Card */}
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Year Name</th>
                <th className="py-3.5 px-4">Start Date</th>
                <th className="py-3.5 px-4">End Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : years.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">No Academic Years created yet.</td>
                </tr>
              ) : (
                years.map((y) => (
                  <tr key={y._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{y.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{new Date(y.startDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4 text-slate-300">{new Date(y.endDate).toLocaleDateString()}</td>
                    <td className="py-3.5 px-4">
                      {y.is_current ? (
                        <span className="px-2.5 py-0.5 text-xs font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Current Active
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Inactive</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(y)}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(y._id, y.name)}
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
      </div>
    </div>
  );
};

export default AcademicYearsPage;
