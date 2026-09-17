import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Plus, Search, Trash2, Printer, Download, Truck, FileText } from 'lucide-react';
import { TripSlip } from '../../types/invoice';
import { getNextTripSlipNumber } from '../../utils/billNumberUtils';
import { formatCurrencySimple } from '../../utils/invoiceCalculations';
import { downloadTripSlipPDF } from '../../utils/exportUtils';

export const TripSlipModal: React.FC = () => {
  const { tripSlips, saveTripSlip, deleteTripSlip, vehicles, companyProfile, setActiveModal } = useStore();

  const [search, setSearch] = useState('');
  const [selectedSlip, setSelectedSlip] = useState<TripSlip | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New slip form state
  const nextSlipNo = getNextTripSlipNumber(tripSlips.map((t) => t.slipNo));
  const todayStr = new Date().toLocaleDateString('en-GB');

  const [form, setForm] = useState<Partial<TripSlip>>({
    slipNo: nextSlipNo,
    date: todayStr,
    vehicleNo: '',
    driverName: '',
    driverPhone: '',
    fromLocation: '',
    toLocation: '',
    containerNo: '',
    dieselLiters: 100,
    dieselRate: 92.5,
    dieselAmount: 9250,
    dieselPumpName: 'Indian Oil Kamothe Hub',
    driverAdvance: 3000,
    tollCharges: 1200,
    otherExpenses: 300,
    remarks: 'Trip dispatched successfully.'
  });

  const handleLitersOrRateChange = (litersVal: any, rateVal: any) => {
    const liters = litersVal === '' ? 0 : parseFloat(litersVal);
    const rate = rateVal === '' ? 0 : parseFloat(rateVal);
    const dieselAmt = liters * rate;

    const adv = typeof form.driverAdvance === 'number' ? form.driverAdvance : 0;
    const toll = typeof form.tollCharges === 'number' ? form.tollCharges : 0;
    const other = typeof form.otherExpenses === 'number' ? form.otherExpenses : 0;

    const total = dieselAmt + adv + toll + other;

    setForm({
      ...form,
      dieselLiters: litersVal,
      dieselRate: rateVal,
      dieselAmount: dieselAmt,
      totalExpense: total
    });
  };

  const handleExpenseChange = (field: string, val: any) => {
    const num = val === '' ? 0 : parseFloat(val);
    const updated = { ...form, [field]: val };

    const dieselAmt = typeof updated.dieselAmount === 'number' ? updated.dieselAmount : 0;
    const adv = field === 'driverAdvance' ? num : (typeof updated.driverAdvance === 'number' ? updated.driverAdvance : 0);
    const toll = field === 'tollCharges' ? num : (typeof updated.tollCharges === 'number' ? updated.tollCharges : 0);
    const other = field === 'otherExpenses' ? num : (typeof updated.otherExpenses === 'number' ? updated.otherExpenses : 0);

    const total = dieselAmt + adv + toll + other;
    setForm({ ...updated, totalExpense: total });
  };

  const handleVehicleSelect = (vehNo: string) => {
    const found = vehicles.find((v) => v.vehicleNo === vehNo);
    if (found) {
      setForm({
        ...form,
        vehicleNo: found.vehicleNo,
        driverName: found.driverName || form.driverName,
        driverPhone: found.driverPhone || form.driverPhone
      });
    } else {
      setForm({ ...form, vehicleNo: vehNo });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vehicleNo || !form.slipNo) return;

    const dieselAmt = typeof form.dieselAmount === 'number' ? form.dieselAmount : 0;
    const adv = typeof form.driverAdvance === 'number' ? form.driverAdvance : 0;
    const toll = typeof form.tollCharges === 'number' ? form.tollCharges : 0;
    const other = typeof form.otherExpenses === 'number' ? form.otherExpenses : 0;
    const total = dieselAmt + adv + toll + other;

    const newTrip: TripSlip = {
      id: `trip-${Date.now()}`,
      slipNo: form.slipNo,
      date: form.date || todayStr,
      vehicleNo: form.vehicleNo.toUpperCase(),
      driverName: form.driverName || '',
      driverPhone: form.driverPhone || '',
      fromLocation: form.fromLocation || '',
      toLocation: form.toLocation || '',
      containerNo: form.containerNo || '',
      dieselLiters: form.dieselLiters || 0,
      dieselRate: form.dieselRate || 0,
      dieselAmount: dieselAmt,
      dieselPumpName: form.dieselPumpName || '',
      driverAdvance: adv,
      tollCharges: toll,
      otherExpenses: other,
      remarks: form.remarks || '',
      totalExpense: total,
      company: companyProfile,
      createdAt: new Date().toISOString()
    };

    saveTripSlip(newTrip);
    setSelectedSlip(newTrip);
    setIsCreating(false);
  };

  const filtered = tripSlips.filter(
    (t) =>
      t.slipNo.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" style={{ maxWidth: '1000px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Truck size={18} color="#f59e0b" />
            <span>Fleet Trip Slips & Diesel Expense Vouchers ({tripSlips.length})</span>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', height: '65vh' }}>
          {/* Left Column: Slips List */}
          <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                padding: '12px 16px',
                background: '#151e2d',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                gap: '8px'
              }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '32px' }}
                  placeholder="Search by Slip No, Vehicle, Driver..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
              </div>

              <button
                className="btn btn-primary"
                onClick={() => {
                  setIsCreating(true);
                  setSelectedSlip(null);
                }}
              >
                <Plus size={14} /> + New Slip
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Slip No</th>
                    <th>Date</th>
                    <th>Vehicle & Driver</th>
                    <th>Total Exp (₹)</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        background: selectedSlip?.id === s.id ? 'rgba(56, 189, 248, 0.08)' : undefined,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setSelectedSlip(s);
                        setIsCreating(false);
                      }}
                    >
                      <td style={{ fontWeight: 800, color: '#f59e0b' }}>{s.slipNo}</td>
                      <td style={{ color: '#94a3b8' }}>{s.date}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#60a5fa' }}>{s.vehicleNo}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.driverName}</div>
                      </td>
                      <td style={{ fontWeight: 700 }}>₹ {formatCurrencySimple(s.totalExpense)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-icon-only"
                          style={{ color: '#ef4444' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete Trip Slip ${s.slipNo}?`)) {
                              deleteTripSlip(s.id);
                              if (selectedSlip?.id === s.id) setSelectedSlip(null);
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Create Form or Voucher Preview */}
          <div style={{ padding: '20px', overflowY: 'auto', background: '#111827' }}>
            {isCreating ? (
              <form onSubmit={handleSave}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', color: '#f8fafc' }}>
                  Create Fleet Trip Slip & Expense Voucher
                </h3>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Slip Number</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={form.slipNo}
                      onChange={(e) => setForm({ ...form, slipNo: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vehicle Registration No. *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      list="trip-vehicles"
                      value={form.vehicleNo}
                      onChange={(e) => handleVehicleSelect(e.target.value.toUpperCase())}
                      placeholder="MH46DL7778"
                    />
                    <datalist id="trip-vehicles">
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.vehicleNo}>
                          {v.driverName ? `${v.vehicleNo} (${v.driverName})` : v.vehicleNo}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Driver Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.driverName}
                      onChange={(e) => setForm({ ...form, driverName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">From Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.fromLocation}
                      onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
                      placeholder="Nhava Sheva CFS"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">To Location</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.toLocation}
                      onChange={(e) => setForm({ ...form, toLocation: e.target.value })}
                      placeholder="MIDC Ranjangaon"
                    />
                  </div>
                </div>

                {/* Diesel Breakdown */}
                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', margin: '14px 0' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
                    Diesel Consumption Breakdown
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Diesel Liters</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={form.dieselLiters}
                        onChange={(e) => handleLitersOrRateChange(e.target.value, form.dieselRate)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rate / Liter (₹)</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        value={form.dieselRate}
                        onChange={(e) => handleLitersOrRateChange(form.dieselLiters, e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Diesel Amount (₹)</label>
                      <input
                        type="number"
                        readOnly
                        className="form-input"
                        value={form.dieselAmount}
                        style={{ color: '#38bdf8', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Diesel Station / Pump Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.dieselPumpName}
                      onChange={(e) => setForm({ ...form, dieselPumpName: e.target.value })}
                      placeholder="e.g. Indian Oil Kamothe Highway Hub"
                    />
                  </div>
                </div>

                {/* Other Expenses */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Driver Advance (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.driverAdvance}
                      onChange={(e) => handleExpenseChange('driverAdvance', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Toll Charges (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.tollCharges}
                      onChange={(e) => handleExpenseChange('tollCharges', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Other Expenses (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={form.otherExpenses}
                      onChange={(e) => handleExpenseChange('otherExpenses', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>
                    Total Trip Expense: <span style={{ color: '#f59e0b' }}>₹ {formatCurrencySimple(form.totalExpense || 0)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Trip Slip
                    </button>
                  </div>
                </div>
              </form>
            ) : selectedSlip ? (
              <div>
                {/* Printable A5 Voucher Card */}
                <div
                  id={`printable-slip-${selectedSlip.id}`}
                  style={{
                    background: '#ffffff',
                    color: '#111111',
                    padding: '20px',
                    borderRadius: '8px',
                    border: '2px solid #b91c1c',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    fontFamily: 'Times New Roman, serif'
                  }}
                >
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #b91c1c', paddingBottom: '8px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#b91c1c' }}>
                      {companyProfile.companyName || 'V S LOGISTICS'}
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                      FLEET DISPATCH VOUCHER & DIESEL EXPENSE SLIP
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      margin: '10px 0',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    <span>Slip No: {selectedSlip.slipNo}</span>
                    <span>Date: {selectedSlip.date}</span>
                    <span style={{ color: '#003399' }}>Veh: {selectedSlip.vehicleNo}</span>
                  </div>

                  <div style={{ fontSize: '12.5px', margin: '6px 0' }}>
                    <div><b>Driver:</b> {selectedSlip.driverName} ({selectedSlip.driverPhone || 'N/A'})</div>
                    <div><b>Route:</b> {selectedSlip.fromLocation} → {selectedSlip.toLocation}</div>
                    {selectedSlip.containerNo && <div><b>Container:</b> {selectedSlip.containerNo}</div>}
                  </div>

                  {/* Expense Breakdown Table */}
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      margin: '10px 0',
                      fontSize: '12.5px',
                      border: '1px solid #b91c1c'
                    }}
                  >
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '4px 6px' }}>
                          <b>Diesel:</b> {selectedSlip.dieselLiters} L @ ₹ {selectedSlip.dieselRate}
                          <div style={{ fontSize: '11px', color: '#666' }}>Pump: {selectedSlip.dieselPumpName}</div>
                        </td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}>
                          ₹ {formatCurrencySimple(selectedSlip.dieselAmount)}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '4px 6px' }}>Driver Cash Advance</td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}>
                          ₹ {formatCurrencySimple(selectedSlip.driverAdvance)}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '4px 6px' }}>Toll & Highway Fees</td>
                        <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}>
                          ₹ {formatCurrencySimple(selectedSlip.tollCharges)}
                        </td>
                      </tr>
                      {selectedSlip.otherExpenses ? (
                        <tr style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '4px 6px' }}>Other Miscellaneous Expenses</td>
                          <td style={{ textAlign: 'right', padding: '4px 6px', fontWeight: 'bold' }}>
                            ₹ {formatCurrencySimple(selectedSlip.otherExpenses)}
                          </td>
                        </tr>
                      ) : null}
                      <tr style={{ background: '#fff0f0', fontWeight: 'bold' }}>
                        <td style={{ padding: '6px' }}>TOTAL TRIP EXPENSES</td>
                        <td style={{ textAlign: 'right', padding: '6px', color: '#b91c1c', fontSize: '14px' }}>
                          ₹ {formatCurrencySimple(selectedSlip.totalExpense)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ fontSize: '11px', color: '#555', marginTop: '6px' }}>
                    <b>Remarks:</b> {selectedSlip.remarks || 'None'}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', fontSize: '12px' }}>
                    <div>Driver Signature</div>
                    <div>Authorized Signatory</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => downloadTripSlipPDF(`printable-slip-${selectedSlip.id}`, `Slip_${selectedSlip.slipNo}.pdf`)}
                  >
                    <Download size={14} /> Download PDF
                  </button>
                  <button className="btn btn-secondary" onClick={() => window.print()}>
                    <Printer size={14} /> Print
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <Truck size={36} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                Select a trip slip from the list to view voucher details or click <b>+ New Slip</b>.
              </div>
            )}
          </div>
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
