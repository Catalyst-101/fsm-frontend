import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';

const StudentPromotionPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [promoting, setPromoting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/students');
      const data = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.docs || [];
      // Only keep active students
      setStudents(data.filter(s => s.isActive !== false));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (filtered) => {
    const newSet = new Set(selectedIds);
    filtered.forEach(s => newSet.add(s._id));
    setSelectedIds(newSet);
  };

  const handleDeselectAll = (filtered) => {
    const newSet = new Set(selectedIds);
    filtered.forEach(s => newSet.delete(s._id));
    setSelectedIds(newSet);
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handlePromote = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to promote ${selectedIds.size} students? Final grade students will be passed out.`)) return;

    setPromoting(true);
    setSuccessMsg('');
    setError('');

    try {
      const res = await api.post('/students/promote', {
        studentIds: Array.from(selectedIds),
        action: 'promote'
      });
      const { promoted, passedOut } = res.data.data;
      setSuccessMsg(`Successfully promoted ${promoted} students and passed out ${passedOut} students.`);
      setSelectedIds(new Set());
      fetchStudents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to promote students.');
    } finally {
      setPromoting(false);
    }
  };

  const uniqueClasses = useMemo(() => {
    const classes = new Set(students.map(s => s.grade).filter(Boolean));
    return Array.from(classes);
  }, [students]);

  const filteredStudents = useMemo(() => {
    let result = [...students];
    if (classFilter) {
      result = result.filter(s => s.grade === classFilter);
    }
    // Sort by grade then section then roll number
    result.sort((a, b) => {
      if (a.grade !== b.grade) return (a.grade || '').localeCompare(b.grade || '');
      if (a.section !== b.section) return (a.section || '').localeCompare(b.section || '');
      return (a.studentId || '').localeCompare(b.studentId || '');
    });
    return result;
  }, [students, classFilter]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Student Promotion System</h1>
          <p className="text-sm text-slate-400 mt-1">
            Promote students to the next grade or pass them out if they are in the final grade.
          </p>
        </div>
        
        <button
          onClick={handlePromote}
          disabled={selectedIds.size === 0 || promoting}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center gap-2 ${
            selectedIds.size === 0 || promoting
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
          }`}
        >
          {promoting ? 'Processing...' : `Promote Selected (${selectedIds.size})`}
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}
      
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm p-4 rounded-xl">
          {successMsg}
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-semibold text-slate-300">Filter by Class:</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 min-w-[200px]"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => handleSelectAll(filteredStudents)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded transition-colors"
            >
              Select All Shown
            </button>
            <button
              onClick={() => handleDeselectAll(filteredStudents)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded transition-colors"
            >
              Deselect All Shown
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-8 text-center text-slate-500 italic">No active students found for the selected class.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">
                  <th className="p-3 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={(e) => e.target.checked ? handleSelectAll(filteredStudents) : handleDeselectAll(filteredStudents)}
                      checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s._id))}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll No</th>
                  <th className="p-3 text-center">Current Grade</th>
                  <th className="p-3 text-center">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredStudents.map(student => (
                  <tr 
                    key={student._id} 
                    className={`hover:bg-slate-700/30 transition-colors cursor-pointer ${selectedIds.has(student._id) ? 'bg-indigo-900/10' : ''}`}
                    onClick={() => toggleSelect(student._id)}
                  >
                    <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(student._id)}
                        onChange={() => toggleSelect(student._id)}
                        className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="p-3 font-semibold text-white">{student.name}</td>
                    <td className="p-3 font-mono text-slate-400 text-sm">{student.studentId || 'N/A'}</td>
                    <td className="p-3 text-center text-indigo-300 font-medium">{student.grade || 'N/A'}</td>
                    <td className="p-3 text-center text-slate-400">{student.section || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPromotionPage;
