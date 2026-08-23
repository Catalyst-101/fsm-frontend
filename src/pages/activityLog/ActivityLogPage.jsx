import React, { useState, useEffect } from 'react';
import { getAllLogs, reversePayment } from '../../api/activityLogs';

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    reversed: '',
    reversible: ''
  });

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, activity: null });
  const [detailsModal, setDetailsModal] = useState({ isOpen: false, activity: null });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
      const response = await getAllLogs({ page, limit: pagination.limit, ...activeFilters });
      setLogs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      alert('Failed to fetch activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReverseClick = (activity) => {
    setConfirmModal({ isOpen: true, activity });
  };

  const executeReverse = async () => {
    if (!confirmModal.activity) return;
    try {
      await reversePayment(confirmModal.activity._id);
      alert('Payment reversed successfully');
      setConfirmModal({ isOpen: false, activity: null });
      fetchLogs(pagination.page);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reverse payment');
    }
  };

  const viewDetails = (activity) => {
    setDetailsModal({ isOpen: true, activity });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Activity Log</h1>
      </div>

      <div className="bg-slate-800 border border-slate-700 p-4 rounded-xl shadow-xl flex gap-4 flex-wrap">
        <select name="action" value={filters.action} onChange={handleFilterChange} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="PAYMENT_REVERSED">PAYMENT_REVERSED</option>
        </select>
        <select name="entityType" value={filters.entityType} onChange={handleFilterChange} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Entities</option>
          <option value="AcademicYear">Academic Year</option>
          <option value="Parent">Parent</option>
          <option value="Student">Student</option>
          <option value="FeeReceipt">Fee Receipt</option>
          <option value="FeeStructure">Fee Structure</option>
          <option value="StudentFeeAssignment">Fee Assignment</option>
        </select>
        <select name="reversed" value={filters.reversed} onChange={handleFilterChange} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          <option value="false">Active</option>
          <option value="true">Reversed</option>
        </select>
        <select name="reversible" value={filters.reversible} onChange={handleFilterChange} className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500">
          <option value="">All Reversible States</option>
          <option value="true">Reversible</option>
          <option value="false">Not Reversible</option>
        </select>
        <button onClick={() => fetchLogs(1)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">Refresh</button>
      </div>

      <div className="bg-slate-800 border border-slate-700 shadow-xl overflow-hidden sm:rounded-xl">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading logs...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-sm">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-slate-300 uppercase tracking-wider text-xs">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-300 uppercase tracking-wider text-xs">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-300 uppercase tracking-wider text-xs">Action</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-300 uppercase tracking-wider text-xs">Entity</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-300 uppercase tracking-wider text-xs">Description</th>
                  <th className="px-6 py-4 text-left font-semibold text-slate-300 uppercase tracking-wider text-xs">Status</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-300 uppercase tracking-wider text-xs">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-700/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">{log.userId?.name || 'System'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${
                        log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        log.action === 'UPDATE' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        log.action === 'PAYMENT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        log.action === 'PAYMENT_REVERSED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 border-dashed' :
                        log.action === 'LOGIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-300">{log.entityType}</td>
                    <td className="px-6 py-4 text-slate-300 truncate max-w-xs">{log.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.reversed ? (
                        <span className="text-rose-400 font-medium text-xs">Reversed</span>
                      ) : (
                        <span className="text-emerald-400 font-medium text-xs">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => viewDetails(log)} className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors">View</button>
                      {log.action === 'PAYMENT' && !log.reversed ? (
                        <button onClick={() => handleReverseClick(log)} className="text-rose-400 hover:text-rose-300 transition-colors">Reverse Payment</button>
                      ) : log.reversed ? (
                        <span className="text-slate-500 cursor-not-allowed text-xs">Reversed</span>
                      ) : log.action === 'PAYMENT' ? (
                         null
                      ) : (
                        <span className="text-slate-500 cursor-not-allowed text-xs" title="Only payments can be reversed">Permanent</span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">No activity logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button 
          disabled={pagination.page <= 1}
          onClick={() => fetchLogs(pagination.page - 1)}
          className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <span className="text-slate-400 text-sm">Page <span className="text-white font-medium">{pagination.page}</span> of {pagination.totalPages || 1}</span>
        <button 
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => fetchLogs(pagination.page + 1)}
          className="bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>

      {/* Confirm Reverse Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-rose-500">Confirm Reversal</h2>
            <p className="mb-4 text-slate-300 text-sm">Are you sure you want to reverse the following action?</p>
            <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-lg mb-6 text-sm text-slate-300">
              <p className="mb-1"><strong className="text-slate-400">Action:</strong> {confirmModal.activity?.action}</p>
              <p className="mb-1"><strong className="text-slate-400">Entity:</strong> {confirmModal.activity?.entityType}</p>
              <p><strong className="text-slate-400">Description:</strong> {confirmModal.activity?.description}</p>
            </div>
            <p className="text-xs text-rose-400/80 mb-6 italic">Warning: This will alter the database and potentially cascade to dependent records.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmModal({ isOpen: false, activity: null })} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">Cancel</button>
              <button onClick={executeReverse} className="px-4 py-2 text-sm font-medium bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors shadow-lg shadow-rose-600/20">Yes, Reverse Action</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {detailsModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-6 text-white">Activity Details</h2>
            
            <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm mb-6">
                <div><span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider">Action</span> <span className="text-slate-200 font-medium">{detailsModal.activity?.action}</span></div>
                <div><span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider">Entity</span> <span className="text-slate-200 font-medium">{detailsModal.activity?.entityType}</span></div>
                <div><span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider">User</span> <span className="text-slate-200 font-medium">{detailsModal.activity?.userId?.name || 'System'}</span></div>
                <div><span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider">Date</span> <span className="text-slate-200 font-medium">{detailsModal.activity && formatDate(detailsModal.activity.createdAt)}</span></div>
                <div className="col-span-2"><span className="text-slate-400 block text-xs mb-1 uppercase tracking-wider">Description</span> <span className="text-slate-200 font-medium">{detailsModal.activity?.description}</span></div>
              </div>

              {detailsModal.activity?.changes && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-slate-300">Changes</h3>
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-indigo-300 font-mono">
                      {JSON.stringify(detailsModal.activity.changes, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {detailsModal.activity?.metadata && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-slate-300">Entity Metadata</h3>
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-rose-300 font-mono">
                      {JSON.stringify(detailsModal.activity.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {detailsModal.activity?.paymentData && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-slate-300">Payment Audit Data</h3>
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-xs text-emerald-300 font-mono">
                      {JSON.stringify(detailsModal.activity.paymentData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6 pt-4 border-t border-slate-700">
              <button onClick={() => setDetailsModal({ isOpen: false, activity: null })} className="px-5 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogPage;
