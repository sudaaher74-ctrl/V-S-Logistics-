import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import {
  Search,
  Plus,
  Download,
  Edit3,
  Printer,
  Share2,
  Trash2,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  Filter
} from 'lucide-react';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from '../../utils/invoiceCalculations';
import { exportInvoicesToCSV, shareInvoiceOnWhatsApp, downloadInvoicePDF } from '../../utils/exportUtils';
import { InvoiceData } from '../../types/invoice';

export const AllBillsView: React.FC = () => {
  const {
    savedInvoices,
    setCurrentInvoice,
    deleteInvoice,
    createNewInvoice,
    setActiveTab,
    setSelectedPaymentInvoiceId,
    setActiveModal
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTemplate, setFilterTemplate] = useState<string>('ALL');

  // KPI Calculations
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

  // Filtered List
  const filtered = savedInvoices.filter((inv) => {
    const q = search.toLowerCase().trim();
    const matchQuery =
      !q ||
      inv.billNo.toLowerCase().includes(q) ||
      inv.clientName.toLowerCase().includes(q) ||
      (inv.clientAddress && inv.clientAddress.toLowerCase().includes(q)) ||
      inv.items.some((i) => i.vehicleNo.toLowerCase().includes(q) || i.particulars.toLowerCase().includes(q));

    const matchStatus = filterStatus === 'ALL' || inv.paymentStatus === filterStatus;
    const matchTemplate = filterTemplate === 'ALL' || (inv.template || 'classic') === filterTemplate;

    return matchQuery && matchStatus && matchTemplate;
  });

  const handleEditBill = (inv: InvoiceData) => {
    setCurrentInvoice(inv);
    setActiveTab('invoice');
  };

  const handlePrintBill = (inv: InvoiceData) => {
    setCurrentInvoice(inv);
    setActiveTab('invoice');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const handleDownloadPDF = async (inv: InvoiceData) => {
    setCurrentInvoice(inv);
    setActiveTab('invoice');
    setTimeout(async () => {
      await downloadInvoicePDF(
        'printable-invoice-document',
        `Invoice_${inv.billNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      );
    }, 400);
  };

  const handleDeleteBill = (inv: InvoiceData) => {
    if (confirm(`Are you sure you want to delete Bill #${inv.billNo} (${inv.clientName})? This action cannot be undone.`)) {
      deleteInvoice(inv.id);
    }
  };

  const handleRecordPayment = (inv: InvoiceData) => {
    setSelectedPaymentInvoiceId(inv.id);
    setActiveModal('payment');
  };

  return (
    <div className="dashboard-view no-print" style={{ padding: '24px 32px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
              All Tax Invoices & Billing Register
            </h1>
            <span
              style={{
                background: '#1e3a8a',
                color: '#60a5fa',
                fontSize: '12px',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px'
              }}
            >
              {savedInvoices.length} Bills on Record
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
            Click <strong>"Edit Bill"</strong> on any invoice to reopen and make changes anytime. All edits are saved automatically.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => exportInvoicesToCSV(savedInvoices, 'V_S_Logistics_Bills.csv')}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={createNewInvoice} style={{ padding: '8px 16px', fontSize: '13px' }}>
            <Plus size={16} /> + Create New Bill
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-stats-grid" style={{ marginBottom: '22px' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#1e3a8a', color: '#60a5fa' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className="stat-val">{savedInvoices.length}</div>
            <div className="stat-lbl">Total Bills Generated</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#0284c7', color: '#bae6fd' }}>
            <DollarSign size={22} />
          </div>
          <div>
            <div className="stat-val">₹ {formatCurrencySimple(totalBilled)}</div>
            <div className="stat-lbl">Total Billed Freight</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#064e3b', color: '#34d399' }}>
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="stat-val">₹ {formatCurrencySimple(totalReceived)}</div>
            <div className="stat-lbl">Received Payments ({paidCount} Paid)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#7f1d1d', color: '#fca5a5' }}>
            <AlertCircle size={22} />
          </div>
          <div>
            <div className="stat-val">₹ {formatCurrencySimple(totalOutstanding)}</div>
            <div className="stat-lbl">Pending Receivables ({unpaidCount} Unpaid)</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px 10px 0 0',
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '13px' }}
              placeholder="Search by Bill No, Client Name, Vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="#94a3b8" />
            <select
              className="form-select"
              style={{ width: '130px', fontSize: '12px' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="UNPAID">UNPAID</option>
            </select>

            <select
              className="form-select"
              style={{ width: '140px', fontSize: '12px' }}
              value={filterTemplate}
              onChange={(e) => setFilterTemplate(e.target.value)}
            >
              <option value="ALL">All Designs</option>
              <option value="classic">📜 Classic Paper</option>
              <option value="modern">🚀 Corporate Modern</option>
              <option value="executive">💎 Executive Sidebar</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{savedInvoices.length}</strong> bills
        </div>
      </div>

      {/* Main Table of All Bills */}
      <div
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-color)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          overflow: 'hidden'
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <FileText size={48} color="#475569" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
              No bills found
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '16px' }}>
              {search ? 'Try adjusting your search or filters.' : 'You have not created any bills yet.'}
            </p>
            <button className="btn btn-primary" onClick={createNewInvoice}>
              <Plus size={15} /> Create Your First Bill
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Bill No.</th>
                <th style={{ width: '95px' }}>Date</th>
                <th>Client / Party</th>
                <th>Vehicles & Routes</th>
                <th style={{ width: '110px' }}>Total (₹)</th>
                <th style={{ width: '110px' }}>Balance (₹)</th>
                <th style={{ width: '110px' }}>Payment</th>
                <th style={{ width: '260px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => {
                const totalAmt = calculateBillTotal(inv.items);
                const advAmt = calculateAdvanceAmount(inv.items, inv.advanceDeduction);
                const balAmt = calculateBalance(totalAmt, advAmt);

                const vehiclesSummary = Array.from(
                  new Set(inv.items.map((i) => i.vehicleNo).filter(Boolean))
                ).join(', ') || '-';

                const routeSummary = inv.items.map((i) => i.particulars).filter(Boolean).slice(0, 2).join('; ') || '-';

                const templateTag =
                  inv.template === 'executive' ? (
                    <span style={{ fontSize: '10px', background: '#0d213a', color: '#38bdf8', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', border: '1px solid #1e3a8a' }}>
                      💎 Exec
                    </span>
                  ) : inv.template === 'modern' ? (
                    <span style={{ fontSize: '10px', background: '#450a0a', color: '#f87171', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px', border: '1px solid #7f1d1d' }}>
                      🚀 Corp
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', background: '#374151', color: '#d1d5db', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>
                      📜 Classic
                    </span>
                  );

                return (
                  <tr key={inv.id} style={{ cursor: 'pointer' }} onClick={() => handleEditBill(inv)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '13px' }}>
                          #{inv.billNo}
                        </span>
                        {templateTag}
                      </div>
                    </td>
                    <td style={{ color: '#cbd5e1', fontSize: '12px' }}>{inv.date}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '13px' }}>
                        {inv.clientName || 'Untitled Client'}
                      </div>
                      {inv.clientAddress && (
                        <div style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inv.clientAddress}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '12px' }}>
                          {vehiclesSummary}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {routeSummary}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: '#f8fafc', fontSize: '13px' }}>
                        ₹ {formatCurrencySimple(totalAmt)}
                      </strong>
                    </td>
                    <td>
                      <strong style={{ color: balAmt > 0 ? '#f87171' : '#34d399', fontSize: '13px' }}>
                        ₹ {formatCurrencySimple(balAmt)}
                      </strong>
                    </td>
                    <td>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRecordPayment(inv);
                        }}
                        style={{
                          background:
                            inv.paymentStatus === 'PAID'
                              ? '#064e3b'
                              : inv.paymentStatus === 'PARTIAL'
                              ? '#78350f'
                              : '#7f1d1d',
                          color: '#ffffff',
                          border: 'none',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Click to Record or Update Payment"
                      >
                        {inv.paymentStatus || 'UNPAID'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        {/* Primary Edit Button */}
                        <button
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '11.5px', fontWeight: 700 }}
                          onClick={() => handleEditBill(inv)}
                          title="Open and edit this bill anytime"
                        >
                          <Edit3 size={13} /> Edit Bill
                        </button>

                        {/* Print */}
                        <button
                          className="btn btn-secondary btn-icon-only"
                          onClick={() => handlePrintBill(inv)}
                          title="Print bill"
                        >
                          <Printer size={13} />
                        </button>

                        {/* PDF Download */}
                        <button
                          className="btn btn-secondary btn-icon-only"
                          onClick={() => handleDownloadPDF(inv)}
                          title="Download PDF"
                        >
                          <Download size={13} />
                        </button>

                        {/* WhatsApp */}
                        <button
                          className="btn btn-success btn-icon-only"
                          onClick={() => shareInvoiceOnWhatsApp(inv)}
                          title="Share bill on WhatsApp"
                        >
                          <Share2 size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          className="btn btn-secondary btn-icon-only"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDeleteBill(inv)}
                          title="Delete bill"
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
    </div>
  );
};
