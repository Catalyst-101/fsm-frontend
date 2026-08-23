import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';

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

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading student details...</div>;
  if (error && !student) return <div className="m-6 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700 flex items-start gap-2 rounded-r-lg"><span className="material-symbols-outlined text-red-500 text-[20px]">error</span><span>{error}</span></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md">
             {student?.name?.charAt(0).toUpperCase()}
           </div>
           <div>
            <h2 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">{student?.name}</h2>
            <p className="text-sm text-gray-500 font-mono mt-0.5 font-medium flex items-center gap-1">
               <span className="material-symbols-outlined text-[16px]">badge</span> ID: {student?._id}
            </p>
           </div>
        </div>
        <div className="flex gap-3">
          <Link to={`/students/edit/${student?._id}`}>
            <Button variant="secondary">
              <span className="material-symbols-outlined text-sm">edit</span> Edit Student
            </Button>
          </Link>
          <Link to="/students">
            <Button variant="outline">Back to List</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Info */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-[var(--color-accent)]">school</span>
            <span className="text-sm uppercase font-bold tracking-wider text-[var(--color-primary)] block">Academic Information</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Grade / Class</p>
              <p className="text-sm text-gray-800 font-semibold mt-1">{student?.grade}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Section</p>
              <p className="text-sm text-gray-800 font-semibold mt-1">{student?.section || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Student ID (Roll No)</p>
              <p className="text-sm text-gray-800 font-semibold font-mono mt-1">{student?.studentId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Gender</p>
              <p className="text-sm text-gray-800 font-semibold mt-1">{student?.gender}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Date of Birth</p>
              <p className="text-sm text-gray-800 font-semibold mt-1">
                {student?.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase">Status</p>
              <div className="mt-1">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${student?.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {student?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Parent Info */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <span className="material-symbols-outlined text-[var(--color-accent)]">family_restroom</span>
            <span className="text-sm uppercase font-bold tracking-wider text-[var(--color-primary)] block">Parent / Guardian Info</span>
          </div>
          
          {student?.parentId ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Parent Name</p>
                  <p className="text-sm text-[var(--color-primary)] font-bold mt-1">{student.parentId.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">CNIC</p>
                  <p className="text-sm text-gray-800 font-semibold font-mono mt-1">{student.parentId.cnic}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                  <p className="text-sm text-gray-800 font-semibold mt-1">{student.parentId.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                  <p className="text-sm text-gray-800 font-semibold mt-1">{student.parentId.email || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 font-medium uppercase">Occupation</p>
                  <p className="text-sm text-gray-800 font-semibold mt-1">{student.parentId.occupation || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-100 text-right">
                <Link
                  to={`/parents/${student.parentId._id}`}
                  className="inline-flex items-center gap-1 text-sm text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-bold transition-colors"
                >
                  View Full Profile & Siblings <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-red-500 bg-red-50 rounded-lg border border-red-100 font-medium">
              No parent linked to this student.
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNED FEE STRUCTURE SECTION */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] space-y-4">
        <h3 className="text-lg font-bold text-[var(--color-primary)] tracking-tight flex items-center gap-2">
           <span className="material-symbols-outlined text-[var(--color-accent)]">payments</span> Assigned Fee Structure
        </h3>

        {!student?.fee ? (
          <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100 text-center font-medium">No fee structure assignment found for this student.</p>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <span className="text-xs font-bold text-[var(--color-secondary)] uppercase tracking-wider">
                Current Fee Assignment Breakdown
              </span>
              <div>
                {student.fee.is_custom ? (
                  <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Custom Fee Override
                  </span>
                ) : (
                  <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Standard Fee Structure
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Monthly Tuition</span>
                <span className="font-bold text-[var(--color-primary)] text-lg">Rs. {student.fee.monthlyTuition}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Admission Fee</span>
                <span className="font-semibold text-gray-700">Rs. {student.fee.admissionFee}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Registration Fee</span>
                <span className="font-semibold text-gray-700">Rs. {student.fee.registrationFee}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Misc Fee</span>
                <span className="font-semibold text-gray-700">Rs. {student.fee.miscellaneousFee}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">Annual Charges</span>
                <span className="font-semibold text-gray-700">Rs. {student.fee.annualCharges}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailPage;
