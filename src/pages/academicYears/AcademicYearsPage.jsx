import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';

const AcademicYearsPage = () => {
  const { user } = useAuth();
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

  const [modalOpen, setModalOpen] = useState(false);
  const [yearToDelete, setYearToDelete] = useState(null);

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

  const requestDelete = (y) => {
    setYearToDelete(y);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!yearToDelete) return;
    setMsg('');
    setError('');
    setModalOpen(false);
    try {
      await api.delete(`/academic-years/${yearToDelete._id}`);
      setMsg('Academic Year deleted.');
      fetchYears();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete academic year.');
    } finally {
      setYearToDelete(null);
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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Academic Year Management</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Configure active school academic sessions</p>
        </div>
        <span className="material-symbols-outlined text-[var(--color-secondary)] text-4xl opacity-20">calendar_month</span>
      </div>

      {msg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700 flex items-start gap-2 rounded-r-lg shadow-sm">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <span>{msg}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg shadow-sm">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${user?.role !== 'ACCOUNTANT' ? 'lg:grid-cols-3' : ''} gap-6`}>
        {/* Form Card */}
        {user?.role !== 'ACCOUNTANT' && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] h-fit">
            <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 border-b border-gray-100 pb-2">
              {editId ? 'Edit Academic Year' : 'Create Academic Year'}
            </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <InputField
              label="Year Name *"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2026-2027"
              required
            />

            <InputField
              label="Start Date *"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />

            <InputField
              label="End Date *"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />

            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isCurrent}
                  onChange={(e) => setIsCurrent(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                Mark as Current Active Year
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Saving...' : editId ? 'Update' : 'Create'}
              </Button>
              
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
        )}

        {/* Table Card */}
        <div className={`${user?.role !== 'ACCOUNTANT' ? 'lg:col-span-2' : ''} bg-white border border-gray-200 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 whitespace-nowrap">Year Name</th>
                  <th className="py-4 px-6 whitespace-nowrap">Start Date</th>
                  <th className="py-4 px-6 whitespace-nowrap">End Date</th>
                  <th className="py-4 px-6 whitespace-nowrap">Status</th>
                  {user?.role !== 'ACCOUNTANT' && (
                    <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      <span className="material-symbols-outlined animate-spin inline-block align-middle mr-2">refresh</span> Loading...
                    </td>
                  </tr>
                ) : years.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium bg-gray-50">No Academic Years created yet.</td>
                  </tr>
                ) : (
                  years.map((y) => (
                    <tr key={y._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-[var(--color-primary)]">{y.name}</td>
                      <td className="py-4 px-6 text-gray-700 font-medium">{new Date(y.startDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6 text-gray-700 font-medium">{new Date(y.endDate).toLocaleDateString()}</td>
                      <td className="py-4 px-6">
                        {y.is_current ? (
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Current Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-500 border border-gray-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      {user?.role !== 'ACCOUNTANT' && (
                        <td className="py-4 px-6">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="secondary"
                              onClick={() => handleEdit(y)}
                              className="px-3 py-1.5 text-xs h-[30px]"
                            >
                              Edit
                            </Button>
                            <button
                              onClick={() => requestDelete(y)}
                              className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-all cursor-pointer h-[30px] flex items-center justify-center"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Delete Academic Year"
        type="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete Permanently</Button>
          </>
        }
      >
        <p>Are you sure you want to delete the academic year <strong>{yearToDelete?.name}</strong>?</p>
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
          <p className="flex items-start gap-2">
            <span className="material-symbols-outlined text-[18px]">warning</span>
            <span>WARNING: This will PERMANENTLY delete all related fee structures and payment receipts! You cannot do this if there are students currently enrolled in this year.</span>
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default AcademicYearsPage;
