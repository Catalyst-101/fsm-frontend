import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const GRADES = [
  'Reception 1',
  'Reception 2',
  'Kindergarten',
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
];

const FeeStructuresPage = () => {
  const [structures, setStructures] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Form state
  const [academicYearId, setAcademicYearId] = useState('');
  const [grade, setGrade] = useState('Grade 1');
  const [monthlyTuition, setMonthlyTuition] = useState(0);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [miscellaneousFee, setMiscellaneousFee] = useState(0);
  const [annualCharges, setAnnualCharges] = useState(0);

  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchYears = async () => {
    try {
      const res = await api.get('/academic-years');
      setYears(res.data.data);
      const current = res.data.data.find((y) => y.is_current);
      if (current && !academicYearId) {
        setAcademicYearId(current._id);
      }
    } catch (err) {
      setError('Failed to fetch academic years.');
    }
  };

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await api.get('/fee-structures');
      setStructures(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fee structures.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYears();
    fetchStructures();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    setSubmitting(true);

    const payload = {
      academicYearId,
      grade,
      monthlyTuition: Number(monthlyTuition),
      admissionFee: Number(admissionFee),
      registrationFee: Number(registrationFee),
      miscellaneousFee: Number(miscellaneousFee),
      annualCharges: Number(annualCharges),
    };

    try {
      if (editId) {
        await api.put(`/fee-structures/${editId}`, payload);
        setMsg('Fee Structure updated successfully.');
      } else {
        await api.post('/fee-structures', payload);
        setMsg('Fee Structure created successfully.');
      }
      resetForm();
      fetchStructures();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (s) => {
    setEditId(s._id);
    setAcademicYearId(s.academicYearId?._id || s.academicYearId);
    setGrade(s.grade);
    setMonthlyTuition(s.monthlyTuition || 0);
    setAdmissionFee(s.admissionFee || 0);
    setRegistrationFee(s.registrationFee || 0);
    setMiscellaneousFee(s.miscellaneousFee || 0);
    setAnnualCharges(s.annualCharges || 0);
  };

  const handleDelete = async (id, yearName, gradeName) => {
    if (!window.confirm(`Are you sure you want to delete Fee Structure for ${gradeName} (Rs. {yearName})?`)) {
      return;
    }
    setMsg('');
    setError('');
    try {
      await api.delete(`/fee-structures/${id}`);
      setMsg('Fee Structure deleted.');
      fetchStructures();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete fee structure.');
    }
  };

  const resetForm = () => {
    setEditId(null);
    setGrade('Grade 1');
    setMonthlyTuition(0);
    setAdmissionFee(0);
    setRegistrationFee(0);
    setMiscellaneousFee(0);
    setAnnualCharges(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white tracking-tight">Fee Structure Management</h2>
        <p className="text-sm text-slate-400">Configure default class fees per Academic Year</p>
      </div>

      {msg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-3 rounded-lg">{msg}</div>}
      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-bold text-white">
            {editId ? 'Edit Fee Structure' : 'Create Fee Structure'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Academic Year *</label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              >
                <option value="">-- Choose Academic Year --</option>
                {years.map((y) => (
                  <option key={y._id} value={y._id}>
                    {y.name} {y.is_current ? '(Current Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Grade / Class *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Monthly Tuition</label>
                <input
                  type="number"
                  min="0"
                  value={monthlyTuition}
                  onChange={(e) => setMonthlyTuition(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Admission Fee</label>
                <input
                  type="number"
                  min="0"
                  value={admissionFee}
                  onChange={(e) => setAdmissionFee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Registration Fee</label>
                <input
                  type="number"
                  min="0"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Miscellaneous Fee</label>
                <input
                  type="number"
                  min="0"
                  value={miscellaneousFee}
                  onChange={(e) => setMiscellaneousFee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Annual Charges</label>
                <input
                  type="number"
                  min="0"
                  value={annualCharges}
                  onChange={(e) => setAnnualCharges(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting || years.length === 0}
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
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-3">Year / Grade</th>
                <th className="py-3.5 px-3">Monthly Tuition</th>
                <th className="py-3.5 px-3">Admission</th>
                <th className="py-3.5 px-3">Registration</th>
                <th className="py-3.5 px-3">Misc</th>
                <th className="py-3.5 px-3">Annual</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Loading...</td>
                </tr>
              ) : structures.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">No Fee Structures created yet.</td>
                </tr>
              ) : (
                structures.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-white">{s.grade}</div>
                      <div className="text-[10px] text-indigo-400">{s.academicYearId?.name}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-200 font-mono">Rs. {s.monthlyTuition}</td>
                    <td className="py-3.5 px-3 text-slate-200 font-mono">Rs. {s.admissionFee}</td>
                    <td className="py-3.5 px-3 text-slate-200 font-mono">Rs. {s.registrationFee}</td>
                    <td className="py-3.5 px-3 text-slate-200 font-mono">Rs. {s.miscellaneousFee}</td>
                    <td className="py-3.5 px-3 text-slate-200 font-mono">Rs. {s.annualCharges}</td>
                    <td className="py-3.5 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(s)}
                        className="px-2 py-1 font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-all cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id, s.academicYearId?.name, s.grade)}
                        className="px-2 py-1 font-medium bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded border border-rose-500/30 transition-all cursor-pointer"
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

export default FeeStructuresPage;
