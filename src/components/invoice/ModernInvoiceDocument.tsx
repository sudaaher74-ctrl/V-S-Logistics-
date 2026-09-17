import React from 'react';
import { useStore } from '../../store/useStore';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatIndianCurrency } from '../../utils/invoiceCalculations';
import { numberToIndianWords, toTitleCase } from '../../utils/numberToWords';
import { ShieldCheck, Truck } from 'lucide-react';

export const ModernInvoiceDocument: React.FC = () => {
  const { currentInvoice, companyProfile, bankDetails } = useStore();

  const total = calculateBillTotal(currentInvoice.items);
  const advance = calculateAdvanceAmount(currentInvoice.items, currentInvoice.advanceDeduction);
  const balance = calculateBalance(total, advance);

  const amountForWords = balance > 0 ? balance : total;
  const wordsText = currentInvoice.customAmountInWords || toTitleCase(numberToIndianWords(amountForWords));

  const statusClass =
    currentInvoice.paymentStatus === 'PAID'
      ? 'status-paid'
      : currentInvoice.paymentStatus === 'PARTIAL'
      ? 'status-partial'
      : 'status-unpaid';

  return (
    <div id="printable-invoice-document" className="a4-page modern-invoice-page">
      {/* Modern Top Banner */}
      <header className="modern-banner">
        <div className="modern-brand-box">
          <div className="modern-logo-circle">
            <Truck size={28} />
          </div>
          <div>
            <h1 className="modern-company-name">{companyProfile.companyName || 'V S LOGISTICS'}</h1>
            <div className="modern-tagline-badge">
              <ShieldCheck size={12} />
              Delivering Trust Every Mile &bull; Fleet Owners
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>
              {companyProfile.addressLine1}, {companyProfile.addressLine2}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Tel: {companyProfile.mobiles} | Email: {companyProfile.email}
            </div>
          </div>
        </div>

        <div className="modern-doc-title-box">
          <h2 className="modern-doc-title">TAX INVOICE</h2>
          <div className="modern-doc-subtitle">ORIGINAL FOR RECIPIENT</div>
          <div style={{ marginTop: 8 }}>
            <span className={`modern-status-badge ${statusClass}`}>
              {currentInvoice.paymentStatus || 'UNPAID'}
            </span>
          </div>
        </div>
      </header>

      {/* Metadata Cards */}
      <div className="modern-meta-grid">
        {/* Client Card */}
        <div className="modern-card">
          <div className="modern-card-title">Billed To (Party)</div>
          <h3 className="modern-client-name">{currentInvoice.clientName || 'Valued Client'}</h3>
          <div className="modern-client-info">
            {currentInvoice.clientAddress || 'Address on record'}
            {currentInvoice.clientPhone && (
              <div>Phone: {currentInvoice.clientPhone}</div>
            )}
          </div>
        </div>

        {/* Invoice Info Card */}
        <div className="modern-card">
          <div className="modern-card-title">Invoice Details</div>
          <div className="modern-info-row">
            <span className="modern-info-label">Invoice / Bill No:</span>
            <span className="modern-info-val">{currentInvoice.billNo}</span>
          </div>
          <div className="modern-info-row">
            <span className="modern-info-label">Invoice Date:</span>
            <span className="modern-info-val">{currentInvoice.date}</span>
          </div>
          <div className="modern-info-row">
            <span className="modern-info-label">Transporter PAN:</span>
            <span className="modern-info-val">{companyProfile.panNo}</span>
          </div>
          {currentInvoice.beNo && (
            <div className="modern-info-row">
              <span className="modern-info-label">{currentInvoice.refDocType || 'REF'}:</span>
              <span className="modern-info-val">{currentInvoice.beNo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Modern Line Items Table */}
      <table className="modern-table">
        <thead>
          <tr>
            <th style={{ width: '45px' }} className="text-center">#</th>
            <th style={{ width: '90px' }}>Date</th>
            <th style={{ width: '130px' }}>Vehicle No.</th>
            <th>Particulars / Route</th>
            <th style={{ width: '100px' }}>Container / Size</th>
            <th style={{ width: '80px' }} className="text-center">Weight</th>
            <th style={{ width: '110px' }} className="text-right">Freight (₹)</th>
          </tr>
        </thead>
        <tbody>
          {currentInvoice.items.map((item, idx) => (
            <tr key={item.id}>
              <td className="text-center" style={{ color: '#94a3b8' }}>{idx + 1}</td>
              <td>{item.date}</td>
              <td>
                <span className="modern-vehicle-tag">{item.vehicleNo || 'N/A'}</span>
              </td>
              <td style={{ fontWeight: 600 }}>{item.particulars}</td>
              <td>{item.containerNo}</td>
              <td className="text-center">{item.weight}</td>
              <td className="text-right" style={{ fontWeight: 700 }}>
                {item.amount !== '' ? formatIndianCurrency(item.amount) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Words Box */}
      <div className="modern-words-box">
        <span style={{ color: '#64748b', fontWeight: 500, marginRight: 8 }}>Amount in Words:</span>
        <span style={{ color: '#0f172a' }}>{wordsText}</span>
      </div>

      {/* Bottom Section: Bank & Totals */}
      <div className="modern-bottom-grid">
        <div className="modern-bank-box">
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Bank & Remittance Details
          </div>
          <div className="modern-info-row">
            <span className="modern-info-label">Bank:</span>
            <span className="modern-info-val">{bankDetails.bankName}</span>
          </div>
          <div className="modern-info-row">
            <span className="modern-info-label">Account No:</span>
            <span className="modern-info-val" style={{ fontFamily: 'monospace' }}>{bankDetails.accountNo}</span>
          </div>
          <div className="modern-info-row">
            <span className="modern-info-label">IFSC Code:</span>
            <span className="modern-info-val" style={{ fontFamily: 'monospace' }}>{bankDetails.ifscCode}</span>
          </div>
          <div className="modern-info-row">
            <span className="modern-info-label">Branch:</span>
            <span className="modern-info-val">{bankDetails.branch}</span>
          </div>
        </div>

        <div className="modern-totals-box">
          <div className="modern-total-row">
            <span>Subtotal (Gross Freight):</span>
            <span style={{ fontWeight: 600 }}>₹ {formatIndianCurrency(total)}</span>
          </div>
          <div className="modern-total-row">
            <span>Advance Deductions:</span>
            <span style={{ fontWeight: 600 }}>- ₹ {formatIndianCurrency(advance)}</span>
          </div>
          <div className="modern-total-row grand-total">
            <span>Net Balance Payable:</span>
            <span style={{ color: '#b91c1c' }}>₹ {formatIndianCurrency(balance)}</span>
          </div>
        </div>
      </div>

      {/* Signatures & Terms */}
      <footer className="modern-footer-signatures">
        <div className="modern-terms-list">
          <div style={{ fontWeight: 700, marginBottom: 4, color: '#334155' }}>Terms & Conditions</div>
          <ol style={{ paddingLeft: 16 }}>
            {companyProfile.terms.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ol>
        </div>

        <div style={{ textAlign: 'right', minWidth: 200 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
            For {companyProfile.companyName || 'V S LOGISTICS'}
          </div>
          <div style={{ height: 45 }} />
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
            {companyProfile.proprietorText || 'Authorized Signatory'}
          </div>
        </div>
      </footer>
    </div>
  );
};
