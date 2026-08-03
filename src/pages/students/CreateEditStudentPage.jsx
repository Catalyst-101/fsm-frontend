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
  const [isActive, setIsActive] = useState(true);

  // Searchable Parent dropdown states
  const [parents, setParents] = useState([]);
  const [parentSearch, setParentSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Parents list for selection
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await api.get('/parents');
        setParents(res.data.data);
      } catch (err) {
        setError('Failed to load parent options.');
      }
    };
    fetchParents();
  }, []);

  // Fetch Student data if edit mode
  useEffect(() => {
    const initData = async () => {
      if (isEdit) {
        try {
          const res = await api.get(`/students/${id}`);
          const s = res.data.data;
          setName(s.name || '');
          setParentId(s.parentId?._id || s.parentId || '');
          setGender(s.gender || 'Male');
          setDob(s.dob ? new Date(s.dob).toISOString().split('T')[0] : '');
          setGrade(s.grade || 'Grade 1');
          setSection(s.section || '');
          setRollNumber(s.rollNumber || '');
          setIsActive(s.isActive !== undefined ? s.isActive : true);
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

    const payload = {
      name,
      parentId,
      gender,
      dob: dob || null,
      grade,
      section,
      rollNumber,
      isActive,
    };

    try {
      if (isEdit) {
        await api.put(`/students/${id}`, payload);
      } else {
        await api.post('/students', payload);
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
          <p className="text-xs text-slate-400">Student registration & parent assignment</p>
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

          <div className="grid grid-cols-2 gap-4">
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
            {submitting ? 'Saving...' : isEdit ? 'Update Student Record' : 'Create Student'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditStudentPage;
