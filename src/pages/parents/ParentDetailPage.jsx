import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

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

  if (loading) return <div className="text-slate-400 text-sm">Loading parent details...</div>;
  if (error && !parent) return <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{parent?.name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">CNIC: {parent?.cnic}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/parents/edit/${parent?._id}`}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Edit Parent
          </Link>
          <Link to="/parents" className="px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            ← Back to Parents List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Contact Info</span>
          <p className="text-sm text-slate-200"><strong>Phone:</strong> {parent?.phone}</p>
          <p className="text-sm text-slate-200"><strong>Email:</strong> {parent?.email || 'N/A'}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Other Info</span>
          <p className="text-sm text-slate-200"><strong>Occupation:</strong> {parent?.occupation || 'N/A'}</p>
          <p className="text-sm text-slate-200"><strong>Address:</strong> {parent?.address || 'N/A'}</p>
        </div>
      </div>

      {/* Linked Students List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Linked Students ({students.length})</h3>
          <Link
            to={`/students/create?parentId=${parent?._id}`}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/30 transition-all"
          >
            + Add Student for this Parent
          </Link>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Class/Grade</th>
                <th className="py-3.5 px-4">Gender</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500">
                    No students linked to this parent yet.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{s.name}</td>
                    <td className="py-3.5 px-4 text-slate-300">{s.grade} {s.section && `(Rs. {s.section})`}</td>
                    <td className="py-3.5 px-4 text-slate-400">{s.gender}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${s.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                        {s.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <Link
                        to={`/students/${s._id}`}
                        className="px-2.5 py-1 text-xs font-medium bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded transition-all inline-block"
                      >
                        View
                      </Link>
                      <Link
                        to={`/students/edit/${s._id}`}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded transition-all inline-block"
                      >
                        Edit
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
  );
};

export default ParentDetailPage;
