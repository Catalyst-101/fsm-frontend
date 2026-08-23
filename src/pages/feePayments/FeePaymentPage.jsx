import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';

const FeePaymentPage = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  
  const [summary, setSummary] = useState(null);
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
    if (selectedStudent && selectedYear) {
      fetchStudentSummary();
    } else {
      setSummary(null);
    }
    // eslint-disable-next-line
  }, [selectedStudent, selectedYear]);

  const fetchInitialData = async () => {
    try {
      const [stuRes, yearRes] = await Promise.all([
        api.get('/students'),
        api.get('/academic-years')
      ]);

      const fetchedStudents = Array.isArray(stuRes.data?.data) ? stuRes.data.data : stuRes.data?.data?.docs || [];
      const fetchedYears = Array.isArray(yearRes.data?.data) ? yearRes.data.data : yearRes.data?.data?.docs || [];

      setStudents(fetchedStudents.filter(s => s.isActive !== false));
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
        amountPaid: res.data.remainingBalance > 0 ? res.data.remainingBalance.toString() : ''
      }));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load fee summary.');
      setSummary(null);
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
      const res = await api.post('/fee-payments/pay', {
        studentId: selectedStudent,
        academicYearId: selectedYear,
        amountPaid: Number(paymentData.amountPaid),
        paymentMethod: paymentData.paymentMethod,
        remarks: paymentData.remarks,
        isTuitionOnly: paymentData.isTuitionOnly
      });
      navigate(`/receipt/${res.data.receipt._id}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment processing failed.');
      setProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">Process Fee Payment</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Accept payments and generate instant receipts</p>
        </div>
        <span className="material-symbols-outlined text-[var(--color-secondary)] text-4xl opacity-20">payments</span>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm font-medium flex items-start gap-2">
          <span className="material-symbols-outlined text-[20px]">error</span> <span>{error}</span>
        </div>
      )}

      {/* Selection Panel */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">Select Student</label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">-- Choose a Student --</option>
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
              <option value="">-- Choose Academic Year --</option>
              {(academicYears || []).map(y => (
                <option key={y._id} value={y._id}>
                  {y.name} {y.is_current ? '(Current Active)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loadingSummary && (
        <div className="p-12 text-center text-gray-500 font-medium">
          <span className="material-symbols-outlined animate-spin align-middle mr-2">refresh</span> Loading fee summary...
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Fee Summary Panel */}
          <div className="lg:col-span-5 bg-white border border-gray-200 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] rounded-xl p-6 h-fit">
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-6 border-b border-gray-100 pb-2">Fee Summary</h2>
            
            {summary.student && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-[var(--color-primary)]">
                     <span className="material-symbols-outlined">school</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--color-primary)]">{summary.student.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">ID: <span className="font-mono">{summary.student.studentId || 'N/A'}</span></p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 font-medium grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-blue-200 border-dashed">
                  <div>
                    <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Class</span>
                    {summary.student.grade} {summary.student.section ? `(${summary.student.section})` : ''}
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Parent</span>
                    {summary.student.parentId?.name || 'N/A'}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded">
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Valid Tuition Months</span>
                <span className="font-bold text-gray-800">{summary.validMonths}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border-l-2 border-blue-500">
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Total Academic Year Fee</span>
                <span className="font-bold text-blue-600">Rs. {summary.totalAmount}</span>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded border-l-2 border-emerald-500">
                <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider">Total Paid So Far</span>
                <span className="font-bold text-emerald-600">Rs. {summary.totalPaid}</span>
              </div>
              
              <div className="flex justify-between items-center bg-red-50 p-4 rounded-lg border border-red-100 mt-4 shadow-inner">
                <span className="font-bold text-red-800 uppercase tracking-wider text-xs">Remaining Balance</span>
                <span className="font-black text-xl text-red-600">Rs. {summary.remainingBalance}</span>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Remaining Breakdown</h4>
                <div className="space-y-2 text-xs font-medium text-gray-600">
                  <div className="flex justify-between"><span>Tuition:</span> <span className="font-mono text-gray-800">Rs. {summary.remainingFees.tuition}</span></div>
                  <div className="flex justify-between"><span>Admission:</span> <span className="font-mono text-gray-800">Rs. {summary.remainingFees.admission}</span></div>
                  <div className="flex justify-between"><span>Registration:</span> <span className="font-mono text-gray-800">Rs. {summary.remainingFees.registration}</span></div>
                  <div className="flex justify-between"><span>Miscellaneous:</span> <span className="font-mono text-gray-800">Rs. {summary.remainingFees.miscellaneous}</span></div>
                  <div className="flex justify-between"><span>Annual:</span> <span className="font-mono text-gray-800">Rs. {summary.remainingFees.annual}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Form */}
          <div className="lg:col-span-7 bg-white border border-gray-200 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] rounded-xl p-6 h-fit">
            <h2 className="text-xl font-bold text-[var(--color-primary)] mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
               <span className="material-symbols-outlined text-[var(--color-secondary)]">account_balance_wallet</span> Payment Details
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">Amount Received (Rs.) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
                  <input
                    type="number"
                    name="amountPaid"
                    value={paymentData.amountPaid}
                    onChange={handleChange}
                    className="w-full bg-white border-2 border-[var(--color-primary)] rounded-lg pl-12 pr-4 py-4 text-[var(--color-primary)] text-xl font-black focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                    min="1"
                    max={paymentData.isTuitionOnly ? summary.remainingFees.tuition : summary.remainingBalance}
                    disabled={paymentData.isTuitionOnly ? summary.remainingFees.tuition === 0 : summary.remainingBalance === 0}
                    required
                  />
                </div>
                {paymentData.isTuitionOnly && summary.remainingFees.tuition === 0 && (
                  <p className="text-xs text-[var(--color-accent)] font-bold mt-2">Tuition is fully paid.</p>
                )}
                {!paymentData.isTuitionOnly && summary.remainingBalance === 0 && (
                   <p className="text-xs text-emerald-600 font-bold mt-2">All dues are cleared.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">Payment Method</label>
                  <div className="relative">
                     <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-[18px]">credit_card</span>
                     <select
                       name="paymentMethod"
                       value={paymentData.paymentMethod}
                       onChange={handleChange}
                       className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium appearance-none"
                     >
                       <option value="Cash">Cash</option>
                       <option value="Bank Transfer">Bank Transfer</option>
                       <option value="Cheque">Cheque</option>
                       <option value="Other">Other</option>
                     </select>
                  </div>
                </div>

                <div className="flex items-center pt-6">
                  <label htmlFor="isTuitionOnly" className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        name="isTuitionOnly"
                        checked={paymentData.isTuitionOnly}
                        onChange={handleChange}
                        id="isTuitionOnly"
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-[var(--color-secondary)] peer-checked:border-[var(--color-secondary)] transition-all"></div>
                      <span className="absolute text-white material-symbols-outlined text-[14px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">check</span>
                    </div>
                    <span className="text-sm text-gray-700 font-bold group-hover:text-[var(--color-primary)] transition-colors select-none">
                      Pay Tuition Only <span className="text-[10px] text-gray-400 block font-normal">(Skips admission/annual fees)</span>
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--color-text)] uppercase tracking-wider mb-2">Remarks (Optional)</label>
                <textarea
                  name="remarks"
                  value={paymentData.remarks}
                  onChange={handleChange}
                  placeholder="Enter any additional notes here..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-[var(--color-text)] text-sm focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  disabled={processing || summary.remainingBalance === 0 || (paymentData.isTuitionOnly && summary.remainingFees.tuition === 0)}
                  className="w-full py-4 text-lg shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">receipt_long</span>
                  {processing ? 'Processing Payment...' : 'Process Payment & Generate Receipt'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeePaymentPage;
