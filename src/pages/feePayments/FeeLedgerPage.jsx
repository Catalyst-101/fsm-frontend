import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

const FeeLedgerPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchLedger();
    } else {
      setLedgerData([]);
    }
    // eslint-disable-next-line
  }, [selectedYear]);

  const fetchInitialData = async () => {
    try {
      const yearRes = await api.get('/academic-years');
      const fetchedYears = Array.isArray(yearRes.data?.data) ? yearRes.data.data : yearRes.data?.data?.docs || [];
      setAcademicYears(fetchedYears);
      
      const current = fetchedYears.find(y => y.is_current);
      if (current) setSelectedYear(current._id);
    } catch (err) {
      console.error(err);
      setError('Failed to load initial data.');
    }
  };

  const fetchLedger = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/fee-payments/ledger?academicYearId=${selectedYear}`);
      setLedgerData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load fee ledger.');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique classes for filter dropdown
  const uniqueClasses = [...new Set(ledgerData.map(item => item.class))];

  // Apply filters
  const filteredData = ledgerData.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter ? item.class === classFilter : true;
    return matchesSearch && matchesClass;
  });

  // Extract dynamic month columns from the first valid ledger row
  let monthColumns = [];
  if (ledgerData.length > 0 && ledgerData[0].monthlyLedger) {
    monthColumns = ledgerData[0].monthlyLedger.map(m => m.monthName);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Fee Ledger</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Search</label>
            <input
              type="text"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
              placeholder="Student / Parent / Admission No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Class Filter</label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700 dark:bg-gray-700 dark:text-white"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading ledger data...</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
          <table className="min-w-max w-full table-auto">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 uppercase text-xs leading-normal">
                <th className="py-3 px-4 text-left font-bold border-b border-gray-200 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-900 z-10">Adm No</th>
                <th className="py-3 px-4 text-left font-bold border-b border-gray-200 dark:border-gray-700 sticky left-[80px] bg-gray-100 dark:bg-gray-900 z-10">Student</th>
                <th className="py-3 px-4 text-left font-bold border-b border-gray-200 dark:border-gray-700">Parent</th>
                <th className="py-3 px-4 text-center font-bold border-b border-gray-200 dark:border-gray-700">Class</th>
                <th className="py-3 px-4 text-center font-bold border-b border-gray-200 dark:border-gray-700">Other Fees (Rem)</th>
                
                {/* Dynamic Month Columns */}
                {monthColumns.map(m => (
                  <th key={m} className="py-3 px-2 text-center font-bold border-b border-gray-200 dark:border-gray-700 border-l">{m}</th>
                ))}
                
                <th className="py-3 px-4 text-right font-bold border-b border-gray-200 dark:border-gray-700 border-l border-gray-300">Total Paid</th>
                <th className="py-3 px-4 text-right font-bold border-b border-gray-200 dark:border-gray-700">Rem Balance</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300 text-sm font-light">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={10 + monthColumns.length} className="py-8 text-center text-gray-500 text-lg">
                    No ledger records found for this selection.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.assignmentId} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/80'}`}>
                    <td className="py-3 px-4 text-left whitespace-nowrap sticky left-0 bg-inherit z-10 font-mono">
                      {item.admissionNo}
                    </td>
                    <td className="py-3 px-4 text-left sticky left-[80px] bg-inherit z-10 font-bold">
                      {item.studentName}
                    </td>
                    <td className="py-3 px-4 text-left">
                      {item.parentName}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.class} {item.section !== 'N/A' ? `(${item.section})` : ''}
                    </td>
                    <td className="py-3 px-4 text-center text-red-500 font-semibold">
                      ${item.otherFeesRemaining}
                    </td>
                    
                    {/* Monthly Ledger Statuses */}
                    {(item.monthlyLedger || []).map((m, idx) => {
                      let cellClass = "py-3 px-2 text-center border-l text-xs font-bold whitespace-nowrap ";
                      let content = "";
                      
                      if (m.status === 'N/A') {
                        cellClass += "bg-gray-100 dark:bg-gray-700 text-gray-400";
                        content = "-";
                      } else if (m.status === 'Paid') {
                        cellClass += "bg-green-100 dark:bg-green-900/40 text-green-700";
                        content = `$${m.paidAmount}`;
                      } else if (m.status === 'Partial') {
                        cellClass += "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700";
                        content = `Partial ($${m.paidAmount})`;
                      } else {
                        cellClass += "bg-red-50 dark:bg-red-900/20 text-red-600";
                        content = "Due";
                      }

                      return (
                        <td key={idx} className={cellClass}>
                          {content}
                        </td>
                      );
                    })}
                    
                    <td className="py-3 px-4 text-right font-bold text-green-600 border-l border-gray-300 dark:border-gray-600">
                      ${item.totalPaid}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-red-600">
                      ${item.remainingBalance}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeLedgerPage;
