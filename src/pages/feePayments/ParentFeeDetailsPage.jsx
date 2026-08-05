import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const ParentFeeDetailsPage = () => {
  const [parents, setParents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [childrenDetails, setChildrenDetails] = useState([]);
  const [grandTotals, setGrandTotals] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedParent && selectedYear) {
      fetchData();
    } else {
      setChildrenDetails([]);
      setGrandTotals(null);
      setReceipts([]);
    }
    // eslint-disable-next-line
  }, [selectedParent, selectedYear]);

  const fetchInitialData = async () => {
    try {
      const [parentRes, yearRes] = await Promise.all([
        api.get('/parents'),
        api.get('/academic-years')
      ]);
      const fetchedParents = Array.isArray(parentRes.data?.data) ? parentRes.data.data : parentRes.data?.data?.docs || [];
      const fetchedYears = Array.isArray(yearRes.data?.data) ? yearRes.data.data : yearRes.data?.data?.docs || [];

      setParents(fetchedParents);
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
      // Get all students for this parent
      const stuRes = await api.get('/students');
      const allStudents = Array.isArray(stuRes.data?.data) ? stuRes.data.data : stuRes.data?.data?.docs || [];
      const parentStudents = allStudents.filter(s => s.parentId?._id === selectedParent || s.parentId === selectedParent);

      const details = [];
      let totalFees = 0;
      let totalPaid = 0;
      let totalRemaining = 0;

      for (let stu of parentStudents) {
        try {
          const res = await api.get(`/fee-payments/summary?studentId=${stu._id}&academicYearId=${selectedYear}`);
          details.push(res.data);
          totalFees += res.data.totalAmount;
          totalPaid += res.data.totalPaid;
          totalRemaining += Math.max(0, res.data.remainingBalance - res.data.advanceBalance);
        } catch (e) {
          // skip if no assignment
        }
      }

      setChildrenDetails(details);
      setGrandTotals({ totalFees, totalPaid, totalRemaining });

      // Fetch parent receipts
      const recRes = await api.get(`/fee-payments/parent/${selectedParent}?academicYearId=${selectedYear}`);
      setReceipts(recRes.data || []);

    } catch (err) {
      console.error(err);
      setError('Failed to load parent fee details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Parent Fee Details & History</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Parent</label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
              value={selectedParent}
              onChange={(e) => setSelectedParent(e.target.value)}
            >
              <option value="">-- Select Parent --</option>
              {parents.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} - {p.phone}
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
              {academicYears.map(y => (
                <option key={y._id} value={y._id}>
                  {y.name} {y.is_current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-300">Loading data...</p>}

      {!loading && grandTotals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 dark:bg-blue-900 shadow rounded p-4 text-center">
            <h3 className="text-blue-800 dark:text-blue-100 font-semibold mb-1">Grand Total Academic Year Fee</h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">${grandTotals.totalFees}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 shadow rounded p-4 text-center">
            <h3 className="text-green-800 dark:text-green-100 font-semibold mb-1">Grand Total Paid</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">${grandTotals.totalPaid}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900 shadow rounded p-4 text-center">
            <h3 className="text-red-800 dark:text-red-100 font-semibold mb-1">Grand Remaining Balance</h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">${grandTotals.totalRemaining}</p>
          </div>
        </div>
      )}

      {!loading && childrenDetails.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {childrenDetails.map(child => (
            <div key={child.assignmentId} className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                {child.student.firstName} {child.student.lastName}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Grade: {child.student.grade}</p>
              
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Total Fee:</span>
                  <span className="font-semibold">${child.totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Paid:</span>
                  <span className="font-semibold text-green-600">${child.totalPaid}</span>
                </div>
                <div className="flex justify-between">
                  <span>Advance:</span>
                  <span className="font-semibold text-yellow-600">${child.advanceBalance}</span>
                </div>
                <div className="flex justify-between border-t mt-2 pt-2 font-bold">
                  <span>Remaining:</span>
                  <span className="text-red-600">${child.remainingBalance}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && grandTotals && receipts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Parent Payment History</h2>
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
                    ${receipt.totalAmountPaid}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">
                    {receipt.paymentMethod}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 dark:border-gray-700 text-sm">
                    <Link
                      to={`/parent-receipt/${receipt._id}`}
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

      {!loading && grandTotals && receipts.length === 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 text-center text-gray-500">
          No parent payments recorded for this academic year.
        </div>
      )}
    </div>
  );
};

export default ParentFeeDetailsPage;
