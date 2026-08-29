import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import InputField from '../../components/ui/InputField';
import Button from '../../components/ui/Button';

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

const getLatestValue = (arr) => Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1].value : (arr || '');

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
  const [studentId, setStudentId] = useState('');
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
  const [booksAndStationeryFee, setBooksAndStationeryFee] = useState(0);
  const [transportFee, setTransportFee] = useState(0);
  const [securityFee, setSecurityFee] = useState(0);
  const [feeNotice, setFeeNotice] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [initialYear, setInitialYear] = useState('');
  const [initialGrade, setInitialGrade] = useState('');
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

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

  // Dynamically load default FeeStructure when academicYearId or grade changes in Creation Mode or if manually changed in Edit Mode
  useEffect(() => {
    if (!academicYearId || !grade) return;
    
    if (isEdit) {
      if (!hasLoadedInitial) return;
      if (academicYearId === initialYear && grade === initialGrade) return;
    }

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
        setBooksAndStationeryFee(fs.booksAndStationeryFee || 0);
        setTransportFee(fs.transportFee || 0);
        setSecurityFee(fs.securityFee || 0);
        setFeeNotice('Pre-filled default Fee Structure values for this Class & Academic Year.');
      } catch (err) {
        setMonthlyTuition(0);
        setAdmissionFee(0);
        setRegistrationFee(0);
        setMiscellaneousFee(0);
        setAnnualCharges(0);
        setBooksAndStationeryFee(0);
        setTransportFee(0);
        setSecurityFee(0);
        setFeeNotice('No default Fee Structure found for this Class in selected Academic Year. You can enter custom fee values below.');
      }
    };

    loadFeeStructure();
  }, [academicYearId, grade, isEdit, hasLoadedInitial, initialYear, initialGrade]);

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
          setGrade(getLatestValue(s.grade) || 'Grade 1');
          setInitialGrade(getLatestValue(s.grade) || 'Grade 1');
          setSection(getLatestValue(s.section) || '');
          setStudentId(s.studentId || '');
          setIsActive(s.isActive !== undefined ? s.isActive : true);

          // Populate embedded fee assignment if exists
          if (s.fee) {
            const fa = s.fee;
            setFeeAssignmentId(fa._id || 'embedded');
            if (fa.academicYearId) {
              setAcademicYearId(fa.academicYearId);
              setInitialYear(fa.academicYearId);
            }
            setMonthlyTuition(fa.monthlyTuition || 0);
            setAdmissionFee(fa.admissionFee || 0);
            setRegistrationFee(fa.registrationFee || 0);
            setMiscellaneousFee(fa.miscellaneousFee || 0);
            setAnnualCharges(fa.annualCharges || 0);
            setBooksAndStationeryFee(fa.booksAndStationeryFee || 0);
            setTransportFee(fa.transportFee || 0);
            setSecurityFee(fa.securityFee || 0);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch student data.');
        }
      }
      setHasLoadedInitial(true);
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
      isActive,
      academicYearId,
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
      if (isEdit) {
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

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading data...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[var(--color-primary)] tracking-tight">
            {isEdit ? 'Edit Student Record' : 'Create New Student'}
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Student registration & fee assignment</p>
        </div>
        <Link to="/students">
          <Button variant="secondary" className="px-4 py-2">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">Personal Details</h3>
            
            {/* PARENT SELECTION DROPDOWN */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">
                Select Parent * (Searchable)
              </label>
              {parents.length === 0 ? (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-sm text-red-700">
                  No parents found in system. You must{' '}
                  <Link to="/parents/create" className="underline font-bold text-red-800">
                    create a Parent first
                  </Link>{' '}
                  before creating a Student.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-lg border border-gray-300 focus-within:border-[var(--color-secondary)] focus-within:border-2 bg-white transition-all">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                       <span className="material-symbols-outlined text-gray-400">search</span>
                     </div>
                     <input
                      type="text"
                      placeholder="Filter parent by name or CNIC..."
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border-none bg-transparent focus:ring-0 text-sm text-[var(--color-text)] rounded-lg placeholder-gray-400 outline-none"
                    />
                  </div>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] font-medium transition-all"
                    required
                  >
                    <option value="">-- Choose Existing Parent --</option>
                    {filteredParents.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (ID: {p.parentId}) - CNIC: {p.cnic} - {p.phone}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <InputField
              label="Student Name *"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Usama Ali"
              required
              icon="person"
            />
            
            {id && (
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Student ID (Auto-Generated)</label>
                <input
                  type="text"
                  className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-gray-500 font-mono text-sm opacity-70 cursor-not-allowed outline-none"
                  value={studentId}
                  readOnly
                  disabled
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Joining Date</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Grade / Class *</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium"
                  required
                >
                  {GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Section (Optional)"
                type="text"
                value={section}
                onChange={(e) => setSection(e.target.value)}
                placeholder="e.g. A"
              />
            </div>
          </div>

          {/* FEE ASSIGNMENT SECTION */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-sm font-bold text-[var(--color-secondary)] uppercase tracking-wider border-b border-gray-100 pb-2 mb-4">
              {isEdit ? 'Assigned Fee Structure' : 'Fee Structure Assignment'}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-2">Academic Year *</label>
              <select
                value={academicYearId}
                onChange={(e) => setAcademicYearId(e.target.value)}
                disabled={isEdit}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-all font-medium"
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

            {feeNotice && (
              <div className="text-sm text-[var(--color-primary)] bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/50 p-4 rounded-lg flex items-start gap-2">
                <span className="material-symbols-outlined text-[var(--color-accent)]">info</span>
                <span className="font-medium">{feeNotice}</span>
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
              {/* One-Time Fees */}
              <div>
                <p className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-3">One-Time Fees</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Admission Fee (Rs.)" type="number" min="0" value={admissionFee} onChange={(e) => setAdmissionFee(e.target.value)} />
                  <InputField label="Registration Fee" type="number" min="0" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} />
                  <InputField label="Security Fee" type="number" min="0" value={securityFee} onChange={(e) => setSecurityFee(e.target.value)} />
                </div>
              </div>

              {/* Annual Fees */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-3 mt-3">Annual Fees</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <InputField label="Miscellaneous Fee" type="number" min="0" value={miscellaneousFee} onChange={(e) => setMiscellaneousFee(e.target.value)} />
                  <InputField label="Annual Charges" type="number" min="0" value={annualCharges} onChange={(e) => setAnnualCharges(e.target.value)} />
                  <InputField label="Books & Stationery" type="number" min="0" value={booksAndStationeryFee} onChange={(e) => setBooksAndStationeryFee(e.target.value)} />
                </div>
              </div>

              {/* Monthly Fees */}
              <div className="pt-2 border-t border-gray-200">
                <p className="text-[10px] font-bold text-[var(--color-secondary)] uppercase tracking-widest mb-3 mt-3">Monthly Fees</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Tuition Fee *" type="number" min="0" value={monthlyTuition} onChange={(e) => setMonthlyTuition(e.target.value)} required />
                  <InputField label="Transport Fee" type="number" min="0" value={transportFee} onChange={(e) => setTransportFee(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          {isEdit && (
            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                />
                Student Active Status
              </label>
            </div>
          )}

          <div className="pt-4 mt-6">
            <Button
              type="submit"
              disabled={submitting || parents.length === 0}
              className="w-full py-4 text-base shadow-md"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Student Record & Fee Assignment' : 'Create Student & Lock Fee Assignment'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditStudentPage;
