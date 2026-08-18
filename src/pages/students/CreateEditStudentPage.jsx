import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
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

const CreateEditStudentPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const preselectedParentId = searchParams.get('parentId') || '';

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState(preselectedParentId);
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [grade, setGrade] = useState('Grade 1');
  const [section, setSection] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().split('T')[0]);
  const [isActive, setIsActive] = useState(true);

  // Searchable Parent dropdown states
  const [parents, setParents] = useState([]);
  const [parentSearch, setParentSearch] = useState('');

  // Fee Assignment states
  const [years, setYears] = useState([]);
  const [academicYearId, setAcademicYearId] = useState('');
  const [feeAssignmentId, setFeeAssignmentId] = useState(null);
  const [monthlyTuition, setMonthlyTuition] = useState(0);
  const [admissionFee, setAdmissionFee] = useState(0);
  const [registrationFee, setRegistrationFee] = useState(0);
  const [miscellaneousFee, setMiscellaneousFee] = useState(0);
  const [annualCharges, setAnnualCharges] = useState(0);
  const [feeNotice, setFeeNotice] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Parents and Academic Years
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [parentsRes, yearsRes] = await Promise.all([
          api.get('/parents'),
          api.get('/academic-years'),
        ]);
        setParents(parentsRes.data.data);
        setYears(yearsRes.data.data);
        const currentYear = yearsRes.data.data.find((y) => y.is_current);
        if (currentYear && !academicYearId) {
          setAcademicYearId(currentYear._id);
        }
      } catch (err) {
        setError('Failed to load initial data options.');
      }
    };
    fetchInit();
  }, []);

  // Dynamically load default FeeStructure when academicYearId or grade changes in Creation Mode
  useEffect(() => {
    if (!academicYearId || !grade || isEdit) return;

    const loadFeeStructure = async () => {
      setFeeNotice('');
      try {
        const res = await api.get(`/fee-structures/year/${academicYearId}/grade/${grade}`);
        const fs = res.data.data;
        setMonthlyTuition(fs.monthlyTuition || 0);
        setAdmissionFee(fs.admissionFee || 0);
        setRegistrationFee(fs.registrationFee || 0);
        setMiscellaneousFee(fs.miscellaneousFee || 0);
        setAnnualCharges(fs.annualCharges || 0);
        setFeeNotice('Pre-filled default Fee Structure values for this Class & Academic Year.');
      } catch (err) {
        setMonthlyTuition(0);
        setAdmissionFee(0);
        setRegistrationFee(0);
        setMiscellaneousFee(0);
        setAnnualCharges(0);
        setFeeNotice('No default Fee Structure found for this Class in selected Academic Year. You can enter custom fee values below.');
      }
    };

    loadFeeStructure();
  }, [academicYearId, grade, isEdit]);

  // Auto-fetch next roll number when grade or section changes in Creation Mode
  useEffect(() => {
    if (isEdit || !grade) return;
    
    const fetchNextRollNumber = async () => {
      try {
        const res = await api.get('/students/next-roll-number', { params: { grade, section } });
        if (res.data && res.data.data) {
          setRollNumber(String(res.data.data));
        }
      } catch (err) {
        console.error('Failed to fetch next roll number', err);
      }
    };

    fetchNextRollNumber();
  }, [grade, section, isEdit]);

  // Fetch Student data + existing Fee Assignment if edit mode
  useEffect(() => {
    const initData = async () => {
      if (isEdit) {
        try {
          const sRes = await api.get(`/students/${id}`);
          const s = sRes.data.data;
          setName(s.name || '');
          setParentId(s.parentId?._id || s.parentId || '');
          setGender(s.gender || 'Male');
          setDob(s.dob ? new Date(s.dob).toISOString().split('T')[0] : '');
          setJoiningDate(s.joiningDate ? new Date(s.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
          setGrade(s.grade || 'Grade 1');
          setSection(s.section || '');
          setRollNumber(s.rollNumber || '');
          setIsActive(s.isActive !== undefined ? s.isActive : true);

          // Populate embedded fee assignment if exists
          if (s.fee) {
            const fa = s.fee;
            setFeeAssignmentId(fa._id || 'embedded');
            if (fa.academicYearId) {
              setAcademicYearId(fa.academicYearId);
            }
            setMonthlyTuition(fa.monthlyTuition || 0);
            setAdmissionFee(fa.admissionFee || 0);
            setRegistrationFee(fa.registrationFee || 0);
            setMiscellaneousFee(fa.miscellaneousFee || 0);
            setAnnualCharges(fa.annualCharges || 0);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch student data.');
        }
      }
      setLoading(false);
    };
    initData();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!parentId) {
      setError('Please select a parent for the student.');
      return;
    }

    setSubmitting(true);

    const studentPayload = {
      name,
      parentId,
      gender,
      dob: dob || null,
      joiningDate: joiningDate || null,
      grade,
      section,
      rollNumber,
      isActive,
      // Fee assignment fields for creation mode
      academicYearId,
      monthlyTuition: Number(monthlyTuition),
      admissionFee: Number(admissionFee),
      registrationFee: Number(registrationFee),
      miscellaneousFee: Number(miscellaneousFee),
      annualCharges: Number(annualCharges),
    };

    try {
      if (isEdit) {
        // 1. Update Student record along with embedded fee
        await api.put(`/students/${id}`, studentPayload);
      } else {
        await api.post('/students', studentPayload);
      }
      navigate('/students');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student record.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParents = parents.filter(
    (p) =>
      p.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
      p.cnic.includes(parentSearch) ||
      p.phone.includes(parentSearch)
  );

  if (loading) return <div className="text-slate-400 text-sm">Loading data...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isEdit ? 'Edit Student Record' : 'Create New Student'}
          </h2>
          <p className="text-xs text-slate-400">Student registration & fee assignment</p>
        </div>
        <Link to="/students" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
          ← Back to Students List
        </Link>
      </div>

      {error && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>}

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PARENT SELECTION DROPDOWN */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Parent * (Searchable)
            </label>
            {parents.length === 0 ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-400">
                No parents found in system. You must{' '}
                <Link to="/parents/create" className="underline font-bold">
                  create a Parent first
                </Link>{' '}
                before creating a Student.
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Filter parent by name or CNIC..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none"
                />
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Existing Parent --</option>
                  {filteredParents.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (CNIC: {p.cnic}) - {p.phone}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Student Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Usama Ali"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Joining Date</label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Grade / Class *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                required
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Section (Optional)</label>
              <input
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 15"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Unique per Class & Section</p>
            </div>
          </div>

          {/* FEE ASSIGNMENT SECTION (Editable in both Creation and Edit mode) */}
          <div className="border-t border-slate-700 pt-4 space-y-3">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
              {isEdit ? 'Assigned Fee Structure' : 'Fee Structure Assignment'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Academic Year *</label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                disabled={isEdit}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-60 cursor-not-allowed"
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

            {feeNotice && <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg">{feeNotice}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Monthly Tuition (Rs.) *</label>
                <input
                  type="number"
                  min="0"
                  value={monthlyTuition}
                  onChange={(e) => setMonthlyTuition(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Admission Fee (Rs.)</label>
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
          </div>

          {isEdit && (
            <div>
              <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                Student Active Status
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || parents.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Update Student Record & Fee Assignment' : 'Create Student & Lock Fee Assignment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditStudentPage;
