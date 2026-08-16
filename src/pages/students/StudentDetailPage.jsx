import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const StudentDetailPage = () => {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentDetails = async () => {
      setLoading(true);
      try {
        const studentRes = await api.get(`/students/${id}`);
        setStudent(studentRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch student details.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetails();
  }, [id]);

  if (loading) return <div className="text-slate-400 text-sm">Loading student details...</div>;
  if (error && !student) return <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-3 rounded-lg">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{student?.name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {student?._id}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/students/edit/${student?._id}`}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Edit Student
          </Link>
          <Link to="/students" className="px-3 py-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            ← Back to Students List
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student Info */}
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-700 pb-2">Academic Info</span>
          <p className="text-sm text-slate-200"><strong>Grade / Class:</strong> {student?.grade}</p>
          <p className="text-sm text-slate-200"><strong>Section:</strong> {student?.section || 'N/A'}</p>
          <p className="text-sm text-slate-200"><strong>Roll Number:</strong> {student?.rollNumber || 'N/A'}</p>
          <p className="text-sm text-slate-200"><strong>Gender:</strong> {student?.gender}</p>
          <p className="text-sm text-slate-200">
            <strong>Date of Birth:</strong> {student?.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
          </p>
          <div>
            <strong>Status:</strong>{' '}
            <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${student?.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {student?.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-slate-800 border border-slate-700 p-5 rounded-xl space-y-3">
          <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block border-b border-slate-700 pb-2">Parent / Guardian Info</span>
          {student?.parentId ? (
            <>
              <p className="text-sm text-slate-200"><strong>Parent Name:</strong> {student.parentId.name}</p>
              <p className="text-sm text-slate-200"><strong>CNIC:</strong> <span className="font-mono">{student.parentId.cnic}</span></p>
              <p className="text-sm text-slate-200"><strong>Phone:</strong> {student.parentId.phone}</p>
              <p className="text-sm text-slate-200"><strong>Email:</strong> {student.parentId.email || 'N/A'}</p>
              <p className="text-sm text-slate-200"><strong>Occupation:</strong> {student.parentId.occupation || 'N/A'}</p>
              <div className="pt-2">
                <Link
                  to={`/parents/${student.parentId._id}`}
                  className="inline-block text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  View Full Parent Profile & Other Children →
                </Link>
              </div>
            </>
          ) : (
            <p className="text-sm text-rose-400">No parent linked to this student.</p>
          )}
        </div>
      </div>

      {/* ASSIGNED FEE STRUCTURE SECTION */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight">Assigned Fee Structure</h3>

        {!student?.fee ? (
          <p className="text-xs text-slate-500">No fee structure assignment found for this student.</p>
        ) : (
          <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Current Fee Assignment
                  </span>
                  <div>
                    {student.fee.is_custom ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Custom Fee Override
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Standard Fee Structure
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Monthly Tuition</span>
                    <span className="font-mono font-bold text-slate-200">Rs. {student.fee.monthlyTuition}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Admission Fee</span>
                    <span className="font-mono text-slate-200">Rs. {student.fee.admissionFee}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Registration Fee</span>
                    <span className="font-mono text-slate-200">Rs. {student.fee.registrationFee}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Miscellaneous Fee</span>
                    <span className="font-mono text-slate-200">Rs. {student.fee.miscellaneousFee}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 block">Annual Charges</span>
                    <span className="font-mono text-slate-200">Rs. {student.fee.annualCharges}</span>
                  </div>
                </div>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailPage;
