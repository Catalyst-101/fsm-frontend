import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const FeeLedgerPage = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [parentFilter, setParentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [onlyDefaulters, setOnlyDefaulters] = useState(false);

  // Sorting
  const [sortBy, setSortBy] = useState('parent');
  const [sortOrder, setSortOrder] = useState('asc');

  // Accordion Expand/Collapse states
  const [collapsedParents, setCollapsedParents] = useState({});
  const [expandedStudents, setExpandedStudents] = useState({});

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
      setLedgerData(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load fee ledger.');
    } finally {
      setLoading(false);
    }
  };

  // Filter options
  const uniqueClasses = useMemo(() => [...new Set(ledgerData.map(item => item.class).filter(Boolean))], [ledgerData]);
  const uniqueSections = useMemo(() => [...new Set(ledgerData.map(item => item.section).filter(Boolean))], [ledgerData]);
  const uniqueParents = useMemo(() => {
    const map = new Map();
    ledgerData.forEach(item => {
      if (item.parentId && item.parentName) {
        map.set(item.parentId, item.parentName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [ledgerData]);

  // Overall Dashboard Metrics Calculation
  const metrics = useMemo(() => {
    const totalStudents = ledgerData.length;
    const parentSet = new Set(ledgerData.map(i => i.parentId));
    const totalParents = parentSet.size;

    let expectedFee = 0;
    let collectedFee = 0;
    let remainingFee = 0;
    let advanceBalance = 0;
    let studentsFullyPaid = 0;
    let studentsWithDue = 0;

    ledgerData.forEach(item => {
      if (!item.studentId) return; // Skip empty parent rows
      
      expectedFee += item.totalAmount || 0;
      collectedFee += item.totalPaid || 0;
      remainingFee += item.remainingBalance || 0;
      advanceBalance += item.advanceBalance || 0;

      if (item.paymentStatus === 'Fully Paid') {
        studentsFullyPaid++;
      } else if (item.paymentStatus === 'Due' || item.paymentStatus === 'Partially Paid') {
        studentsWithDue++;
      }
    });

    return {
      totalStudents,
      totalParents,
      expectedFee,
      collectedFee,
      remainingFee,
      advanceBalance,
      studentsFullyPaid,
      studentsWithDue
    };
  }, [ledgerData]);

  // Filtered & Sorted Student Data
  const filteredSortedData = useMemo(() => {
    let result = [...ledgerData];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        (item.studentName && item.studentName.toLowerCase().includes(term)) ||
        (item.admissionNo && item.admissionNo.toLowerCase().includes(term)) ||
        (item.parentName && item.parentName.toLowerCase().includes(term))
      );
    }

    // Class filter
    if (classFilter) {
      result = result.filter(item => item.class === classFilter);
    }

    // Section filter
    if (sectionFilter) {
      result = result.filter(item => item.section === sectionFilter);
    }

    // Parent filter
    if (parentFilter) {
      result = result.filter(item => item.parentId === parentFilter);
    }

    // Defaulters toggle
    if (onlyDefaulters) {
      result = result.filter(item => item.paymentStatus === 'Due' || item.paymentStatus === 'Partially Paid');
    } else if (statusFilter !== 'All') {
      if (statusFilter === 'Only Defaulters') {
        result = result.filter(item => item.paymentStatus === 'Due' || item.paymentStatus === 'Partially Paid');
      } else if (statusFilter === 'Only Fully Paid') {
        result = result.filter(item => item.paymentStatus === 'Fully Paid');
      } else if (statusFilter === 'Only Partial') {
        result = result.filter(item => item.paymentStatus === 'Partially Paid');
      } else {
        result = result.filter(item => item.paymentStatus === statusFilter);
      }
    }

    // Sorting
    result.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'parent') {
        valA = a.parentName || '';
        valB = b.parentName || '';
      } else if (sortBy === 'student') {
        valA = a.studentName || '';
        valB = b.studentName || '';
      } else if (sortBy === 'admissionNo') {
        valA = a.admissionNo || '';
        valB = b.admissionNo || '';
      } else if (sortBy === 'class') {
        valA = a.class || '';
        valB = b.class || '';
      } else if (sortBy === 'remainingBalance') {
        valA = a.remainingBalance || 0;
        valB = b.remainingBalance || 0;
      } else if (sortBy === 'lastPaymentDate') {
        valA = a.lastPaymentDate ? new Date(a.lastPaymentDate).getTime() : 0;
        valB = b.lastPaymentDate ? new Date(b.lastPaymentDate).getTime() : 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [ledgerData, searchTerm, classFilter, sectionFilter, parentFilter, statusFilter, onlyDefaulters, sortBy, sortOrder]);

  // Group by Parent
  const parentGroups = useMemo(() => {
    const groupsMap = new Map();

    filteredSortedData.forEach(item => {
      const pId = item.parentId || 'unlinked';
      if (!groupsMap.has(pId)) {
        groupsMap.set(pId, {
          parentId: pId,
          parentName: item.parentName,
          parentPhone: item.parentPhone,
          parentCnic: item.parentCnic,
          totalPaid: 0,
          totalRemaining: 0,
          totalOtherFeesRemaining: 0,
          children: []
        });
      }

      const group = groupsMap.get(pId);
      group.totalPaid += item.totalPaid || 0;
      group.totalRemaining += item.remainingBalance || 0;
      group.totalOtherFeesRemaining += item.otherFeesRemaining || 0;
      if (item.studentId) {
        group.children.push(item);
      }
    });

    return Array.from(groupsMap.values());
  }, [filteredSortedData]);

  // Extract Month Columns from first student
  const monthColumns = useMemo(() => {
    if (ledgerData.length > 0 && ledgerData[0].monthlyLedger) {
      return ledgerData[0].monthlyLedger.map(m => m.monthName);
    }
    return [];
  }, [ledgerData]);

  // Parent Collapse Toggle
  const toggleParentCollapse = (parentId) => {
    setCollapsedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }));
  };

  // Student Drawer Toggle
  const toggleStudentExpand = (assignmentId) => {
    setExpandedStudents(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
  };

  // Export CSV
  const exportLedgerToCSV = () => {
    if (filteredSortedData.length === 0) return;

    const headers = [
      'Parent Name',
      'Parent CNIC',
      'Student Name',
      'Admission No',
      'Class',
      'Section',
      'Academic Year',
      ...monthColumns,
      'Admission Rem',
      'Registration Rem',
      'Misc Rem',
      'Annual Rem',
      'Monthly Total',
      'Other Total',
      'Total Fee',
      'Total Paid',
      'Remaining Balance',
      'Advance Balance',
      'Last Payment Date',
      'Payment Status'
    ];

    const rows = filteredSortedData.map(item => {
      const months = (item.monthlyLedger || []).map(m => {
        if (m.status === 'N/A') return '-';
        if (m.status === 'Paid') return `Paid (Rs. {m.paidAmount})`;
        if (m.status === 'Partial') return `Partial (Rs. {m.paidAmount})`;
        return `Due (Rs. {m.originalAmount - m.paidAmount})`;
      });

      return [
        `"${item.parentName}"`,
        `"${item.parentCnic}"`,
        `"${item.studentName}"`,
        `"${item.admissionNo}"`,
        `"${item.class}"`,
        `"${item.section}"`,
        `"${item.academicYearName}"`,
        ...months.map(m => `"${m}"`),
        item.admissionFeeRemaining,
        item.registrationFeeRemaining,
        item.miscellaneousFeeRemaining,
        item.annualChargesRemaining,
        item.monthlyTuitionTotal,
        item.otherFeesRemaining,
        item.totalAmount,
        item.totalPaid,
        item.remainingBalance,
        item.advanceBalance,
        item.lastPaymentDate ? new Date(item.lastPaymentDate).toLocaleDateString() : 'N/A',
        `"${item.paymentStatus}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Fee_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px] space-y-6">
      {/* Header & Print Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Fee Ledger Dashboard</h1>
          <p className="text-sm text-slate-400">Database-style accountant view with parent grouping and tuition tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportLedgerToCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            📊 Export CSV / Excel
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            🖨️ Print / Save PDF
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* 11. DASHBOARD TOTALS ABOVE LEDGER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 print:hidden">
        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-indigo-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
          <p className="text-xl font-extrabold text-white mt-1">{metrics.totalStudents}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-purple-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Parents</p>
          <p className="text-xl font-extrabold text-white mt-1">{metrics.totalParents}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-blue-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Fee</p>
          <p className="text-xl font-extrabold text-white mt-1">Rs. {metrics.expectedFee}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-emerald-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collected Fee</p>
          <p className="text-xl font-extrabold text-emerald-400 mt-1">Rs. {metrics.collectedFee}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-rose-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Fee</p>
          <p className="text-xl font-extrabold text-rose-400 mt-1">Rs. {metrics.remainingFee}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-amber-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advance Balance</p>
          <p className="text-xl font-extrabold text-amber-400 mt-1">Rs. {metrics.advanceBalance}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-teal-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fully Paid</p>
          <p className="text-xl font-extrabold text-teal-300 mt-1">{metrics.studentsFullyPaid}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3.5 rounded-xl border-l-4 border-l-orange-500 shadow-md">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">With Due Amount</p>
          <p className="text-xl font-extrabold text-orange-400 mt-1">{metrics.studentsWithDue}</p>
        </div>
      </div>

      {/* 8. FILTERING BAR */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-xl space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
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
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Multi-Search</label>
            <input
              type="text"
              placeholder="Student / Adm No / Parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Parent</label>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Parents</option>
              {uniqueParents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Class Filter</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Section</label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Sections</option>
              {uniqueSections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Only Defaulters">Only Defaulters (Due/Partial)</option>
              <option value="Only Fully Paid">Only Fully Paid</option>
              <option value="Only Partial">Only Partial</option>
              <option value="Due">Due Only</option>
              <option value="Advance">Advance Only</option>
            </select>
          </div>
        </div>

        {/* 9. SORTING & QUICK TOGGLES */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-700/60">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-amber-400 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyDefaulters}
                onChange={(e) => setOnlyDefaulters(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
              />
              ⚠️ Only Show Defaulters (Pending Balance)
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold uppercase tracking-wider text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              <option value="parent">Parent Name</option>
              <option value="student">Student Name</option>
              <option value="admissionNo">Admission No</option>
              <option value="class">Class</option>
              <option value="remainingBalance">Remaining Balance</option>
              <option value="lastPaymentDate">Last Payment Date</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-white transition-all cursor-pointer"
            >
              {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>
        </div>
      </div>

      {/* DATABASE-STYLE ACCOUNTANT TABLE WITH PARENT GROUPING */}
      {loading ? (
        <div className="p-8 text-center text-slate-400 text-sm">Loading fee ledger data...</div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden print:border-none print:shadow-none printable-ledger" id="ledger-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 uppercase font-bold text-[10px] tracking-wider border-b border-slate-700">
                  <th className="py-3 px-3 text-center w-8">History</th>
                  <th className="py-3 px-3">Adm No</th>
                  <th className="py-3 px-3">Roll No</th>
                  <th className="py-3 px-3 font-extrabold text-white">Student Name</th>
                  <th className="py-3 px-3">Parent Name</th>
                  <th className="py-3 px-3 text-center">Class</th>
                  <th className="py-3 px-3 text-center">Sec</th>
                  <th className="py-3 px-3 text-center">AY</th>

                  {/* 3. MONTHLY TUITION COLUMNS */}
                  {monthColumns.map(m => (
                    <th key={m} className="py-3 px-2 text-center border-l border-slate-700 bg-slate-900/80">{m}</th>
                  ))}

                  {/* 4. SEPARATE OTHER FEE REMAINING COLUMNS */}
                  <th className="py-3 px-2 text-right border-l border-slate-700 text-rose-300">Adm Fee Rem</th>
                  <th className="py-3 px-2 text-right text-rose-300">Reg Fee Rem</th>
                  <th className="py-3 px-2 text-right text-rose-300">Misc Rem</th>
                  <th className="py-3 px-2 text-right text-rose-300">Annual Rem</th>

                  {/* 5. SUMMARY COLUMNS */}
                  <th className="py-3 px-3 text-right border-l border-slate-700 font-bold">Tuition Total</th>
                  <th className="py-3 px-3 text-right font-bold text-rose-300">Other Rem Total</th>
                  <th className="py-3 px-3 text-right font-bold text-indigo-300">Grand Total</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-400">Total Paid</th>
                  <th className="py-3 px-3 text-right font-bold text-rose-400">Rem Balance</th>
                  <th className="py-3 px-3 text-right font-bold text-amber-400">Advance</th>
                  <th className="py-3 px-3 text-center">Last Paid Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700/60 text-slate-200">
                {parentGroups.length === 0 ? (
                  <tr>
                    <td colSpan={19 + monthColumns.length} className="py-12 text-center text-slate-500 text-base">
                      No matching student ledger records found for this academic year and filter selection.
                    </td>
                  </tr>
                ) : (
                  parentGroups.map((group) => {
                    const isCollapsed = collapsedParents[group.parentId];
                    return (
                      <React.Fragment key={group.parentId}>
                        {/* 1. GROUP BY PARENT ROW */}
                        <tr className="bg-indigo-950/70 border-y-2 border-indigo-500/40 text-xs font-bold text-white hover:bg-indigo-900/60 transition-colors">
                          <td colSpan={8} className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleParentCollapse(group.parentId)}
                                className="w-5 h-5 rounded bg-indigo-800 hover:bg-indigo-700 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                                title="Expand / Collapse Parent"
                              >
                                {isCollapsed ? '+' : '−'}
                              </button>
                              <div>
                                <span className="text-indigo-300 text-sm font-extrabold">{group.parentName}</span>
                                <span className="ml-3 text-[11px] text-slate-400 font-normal">
                                  CNIC: <span className="font-mono text-slate-300">{group.parentCnic}</span> | Phone: {group.parentPhone} | Children: <span className="font-bold text-indigo-200">{group.children.length}</span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Empty Month Cells spanning length */}
                          <td colSpan={monthColumns.length + 4} className="py-3 px-2 border-l border-slate-700 text-right text-[11px] text-indigo-300 font-semibold italic">
                            Parent Totals →
                          </td>

                          <td colSpan={3} className="py-3 px-3 text-right text-emerald-300 font-extrabold border-l border-slate-700">
                            Paid: Rs. {group.totalPaid}
                          </td>
                          <td colSpan={2} className="py-3 px-3 text-right text-rose-300 font-extrabold">
                            Rem: Rs. {group.totalRemaining}
                          </td>
                          <td colSpan={2} className="py-3 px-3 text-center text-slate-400 text-[10px]">
                            Other Rem: Rs. {group.totalOtherFeesRemaining}
                          </td>
                        </tr>

                        {/* STUDENT ROWS UNDER THIS PARENT */}
                        {!isCollapsed &&
                          group.children.map((student) => {
                            const isExpanded = expandedStudents[student.assignmentId];
                            return (
                              <React.Fragment key={student.assignmentId}>
                                <tr className="hover:bg-slate-700/40 transition-colors border-b border-slate-700/50">
                                  {/* 7. ROW EXPANSION TOGGLE */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      onClick={() => toggleStudentExpand(student.assignmentId)}
                                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${
                                        isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                      }`}
                                      title="Toggle Payment Receipt History"
                                    >
                                      {isExpanded ? '▲' : '▼'}
                                    </button>
                                  </td>

                                  {/* 2. STUDENT INFORMATION COLUMNS */}
                                  <td className="py-2.5 px-3 font-mono text-slate-300">{student.admissionNo}</td>
                                  <td className="py-2.5 px-3 font-mono text-slate-400">{student.rollNumber}</td>
                                  <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">{student.studentName}</td>
                                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{student.parentName}</td>
                                  <td className="py-2.5 px-3 text-center font-semibold">{student.class}</td>
                                  <td className="py-2.5 px-3 text-center text-slate-400">{student.section || '-'}</td>
                                  <td className="py-2.5 px-3 text-center text-slate-400 whitespace-nowrap">{student.academicYearName}</td>

                                  {/* 3. MONTHLY TUITION STATUS COLUMNS */}
                                  {(student.monthlyLedger || []).map((m, idx) => {
                                    let cellContent = '-';
                                    let badgeStyle = 'text-slate-500';

                                    if (m.status === 'Paid') {
                                      cellContent = `$${m.paidAmount} ✓`;
                                      badgeStyle = 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30';
                                    } else if (m.status === 'Partial') {
                                      cellContent = `$${m.paidAmount} (Partial)`;
                                      badgeStyle = 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30';
                                    } else if (m.status === 'Unpaid') {
                                      cellContent = 'Due';
                                      badgeStyle = 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30';
                                    }

                                    return (
                                      <td key={idx} className="py-2.5 px-2 text-center border-l border-slate-700/60 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] inline-block ${badgeStyle}`}>
                                          {cellContent}
                                        </span>
                                      </td>
                                    );
                                  })}

                                  {/* 4. OTHER FEE REMAINING COLUMNS */}
                                  <td className="py-2.5 px-2 text-right border-l border-slate-700/60 text-slate-300 font-mono">
                                    ${student.admissionFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-slate-300 font-mono">
                                    ${student.registrationFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-slate-300 font-mono">
                                    ${student.miscellaneousFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-slate-300 font-mono">
                                    ${student.annualChargesRemaining}
                                  </td>

                                  {/* 5. SUMMARY COLUMNS */}
                                  <td className="py-2.5 px-3 text-right border-l border-slate-700/60 font-semibold text-slate-200">Rs. {student.monthlyTuitionTotal}</td>
                                  <td className="py-2.5 px-3 text-right font-semibold text-rose-300">Rs. {student.otherFeesRemaining}</td>
                                  <td className="py-2.5 px-3 text-right font-bold text-indigo-300">Rs. {student.totalAmount}</td>
                                  <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">Rs. {student.totalPaid}</td>
                                  <td className="py-2.5 px-3 text-right font-extrabold text-rose-400">Rs. {student.remainingBalance}</td>
                                  <td className="py-2.5 px-3 text-right font-extrabold text-amber-400">Rs. {student.advanceBalance}</td>

                                  <td className="py-2.5 px-3 text-center text-[10px] text-slate-400 whitespace-nowrap">
                                    {student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : 'N/A'}
                                  </td>

                                  {/* 6. PAYMENT STATUS BADGE */}
                                  <td className="py-2.5 px-3 text-center">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider inline-block ${
                                        student.paymentStatus === 'Fully Paid'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : student.paymentStatus === 'Partially Paid'
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                          : student.paymentStatus === 'Advance'
                                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      }`}
                                    >
                                      {student.paymentStatus}
                                    </span>
                                  </td>
                                </tr>

                                {/* 7. ROW EXPANSION DRAWER (RECEIPT PAYMENT HISTORY) */}
                                {isExpanded && (
                                  <tr className="bg-slate-900/90 border-b border-indigo-500/30">
                                    <td colSpan={19 + monthColumns.length} className="p-4">
                                      <div className="bg-slate-950 border border-slate-700/80 rounded-xl p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                                            Payment Receipt History for {student.studentName} ({student.class})
                                          </h4>
                                          <span className="text-[10px] text-slate-400">Total Receipts: {student.receipts.length}</span>
                                        </div>

                                        {student.receipts.length === 0 ? (
                                          <p className="text-xs text-slate-500 italic py-2">No payment receipts recorded for this academic year.</p>
                                        ) : (
                                          <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                              <tr className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                                                <th className="py-2 px-3">Receipt No</th>
                                                <th className="py-2 px-3">Receipt Date</th>
                                                <th className="py-2 px-3 text-right">Amount Paid</th>
                                                <th className="py-2 px-3 text-center">Payment Method</th>
                                                <th className="py-2 px-3 text-right">Remaining Balance After Receipt</th>
                                                <th className="py-2 px-3 text-right">Actions</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                              {student.receipts.map((rec) => (
                                                <tr key={rec._id} className="hover:bg-slate-800/50">
                                                  <td className="py-2 px-3 font-mono font-bold text-indigo-300">{rec.receiptNumber}</td>
                                                  <td className="py-2 px-3 text-slate-400">{new Date(rec.createdAt).toLocaleString()}</td>
                                                  <td className="py-2 px-3 text-right font-bold text-emerald-400">Rs. {rec.amountPaid}</td>
                                                  <td className="py-2 px-3 text-center text-slate-400">{rec.paymentMethod}</td>
                                                  <td className="py-2 px-3 text-right font-semibold text-rose-300">Rs. {rec.remainingBalance}</td>
                                                  <td className="py-2 px-3 text-right space-x-2">
                                                    <Link
                                                      to={`/receipt/${rec._id}`}
                                                      className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded text-[10px] font-semibold transition-all inline-block"
                                                    >
                                                      Print Receipt
                                                    </Link>
                                                    <Link
                                                      to={`/receipt/${rec._id}`}
                                                      className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-semibold transition-all inline-block"
                                                    >
                                                      Download PDF
                                                    </Link>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT STYLES FOR LEDGER EXPORT */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-ledger, .printable-ledger * {
            visibility: visible;
          }
          .printable-ledger {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            background: white !important;
            color: black !important;
          }
          .printable-ledger table {
            color: black !important;
          }
          .printable-ledger th, .printable-ledger td {
            border-color: #ccc !important;
            color: black !important;
          }
          @page { size: landscape; margin: 8mm; }
        }
      `}</style>
    </div>
  );
};

export default FeeLedgerPage;
