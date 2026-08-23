import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';

const StudentFeeDetailsPage = () => {
  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [summary, setSummary] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentsAndYears();
  }, []);

  useEffect(() => {
    if (selectedStudent && selectedYear) {
      fetchData();
    } else {
      setSummary(null);
      setReceipts([]);
    }
    // eslint-disable-next-line
  }, [selectedStudent, selectedYear]);

  const fetchStudentsAndYears = async () => {
    try {
      const [stuRes, yearRes] = await Promise.all([
        api.get('/students'),
        api.get('/academic-years')
      ]);

      const fetchedStudents = Array.isArray(stuRes.data?.data)
        ? stuRes.data.data
        : stuRes.data?.data?.docs || [];

      const fetchedYears = Array.isArray(yearRes.data?.data)
        ? yearRes.data.data
        : yearRes.data?.data?.docs || [];

      setStudents(fetchedStudents.filter(s => s.isActive !== false));
      setAcademicYears(fetchedYears);
      
      const current = fetchedYears.find(y => y.is_current);
      if (current) setSelectedYear(current._id);
    } catch (err) {
      console.error(err);
      setError('Failed to load initial data.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, recRes] = await Promise.all([
        api.get(`/fee-payments/summary?studentId=${selectedStudent}&academicYearId=${selectedYear}`),
        api.get(`/fee-payments/student/${selectedStudent}?academicYearId=${selectedYear}`)
      ]);
      setSummary(sumRes.data);
      setReceipts(recRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load fee details.');
      setSummary(null);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">Student Fee Details</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">View comprehensive payment history and current ledger</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm font-medium flex items-start gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">Student</label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">-- Select Student --</option>
              {(students || []).map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} | ID: {s.studentId || 'N/A'} | Class: {s.grade}{s.section ? `-${s.section}` : ''} | Parent: {s.parentId?.name || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">Academic Year</label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">-- Select Year --</option>
              {(academicYears || []).map(y => (
                <option key={y._id} value={y._id}>
                  {y.name} {y.is_current ? '(Current Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="p-12 text-center text-gray-500 font-medium">
          <span className="material-symbols-outlined animate-spin align-middle mr-2">refresh</span> Loading student details...
        </div>
      )}

      {/* Profile Header */}
      {!loading && summary && summary.student && (
        <div className="bg-[var(--color-primary)] text-white rounded-xl p-6 shadow-md flex flex-wrap justify-between items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <div className="flex items-center gap-4 z-10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center border-2 border-white/20">
               <span className="material-symbols-outlined text-3xl text-[var(--color-accent)]">person</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wide">{summary.student.name}</h2>
              <p className="text-blue-200 font-medium text-sm mt-1">Class: {summary.student.grade} {summary.student.section ? `(${summary.student.section})` : ''}</p>
            </div>
          </div>
          
          <div className="flex gap-8 z-10 bg-black/20 rounded-lg p-4">
            <div>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Student ID</p>
              <p className="font-mono text-lg font-bold">{summary.student.studentId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Parent / Guardian</p>
              <p className="text-lg font-bold">{summary.student.parentId?.name || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Snapshot Cards */}
      {!loading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border-l-4 border-blue-500 shadow-sm rounded-xl p-6">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Academic Year Fee</h3>
            <p className="text-3xl font-black text-blue-600">Rs. {summary.totalAmount}</p>
          </div>
          <div className="bg-white border-l-4 border-emerald-500 shadow-sm rounded-xl p-6">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Total Paid</h3>
            <p className="text-3xl font-black text-emerald-600">Rs. {summary.totalPaid}</p>
          </div>
          <div className="bg-white border-l-4 border-red-500 shadow-sm rounded-xl p-6">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Remaining Balance</h3>
            <p className="text-3xl font-black text-red-600">Rs. {summary.remainingBalance}</p>
          </div>
        </div>
      )}

      {/* Monthly Tuition Ledger */}
      {!loading && summary && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[var(--color-secondary)]">calendar_month</span>
            <h2 className="text-xl font-bold text-[var(--color-primary)]">Monthly Tuition Ledger</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(summary.monthlyLedger || []).map((month, idx) => (
              <div key={idx} className={`border-2 rounded-xl p-4 text-center transition-all ${
                month.status === 'Paid' ? 'border-emerald-200 bg-emerald-50' :
                month.status === 'Partial' ? 'border-amber-200 bg-amber-50' :
                month.status === 'N/A' ? 'border-gray-100 bg-gray-50 opacity-60 grayscale' :
                'border-red-200 bg-red-50 shadow-inner'
              }`}>
                <p className="font-bold text-[var(--color-primary)] text-sm">{month.monthName} {month.year}</p>
                <div className="my-2 h-[1px] w-full bg-black/10"></div>
                <p className="text-xs font-mono font-semibold text-gray-700">
                  {month.status === 'N/A' ? '-' : `Rs. ${month.paidAmount} / Rs. ${month.originalAmount}`}
                </p>
                <p className={`text-[10px] mt-2 font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded-full ${
                  month.status === 'Paid' ? 'text-emerald-700 bg-emerald-200/50' :
                  month.status === 'Partial' ? 'text-amber-700 bg-amber-200/50' :
                  month.status === 'N/A' ? 'text-gray-500 bg-gray-200' :
                  'text-red-700 bg-red-200/50'
                }`}>{month.status}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
            <h3 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wider">Other Fees (Remaining)</h3>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-gray-400">payments</span> Admission: <span className="font-mono text-black">Rs. {summary.remainingFees.admission}</span>
              </span>
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-gray-400">app_registration</span> Registration: <span className="font-mono text-black">Rs. {summary.remainingFees.registration}</span>
              </span>
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-gray-400">more_horiz</span> Miscellaneous: <span className="font-mono text-black">Rs. {summary.remainingFees.miscellaneous}</span>
              </span>
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-gray-400">event</span> Annual: <span className="font-mono text-black">Rs. {summary.remainingFees.annual}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment History */}
      {!loading && summary && receipts.length > 0 && (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
             <span className="material-symbols-outlined text-[var(--color-secondary)]">history</span>
            <h2 className="text-xl font-bold text-[var(--color-primary)]">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-4 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Date</th>
                  <th className="px-6 py-4 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Receipt No</th>
                  <th className="px-6 py-4 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Amount</th>
                  <th className="px-6 py-4 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">Method</th>
                  <th className="px-6 py-4 bg-white text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receipts.map(receipt => (
                  <tr key={receipt._id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {new Date(receipt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-[var(--color-primary)]">
                      {receipt.receiptNumber}
                    </td>
                    <td className="px-6 py-4 text-sm font-black text-emerald-600">
                      Rs. {receipt.amountPaid}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-500 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">{receipt.paymentMethod === 'Cash' ? 'payments' : 'account_balance'}</span> {receipt.paymentMethod}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex justify-end">
                        <Link
                          to={`/receipt/${receipt._id}`}
                          className="inline-block"
                        >
                           <Button variant="secondary" className="px-3 py-1.5 text-xs flex items-center gap-1">
                             <span className="material-symbols-outlined text-[14px]">visibility</span> View
                           </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && summary && receipts.length === 0 && (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 font-bold uppercase tracking-wider">
          No payments recorded for this academic year
        </div>
      )}
    </div>
  );
};

export default StudentFeeDetailsPage;
