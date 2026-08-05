import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const ParentReceiptViewPage = () => {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceipt();
    // eslint-disable-next-line
  }, [id]);

  const fetchReceipt = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/fee-payments/parent-receipt/${id}`);
      setReceipt(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load parent receipt.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center">Loading receipt...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!receipt) return <div className="p-8 text-center">Receipt not found.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-4 flex justify-between items-center print:hidden">
        <Link to="/fee-payment" className="text-blue-500 hover:underline">
          &larr; Back to Payments
        </Link>
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Print / Save PDF
        </button>
      </div>

      <div className="bg-white shadow-lg p-8 border border-gray-200 printable-receipt" id="receipt-content">
        {/* School Header */}
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold uppercase tracking-wider text-gray-900">Modern School System</h1>
          <p className="text-gray-600">123 Education Lane, Knowledge City</p>
          <p className="text-gray-600">Phone: (555) 123-4567 | Email: info@modernschool.edu</p>
          <h2 className="text-xl font-bold mt-4 uppercase text-gray-800">Parent Fee Receipt</h2>
        </div>

        {/* Receipt Info */}
        <div className="flex justify-between mb-6 text-gray-800">
          <div>
            <p><span className="font-bold">Receipt No:</span> {receipt.receiptNumber}</p>
            <p><span className="font-bold">Date:</span> {new Date(receipt.createdAt).toLocaleString()}</p>
            <p><span className="font-bold">Academic Year:</span> {receipt.academicYearId?.name}</p>
          </div>
          <div className="text-right">
            <p><span className="font-bold">Payment Method:</span> {receipt.paymentMethod}</p>
            <p><span className="font-bold">Cashier:</span> {receipt.cashierId?.name}</p>
          </div>
        </div>

        {/* Parent Info */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-bold text-gray-800 mb-2 uppercase border-b pb-1">Parent Details</h3>
          <p><span className="font-semibold">Name:</span> {receipt.parentId?.name}</p>
          <p><span className="font-semibold">Phone:</span> {receipt.parentId?.phone}</p>
          <p><span className="font-semibold">CNIC:</span> {receipt.parentId?.cnic}</p>
        </div>

        {/* Grand Total Paid */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded text-center">
          <h3 className="text-blue-900 font-bold uppercase">Total Amount Paid</h3>
          <p className="text-4xl font-bold text-blue-700 mt-2">${receipt.totalAmountPaid}</p>
        </div>

        {/* Allocation Breakdown */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-800 mb-3 uppercase border-b-2 border-gray-800 pb-1">Payment Distribution</h3>
          
          {receipt.studentAllocations.length === 0 ? (
            <p className="text-gray-600 italic">No student allocations found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-800 border-y border-gray-300">
                  <th className="py-2 px-2 font-semibold">Student</th>
                  <th className="py-2 px-2 font-semibold">Grade</th>
                  <th className="py-2 px-2 font-semibold text-right">Student Receipt No</th>
                  <th className="py-2 px-2 font-semibold text-right">Amount Allocated</th>
                </tr>
              </thead>
              <tbody>
                {receipt.studentAllocations.map((alloc, idx) => (
                  <tr key={idx} className="border-b border-gray-200">
                    <td className="py-3 px-2 text-gray-800 font-medium">
                      {alloc.studentId?.firstName} {alloc.studentId?.lastName}
                    </td>
                    <td className="py-3 px-2 text-gray-800">
                      {alloc.studentId?.grade}
                    </td>
                    <td className="py-3 px-2 text-gray-800 text-right text-xs">
                      {alloc.receiptId?.receiptNumber || 'N/A'}
                    </td>
                    <td className="py-3 px-2 text-gray-900 font-bold text-right">
                      ${alloc.receiptId?.amountPaid || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {receipt.remarks && (
          <div className="mb-8">
            <h3 className="font-bold text-gray-800 mb-1">Remarks:</h3>
            <p className="text-gray-700 italic bg-gray-50 p-2 rounded">{receipt.remarks}</p>
          </div>
        )}

        {/* Signatures */}
        <div className="mt-16 pt-8 flex justify-between text-center text-gray-600">
          <div className="w-48 border-t-2 border-gray-400 pt-2">
            Accountant Signature
          </div>
          <div className="w-48 border-t-2 border-gray-400 pt-2">
            Parent Signature
          </div>
        </div>

        <div className="text-center text-xs text-gray-400 mt-8 pt-4 border-t border-gray-200">
          This is a computer-generated receipt. No physical signature is required for validity.
        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
            padding: 0;
          }
          @page { size: auto;  margin: 10mm; }
        }
      `}} />
    </div>
  );
};

export default ParentReceiptViewPage;
