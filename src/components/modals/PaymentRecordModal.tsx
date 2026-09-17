import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { X, DollarSign, CheckCircle } from 'lucide-react';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from '../../utils/invoiceCalculations';

export const PaymentRecordModal: React.FC = () => {
  const {
    savedInvoices,
    selectedPaymentInvoiceId,
    recordPayment,
    setActiveModal,
    setSelectedPaymentInvoiceId
  } = useStore();

  const invoice = savedInvoices.find((i) => i.id === selectedPaymentInvoiceId);

  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toLocaleDateString('en-GB'));
  const [paymentMode, setPaymentMode] = useState<string>('BANK_TRANSFER');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID' | 'PARTIAL'>('PAID');

  useEffect(() => {
    if (invoice) {
      const total = calculateBillTotal(invoice.items);
      const adv = calculateAdvanceAmount(invoice.items, invoice.advanceDeduction);
      const bal = calculateBalance(total, adv);

      setAmountReceived(invoice.amountReceived || bal || total);
      setPaymentDate(invoice.paymentDate || new Date().toLocaleDateString('en-GB'));
      setPaymentMode(invoice.paymentMode || 'BANK_TRANSFER');
      setPaymentNotes(invoice.paymentNotes || 'NEFT / RTGS Full Settlement');
      setPaymentStatus(invoice.paymentStatus || 'PAID');
    }
  }, [invoice]);

  if (!invoice) return null;

  const total = calculateBillTotal(invoice.items);
  const adv = calculateAdvanceAmount(invoice.items, invoice.advanceDeduction);
  const bal = calculateBalance(total, adv);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordPayment(invoice.id, {
      amountReceived: Number(amountReceived),
      paymentDate,
      paymentMode,
      paymentNotes,
      paymentStatus
    });
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <DollarSign size={18} color="#10b981" />
            <span>Record Payment: Bill {invoice.billNo}</span>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => {
              setActiveModal(null);
              setSelectedPaymentInvoiceId(null);
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Bill Summary Banner */}
            <div
              style={{
                background: '#151e2d',
                padding: '12px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span style={{ color: '#94a3b8' }}>Client / Party:</span>
                <span style={{ fontWeight: 'bold' }}>{invoice.clientName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: 4 }}>
                <span style={{ color: '#94a3b8' }}>Gross Bill Total:</span>
                <span style={{ fontWeight: 'bold' }}>₹ {formatCurrencySimple(total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: 4 }}>
                <span style={{ color: '#94a3b8' }}>Pending Balance:</span>
                <span style={{ fontWeight: 'bold', color: '#ef4444' }}>₹ {formatCurrencySimple(bal)}</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
              >
                <option value="PAID">PAID (Full Settlement)</option>
                <option value="PARTIAL">PARTIAL (Part Payment)</option>
                <option value="UNPAID">UNPAID</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount Received (₹) *</label>
              <input
                type="number"
                step="any"
                required
                className="form-input"
                value={amountReceived}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Payment Date</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                >
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reference / Transaction Notes</label>
              <input
                type="text"
                className="form-input"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="UTR No / Cheque No / Remarks"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setActiveModal(null);
                setSelectedPaymentInvoiceId(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              <CheckCircle size={14} /> Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
