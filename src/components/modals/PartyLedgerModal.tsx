import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, BookOpen, Download, Search, DollarSign, Filter, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from '../../utils/invoiceCalculations';
import { exportLedgerToCSV } from '../../utils/exportUtils';
import { InvoiceData } from '../../types/invoice';

export const PartyLedgerModal: React.FC = () => {
  const {
    savedInvoices,
    customers,
    setActiveModal,
    setSelectedPaymentInvoiceId
  } = useStore();

  const [selectedParty, setSelectedParty] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  // Extract unique customer names from both customers master and existing invoices
  const allPartyNames = Array.from(
    new Set([
      ...customers.map((c) => c.name),
      ...savedInvoices.map((i) => i.clientName).filter(Boolean)
    ])
  ).sort();

  const filteredBills = savedInvoices.filter((inv) => {
    const matchParty = selectedParty === 'ALL' || inv.clientName.toLowerCase() === selectedParty.toLowerCase();
    const matchSearch =
      inv.billNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.items.some((i) => i.particulars.toLowerCase().includes(search.toLowerCase()));

    return matchParty && matchSearch;
  });

  // Analytics for the selected party / view
  let partyGrossBilled = 0;
  let partyReceived = 0;
  let partyOutstanding = 0;

  filteredBills.forEach((inv) => {
    const total = calculateBillTotal(inv.items);
    const adv = calculateAdvanceAmount(inv.items, inv.advanceDeduction);
    const bal = calculateBalance(total, adv);

    partyGrossBilled += total;

    if (inv.paymentStatus === 'PAID') {
      partyReceived += total;
    } else if (inv.paymentStatus === 'PARTIAL') {
      const rec = inv.amountReceived || 0;
      partyReceived += rec;
      partyOutstanding += Math.max(0, bal - rec);
    } else {
      partyOutstanding += bal;
    }
  });

  const handleRecordPayment = (inv: InvoiceData) => {
    setSelectedPaymentInvoiceId(inv.id);
    setActiveModal('payment');
  };

  const handleExportCSV = () => {
    const fileName = selectedParty === 'ALL' ? 'General_Party_Ledger.csv' : `${selectedParty}_Statement.csv`;
    exportLedgerToCSV(selectedParty, filteredBills, fileName);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" style={{ maxWidth: '1020px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <BookOpen size={18} color="#38bdf8" />
            <span>Party Ledger (Khata) & Outstanding Statement</span>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        {/* Top Control Filter */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '220px' }}>
              <Filter size={14} color="#94a3b8" />
              <select
                className="form-select"
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
              >
                <option value="ALL">All Clients / Parties</option>
                {allPartyNames.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Search bill, route, particulars..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
            </div>
          </div>

          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={14} /> Export Client Ledger CSV
          </button>
        </div>

        {/* Analytics Header Cards */}
        <div style={{ padding: '16px 20px 0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div className="stat-card" style={{ padding: '14px' }}>
              <div className="stat-icon" style={{ background: '#1e3a8a', color: '#60a5fa', width: 40, height: 40 }}>
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="stat-val" style={{ fontSize: '18px' }}>₹ {formatCurrencySimple(partyGrossBilled)}</div>
                <div className="stat-lbl">Total Billed Freight</div>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '14px' }}>
              <div className="stat-icon" style={{ background: '#064e3b', color: '#34d399', width: 40, height: 40 }}>
                <CheckCircle size={20} />
              </div>
              <div>
                <div className="stat-val" style={{ fontSize: '18px', color: '#34d399' }}>₹ {formatCurrencySimple(partyReceived)}</div>
                <div className="stat-lbl">Total Paid / Received</div>
              </div>
            </div>

            <div className="stat-card" style={{ padding: '14px' }}>
              <div className="stat-icon" style={{ background: '#7f1d1d', color: '#f87171', width: 40, height: 40 }}>
                <AlertCircle size={20} />
              </div>
              <div>
                <div className="stat-val" style={{ fontSize: '18px', color: '#f87171' }}>₹ {formatCurrencySimple(partyOutstanding)}</div>
                <div className="stat-lbl">Pending Outstanding Balance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="modal-body" style={{ padding: '16px 20px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Party / Client</th>
                <th>Vehicle & Route</th>
                <th>Total Billed</th>
                <th>Advance / Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Payment Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.map((inv) => {
                const total = calculateBillTotal(inv.items);
                const adv = calculateAdvanceAmount(inv.items, inv.advanceDeduction);
                const bal = calculateBalance(total, adv);
                const routes = Array.from(new Set(inv.items.map((i) => i.particulars).filter(Boolean))).join(', ');
                const vehs = Array.from(new Set(inv.items.map((i) => i.vehicleNo).filter(Boolean))).join(', ');

                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 800, color: '#38bdf8' }}>{inv.billNo}</td>
                    <td style={{ color: '#94a3b8' }}>{inv.date}</td>
                    <td style={{ fontWeight: 600 }}>{inv.clientName}</td>
                    <td style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '180px' }}>
                      <div><b>{vehs}</b></div>
                      <div>{routes}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹ {formatCurrencySimple(total)}</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>
                      ₹ {formatCurrencySimple(inv.paymentStatus === 'PAID' ? total : (inv.amountReceived || adv))}
                    </td>
                    <td style={{ fontWeight: 700, color: bal > 0 && inv.paymentStatus !== 'PAID' ? '#f87171' : '#34d399' }}>
                      ₹ {formatCurrencySimple(inv.paymentStatus === 'PAID' ? 0 : bal)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
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
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '3px 8px', fontSize: '11px', color: '#10b981' }}
                        onClick={() => handleRecordPayment(inv)}
                      >
                        <DollarSign size={12} /> Record Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
