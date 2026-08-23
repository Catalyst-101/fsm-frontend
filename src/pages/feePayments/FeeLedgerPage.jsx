import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import * as XLSX from 'xlsx';

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
    const totalStudents = ledgerData.filter(i => i.studentId).length;
    const parentSet = new Set(ledgerData.map(i => i.parentId));
    const totalParents = parentSet.size;

    let expectedFee = 0;
    let collectedFee = 0;
    let remainingFee = 0;
    let studentsFullyPaid = 0;
    let studentsWithDue = 0;

    ledgerData.forEach(item => {
      if (!item.studentId) return; // Skip empty parent rows

      expectedFee += item.totalAmount || 0;
      collectedFee += item.totalPaid || 0;
      remainingFee += item.remainingBalance || 0;

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

  // Export Excel
  const handleExportExcel = () => {
    if (filteredSortedData.length === 0) return;

    const exportData = filteredSortedData.map(item => {
      const row = {
        'Parent Name': item.parentName || '',
        'Parent CNIC': item.parentCnic || '',
        'Student Name': item.studentName || '',
        'Admission No': item.admissionNo || '',
        'Class': item.class || '',
        'Section': item.section || '',
        'Academic Year': item.academicYearName || '',
      };

      (item.monthlyLedger || []).forEach(m => {
        let statusStr = '-';
        if (m.status === 'Paid') statusStr = `Paid (Rs. ${m.paidAmount})`;
        else if (m.status === 'Partial') statusStr = `Partial (Rs. ${m.paidAmount})`;
        else if (m.status !== 'N/A') statusStr = `Due (Rs. ${m.originalAmount - m.paidAmount})`;
        row[m.monthName] = statusStr;
      });

      row['Admission Rem'] = item.admissionFeeRemaining || 0;
      row['Registration Rem'] = item.registrationFeeRemaining || 0;
      row['Security Rem'] = item.securityFeeRemaining || 0;
      row['Misc Rem'] = item.miscellaneousFeeRemaining || 0;
      row['Annual Rem'] = item.annualChargesRemaining || 0;
      row['Books Rem'] = item.booksAndStationeryFeeRemaining || 0;
      row['Transport Rem'] = item.transportFeeRemaining || 0;
      row['Monthly Total'] = item.monthlyTuitionTotal || 0;
      row['Other Total'] = item.otherFeesRemaining || 0;
      row['Total Fee'] = item.totalAmount || 0;
      row['Total Paid'] = item.totalPaid || 0;
      row['Remaining Balance'] = item.remainingBalance || 0;
      row['Last Payment Date'] = item.lastPaymentDate ? new Date(item.lastPaymentDate).toLocaleDateString() : 'N/A';
      row['Payment Status'] = item.paymentStatus || '';
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fee Ledger");
    XLSX.writeFile(wb, `Fee_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1600px] space-y-6 text-gray-800">
      {/* Header & Print Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">Fee Ledger Dashboard</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Database-style accountant view with parent grouping and tuition tracking</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleExportExcel} variant="secondary" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Excel
          </Button>

          <Button onClick={handlePrint} variant="primary" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">print</span> Print / Save PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm font-medium flex items-start gap-2">
           <span className="material-symbols-outlined text-[20px]">error</span>
           <span>{error}</span>
        </div>
      )}

      {/* DASHBOARD TOTALS ABOVE LEDGER */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 print:hidden">
        <div className="bg-white border border-gray-200 p-4 rounded-xl border-l-4 border-l-blue-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Students</p>
          <p className="text-xl font-black text-blue-600">{metrics.totalStudents}</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl border-l-4 border-l-[var(--color-primary)] shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Parents</p>
          <p className="text-xl font-black text-[var(--color-primary)]">{metrics.totalParents}</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl border-l-4 border-l-purple-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Expected Fee</p>
          <p className="text-xl font-black text-purple-600">Rs. {metrics.expectedFee}</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl border-l-4 border-l-emerald-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Collected Fee</p>
          <p className="text-xl font-black text-emerald-600">Rs. {metrics.collectedFee}</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl border-l-4 border-l-red-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Remaining Fee</p>
          <p className="text-xl font-black text-red-600">Rs. {metrics.remainingFee}</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl border-l-4 border-l-teal-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Fully Paid</p>
          <p className="text-xl font-black text-teal-600">{metrics.studentsFullyPaid}</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-xl border-l-4 border-l-orange-500 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">With Due Amount</p>
          <p className="text-xl font-black text-orange-600">{metrics.studentsWithDue}</p>
        </div>
      </div>

      {/* FILTERING BAR */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Academic Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
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
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Multi-Search</label>
            <input
              type="text"
              placeholder="Student / Adm No / Parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Parent</label>
            <select
              value={parentFilter}
              onChange={(e) => setParentFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
            >
              <option value="">All Parents</option>
              {uniqueParents.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Class Filter</label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
            >
              <option value="">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Section</label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
            >
              <option value="">All Sections</option>
              {uniqueSections.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 font-medium focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
            >
              <option value="All">All Statuses</option>
              <option value="Only Defaulters">Only Defaulters (Due/Partial)</option>
              <option value="Only Fully Paid">Only Fully Paid</option>
              <option value="Only Partial">Only Partial</option>
              <option value="Due">Due Only</option>
            </select>
          </div>
        </div>

        {/* SORTING & QUICK TOGGLES */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 mt-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold text-[var(--color-accent)] cursor-pointer bg-orange-50 px-3 py-1.5 rounded border border-orange-200 hover:bg-orange-100 transition-colors">
              <input
                type="checkbox"
                checked={onlyDefaulters}
                onChange={(e) => setOnlyDefaulters(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 border-orange-300 cursor-pointer"
              />
              <span className="material-symbols-outlined text-[16px]">warning</span> Only Show Defaulters
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-bold uppercase tracking-wider text-gray-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs text-gray-700 font-semibold focus:outline-none focus:border-[var(--color-secondary)]"
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
              className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold text-gray-700 transition-all cursor-pointer flex items-center gap-1"
            >
               {sortOrder === 'asc' ? <><span className="material-symbols-outlined text-[14px]">arrow_upward</span> ASC</> : <><span className="material-symbols-outlined text-[14px]">arrow_downward</span> DESC</>}
            </button>
          </div>
        </div>
      </div>

      {/* DATABASE-STYLE ACCOUNTANT TABLE WITH PARENT GROUPING */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium bg-white rounded-xl shadow-sm border border-gray-200">
          <span className="material-symbols-outlined animate-spin align-middle mr-2">refresh</span> Loading fee ledger data...
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none print-scale-down printable-ledger" id="ledger-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase font-black text-[10px] tracking-wider border-b-2 border-gray-200">
                  <th className="py-3 px-3 text-center w-8">Hist</th>
                  <th className="py-3 px-3 text-center">Student ID</th>
                  <th className="py-3 px-3 font-black text-gray-800">Student Name</th>
                  <th className="py-3 px-3">Parent Name</th>
                  <th className="py-3 px-3 text-center">Class</th>
                  <th className="py-3 px-3 text-center">Sec</th>
                  <th className="py-3 px-3 text-center">AY</th>

                  {/* MONTHLY TUITION COLUMNS */}
                  {monthColumns.map(m => (
                    <th key={m} className="py-3 px-2 text-center border-l border-gray-200 bg-blue-50/50 text-[var(--color-primary)]">{m}</th>
                  ))}

                  {/* SEPARATE OTHER FEE REMAINING COLUMNS */}
                  <th className="py-3 px-2 text-right border-l border-gray-200 text-red-700">Adm Rem</th>
                  <th className="py-3 px-2 text-right text-red-700">Reg Rem</th>
                  <th className="py-3 px-2 text-right text-red-700">Sec Rem</th>
                  <th className="py-3 px-2 text-right text-red-700">Misc Rem</th>
                  <th className="py-3 px-2 text-right text-red-700">Ann Rem</th>
                  <th className="py-3 px-2 text-right text-red-700">Books Rem</th>
                  <th className="py-3 px-2 text-right text-red-700">Trans Rem</th>

                  {/* SUMMARY COLUMNS */}
                  <th className="py-3 px-3 text-right border-l border-gray-200 font-black">Tuition Total</th>
                  <th className="py-3 px-3 text-right font-black text-red-700">Other Rem</th>
                  <th className="py-3 px-3 text-right font-black text-[var(--color-primary)]">Grand Total</th>
                  <th className="py-3 px-3 text-right font-black text-emerald-700">Total Paid</th>
                  <th className="py-3 px-3 text-right font-black text-red-600 bg-red-50">Rem Balance</th>
                  <th className="py-3 px-3 text-center">Last Paid Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-gray-700">
                {parentGroups.length === 0 ? (
                  <tr>
                    <td colSpan={21 + monthColumns.length} className="py-12 text-center text-gray-500 text-base font-medium">
                      No matching student ledger records found.
                    </td>
                  </tr>
                ) : (
                  parentGroups.map((group) => {
                    const isCollapsed = collapsedParents[group.parentId];
                    return (
                      <React.Fragment key={group.parentId}>
                        {/* 1. GROUP BY PARENT ROW */}
                        <tr className="bg-[var(--color-primary)] border-y-[3px] border-[var(--color-secondary)] text-xs font-bold text-white hover:bg-[var(--color-secondary)] transition-colors">
                          <td colSpan={8} className="py-2.5 px-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleParentCollapse(group.parentId)}
                                className="w-5 h-5 rounded bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                                title="Expand / Collapse Parent"
                              >
                                <span className="material-symbols-outlined text-[16px]">{isCollapsed ? 'add' : 'remove'}</span>
                              </button>
                              <div>
                                <span className="text-white text-sm font-black uppercase tracking-wider">{group.parentName}</span>
                                <span className="ml-3 text-[11px] text-blue-200 font-normal">
                                  CNIC: <span className="font-mono text-white">{group.parentCnic}</span> | Phone: {group.parentPhone} | Children: <span className="font-black text-[var(--color-accent)]">{group.children.length}</span>
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Empty Month Cells spanning length */}
                          <td colSpan={monthColumns.length + 7} className="py-2.5 px-2 border-l border-white/20 text-right text-[11px] text-blue-200 font-semibold italic">
                            Parent Totals →
                          </td>

                          <td colSpan={3} className="py-2.5 px-3 text-right text-emerald-300 font-black border-l border-white/20">
                            Paid: Rs. {group.totalPaid}
                          </td>
                          <td colSpan={2} className="py-2.5 px-3 text-right text-red-300 font-black">
                            Rem: Rs. {group.totalRemaining}
                          </td>
                          <td colSpan={1} className="py-2.5 px-3 text-center text-blue-200 text-[10px]">
                            Other Rem: Rs. {group.totalOtherFeesRemaining}
                          </td>
                        </tr>

                        {/* STUDENT ROWS UNDER THIS PARENT */}
                        {!isCollapsed &&
                          group.children.map((student) => {
                            const isExpanded = expandedStudents[student.assignmentId];
                            return (
                              <React.Fragment key={student.assignmentId}>
                                <tr className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${isExpanded ? 'bg-blue-50/30' : ''}`}>
                                  {/* ROW EXPANSION TOGGLE */}
                                  <td className="py-2.5 px-3 text-center">
                                    <button
                                      onClick={() => toggleStudentExpand(student.assignmentId)}
                                      className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${isExpanded ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                                        }`}
                                      title="Toggle Payment Receipt History"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                                    </button>
                                  </td>

                                  {/* STUDENT INFORMATION COLUMNS */}
                                  <td className="py-2.5 px-3 font-mono text-gray-500 font-semibold">{student.studentId}</td>
                                  <td className="py-2.5 px-3 font-black text-[var(--color-primary)] whitespace-nowrap">{student.studentName}</td>
                                  <td className="py-2.5 px-3 text-gray-600 whitespace-nowrap font-medium">{student.parentName}</td>
                                  <td className="py-2.5 px-3 text-center font-bold text-gray-800">{student.class}</td>
                                  <td className="py-2.5 px-3 text-center text-gray-500 font-medium">{student.section || '-'}</td>
                                  <td className="py-2.5 px-3 text-center text-gray-500 whitespace-nowrap font-medium">{student.academicYearName}</td>

                                  {/* MONTHLY TUITION STATUS COLUMNS */}
                                  {(student.monthlyLedger || []).map((m, idx) => {
                                    let cellContent = '-';
                                    let badgeStyle = 'text-gray-400 font-medium';

                                    if (m.status === 'Paid') {
                                      cellContent = `Rs.${m.paidAmount} ✓`;
                                      badgeStyle = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200';
                                    } else if (m.status === 'Partial') {
                                      cellContent = `Rs.${m.paidAmount} (P)`;
                                      badgeStyle = 'bg-amber-100 text-amber-800 font-bold border border-amber-200';
                                    } else if (m.status === 'Unpaid') {
                                      cellContent = 'Due';
                                      badgeStyle = 'bg-red-100 text-red-800 font-bold border border-red-200';
                                    }

                                    return (
                                      <td key={idx} className="py-2 px-1 text-center border-l border-gray-100 whitespace-nowrap">
                                        <span className={`px-1.5 py-0.5 rounded-[3px] text-[9px] inline-block w-full ${badgeStyle}`}>
                                          {cellContent}
                                        </span>
                                      </td>
                                    );
                                  })}

                                  {/* OTHER FEE REMAINING COLUMNS */}
                                  <td className="py-2.5 px-2 text-right border-l border-gray-200 text-gray-600 font-mono font-medium">
                                    {student.admissionFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-600 font-mono font-medium">
                                    {student.registrationFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-600 font-mono font-medium">
                                    {student.securityFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-600 font-mono font-medium">
                                    {student.miscellaneousFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-600 font-mono font-medium">
                                    {student.annualChargesRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-600 font-mono font-medium">
                                    {student.booksAndStationeryFeeRemaining}
                                  </td>
                                  <td className="py-2.5 px-2 text-right text-gray-600 font-mono font-medium">
                                    {student.transportFeeRemaining}
                                  </td>

                                  {/* SUMMARY COLUMNS */}
                                  <td className="py-2.5 px-3 text-right border-l border-gray-200 font-black text-gray-700">{student.monthlyTuitionTotal}</td>
                                  <td className="py-2.5 px-3 text-right font-black text-red-700">{student.otherFeesRemaining}</td>
                                  <td className="py-2.5 px-3 text-right font-black text-[var(--color-primary)]">{student.totalAmount}</td>
                                  <td className="py-2.5 px-3 text-right font-black text-emerald-600 bg-emerald-50/50">{student.totalPaid}</td>
                                  <td className="py-2.5 px-3 text-right font-black text-red-600 bg-red-50/80">{student.remainingBalance}</td>

                                  <td className="py-2.5 px-3 text-center text-[10px] text-gray-500 font-medium whitespace-nowrap">
                                    {student.lastPaymentDate ? new Date(student.lastPaymentDate).toLocaleDateString() : 'N/A'}
                                  </td>

                                  {/* PAYMENT STATUS BADGE */}
                                  <td className="py-2.5 px-3 text-center">
                                    <span
                                      className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider inline-block ${student.paymentStatus === 'Fully Paid'
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : student.paymentStatus === 'Partially Paid'
                                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                            : student.paymentStatus === 'Advance'
                                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                              : 'bg-red-100 text-red-800 border border-red-200 shadow-sm'
                                        }`}
                                    >
                                      {student.paymentStatus}
                                    </span>
                                  </td>
                                </tr>

                                {/* ROW EXPANSION DRAWER (RECEIPT PAYMENT HISTORY) */}
                                {isExpanded && (
                                  <tr className="bg-gray-100 border-b-2 border-[var(--color-primary)] shadow-inner">
                                    <td colSpan={21 + monthColumns.length} className="p-4">
                                      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4 className="text-xs font-black text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                                            Payment Receipt History for {student.studentName}
                                          </h4>
                                          <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">Total Receipts: {student.receipts.length}</span>
                                        </div>

                                        {student.receipts.length === 0 ? (
                                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider italic py-4 text-center border-2 border-dashed border-gray-200 rounded">No payment receipts recorded</p>
                                        ) : (
                                          <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                              <tr className="bg-gray-50 text-gray-500 uppercase text-[9px] font-black border-b border-gray-200 tracking-wider">
                                                <th className="py-2 px-3">Receipt No</th>
                                                <th className="py-2 px-3">Receipt Date</th>
                                                <th className="py-2 px-3 text-right">Amount Paid</th>
                                                <th className="py-2 px-3 text-center">Payment Method</th>
                                                <th className="py-2 px-3 text-right">Remaining Balance After</th>
                                                <th className="py-2 px-3 text-right">Actions</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                              {student.receipts.map((rec) => (
                                                <tr key={rec._id} className="hover:bg-blue-50/50">
                                                  <td className="py-2 px-3 font-mono font-bold text-[var(--color-primary)]">{rec.receiptNumber}</td>
                                                  <td className="py-2 px-3 font-medium text-gray-600">{new Date(rec.createdAt).toLocaleString()}</td>
                                                  <td className="py-2 px-3 text-right font-black text-emerald-600">Rs. {rec.amountPaid}</td>
                                                  <td className="py-2 px-3 text-center font-medium text-gray-500">{rec.paymentMethod}</td>
                                                  <td className="py-2 px-3 text-right font-bold text-red-500">Rs. {rec.remainingBalance}</td>
                                                  <td className="py-2 px-3 text-right">
                                                    <Link
                                                      to={`/receipt/${rec._id}`}
                                                      className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] font-bold text-[10px] uppercase tracking-wider flex items-center justify-end gap-1 transition-colors"
                                                    >
                                                       <span className="material-symbols-outlined text-[14px]">visibility</span> View
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
            background-color: white !important;
            color: black !important;
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
