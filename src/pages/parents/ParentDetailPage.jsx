import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';

const getLatestValue = (arr) => Array.isArray(arr) && arr.length > 0 ? arr[arr.length - 1].value : (arr || '');

const ParentDetailPage = () => {
  const { id } = useParams();

  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParentDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/parents/${id}`);
        setParent(res.data.data.parent);
        setStudents(res.data.data.students);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch parent details.');
      } finally {
        setLoading(false);
      }
    };
    fetchParentDetails();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading parent details...</div>;
  if (error && !parent) return <div className="m-6 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg"><span className="material-symbols-outlined text-red-500 text-[20px]">error</span><span>{error}</span></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
            {parent?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">{parent?.name}</h2>
            <p className="text-sm text-gray-500 font-mono mt-0.5 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">badge</span> {parent?.cnic}
            </p>
            <p className="text-sm text-gray-800 font-bold font-mono mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">tag</span> ID: {parent?.parentId}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/parents/edit/${parent?._id}`}>
            <Button variant="secondary">
              <span className="material-symbols-outlined text-sm">edit</span> Edit Parent
            </Button>
          </Link>
          <Link to="/parents">
            <Button variant="outline">Back to List</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-[var(--color-accent)]">contact_phone</span>
            <span className="text-sm uppercase font-bold tracking-wider text-[var(--color-primary)] block">Contact Information</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gray-400">phone_iphone</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                <p className="text-sm text-gray-800 font-semibold">{parent?.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gray-400">mail</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Email Address</p>
                <p className="text-sm text-gray-800 font-semibold">{parent?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-[var(--color-accent)]">info</span>
            <span className="text-sm uppercase font-bold tracking-wider text-[var(--color-primary)] block">Other Information</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gray-400">work</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Occupation</p>
                <p className="text-sm text-gray-800 font-semibold">{parent?.occupation || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gray-400">location_on</span>
              <div>
                <p className="text-xs text-gray-500 font-medium">Residential Address</p>
                <p className="text-sm text-gray-800 font-semibold">{parent?.address || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Students List */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
            <span className="material-symbols-outlined">school</span> Linked Students ({students.length})
          </h3>
          <Link to={`/students/create?parentId=${parent?._id}`}>
            <Button variant="primary">
              <span className="material-symbols-outlined text-sm">add</span> Add Student
            </Button>
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-6 whitespace-nowrap">Student Name</th>
                  <th className="py-4 px-6 whitespace-nowrap">Class/Grade</th>
                  <th className="py-4 px-6 whitespace-nowrap">Gender</th>
                  <th className="py-4 px-6 whitespace-nowrap">Status</th>
                  <th className="py-4 px-6 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">
                      No students linked to this parent yet.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-[var(--color-primary)]">{s.name}</td>
                      <td className="py-4 px-6 text-gray-700 font-medium">
                        {getLatestValue(s.grade)} {getLatestValue(s.section) && `(Sec: ${getLatestValue(s.section)})`}
                      </td>
                      <td className="py-4 px-6 text-gray-600">{s.gender}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-full ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                        <Link to={`/students/${s._id}`}>
                          <Button variant="outline" className="inline-flex px-3 py-1.5 text-xs">View</Button>
                        </Link>
                        <Link to={`/students/edit/${s._id}`}>
                          <Button variant="secondary" className="inline-flex px-3 py-1.5 text-xs bg-gray-100">Edit</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDetailPage;
