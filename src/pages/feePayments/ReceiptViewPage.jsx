import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

const ReceiptCopy = ({ receipt, copyType }) => {
  return (
    <div className="bg-white text-gray-900 shadow-sm rounded-lg p-6 border border-gray-300 mb-8 print:mb-8 print:shadow-none break-inside-avoid">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b-2 border-gray-800 pb-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">Pen & Page Academia</h1>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-700">(School Section)</h2>
            <p className="text-xs text-gray-500 italic mt-0.5">Innovating Tomorrow by Educating Today</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Rehman Baba Street, University Town, Peshawar</p>
          <div className="inline-block border-2 border-gray-800 px-3 py-1 font-bold uppercase text-sm">
            {copyType}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="mb-1"><strong>Student Name:</strong> {receipt.studentId?.name || 'N/A'}</p>
          <p className="mb-1"><strong>Roll / Adm No:</strong> <span className="font-mono">{receipt.studentId?.rollNumber || 'N/A'}</span></p>
          <p className="mb-1"><strong>Class & Section:</strong> {receipt.studentId?.grade || 'N/A'} {receipt.studentId?.section ? `(${receipt.studentId.section})` : ''}</p>
          {receipt.studentId?.parentId && (
            <p className="mb-1"><strong>Parent Name:</strong> {receipt.studentId.parentId.name || 'N/A'}</p>
          )}
          <p><strong>Fee Month/AY:</strong> {receipt.academicYearId?.name || 'N/A'}</p>
        </div>
        <div className="text-right">
          <p className="mb-1"><strong>Receipt No:</strong> <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{receipt.receiptNumber}</span></p>
          <p className="mb-1"><strong>Date:</strong> {new Date(receipt.createdAt).toLocaleDateString()} {new Date(receipt.createdAt).toLocaleTimeString()}</p>
          <p className="mb-1"><strong>Payment Method:</strong> {receipt.paymentMethod}</p>
          <p><strong>Cashier:</strong> {receipt.cashierId?.name || 'Admin'}</p>
        </div>
      </div>

      {/* Fee Breakdown Table */}
      <div className="mb-4 border border-gray-300 rounded overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-3 font-bold border-b border-gray-300">Fee Description</th>
              <th className="py-2 px-3 font-bold border-b border-gray-300 text-right">Amount (PKR)</th>
            </tr>
          </thead>
          <tbody>
            {receipt.allocatedToTuition > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1.5 px-3">Tuition Fee</td>
                <td className="py-1.5 px-3 text-right">Rs. {receipt.allocatedToTuition}</td>
              </tr>
            )}
            {receipt.allocatedToAdmission > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1.5 px-3">Admission Fee</td>
                <td className="py-1.5 px-3 text-right">Rs. {receipt.allocatedToAdmission}</td>
              </tr>
            )}
            {receipt.allocatedToRegistration > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1.5 px-3">Registration Fee</td>
                <td className="py-1.5 px-3 text-right">Rs. {receipt.allocatedToRegistration}</td>
              </tr>
            )}
            {receipt.allocatedToMiscellaneous > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1.5 px-3">Miscellaneous Fee</td>
                <td className="py-1.5 px-3 text-right">Rs. {receipt.allocatedToMiscellaneous}</td>
              </tr>
            )}
            {receipt.allocatedToAnnual > 0 && (
              <tr className="border-b border-gray-200">
                <td className="py-1.5 px-3">Annual Charges</td>
                <td className="py-1.5 px-3 text-right">Rs. {receipt.allocatedToAnnual}</td>
              </tr>
            )}
            {receipt.addedToAdvance > 0 && (
              <tr className="border-b border-gray-200 bg-yellow-50">
                <td className="py-1.5 px-3 font-semibold text-yellow-800">Added to Advance Balance</td>
                <td className="py-1.5 px-3 text-right font-semibold text-yellow-800">Rs. {receipt.addedToAdvance}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Balances and Total */}
      <div className="flex justify-between items-end mb-4">
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200 flex-1 mr-4">
          <p className="mb-1"><strong>Previous Dues:</strong> Rs. {receipt.previousBalance}</p>
          <p><strong>Remaining Dues:</strong> Rs. {receipt.remainingBalance}</p>
          {receipt.lastPayment && (
            <p className="mt-2 pt-2 border-t border-gray-200 text-blue-800">
              <strong>Last Payment:</strong> Rs. {receipt.lastPayment.amountPaid} on {new Date(receipt.lastPayment.createdAt).toLocaleDateString()} (Receipt #{receipt.lastPayment.receiptNumber})
            </p>
          )}
        </div>
        
        <div className="text-right flex-1">
          <div className="inline-block border-2 border-gray-800 rounded p-3 bg-gray-50">
            <p className="text-sm font-bold uppercase text-gray-600 mb-1">Total Paid</p>
            <p className="text-2xl font-black text-gray-900">Rs. {receipt.amountPaid}</p>
          </div>
        </div>
      </div>

      {/* Amount in words */}
      <div className="bg-gray-100 p-2 rounded text-sm font-semibold italic text-gray-800 mb-8 border border-gray-200">
        Amount in Words: {numberToWords(receipt.amountPaid)}
      </div>

      {/* Signatures */}
      <div className="mt-auto pt-6 border-t border-gray-300 flex justify-between px-8 text-gray-500 text-xs">
        <div className="text-center">
          <div className="w-32 border-b border-gray-400 mb-1"></div>
          Cashier Signature
        </div>
        <div className="text-center">
          <div className="w-32 h-16 border-2 border-dashed border-gray-300 mb-1 flex items-center justify-center text-gray-300 text-xs">
            STAMP
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Controls */}
      <div className="mb-6 flex justify-between items-center print:hidden">
        <Link to="/student-fee-details" className="text-blue-500 hover:text-blue-700 font-semibold">
          &larr; Back to History
        </Link>
        <button
          onClick={handlePrint}
          className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded shadow flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
          </svg>
          Print Receipt
        </button>
      </div>

      {/* Receipts */}
      <div className="print:m-0 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <ReceiptCopy receipt={receipt} copyType="School Copy" />
        </div>
        
        {/* Cut line (vertical) */}
        <div className="hidden md:flex flex-col items-center justify-center text-gray-400 print:text-black self-stretch">
          <div className="border-l-2 border-dashed border-gray-400 h-full"></div>
          <span className="py-4 text-xs font-mono uppercase tracking-widest print:inline-block absolute bg-white" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>✂ Cut Here</span>
        </div>
        
        <div className="flex-1">
          <ReceiptCopy receipt={receipt} copyType="Parent Copy" />
        </div>
      </div>
      
      {/* Print styles */}
      <style>{`
        @media print {
          @page { margin: 0.5cm; size: A4 landscape; }
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

export default ReceiptViewPage;
