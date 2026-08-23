import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';
import { useAuth } from '../../context/AuthContext';

const getLatestValue = (arr) => Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1].value : (arr || '');

const StudentsPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [msg, setMsg] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

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

  const requestDelete = (s) => {
    setStudentToDelete(s);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    setMsg('');
    setError('');
    setModalOpen(false);
    try {
      const res = await api.delete(`/students/${studentToDelete._id}`);
      setMsg(res.data.message || 'Student deleted successfully.');
      fetchStudents(search);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete student.');
    } finally {
      setStudentToDelete(null);
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Student Management</h2>
          <p className="text-sm text-gray-500 font-medium">View and manage student records</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/students/promotion">
            <Button variant="secondary" className="w-full">
              Promote Students
            </Button>
          </Link>
          <Link to="/students/create">
            <Button variant="primary" className="w-full">
              <span className="material-symbols-outlined text-sm">add</span> Add New Student
            </Button>
          </Link>
        </div>
      </div>

      {msg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          <span>{msg}</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg">
          <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-center">
        <InputField
          type="text"
          placeholder="Search by student name or Student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon="search"
          containerClassName="flex-1 min-w-[250px]"
        />
        <label className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => {
              setShowInactive(e.target.checked);
              fetchStudents(search, e.target.checked);
            }}
            className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
          />
          <span className="text-sm text-gray-700 font-medium select-none">Show Only Inactive</span>
        </label>
        <Button type="submit" variant="secondary" className="py-3 px-6 h-[46px]">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2">
          <span className="material-symbols-outlined animate-spin">refresh</span> Loading students...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 whitespace-nowrap">Student Name</th>
                  <th className="py-4 px-6 whitespace-nowrap">Parent Details</th>
                  <th className="py-4 px-6 whitespace-nowrap">Grade/Class</th>
                  <th className="py-4 px-6 whitespace-nowrap">Gender</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      No student records found.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-6">
                        <div className="font-bold text-[var(--color-primary)] flex items-center gap-2">
                          {s.name}
                          {!s.isActive && (
                             <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-red-100 text-red-700 border border-red-200">
                               Inactive
                             </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{s.studentId && `ID: ${s.studentId}`}</div>
                      </td>
                      <td className="py-4 px-6">
                        {s.parentId ? (
                          <Link to={`/parents/${s.parentId._id}`} className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:underline font-medium">
                            {s.parentId.name} <span className="text-xs text-gray-500 font-mono font-normal">({s.parentId.cnic})</span>
                          </Link>
                        ) : (
                          <span className="text-red-500 text-xs font-medium">No Parent</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {getLatestValue(s.grade)} {getLatestValue(s.section) && `(Sec: ${getLatestValue(s.section)})`}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{s.gender}</td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/students/${s._id}`}>
                          <Button variant="outline" className="inline-flex px-3 py-1.5 text-xs">View</Button>
                        </Link>
                        <Link to={`/students/edit/${s._id}`}>
                          <Button variant="secondary" className="inline-flex px-3 py-1.5 text-xs bg-gray-100">Edit</Button>
                        </Link>
                        <button
                          onClick={() => handleToggleActive(s)}
                          className={`px-3 py-1.5 text-xs font-bold rounded transition-all cursor-pointer border ${
                            s.isActive 
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200'
                          }`}
                        >
                          {s.isActive ? 'Disable' : 'Enable'}
                        </button>
                        {user?.role !== 'ACCOUNTANT' && (
                          <button
                            onClick={() => requestDelete(s)}
                            className="px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 rounded border border-red-200 transition-all cursor-pointer"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        <p>Are you sure you want to delete student <strong>{studentToDelete?.name}</strong>?</p>
        <p className="text-sm text-gray-500 mt-2">This action cannot be undone and will remove associated fee ledgers.</p>
      </Modal>
    </div>
  );
};

export default StudentsPage;
