import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const FeePaymentPage = () => {
  const navigate = useNavigate();
  const [paymentMode, setPaymentMode] = useState('student'); // 'student' or 'parent'

  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [summary, setSummary] = useState(null); // Used for student mode
  const [parentSummary, setParentSummary] = useState(null); // Used for parent mode
  
  const [loadingSummary, setLoadingSummary] = useState(false);
  
  const [paymentData, setPaymentData] = useState({
    amountPaid: '',
    paymentMethod: 'Cash',
    remarks: '',
    isTuitionOnly: false,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (paymentMode === 'student' && selectedStudent && selectedYear) {
      fetchStudentSummary();
    } else if (paymentMode === 'parent' && selectedParent && selectedYear) {
      fetchParentSummary();
    } else {
      setSummary(null);
      setParentSummary(null);
    }
    // eslint-disable-next-line
  }, [paymentMode, selectedStudent, selectedParent, selectedYear]);

  const fetchInitialData = async () => {
    try {
      const [stuRes, parentRes, yearRes] = await Promise.all([
        api.get('/students'),
        api.get('/parents'),
        api.get('/academic-years')
      ]);

      const fetchedStudents = Array.isArray(stuRes.data?.data) ? stuRes.data.data : stuRes.data?.data?.docs || [];
      const fetchedParents = Array.isArray(parentRes.data?.data) ? parentRes.data.data : parentRes.data?.data?.docs || [];
      const fetchedYears = Array.isArray(yearRes.data?.data) ? yearRes.data.data : yearRes.data?.data?.docs || [];

      setStudents(fetchedStudents);
      setParents(fetchedParents);
      setAcademicYears(fetchedYears);
      
      const current = fetchedYears.find(y => y.is_current);
      if (current) setSelectedYear(current._id);
    } catch (err) {
      console.error(err);
      setError('Failed to load initial data.');
    }
  };

  const fetchStudentSummary = async () => {
    setLoadingSummary(true);
    setError('');
    try {
      const res = await api.get(`/fee-payments/summary?studentId=${selectedStudent}&academicYearId=${selectedYear}`);
      setSummary(res.data);
      setPaymentData(prev => ({
        ...prev,
        amountPaid: res.data.remainingBalance > 0 ? (res.data.remainingBalance - res.data.advanceBalance > 0 ? res.data.remainingBalance - res.data.advanceBalance : 0).toString() : ''
      }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load fee summary.');
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchParentSummary = async () => {
    setLoadingSummary(true);
    setError('');
    try {
      // Find all students for this parent
      const parentStudents = students.filter(s => s.parentId?._id === selectedParent || s.parentId === selectedParent);
      
      let grandTotal = 0;
      let childrenDetails = [];

      for (let stu of parentStudents) {
        try {
          const res = await api.get(`/fee-payments/summary?studentId=${stu._id}&academicYearId=${selectedYear}`);
          const amountOwed = res.data.remainingBalance - res.data.advanceBalance;
          if (amountOwed > 0) grandTotal += amountOwed;
          childrenDetails.push(res.data);
        } catch (e) {
          // Skip if no assignment
        }
      }

      setParentSummary({ childrenDetails, grandTotal });
      setPaymentData(prev => ({
        ...prev,
        amountPaid: grandTotal > 0 ? grandTotal.toString() : ''
      }));

    } catch (err) {
      console.error(err);
      setError('Failed to load parent summary.');
      setParentSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Number(paymentData.amountPaid) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      if (paymentMode === 'student') {
        const res = await api.post('/fee-payments/pay', {
          studentId: selectedStudent,
          academicYearId: selectedYear,
          amountPaid: Number(paymentData.amountPaid),
          paymentMethod: paymentData.paymentMethod,
          remarks: paymentData.remarks,
          isTuitionOnly: paymentData.isTuitionOnly
        });
        navigate(`/receipt/${res.data.receipt._id}`);
      } else {
        const res = await api.post('/fee-payments/pay-parent', {
          parentId: selectedParent,
          academicYearId: selectedYear,
          amountPaid: Number(paymentData.amountPaid),
          paymentMethod: paymentData.paymentMethod,
          remarks: paymentData.remarks,
          isTuitionOnly: paymentData.isTuitionOnly
        });
        navigate(`/parent-receipt/${res.data.receipt._id}`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment processing failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Process Fee Payment</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="flex gap-4 mb-6">
          <label className="flex items-center space-x-2 text-gray-800 dark:text-white cursor-pointer">
            <input 
              type="radio" 
              value="student" 
              checked={paymentMode === 'student'} 
              onChange={() => { setPaymentMode('student'); setPaymentData(p => ({...p, amountPaid: ''})); }} 
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold">Pay for Single Student</span>
          </label>
          <label className="flex items-center space-x-2 text-gray-800 dark:text-white cursor-pointer">
            <input 
              type="radio" 
              value="parent" 
              checked={paymentMode === 'parent'} 
              onChange={() => { setPaymentMode('parent'); setPaymentData(p => ({...p, amountPaid: ''})); }} 
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="font-semibold">Pay for Multiple Siblings (Parent)</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMode === 'student' ? (
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
          ) : (
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Parent</label>
              <select
                className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
              >
                <option value="">-- Select Parent --</option>
                {(parents || []).map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} - {p.phone}
                  </option>
                ))}
              </select>
            </div>
          )}

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

      {loadingSummary && <p className="text-gray-600 dark:text-gray-300 mb-6">Loading fee summary...</p>}

      {(summary || parentSummary) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Fee Summary</h2>
            
            {paymentMode === 'student' && summary && (
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <div className="flex justify-between border-b pb-1">
                  <span>Valid Tuition Months:</span>
                  <span className="font-semibold">{summary.validMonths}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Total Academic Year Fee:</span>
                  <span className="font-semibold text-blue-600">${summary.totalAmount}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Total Paid So Far:</span>
                  <span className="font-semibold text-green-600">${summary.totalPaid}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Advance Balance:</span>
                  <span className="font-semibold text-yellow-600">${summary.advanceBalance}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Remaining Balance:</span>
                  <span className="text-red-600">${summary.remainingBalance}</span>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <p>Tuition: ${summary.remainingFees.tuition} left</p>
                  <p>Admission: ${summary.remainingFees.admission} left</p>
                  <p>Registration: ${summary.remainingFees.registration} left</p>
                  <p>Miscellaneous: ${summary.remainingFees.miscellaneous} left</p>
                  <p>Annual: ${summary.remainingFees.annual} left</p>
                </div>
              </div>
            )}

            {paymentMode === 'parent' && parentSummary && (
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                {parentSummary.childrenDetails.length === 0 ? (
                  <p className="text-gray-500 italic">No students found with active fee assignments for this year.</p>
                ) : (
                  parentSummary.childrenDetails.map(child => (
                    <div key={child.assignmentId} className="border p-3 rounded bg-gray-50 dark:bg-gray-700">
                      <h3 className="font-bold">{child.student.firstName} {child.student.lastName} ({child.student.grade})</h3>
                      <div className="flex justify-between text-sm mt-1">
                        <span>Remaining: <span className="text-red-600 font-semibold">${child.remainingBalance}</span></span>
                        <span>Advance: <span className="text-yellow-600 font-semibold">${child.advanceBalance}</span></span>
                      </div>
                    </div>
                  ))
                )}
                
                <div className="flex justify-between font-bold text-xl pt-4 border-t border-gray-300 dark:border-gray-600 mt-4">
                  <span>Grand Total Remaining:</span>
                  <span className="text-red-600">${parentSummary.grandTotal}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Payment will be automatically distributed across children according to standard priority rules.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Payment Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Amount Received ($)</label>
                <input
                  type="number"
                  name="amountPaid"
                  value={paymentData.amountPaid}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
                  min="1"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={paymentData.paymentMethod}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Remarks (Optional)</label>
                <textarea
                  name="remarks"
                  value={paymentData.remarks}
                  onChange={handleChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
                  rows="2"
                ></textarea>
              </div>

              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  name="isTuitionOnly"
                  checked={paymentData.isTuitionOnly}
                  onChange={handleChange}
                  id="isTuitionOnly"
                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isTuitionOnly" className="text-sm text-gray-700 dark:text-gray-300 font-bold">
                  Pay Tuition Only (Skips other fees)
                </label>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeePaymentPage;
