import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const ReceiptViewPage = () => {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReceipt();
    // eslint-disable-next-line
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const res = await api.get(`/fee-payments/receipt/${id}`);
      setReceipt(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load receipt.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-gray-600">Loading receipt...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!receipt) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Hide controls when printing */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link to="/student-fee-details" className="text-blue-500 hover:text-blue-700 font-semibold">
          &larr; Back to History
        </Link>
        <button
          onClick={handlePrint}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded shadow"
        >
          Print / Save PDF
        </button>
      </div>

      {/* Receipt Paper */}
      <div className="bg-white text-gray-900 shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="text-center mb-8 border-b-2 border-gray-200 pb-6">
          <h1 className="text-3xl font-bold uppercase tracking-widest">FMS School</h1>
          <p className="text-sm text-gray-500 mt-1">Official Fee Receipt</p>
        </div>

        <div className="flex justify-between mb-8">
          <div>
            <h3 className="font-semibold text-lg text-gray-800">Student Details</h3>
            <p><strong>Name:</strong> {receipt.studentId.firstName} {receipt.studentId.lastName}</p>
            <p><strong>Grade:</strong> {receipt.studentId.grade}</p>
            {receipt.studentId.parentId && (
              <p><strong>Parent:</strong> {receipt.studentId.parentId.firstName} {receipt.studentId.parentId.lastName}</p>
            )}
            <p><strong>Academic Year:</strong> {receipt.academicYearId.name}</p>
          </div>
          <div className="text-right">
            <h3 className="font-semibold text-lg text-gray-800">Receipt Details</h3>
            <p><strong>Receipt No:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{receipt.receiptNumber}</span></p>
            <p><strong>Date:</strong> {new Date(receipt.createdAt).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> {receipt.paymentMethod}</p>
            <p><strong>Cashier:</strong> {receipt.cashierId.name}</p>
          </div>
        </div>

        {/* Allocation Table */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-2 font-bold uppercase text-sm">Fee Description</th>
                <th className="py-2 font-bold uppercase text-sm text-right">Amount Allocated</th>
              </tr>
            </thead>
            <tbody>
              {receipt.allocatedToTuition > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2">Tuition Fee</td>
                  <td className="py-2 text-right">${receipt.allocatedToTuition}</td>
                </tr>
              )}
              {receipt.allocatedToAdmission > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2">Admission Fee</td>
                  <td className="py-2 text-right">${receipt.allocatedToAdmission}</td>
                </tr>
              )}
              {receipt.allocatedToRegistration > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2">Registration Fee</td>
                  <td className="py-2 text-right">${receipt.allocatedToRegistration}</td>
                </tr>
              )}
              {receipt.allocatedToMiscellaneous > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2">Miscellaneous Fee</td>
                  <td className="py-2 text-right">${receipt.allocatedToMiscellaneous}</td>
                </tr>
              )}
              {receipt.allocatedToAnnual > 0 && (
                <tr className="border-b border-gray-200">
                  <td className="py-2">Annual Charges</td>
                  <td className="py-2 text-right">${receipt.allocatedToAnnual}</td>
                </tr>
              )}
              {receipt.addedToAdvance > 0 && (
                <tr className="border-b border-gray-200 bg-yellow-50">
                  <td className="py-2 font-semibold text-yellow-800">Added to Advance Balance</td>
                  <td className="py-2 text-right font-semibold text-yellow-800">${receipt.addedToAdvance}</td>
                </tr>
              )}
              <tr className="border-b-4 border-gray-800 bg-gray-50">
                <td className="py-3 font-bold text-lg text-right">Total Amount Received:</td>
                <td className="py-3 font-bold text-xl text-green-700 text-right">${receipt.amountPaid}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-between text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <div>
            <p><strong>Previous Balance:</strong> ${receipt.previousBalance}</p>
            <p><strong>Remaining Balance:</strong> ${receipt.remainingBalance}</p>
          </div>
          {receipt.remarks && (
            <div className="max-w-xs text-right">
              <p><strong>Remarks:</strong> {receipt.remarks}</p>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-300 flex justify-between px-8 text-gray-400 text-sm">
          <div className="text-center">
            <div className="w-40 border-b border-gray-400 mb-2"></div>
            Cashier Signature
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-gray-400 mb-2"></div>
            Parent/Guardian Signature
          </div>
        </div>
      </div>
      
      {/* Print styles injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
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
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptViewPage;
