import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Button from '../components/ui/Button';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedYear || academicYears.length > 0) {
      fetchStats();
    }
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
      setError('Failed to load academic years');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const endpoint = selectedYear ? `/dashboard/stats?academicYearId=${selectedYear}` : '/dashboard/stats';
      const res = await api.get(endpoint);
      setStats(res.data.data);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const endpoint = selectedYear ? `/dashboard/export-fee-data?academicYearId=${selectedYear}` : '/dashboard/export-fee-data';
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'fee-data.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  if (loading && !stats) return <div className="p-8 text-center text-gray-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin">refresh</span> Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-medium flex items-center justify-center gap-2"><span className="material-symbols-outlined">error</span> {error}</div>;

  return (
    <div>
      {/* Greeting & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 mt-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Welcome back, {user?.name}!</h2>
          <p className="text-gray-600 font-medium">Here's your financial overview for the current academic year.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] min-w-[200px] shadow-sm font-medium"
          >
            <option value="">-- Select Academic Year --</option>
            {academicYears.map(y => (
              <option key={y._id} value={y._id}>
                {y.name} {y.is_current ? '(Current)' : ''}
              </option>
            ))}
          </select>
          
          <Link to="/fee-payment">
            <Button variant="primary" className="shadow-sm hover:shadow-md">
              <span className="material-symbols-outlined text-sm">receipt_long</span> Receive Payment
            </Button>
          </Link>

          {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
            <Button variant="secondary" onClick={handleExportExcel} className="shadow-sm hover:shadow-md">
              <span className="material-symbols-outlined text-sm">download</span> Export Excel
            </Button>
          )}
        </div>
      </div>

      {!stats ? (
        <div className="bg-white rounded-xl p-8 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] text-center text-gray-500 border border-gray-200">
          <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">calendar_today</span>
          <p>No active academic year found or data unavailable.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Financial Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] border-t-4 border-[var(--color-accent)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Expected Tuition (AY)</span>
              <span className="material-symbols-outlined text-gray-400">account_balance</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-accent)]">
              Rs. {stats.expectedTuition || 0}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] border-t-4 border-[var(--color-accent)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Collected Tuition (AY)</span>
              <span className="material-symbols-outlined text-gray-400">savings</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-accent)]">
              Rs. {stats.collectedTuition || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] border-t-4 border-[var(--color-accent)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Remaining Tuition (AY)</span>
              <span className="material-symbols-outlined text-gray-400">pending_actions</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-accent)]">
              Rs. {stats.remainingTuition || 0}
            </div>
          </div>

          {/* Highlight Card */}
          <div className="bg-[var(--color-primary)] rounded-xl p-6 shadow-md flex flex-col justify-between md:col-span-2 lg:col-span-1 xl:col-span-1 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
            </div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <span className="text-gray-300 text-xs font-bold uppercase tracking-wider">Total Outstanding</span>
              </div>
              <div className="text-3xl font-bold text-white">
                Rs. {stats.totalOutstanding || 0}
              </div>
            </div>
          </div>

          {/* Time-based Metrics */}
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] border-t-4 border-[var(--color-accent)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Collected This Month</span>
              <span className="material-symbols-outlined text-gray-400">event_note</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-accent)]">
              Rs. {stats.collectedThisMonth || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] border-t-4 border-[var(--color-accent)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Today's Collection</span>
              <span className="material-symbols-outlined text-gray-400">today</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-accent)]">
              Rs. {stats.todayCollection || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] border-t-4 border-[var(--color-primary)] flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Students Paid (Month)</span>
              <span className="material-symbols-outlined text-gray-400">how_to_reg</span>
            </div>
            <div className="text-3xl font-bold text-[var(--color-primary)]">
              {stats.studentsPaidThisMonth || 0}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] border-t-4 border-red-500 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Students Pending</span>
              <span className="material-symbols-outlined text-gray-400">person_alert</span>
            </div>
            <div className="text-3xl font-bold text-red-500">
              {stats.studentsPending || 0}
            </div>
          </div>
        </div>
      )}
      
      <div className="h-12"></div>
    </div>
  );
};

export default DashboardPage;
