import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const StudentPromotionPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [promoting, setPromoting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [classFilter, setClassFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

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

  const requestPromote = () => {
    if (selectedIds.size === 0) return;
    setModalOpen(true);
  };

  const confirmPromote = async () => {
    setModalOpen(false);
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
    // Sort by grade then section then student ID
    result.sort((a, b) => {
      if (a.grade !== b.grade) return (a.grade || '').localeCompare(b.grade || '');
      if (a.section !== b.section) return (a.section || '').localeCompare(b.section || '');
      return (a.studentId || '').localeCompare(b.studentId || '');
    });
    return result;
  }, [students, classFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Student Promotion System</h2>
          <p className="text-sm text-gray-500 font-medium">Promote students to the next grade or pass them out if they are in the final grade.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link to="/students">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            variant="primary"
            onClick={requestPromote}
            disabled={selectedIds.size === 0 || promoting}
          >
            {promoting ? 'Processing...' : `Promote Selected (${selectedIds.size})`}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}
      
      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-sm font-semibold text-[var(--color-text)]">Filter by Class:</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] min-w-[200px]"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => handleSelectAll(filteredStudents)}
              className="py-1.5 px-3 text-xs"
            >
              Select All Shown
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDeselectAll(filteredStudents)}
              className="py-1.5 px-3 text-xs"
            >
              Deselect All Shown
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">refresh</span> Loading students...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-8 text-center text-gray-500 italic bg-gray-50 rounded-lg border border-gray-100">No active students found for the selected class.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs font-bold tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={(e) => e.target.checked ? handleSelectAll(filteredStudents) : handleDeselectAll(filteredStudents)}
                      checked={filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s._id))}
                      className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Student ID</th>
                  <th className="p-4 text-center">Current Grade</th>
                  <th className="p-4 text-center">Section</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map(student => (
                  <tr 
                    key={student._id} 
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedIds.has(student._id) ? 'bg-indigo-50/50' : ''}`}
                    onClick={() => toggleSelect(student._id)}
                  >
                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(student._id)}
                        onChange={() => toggleSelect(student._id)}
                        className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                      />
                    </td>
                    <td className="p-4 font-bold text-[var(--color-primary)]">{student.name}</td>
                    <td className="p-4 font-mono text-gray-500 text-sm">{student.studentId || 'N/A'}</td>
                    <td className="p-4 text-center text-[var(--color-secondary)] font-semibold">{student.grade || 'N/A'}</td>
                    <td className="p-4 text-center text-gray-500 font-medium">{student.section || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Promotion Confirmation Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Confirm Promotion"
        type="warning"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={confirmPromote}>Confirm Promotion</Button>
          </>
        }
      >
        <p>Are you sure you want to promote <strong>{selectedIds.size}</strong> students?</p>
        <p className="text-sm text-gray-500 mt-2">Final grade students (Grade 10) will be marked as passed out. Other students will be moved to the next grade.</p>
      </Modal>
    </div>
  );
};

export default StudentPromotionPage;
