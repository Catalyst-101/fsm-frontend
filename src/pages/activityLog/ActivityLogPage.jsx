import React, { useState, useEffect } from 'react';
import { getAllLogs, reversePayment } from '../../api/activityLogs';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

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
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">System Activity Log</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Track user actions, changes, and audit financial reversals</p>
        </div>
        <span className="material-symbols-outlined text-[var(--color-secondary)] text-4xl opacity-20">history</span>
      </div>

      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center flex-wrap">
        <select name="action" value={filters.action} onChange={handleFilterChange} className="flex-1 min-w-[150px] bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium">
          <option value="">All Actions</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="PAYMENT_REVERSED">PAYMENT_REVERSED</option>
        </select>
        <select name="entityType" value={filters.entityType} onChange={handleFilterChange} className="flex-1 min-w-[150px] bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium">
          <option value="">All Entities</option>
          <option value="AcademicYear">Academic Year</option>
          <option value="Parent">Parent</option>
          <option value="Student">Student</option>
          <option value="FeeReceipt">Fee Receipt</option>
          <option value="FeeStructure">Fee Structure</option>
          <option value="StudentFeeAssignment">Fee Assignment</option>
        </select>
        <select name="reversed" value={filters.reversed} onChange={handleFilterChange} className="flex-1 min-w-[150px] bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium">
          <option value="">All Statuses</option>
          <option value="false">Active</option>
          <option value="true">Reversed</option>
        </select>
        <select name="reversible" value={filters.reversible} onChange={handleFilterChange} className="flex-1 min-w-[150px] bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)] transition-all font-medium">
          <option value="">All Reversible States</option>
          <option value="true">Reversible</option>
          <option value="false">Not Reversible</option>
        </select>
        <Button onClick={() => fetchLogs(1)} variant="secondary" className="px-6 py-2.5">
          <span className="material-symbols-outlined text-sm">refresh</span> Refresh
        </Button>
      </div>

      <div className="bg-white border border-gray-200 shadow-[0_4px_6px_-1px_rgba(11,37,69,0.05)] overflow-hidden rounded-xl">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            <span className="material-symbols-outlined animate-spin align-middle mr-2">refresh</span> Loading logs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">User</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">Action</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">Entity</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">Description</th>
                  <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right font-bold text-gray-500 uppercase tracking-wider text-xs whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium text-xs">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-[var(--color-primary)] font-bold">{log.userId?.name || 'System'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                        log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' :
                        log.action === 'PAYMENT' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        log.action === 'PAYMENT_REVERSED' ? 'bg-red-50 text-red-700 border-red-200 border-dashed' :
                        log.action === 'LOGIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-semibold">{log.entityType}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-xs">{log.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.reversed ? (
                        <span className="text-red-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">undo</span> Reversed</span>
                      ) : (
                        <span className="text-emerald-600 font-bold text-xs uppercase tracking-wider">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => viewDetails(log)} className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:underline mr-4 transition-colors font-bold">View</button>
                      {log.action === 'PAYMENT' && !log.reversed ? (
                        <button onClick={() => handleReverseClick(log)} className="text-red-500 hover:text-red-700 hover:underline transition-colors font-bold">Reverse</button>
                      ) : log.reversed ? (
                        <span className="text-gray-400 cursor-not-allowed text-xs font-semibold uppercase">Reversed</span>
                      ) : log.action === 'PAYMENT' ? (
                         null
                      ) : (
                        <span className="text-gray-400 cursor-not-allowed text-xs font-semibold uppercase">Permanent</span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">No activity logs match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
        <Button 
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => fetchLogs(pagination.page - 1)}
          className="px-4 py-2"
        >
          Previous
        </Button>
        <span className="text-gray-600 text-sm font-medium">Page <span className="text-[var(--color-primary)] font-bold">{pagination.page}</span> of {pagination.totalPages || 1}</span>
        <Button 
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => fetchLogs(pagination.page + 1)}
          className="px-4 py-2"
        >
          Next
        </Button>
      </div>

      {/* Confirm Reverse Modal */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, activity: null })} 
        title="Confirm Payment Reversal"
        type="danger"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmModal({ isOpen: false, activity: null })}>Cancel</Button>
            <Button variant="danger" onClick={executeReverse}>Yes, Reverse Payment</Button>
          </>
        }
      >
        <p>Are you sure you want to reverse the following action?</p>
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg my-4 text-sm text-gray-700">
          <p className="mb-2"><strong className="text-gray-500 uppercase text-xs mr-2">Action:</strong> <span className="font-bold text-[var(--color-primary)]">{confirmModal.activity?.action}</span></p>
          <p className="mb-2"><strong className="text-gray-500 uppercase text-xs mr-2">Entity:</strong> <span className="font-bold">{confirmModal.activity?.entityType}</span></p>
          <p><strong className="text-gray-500 uppercase text-xs mr-2">Description:</strong> {confirmModal.activity?.description}</p>
        </div>
        <p className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span>Warning: This will alter the database and potentially cascade to dependent records (fee ledgers will be updated).</span>
        </p>
      </Modal>

      {/* View Details Modal */}
      <Modal 
        isOpen={detailsModal.isOpen} 
        onClose={() => setDetailsModal({ isOpen: false, activity: null })} 
        title="Activity Details"
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setDetailsModal({ isOpen: false, activity: null })}>Close</Button>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div><span className="text-gray-500 block text-[10px] font-bold mb-1 uppercase tracking-wider">Action</span> <span className="text-[var(--color-primary)] font-bold">{detailsModal.activity?.action}</span></div>
            <div><span className="text-gray-500 block text-[10px] font-bold mb-1 uppercase tracking-wider">Entity</span> <span className="text-gray-800 font-semibold">{detailsModal.activity?.entityType}</span></div>
            <div><span className="text-gray-500 block text-[10px] font-bold mb-1 uppercase tracking-wider">User</span> <span className="text-gray-800 font-semibold">{detailsModal.activity?.userId?.name || 'System'}</span></div>
            <div><span className="text-gray-500 block text-[10px] font-bold mb-1 uppercase tracking-wider">Date</span> <span className="text-gray-800 font-semibold">{detailsModal.activity && formatDate(detailsModal.activity.createdAt)}</span></div>
            <div className="col-span-2"><span className="text-gray-500 block text-[10px] font-bold mb-1 uppercase tracking-wider">Description</span> <span className="text-gray-800 font-medium">{detailsModal.activity?.description}</span></div>
          </div>

          {detailsModal.activity?.changes && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2 border-b border-gray-100 pb-1">Changes</h3>
              <div className="bg-gray-800 border border-gray-900 p-4 rounded-lg overflow-x-auto shadow-inner">
                <pre className="text-xs text-green-400 font-mono">
                  {JSON.stringify(detailsModal.activity.changes, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {detailsModal.activity?.metadata && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2 border-b border-gray-100 pb-1">Entity Metadata</h3>
              <div className="bg-gray-800 border border-gray-900 p-4 rounded-lg overflow-x-auto shadow-inner">
                <pre className="text-xs text-blue-400 font-mono">
                  {JSON.stringify(detailsModal.activity.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {detailsModal.activity?.paymentData && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)] mb-2 border-b border-gray-100 pb-1">Payment Audit Data</h3>
              <div className="bg-gray-800 border border-gray-900 p-4 rounded-lg overflow-x-auto shadow-inner">
                <pre className="text-xs text-yellow-400 font-mono">
                  {JSON.stringify(detailsModal.activity.paymentData, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ActivityLogPage;
