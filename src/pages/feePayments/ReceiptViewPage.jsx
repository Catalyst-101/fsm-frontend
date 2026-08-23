import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import logo from '../../assets/images/logo.png';
import Button from '../../components/ui/Button';

function numberToWords(num) {
  num = Number(num) || 0;

  if (num === 0) return 'Zero Rupees Only';

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  const twoDigits = (n) => {
    if (n < 20) return ones[n];
    return `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`;
  };

  const threeDigits = (n) => {
    if (n < 100) return twoDigits(n);

    return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${twoDigits(n % 100)}` : ''
      }`;
  };

  if (num > 999999999) return 'Amount Too Large';

  const crore = Math.floor(num / 10000000);
  num %= 10000000;

  const lakh = Math.floor(num / 100000);
  num %= 100000;

  const thousand = Math.floor(num / 1000);
  num %= 1000;

  const hundred = num;

  const parts = [];

  if (crore) parts.push(`${twoDigits(crore)} Crore`);
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (hundred) parts.push(threeDigits(hundred));

  return `${parts.join(' ')} Rupees Only`;
}

const getAcademicValue = (field, academicYearId) => {
  if (!field) return '';

  if (Array.isArray(field)) {
    const entry = field.find(
      (item) =>
        String(item?.academicYearId?._id || item?.academicYearId) ===
        String(academicYearId?._id || academicYearId)
    );

    return entry?.value || '';
  }

  return field;
};

const ReceiptCopy = ({ receipt, copyType }) => {
  const student = receipt?.studentId || {};
  const parent = student?.parentId || receipt?.parentId || {};

  // Safe handling whether academicYearId is populated object or raw string reference
  const academicYear =
    typeof receipt?.academicYearId === 'object' && receipt?.academicYearId !== null
      ? receipt.academicYearId
      : { name: receipt?.academicYearName || 'N/A', _id: receipt?.academicYearId };

  const grade = getAcademicValue(student.grade, academicYear?._id);
  const section = getAcademicValue(student.section, academicYear?._id);

  return (
    <div className="receipt-copy">
      {/* Header */}
      <div className="receipt-header">
        <div className="receipt-brand">
          <img src={logo} alt="Pen & Page Academia" />

          <div>
            <h1>Pen & Page Academia</h1>
            <h2>(School Section)</h2>
            <p>Innovating Tomorrow by Educating Today</p>
          </div>
        </div>

        <div className="receipt-copy-label">
          <div className="copy-badge">{copyType}</div>
          <p>Rehman Baba Street, University Town, Peshawar</p>
        </div>
      </div>

      {/* Student / Receipt Information */}
      <div className="receipt-info">
        <div className="info-column">
          <div className="info-row">
            <span>Student Name</span>
            <strong>{student?.name || 'N/A'}</strong>
          </div>

          <div className="info-row">
            <span>Student ID</span>
            <strong className="mono">
              {student?.studentId ? (typeof student.studentId === 'object' ? (student.studentId.studentId || Object.values(student.studentId)[0] || JSON.stringify(student.studentId)) : student.studentId) : 'N/A'}
            </strong>
          </div>

          <div className="info-row">
            <span>Class & Section</span>
            <strong>
              {grade || 'N/A'}
              {section ? ` (${section})` : ''}
            </strong>
          </div>

          <div className="info-row">
            <span>Parent / Guardian</span>
            <strong>{parent?.name || 'N/A'}</strong>
          </div>

          <div className="info-row">
            <span>Academic Year</span>
            <strong>{academicYear?.name || 'N/A'}</strong>
          </div>
        </div>

        <div className="info-column right">
          <div className="info-row">
            <span>Receipt No</span>
            <strong className="mono">
              {receipt?.receiptNumber || 'N/A'}
            </strong>
          </div>

          <div className="info-row">
            <span>Date</span>
            <strong>
              {receipt?.createdAt
                ? new Date(receipt.createdAt).toLocaleDateString()
                : 'N/A'}
            </strong>
          </div>

          <div className="info-row">
            <span>Payment Method</span>
            <strong>{receipt?.paymentMethod || 'N/A'}</strong>
          </div>

          <div className="info-row">
            <span>Cashier</span>
            <strong>{receipt?.cashierId?.name || 'Admin'}</strong>
          </div>
        </div>
      </div>

      {/* Fee Table */}
      <div className="fee-table-wrapper">
        <table className="fee-table">
          <thead>
            <tr>
              <th>Fee Description</th>
              <th>Amount (PKR)</th>
            </tr>
          </thead>

          <tbody>
            {Number(receipt?.allocatedToTuition) > 0 && (
              <tr>
                <td>Tuition Fee</td>
                <td>Rs. {receipt.allocatedToTuition}</td>
              </tr>
            )}

            {Number(receipt?.allocatedToTransport) > 0 && (
              <tr>
                <td>Transport Fee</td>
                <td>Rs. {receipt.allocatedToTransport}</td>
              </tr>
            )}

            {Number(receipt?.allocatedToAdmission) > 0 && (
              <tr>
                <td>Admission Fee</td>
                <td>Rs. {receipt.allocatedToAdmission}</td>
              </tr>
            )}

            {Number(receipt?.allocatedToRegistration) > 0 && (
              <tr>
                <td>Registration Fee</td>
                <td>Rs. {receipt.allocatedToRegistration}</td>
              </tr>
            )}

            {Number(receipt?.allocatedToSecurity) > 0 && (
              <tr>
                <td>Security Fee</td>
                <td>Rs. {receipt.allocatedToSecurity}</td>
              </tr>
            )}

            {Number(receipt?.allocatedToMiscellaneous) > 0 && (
              <tr>
                <td>Miscellaneous Fee</td>
                <td>Rs. {receipt.allocatedToMiscellaneous}</td>
              </tr>
            )}

            {Number(receipt?.allocatedToAnnual) > 0 && (
              <tr>
                <td>Annual Charges</td>
                <td>Rs. {receipt.allocatedToAnnual}</td>
              </tr>
            )}

            {Number(receipt?.allocatedToBooksAndStationery) > 0 && (
              <tr>
                <td>Books & Stationery</td>
                <td>Rs. {receipt.allocatedToBooksAndStationery}</td>
              </tr>
            )}

            {Number(receipt?.addedToAdvance) > 0 && (
              <tr>
                <td>Added to Advance Balance</td>
                <td>Rs. {receipt.addedToAdvance}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Section */}
      <div className="receipt-bottom">
        {/* Balance */}
        <div className="balance-box">
          <div>
            <span>Previous Dues</span>
            <strong>Rs. {receipt?.previousBalance || 0}</strong>
          </div>

          <div>
            <span>Remaining Dues</span>
            <strong>Rs. {receipt?.remainingBalance || 0}</strong>
          </div>

          {receipt?.lastPayment && (
            <div className="last-payment">
              <span>Last Payment</span>
              <strong>
                Rs. {receipt.lastPayment.amountPaid} — Receipt #
                {receipt.lastPayment.receiptNumber}
              </strong>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="total-box">
          <span>Total Paid</span>
          <strong>Rs. {receipt?.amountPaid || 0}</strong>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="amount-words">
        <strong>Amount in Words:</strong>{' '}
        {numberToWords(receipt?.amountPaid)}
      </div>

      {/* Footer */}
      <div className="receipt-footer">
        <div className="signature">
          <div className="signature-line"></div>
          <span>Cashier Signature</span>
        </div>

        <div className="stamp">
          <div className="stamp-box">STAMP</div>
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
  }, [id]);

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.get(`/fee-payments/receipt/${id}`);

      setReceipt(res.data);
    } catch (err) {
      console.error('Failed to load receipt:', err);
      setError('Failed to load receipt.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="receipt-page-loading">
        <div className="loading-spinner"></div>
        <p>Loading receipt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="receipt-page-error">
        <p>{error}</p>
        <Link to="/student-fee-details">
          Back to Student Fee Details
        </Link>
      </div>
    );
  }

  if (!receipt) return null;

  return (
    <div className="pt-6">
      {/* Screen Controls */}
      <div className="max-w-[1400px] mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Link
          to="/student-fee-details"
          className="text-[var(--color-primary)] font-bold hover:underline flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Fee Details
        </Link>

        <Button
          onClick={handlePrint}
          className="flex items-center gap-2 shadow-md"
        >
          <span className="material-symbols-outlined text-[18px]">print</span>
          Print Receipt
        </Button>
      </div>

      {/* Receipt Sheet */}
      <main className="receipt-sheet">
        {/* Left Copy */}
        <section className="receipt-half">
          <ReceiptCopy
            receipt={receipt}
            copyType="School Copy"
          />
        </section>

        {/* Vertical Cut Line */}
        <div className="cut-line">
          <span>✂ CUT HERE</span>
        </div>

        {/* Right Copy */}
        <section className="receipt-half">
          <ReceiptCopy
            receipt={receipt}
            copyType="Parent Copy"
          />
        </section>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        /* ================================
           SCREEN
           ================================ */

        .receipt-page-loading,
        .receipt-page-error {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          color: #4b5563;
        }

        .receipt-page-error {
          color: #dc2626;
        }

        .receipt-page-error a {
          color: #2563eb;
          text-decoration: none;
        }

        .receipt-controls {
          width: min(1400px, calc(100% - 40px));
          margin: 24px auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .back-button {
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
        }

        .back-button:hover {
          text-decoration: underline;
        }

        .print-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          border-radius: 6px;
          background: #1f2937;
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }

        .print-button:hover {
          background: #111827;
        }

        .receipt-sheet {
          width: min(1400px, calc(100% - 40px));
          aspect-ratio: 1.414 / 1;
          margin: 0 auto 40px;
          background: white;
          border: 1px solid #d1d5db;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.12);

          display: grid;
          grid-template-columns: 1fr 1px 1fr;

          overflow: hidden;
        }

        .receipt-half {
          min-width: 0;
          min-height: 0;
          padding: 18px;
          overflow: hidden;
        }

        .cut-line {
          height: 100%;
          border-left: 1px dashed #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .cut-line span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(90deg);
          background: white;
          padding: 5px 10px;
          color: #6b7280;
          font-size: 9px;
          font-family: monospace;
          white-space: nowrap;
          letter-spacing: 1px;
        }

        .receipt-copy {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          color: #111827;
          overflow: hidden;
        }

        /* Header */

        .receipt-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #1f2937;
          padding-bottom: 9px;
          margin-bottom: 10px;
          flex-shrink: 0;
        }

        .receipt-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .receipt-brand img {
          width: 45px;
          height: 45px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .receipt-brand h1 {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .receipt-brand h2 {
          margin: 2px 0;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #374151;
        }

        .receipt-brand p {
          margin: 0;
          font-size: 9px;
          color: #6b7280;
          font-style: italic;
        }

        .receipt-copy-label {
          text-align: right;
          max-width: 45%;
        }

        .receipt-copy-label p {
          margin: 4px 0 0;
          font-size: 9px;
          color: #6b7280;
        }

        .copy-badge {
          display: inline-block;
          border: 2px solid #1f2937;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }

        /* Information */

        .receipt-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 9px;
          flex-shrink: 0;
        }

        .info-column {
          min-width: 0;
        }

        .info-column.right {
          text-align: right;
        }

        .info-row {
          display: flex;
          justify-content: flex-start;
          gap: 6px;
          font-size: 10px;
          line-height: 1.4;
          margin-bottom: 4px;
        }

        .info-column.right .info-row {
          justify-content: flex-end;
        }

        .info-row span {
          color: #6b7280;
          font-weight: 600;
          white-space: nowrap;
        }

        .info-row strong {
          color: #111827;
          font-weight: 700;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mono {
          font-family: monospace;
        }

        /* Fee table */

        .fee-table-wrapper {
          border: 1px solid #d1d5db;
          border-radius: 3px;
          overflow: hidden;
          flex-shrink: 0;
          margin-bottom: 8px;
        }

        .fee-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }

        .fee-table th {
          background: #f3f4f6;
          font-weight: 800;
          padding: 6px 9px;
          border-bottom: 1px solid #d1d5db;
          text-align: left;
        }

        .fee-table th:last-child {
          text-align: right;
        }

        .fee-table td {
          padding: 5px 9px;
          border-bottom: 1px solid #e5e7eb;
        }

        .fee-table td:last-child {
          text-align: right;
          font-family: monospace;
        }

        .fee-table tr:last-child td {
          border-bottom: none;
        }

        /* Bottom */

        .receipt-bottom {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 10px;
          align-items: stretch;
          margin-bottom: 7px;
          flex-shrink: 0;
        }

        .balance-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 3px;
          padding: 6px 8px;
        }

        .balance-box > div {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          font-size: 10px;
          margin-bottom: 4px;
        }

        .balance-box span {
          color: #6b7280;
          font-weight: 600;
        }

        .balance-box strong {
          font-family: monospace;
          color: #111827;
        }

        .last-payment {
          border-top: 1px solid #e5e7eb;
          padding-top: 4px;
          margin-top: 4px;
        }

        .total-box {
          border: 2px solid #1f2937;
          border-radius: 3px;
          background: #f9fafb;
          padding: 9px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
        }

        .total-box span {
          font-size: 10px;
          font-weight: 800;
          color: #4b5563;
          text-transform: uppercase;
        }

        .total-box strong {
          font-size: 22px;
          line-height: 1.1;
          font-weight: 900;
          font-family: monospace;
          margin-top: 2px;
        }

        /* Amount in words */

        .amount-words {
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 3px;
          padding: 6px 9px;
          font-size: 9px;
          font-style: italic;
          margin-bottom: 10px;
          flex-shrink: 0;
        }

        /* Footer */

        .receipt-footer {
          margin-top: auto;
          padding-top: 7px;
          border-top: 1px solid #d1d5db;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-shrink: 0;
        }

        .signature {
          text-align: center;
          font-size: 9px;
          color: #6b7280;
        }

        .signature-line {
          width: 110px;
          border-bottom: 1px solid #9ca3af;
          margin-bottom: 4px;
        }

        .stamp-box {
          width: 80px;
          height: 35px;
          border: 2px dashed #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
          font-weight: 900;
          font-size: 12px;
          letter-spacing: 2px;
        }

        /* ================================
           PRINT STYLES
           ================================ */

        @media print {
          @page {
            size: landscape;
            margin: 10mm;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .receipt-controls,
          .cut-line span {
            display: none !important;
          }

          .receipt-sheet {
            width: 100% !important;
            height: 95vh !important;
            aspect-ratio: auto;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          .receipt-half {
            padding: 0 15px !important;
          }

          .cut-line {
            border-left: 1px dashed #9ca3af !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptViewPage;