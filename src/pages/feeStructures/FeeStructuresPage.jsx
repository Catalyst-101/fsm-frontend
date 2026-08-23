import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

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
  const [booksAndStationeryFee, setBooksAndStationeryFee] = useState(0);
  const [transportFee, setTransportFee] = useState(0);
  const [securityFee, setSecurityFee] = useState(0);

  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);

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
      booksAndStationeryFee: Number(booksAndStationeryFee),
      transportFee: Number(transportFee),
      securityFee: Number(securityFee),
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
    setBooksAndStationeryFee(s.booksAndStationeryFee || 0);
    setTransportFee(s.transportFee || 0);
    setSecurityFee(s.securityFee || 0);
  };

  const requestDelete = (s) => {
    setStructureToDelete(s);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!structureToDelete) return;
    setMsg('');
    setError('');
    setModalOpen(false);
    try {
      await api.delete(`/fee-structures/${structureToDelete._id}`);
      setMsg('Fee Structure deleted.');
      fetchStructures();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete fee structure.');
    } finally {
      setStructureToDelete(null);
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
    setBooksAndStationeryFee(0);
    setTransportFee(0);
    setSecurityFee(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Fee Structure Management</h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Configure default class fees per Academic Year</p>
        </div>
        <span className="material-symbols-outlined text-[var(--color-secondary)] text-4xl opacity-20">account_balance_wallet</span>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] h-fit">
          <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 border-b border-gray-100 pb-2">
            {editId ? 'Edit Fee Structure' : 'Create Fee Structure'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Academic Year *</label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] font-medium transition-all"
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
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Grade / Class *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] font-medium transition-all"
                required
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-4">
              {/* One-Time Fees */}
              <div>
                <p className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-3">One-Time Fees</p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Admission Fee" type="number" min="0" value={admissionFee} onChange={(e) => setAdmissionFee(e.target.value)} />
                  <InputField label="Registration Fee" type="number" min="0" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} />
                  <InputField label="Security Fee" type="number" min="0" value={securityFee} onChange={(e) => setSecurityFee(e.target.value)} />
                </div>
              </div>

              {/* Annual Fees */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-3">Annual Fees</p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Miscellaneous Fee" type="number" min="0" value={miscellaneousFee} onChange={(e) => setMiscellaneousFee(e.target.value)} />
                  <InputField label="Annual Charges" type="number" min="0" value={annualCharges} onChange={(e) => setAnnualCharges(e.target.value)} />
                  <InputField label="Books & Stationery" type="number" min="0" value={booksAndStationeryFee} onChange={(e) => setBooksAndStationeryFee(e.target.value)} />
                </div>
              </div>
              
              {/* Monthly Fees */}
              <div className="pt-2">
                <p className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-3">Monthly Fees</p>
                <div className="grid grid-cols-2 gap-3">
                  <InputField label="Tuition Fee" type="number" min="0" value={monthlyTuition} onChange={(e) => setMonthlyTuition(e.target.value)} />
                  <InputField label="Transport Fee" type="number" min="0" value={transportFee} onChange={(e) => setTransportFee(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                disabled={submitting || years.length === 0}
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

        {/* Table Card */}
        <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                  <th className="py-4 px-3 whitespace-nowrap">Year / Grade</th>
                  <th className="py-4 px-2 whitespace-nowrap">Tuition</th>
                  <th className="py-4 px-2 whitespace-nowrap">Trans.</th>
                  <th className="py-4 px-2 whitespace-nowrap">Admission</th>
                  <th className="py-4 px-2 whitespace-nowrap">Reg.</th>
                  <th className="py-4 px-2 whitespace-nowrap">Sec.</th>
                  <th className="py-4 px-2 whitespace-nowrap">Misc.</th>
                  <th className="py-4 px-2 whitespace-nowrap">Ann.</th>
                  <th className="py-4 px-2 whitespace-nowrap">Books</th>
                  <th className="py-4 px-3 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      <span className="material-symbols-outlined animate-spin inline-block align-middle mr-2">refresh</span> Loading...
                    </td>
                  </tr>
                ) : structures.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 bg-gray-50 font-medium">No Fee Structures created yet.</td>
                  </tr>
                ) : (
                  structures.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-3">
                        <div className="font-bold text-[var(--color-primary)]">{s.grade}</div>
                        <div className="text-[11px] font-semibold text-[var(--color-secondary)] uppercase tracking-wider mt-0.5">{s.academicYearId?.name}</div>
                      </td>
                      <td className="py-4 px-2 font-semibold text-gray-800">Rs. {s.monthlyTuition}</td>
                      <td className="py-4 px-2 font-medium text-gray-600">Rs. {s.transportFee || 0}</td>
                      <td className="py-4 px-2 font-medium text-gray-600">Rs. {s.admissionFee}</td>
                      <td className="py-4 px-2 font-medium text-gray-600">Rs. {s.registrationFee}</td>
                      <td className="py-4 px-2 font-medium text-gray-600">Rs. {s.securityFee || 0}</td>
                      <td className="py-4 px-2 font-medium text-gray-600">Rs. {s.miscellaneousFee}</td>
                      <td className="py-4 px-2 font-medium text-gray-600">Rs. {s.annualCharges}</td>
                      <td className="py-4 px-2 font-medium text-gray-600">Rs. {s.booksAndStationeryFee || 0}</td>
                      <td className="py-4 px-3">
                        <div className="flex justify-end items-center gap-2">
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(s)}
                            className="px-3 py-1.5 text-xs h-[30px]"
                          >
                            Edit
                          </Button>
                          <button
                            onClick={() => requestDelete(s)}
                            className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-all cursor-pointer h-[30px] flex items-center justify-center"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
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
        title="Confirm Deletion"
        type="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p>Are you sure you want to delete Fee Structure for <strong>{structureToDelete?.grade}</strong> ({structureToDelete?.academicYearId?.name})?</p>
        <p className="text-sm text-gray-500 mt-2">Students currently using this fee structure will not be affected until their fee is reassigned.</p>
      </Modal>
    </div>
  );
};

export default FeeStructuresPage;
