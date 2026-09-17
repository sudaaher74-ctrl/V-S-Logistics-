import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Search, Download, Trash2, Edit3, Share2, DollarSign } from 'lucide-react';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from '../../utils/invoiceCalculations';
import { exportInvoicesToCSV, shareInvoiceOnWhatsApp } from '../../utils/exportUtils';
import { InvoiceData } from '../../types/invoice';

export const SavedInvoicesModal: React.FC = () => {
  const {
    savedInvoices,
    setCurrentInvoice,
    deleteInvoice,
    setActiveModal,
    setActiveTab,
    setSelectedPaymentInvoiceId
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = savedInvoices.filter((inv) => {
    const matchQuery =
      inv.billNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.items.some((i) => i.vehicleNo.toLowerCase().includes(search.toLowerCase()));

    if (filterStatus === 'ALL') return matchQuery;
    return matchQuery && inv.paymentStatus === filterStatus;
  });

  const handleOpenInvoice = (inv: InvoiceData) => {
    setCurrentInvoice(inv);
    setActiveTab('invoice');
    setActiveModal(null);
  };

  const handleRecordPayment = (inv: InvoiceData) => {
    setSelectedPaymentInvoiceId(inv.id);
    setActiveModal('payment');
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>Saved Tax Invoices & Bills ({savedInvoices.length})</span>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search, Filter, Export */}
        <div
          style={{
            padding: '12px 20px',
            background: '#151e2d',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 240 }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Search by Bill No, Client Name, Vehicle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            </div>

            <select
              className="form-select"
              style={{ width: '140px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="UNPAID">UNPAID</option>
            </select>
          </div>

          <button
            className="btn btn-secondary"
            onClick={() => exportInvoicesToCSV(filtered, 'V_S_Logistics_Bills.csv')}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Table Body */}
        <div className="modal-body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No bills found matching your search.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Client / Party</th>
                  <th>Vehicles & Routes</th>
                  <th>Total (₹)</th>
                  <th>Balance (₹)</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const total = calculateBillTotal(inv.items);
                  const adv = calculateAdvanceAmount(inv.items, inv.advanceDeduction);
                  const bal = calculateBalance(total, adv);
                  const vehs = Array.from(new Set(inv.items.map((i) => i.vehicleNo).filter(Boolean))).join(', ');

                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 800, color: '#38bdf8' }}>{inv.billNo}</td>
                      <td style={{ color: '#94a3b8' }}>{inv.date}</td>
                      <td style={{ fontWeight: 600 }}>{inv.clientName}</td>
                      <td style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '200px' }}>
                        <div><b>Veh: </b>{vehs || '-'}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹ {formatCurrencySimple(total)}</td>
                      <td style={{ fontWeight: 700, color: bal > 0 ? '#ef4444' : '#10b981' }}>
                        ₹ {formatCurrencySimple(bal)}
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background:
                              inv.paymentStatus === 'PAID'
                                ? '#064e3b'
                                : inv.paymentStatus === 'PARTIAL'
                                ? '#78350f'
                                : '#7f1d1d',
                            color: '#ffffff'
                          }}
                        >
                          {inv.paymentStatus || 'UNPAID'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            title="Open in Editor"
                            onClick={() => handleOpenInvoice(inv)}
                          >
                            <Edit3 size={13} /> Open
                          </button>

                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px', color: '#10b981' }}
                            title="Record Payment Receipt"
                            onClick={() => handleRecordPayment(inv)}
                          >
                            <DollarSign size={13} /> Pay
                          </button>

                          <button
                            className="btn btn-secondary btn-icon-only"
                            style={{ color: '#22c55e' }}
                            title="Share on WhatsApp"
                            onClick={() => shareInvoiceOnWhatsApp(inv)}
                          >
                            <Share2 size={13} />
                          </button>

                          <button
                            className="btn btn-secondary btn-icon-only"
                            style={{ color: '#ef4444' }}
                            title="Delete Bill"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete Bill ${inv.billNo}?`)) {
                                deleteInvoice(inv.id);
                              }
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setActiveModal(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
