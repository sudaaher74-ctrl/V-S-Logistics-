import React from 'react';
import { useStore } from '../store/useStore';
import {
  FileText,
  Truck,
  TrendingUp,
  AlertCircle,
  Plus,
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatIndianCurrency, formatCurrencySimple } from '../utils/invoiceCalculations';

export const Dashboard: React.FC = () => {
  const {
    savedInvoices,
    savedLRs,
    tripSlips,
    setActiveTab,
    setCurrentInvoice,
    setCurrentLR,
    createNewInvoice,
    createNewLR,
    setActiveModal
  } = useStore();

  // Financial aggregates
  let totalBilled = 0;
  let totalReceived = 0;
  let totalOutstanding = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  savedInvoices.forEach((inv) => {
    const invTotal = calculateBillTotal(inv.items);
    const adv = calculateAdvanceAmount(inv.items, inv.advanceDeduction);
    const bal = calculateBalance(invTotal, adv);
    totalBilled += invTotal;

    if (inv.paymentStatus === 'PAID') {
      paidCount++;
      totalReceived += invTotal;
    } else if (inv.paymentStatus === 'PARTIAL') {
      totalReceived += inv.amountReceived || 0;
      totalOutstanding += Math.max(0, bal - (inv.amountReceived || 0));
    } else {
      unpaidCount++;
      totalOutstanding += bal;
    }
  });

  return (
    <div className="dashboard-view no-print">
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>
            Enterprise Transport Overview
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
            Real-time logistics billing, e-LR consignment notes, fleet expenses & party khata.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={createNewInvoice}>
            <Plus size={15} />
            + New Tax Invoice
          </button>
          <button className="btn btn-secondary" onClick={createNewLR}>
            <Plus size={15} />
            + New e-LR Bilty
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#1e3a8a', color: '#60a5fa' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-val">{savedInvoices.length}</div>
            <div className="stat-lbl">Total Tax Invoices</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#064e3b', color: '#34d399' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-val">₹ {formatCurrencySimple(totalBilled)}</div>
            <div className="stat-lbl">Gross Billed Freight</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#7f1d1d', color: '#f87171' }}>
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="stat-val">₹ {formatCurrencySimple(totalOutstanding)}</div>
            <div className="stat-lbl">Outstanding Balance</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#312e81', color: '#818cf8' }}>
            <Truck size={24} />
          </div>
          <div>
            <div className="stat-val">{savedLRs.length}</div>
            <div className="stat-lbl">Consignment Notes (LRs)</div>
          </div>
        </div>
      </div>

      {/* Quick Access Actions Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '28px'
        }}
      >
        <div
          onClick={() => setActiveModal('party-ledger')}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            padding: '14px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'border-color 0.15s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={18} color="#38bdf8" />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Party Ledger (Khata)</span>
          </div>
          <ArrowUpRight size={15} color="#94a3b8" />
        </div>

        <div
          onClick={() => setActiveModal('trip-slips')}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            padding: '14px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={18} color="#f59e0b" />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Fleet Trip Slips & Diesel</span>
          </div>
          <ArrowUpRight size={15} color="#94a3b8" />
        </div>

        <div
          onClick={() => setActiveModal('directory')}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            padding: '14px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={18} color="#10b981" />
            <span style={{ fontWeight: 600, fontSize: '13px' }}>Customer & Fleet Directory</span>
          </div>
          <ArrowUpRight size={15} color="#94a3b8" />
        </div>
      </div>

      {/* Recent Records Split Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        {/* Recent Invoices */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Recent Tax Invoices</h3>
            <button
              className="btn btn-secondary"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => setActiveModal('saved-invoices')}
            >
              View All ({savedInvoices.length})
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Date</th>
                <th>Client / Party</th>
                <th>Amount (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {savedInvoices.slice(0, 5).map((inv) => {
                const totalAmt = calculateBillTotal(inv.items);
                return (
                  <tr key={inv.id}>
                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>{inv.billNo}</td>
                    <td style={{ color: '#94a3b8' }}>{inv.date}</td>
                    <td style={{ fontWeight: 600 }}>{inv.clientName}</td>
                    <td style={{ fontWeight: 700 }}>₹ {formatCurrencySimple(totalAmt)}</td>
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
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '2px 6px', fontSize: '11px' }}
                        onClick={() => {
                          setCurrentInvoice(inv);
                          setActiveTab('invoice');
                        }}
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recent e-LRs */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', overflow: 'hidden' }}>
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid #334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>Recent Consignment Notes (e-LR)</h3>
            <button
              className="btn btn-secondary"
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => setActiveModal('saved-lrs')}
            >
              View All ({savedLRs.length})
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>LR No</th>
                <th>Vehicle</th>
                <th>Route (From - To)</th>
                <th>Freight</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {savedLRs.slice(0, 5).map((lr) => (
                <tr key={lr.id}>
                  <td style={{ fontWeight: 700, color: '#f87171' }}>№ {lr.lrNo}</td>
                  <td style={{ fontWeight: 600, color: '#60a5fa' }}>{lr.vehicleNo}</td>
                  <td style={{ fontSize: '12px' }}>
                    {lr.fromLocation} → {lr.toLocation}
                  </td>
                  <td style={{ fontWeight: 700 }}>₹ {formatCurrencySimple(lr.totalFreightAmount || lr.freightAmount)}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '11px' }}
                      onClick={() => {
                        setCurrentLR(lr);
                        setActiveTab('lr');
                      }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
