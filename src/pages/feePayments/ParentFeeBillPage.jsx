import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import logo from '../../assets/images/logo.png';

function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only';
  const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
  const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return ''; 
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Rupees Only';
}

const ParentFeeBillPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [parents, setParents] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  
  const [billData, setBillData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedYear && selectedParent) {
      generateBill();
    } else {
      setBillData(null);
    }
  }, [selectedYear, selectedParent]);

  const fetchInitialData = async () => {
    try {
      const [ayRes, parentsRes] = await Promise.all([
        api.get('/academic-years'),
        api.get('/parents')
      ]);
      setAcademicYears(ayRes.data.data || []);
      setParents(parentsRes.data.data || []);

      const currentYear = ayRes.data.data.find(y => y.is_current);
      if (currentYear) {
        setSelectedYear(currentYear._id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load initial data.');
    }
  };

  const generateBill = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch students for this parent
      const studentsRes = await api.get('/students?academicYearId=' + selectedYear);
      const allStudents = studentsRes.data.data || [];
      const parentStudents = allStudents.filter(s => s.parentId?._id === selectedParent);

      if (parentStudents.length === 0) {
        setBillData({ students: [], grandTotal: 0 });
        setLoading(false);
        return;
      }

      const currentDate = new Date();
      const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
      const dueDate = `5th ${currentDate.toLocaleString('default', { month: 'long' })}, ${currentDate.getFullYear()}`;

      // 2. Fetch fee summary and past receipts for each student
      const studentSummaries = [];
      let grandTotal = 0;

      for (const student of parentStudents) {
        try {
          const [summaryRes, receiptRes] = await Promise.all([
            api.get(`/fee-payments/summary?studentId=${student._id}&academicYearId=${selectedYear}`),
            api.get(`/fee-payments/student/${student._id}?academicYearId=${selectedYear}`)
          ]);
          
          const summary = summaryRes.data;
          const receipts = receiptRes.data.data || [];
          const lastReceipt = receipts.length > 0 ? receipts[0] : null;

          const remainingTuition = summary.remainingFees.tuition;
          const remainingOther = summary.remainingFees.admission + summary.remainingFees.registration + summary.remainingFees.miscellaneous + summary.remainingFees.annual;
          const totalRemaining = summary.remainingBalance;

          const currentMonthTuition = summary.currentMonthTuition || 0;
          const previousTuitionDues = summary.previousUnpaidTuition || 0;

          // Total payable for the current month section
          // It consists of current month's tuition + any unpaid previous tuition + unpaid other fees
          const currentMonthPayable = currentMonthTuition + previousTuitionDues + remainingOther;

          studentSummaries.push({
            student,
            summary,
            remainingTuition,
            remainingOther,
            totalRemaining,
            lastReceipt,
            currentMonthPayable,
            currentMonthTuition,
            previousTuitionDues
          });

          grandTotal += currentMonthPayable;
        } catch (err) {
          console.error(`Failed to fetch fee summary for student ${student._id}`, err);
        }
      }

      const parentInfo = parents.find(p => p._id === selectedParent);
      const yearInfo = academicYears.find(y => y._id === selectedYear);

      setBillData({
        parent: parentInfo,
        academicYear: yearInfo,
        students: studentSummaries,
        grandTotal,
        currentMonthName,
        dueDate
      });
    } catch (err) {
      console.error(err);
      setError('Failed to generate bill.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex justify-between items-center print:hidden">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Generate Parent Fee Bill</h1>
        {billData && billData.students.length > 0 && (
          <button
            onClick={handlePrint}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print Bill
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 print:hidden">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {p.name} (CNIC: {p.cnic})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-8 text-gray-600 print:hidden">Generating bill...</div>}

      {/* Bill View */}
      {!loading && billData && (
        <div className="print:m-0 bg-white text-gray-900 shadow-sm rounded-lg p-6 border border-gray-300 print:shadow-none print:border-none break-inside-avoid">
          
          {/* Header matching Receipt Design */}
          <div className="flex justify-between items-center mb-6 border-b-2 border-gray-800 pb-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
              <div>
                <h1 className="text-2xl font-bold uppercase tracking-wide">Pen & Page Academia</h1>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-700">(Fee Bill)</h2>
                <p className="text-xs text-gray-500 italic mt-0.5">Innovating Tomorrow by Educating Today</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Rehman Baba Street, University Town, Peshawar</p>
              <p className="text-sm font-semibold">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm font-semibold text-red-600 mt-1">Due Date: {billData.dueDate}</p>
            </div>
          </div>

          <div className="mb-6 border-l-4 border-gray-800 pl-4">
            <p className="mb-1 text-xs uppercase tracking-wider text-gray-500 font-bold">Parent / Guardian</p>
            <p className="font-bold text-xl text-gray-800">{billData.parent?.name}</p>
            <p className="text-gray-600 text-sm">CNIC: <span className="font-mono">{billData.parent?.cnic}</span> | Phone: {billData.parent?.phone}</p>
            <p className="text-gray-600 text-sm">Academic Year: {billData.academicYear?.name}</p>
          </div>

          {billData.students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No outstanding dues found for this parent's students in the selected academic year.
            </div>
          ) : (
            <div className="space-y-8">
              {billData.students.map((item, index) => (
                <div key={index} className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg">{item.student.name}</h3>
                      <p className="text-sm text-gray-600">Student ID: <span className="font-mono">{item.student.studentId || 'N/A'}</span> | Class: {item.student.grade} {item.student.section ? `(${item.student.section})` : ''}</p>
                    </div>
                  </div>
                  
                  {item.totalRemaining === 0 ? (
                    <div className="p-8 flex items-center justify-center bg-green-50 text-green-700 font-bold text-lg border-t border-green-200">
                      ✓ All dues paid for this student.
                    </div>
                  ) : (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Part 1: Overall Remaining Dues & Previous Payment */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Remaining Fees Breakdown</h4>
                        <table className="w-full text-sm mb-4">
                          <tbody>
                            <tr className="border-b border-gray-100">
                              <td className="py-1">Tuition Fee</td>
                              <td className="py-1 text-right">Rs. {item.remainingTuition}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-1">Admission Fee</td>
                              <td className="py-1 text-right">Rs. {item.summary.remainingFees.admission}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-1">Registration Fee</td>
                              <td className="py-1 text-right">Rs. {item.summary.remainingFees.registration}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-1">Miscellaneous Fee</td>
                              <td className="py-1 text-right">Rs. {item.summary.remainingFees.miscellaneous}</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-1">Annual Fee</td>
                              <td className="py-1 text-right">Rs. {item.summary.remainingFees.annual}</td>
                            </tr>
                            <tr className="font-bold text-gray-800 bg-gray-50">
                              <td className="py-1.5 px-1">Total Remaining</td>
                              <td className="py-1.5 px-1 text-right">Rs. {item.totalRemaining}</td>
                            </tr>
                          </tbody>
                        </table>
                        
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 border-b pb-1">Previous Payment</h4>
                        {item.lastReceipt ? (
                          <div className="text-sm">
                            <p><strong>Receipt #:</strong> <span className="font-mono">{item.lastReceipt.receiptNumber}</span></p>
                            <p><strong>Date:</strong> {new Date(item.lastReceipt.createdAt).toLocaleDateString()}</p>
                            <p><strong>Amount Paid:</strong> Rs. {item.lastReceipt.amountPaid}</p>
                            <p className="italic text-xs text-gray-600 mt-1">{numberToWords(item.lastReceipt.amountPaid)}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No previous payments found for this academic year.</p>
                        )}
                      </div>
                      
                      {/* Part 2: Current Month's Payable Amount */}
                      <div className="bg-gray-50 border border-gray-200 rounded p-4">
                        <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3 pb-1 border-b border-gray-300">
                          Payable for {billData.currentMonthName}
                        </h4>
                        
                        {item.currentMonthPayable === 0 ? (
                          <div className="flex items-center justify-center h-24 text-green-600 font-bold border-2 border-green-200 bg-green-50 rounded">
                            ✓ DUES CLEARED
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Current Month Tuition:</span>
                              <span className="font-mono">Rs. {item.currentMonthTuition}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Previous Unpaid Tuition:</span>
                              <span className="font-mono text-red-600">Rs. {item.previousTuitionDues}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Other Unpaid Fees:</span>
                              <span className="font-mono">Rs. {item.remainingOther}</span>
                            </div>
                            <div className="flex justify-between items-center text-lg font-black border-t-2 border-gray-800 pt-2 mt-2">
                              <span>Total Payable:</span>
                              <span>Rs. {item.currentMonthPayable}</span>
                            </div>
                            <div className="text-xs font-semibold italic text-gray-700 bg-white p-2 rounded border mt-2">
                              {numberToWords(item.currentMonthPayable)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="mt-8 bg-gray-900 text-white p-6 rounded-lg flex justify-between items-center shadow-lg">
                <div>
                  <h3 className="text-xl font-bold uppercase tracking-widest text-gray-300">Grand Total Payable</h3>
                  <p className="text-sm text-gray-400 mt-1">For all students for the month of {billData.currentMonthName}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black mb-1">Rs. {billData.grandTotal}</div>
                  <div className="text-sm italic text-gray-300">{numberToWords(billData.grandTotal)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Print styles */}
      <style>{`
        @media print {
          @page { margin: 1cm; size: A4 portrait; }
          body * {
            visibility: hidden;
            background-color: white !important;
            color: black !important;
          }
          .container * {
            visibility: visible;
          }
          .container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ParentFeeBillPage;
