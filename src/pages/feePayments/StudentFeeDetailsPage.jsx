import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

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

      setStudents(fetchedStudents);
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Student Fee Details & History</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Student</label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">-- Select Student --</option>
              {(students || []).map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} ({s.grade})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Academic Year</label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">-- Select Year --</option>
              {(academicYears || []).map(y => (
                <option key={y._id} value={y._id}>
                  {y.name} {y.is_current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-300">Loading data...</p>}

      {!loading && summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900 shadow rounded p-4 text-center">
            <h3 className="text-blue-800 dark:text-blue-100 font-semibold mb-1">Total Academic Year Fee</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">${summary.totalAmount}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 shadow rounded p-4 text-center">
            <h3 className="text-green-800 dark:text-green-100 font-semibold mb-1">Total Paid</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">${summary.totalPaid}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900 shadow rounded p-4 text-center">
            <h3 className="text-red-800 dark:text-red-100 font-semibold mb-1">Remaining Balance</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">${summary.remainingBalance}</p>
            {summary.advanceBalance > 0 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">Advance: ${summary.advanceBalance}</p>
            )}
          </div>
        </div>
      )}

      {!loading && summary && receipts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Payment History</h2>
          </div>
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Receipt No
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {receipts.map(receipt => (
                <tr key={receipt._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                    {new Date(receipt.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {receipt.receiptNumber}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-sm text-green-600 font-bold">
                    ${receipt.amountPaid}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                    {receipt.paymentMethod}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-sm">
                    <Link
                      to={`/receipt/${receipt._id}`}
                      className="text-blue-500 hover:text-blue-700 font-semibold"
                    >
                      View Receipt
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && summary && receipts.length === 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center text-gray-500">
          No payments recorded for this academic year.
        </div>
      )}
    </div>
  );
};

export default StudentFeeDetailsPage;
