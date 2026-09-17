import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, Copy, UserCheck, Truck, Layout, Shield, ListOrdered } from 'lucide-react';
import { LineItem } from '../../types/invoice';

export const InvoiceEditor: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'bill' | 'company' | 'bank'>('items');

  const {
    currentInvoice,
    updateCurrentInvoice,
    updateLineItem,
    addLineItem,
    removeLineItem,
    cloneLineItem,
    customers,
    vehicles,
    savedInvoices,
    saveCustomer,
    saveVehicle,
    companyProfile,
    updateCompanyProfile,
    bankDetails,
    updateBankDetails,
    setActiveTab
  } = useStore();

  const isExistingBill = savedInvoices.some((inv) => inv.id === currentInvoice.id);

  // Route presets
  const routePresets = [
    'Indev to Ranjangaon',
    'Continental to Vasai',
    'Nhava Sheva to Chakan',
    'Port to Factory',
    'Emty Charges',
    'Empty Offloading',
    'Kalamboli to Bhiwandi'
  ];

  // Weight / Size presets
  const weightPresets = ["1X40'", "1X20'", 'FIXED', '24 MT', '32 MT', '-'];

  // Check if customer is already saved in directory
  const isCustomerSaved = customers.some(
    (c) => c.name.toLowerCase() === (currentInvoice.clientName || '').toLowerCase().trim()
  );

  const handleSaveCustomerToDirectory = () => {
    if (!currentInvoice.clientName) return;
    saveCustomer({
      id: `cust-${Date.now()}`,
      name: currentInvoice.clientName,
      phone: currentInvoice.clientPhone || '',
      address: currentInvoice.clientAddress || '',
      gstin: ''
    });
    alert(`Saved "${currentInvoice.clientName}" to Directory!`);
  };

  const handleSelectCustomer = (clientName: string) => {
    const found = customers.find((c) => c.name === clientName);
    if (found) {
      updateCurrentInvoice({
        clientName: found.name,
        clientPhone: found.phone || '',
        clientAddress: found.address || ''
      });
    } else {
      updateCurrentInvoice({ clientName });
    }
  };

  return (
    <div className="editor-sidebar no-print">
      {/* Editing Status Banner */}
      <div className="editing-status-bar">
        <span className="esb-label">
          {isExistingBill ? `✏️ Editing: Bill #${currentInvoice.billNo}` : `📄 New Bill #${currentInvoice.billNo}`}
        </span>
        {isExistingBill ? (
          <span className="esb-saved-tag">● AUTO-SAVED</span>
        ) : (
          <span className="esb-new-tag">UNSAVED</span>
        )}
        <button
          className="esb-view-all-btn"
          onClick={() => setActiveTab('all-bills')}
          title="View all saved bills"
        >
          <ListOrdered size={12} style={{ display: 'inline', marginRight: 4 }} />
          All Bills
        </button>
      </div>

      {/* Design Template Switcher */}
      <div className="template-editor-bar">
        <span className="template-bar-label">INVOICE DESIGN:</span>
        <div className="template-bar-toggles">
          <button
            type="button"
            className={`template-bar-btn ${(!currentInvoice.template || currentInvoice.template === 'classic') ? 'active' : ''}`}
            onClick={() => updateCurrentInvoice({ template: 'classic' })}
            title="Classic physical paper stationery format"
          >
            📜 Classic
          </button>
          <button
            type="button"
            className={`template-bar-btn ${currentInvoice.template === 'modern' ? 'active' : ''}`}
            onClick={() => updateCurrentInvoice({ template: 'modern' })}
            title="Corporate Modern (Top Truck Banner & Cards)"
          >
            🚀 Corporate
          </button>
          <button
            type="button"
            className={`template-bar-btn ${currentInvoice.template === 'executive' ? 'active' : ''}`}
            onClick={() => updateCurrentInvoice({ template: 'executive' })}
            title="Executive Sidebar (Navy Left Bar & World Map)"
          >
            💎 Executive
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="sidebar-tabs">
        <button
          className={`sidebar-tab ${activeSubTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('items')}
        >
          Line Items ({currentInvoice.items.length})
        </button>
        <button
          className={`sidebar-tab ${activeSubTab === 'bill' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('bill')}
        >
          Bill & Client
        </button>
        <button
          className={`sidebar-tab ${activeSubTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('company')}
        >
          Company
        </button>
        <button
          className={`sidebar-tab ${activeSubTab === 'bank' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('bank')}
        >
          Bank Remit
        </button>
      </div>

      <div className="sidebar-content">
        {/* ================= TAB 1: LINE ITEMS ================= */}
        {activeSubTab === 'items' && (
          <div>
            <div className="form-section-title">
              <span>Bill Line Items</span>
              <button
                className="btn btn-primary"
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => addLineItem()}
              >
                <Plus size={13} />
                Add Row
              </button>
            </div>

            {currentInvoice.items.map((item, index) => {
              // Check if vehicle is in directory
              const isVehSaved = vehicles.some(
                (v) => v.vehicleNo.toLowerCase() === (item.vehicleNo || '').toLowerCase().trim()
              );

              return (
                <div key={item.id} className="item-card">
                  <div className="item-card-header">
                    <span>Item #{index + 1}</span>
                    <div className="item-card-actions">
                      <button
                        className="btn-icon-only"
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        title="Clone Item"
                        onClick={() => cloneLineItem(item.id)}
                      >
                        <Copy size={13} />
                      </button>
                      {currentInvoice.items.length > 1 && (
                        <button
                          className="btn-icon-only"
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          title="Delete Item"
                          onClick={() => removeLineItem(item.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ flex: 1 }}>
                      <label className="form-label">Date</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.date}
                        onChange={(e) => updateLineItem(item.id, { date: e.target.value })}
                        placeholder="01/08/26"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1.5 }}>
                      <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Vehicle No.</span>
                        {item.vehicleNo && !isVehSaved && (
                          <span
                            style={{ color: '#38bdf8', cursor: 'pointer', fontSize: '10px' }}
                            onClick={() => {
                              saveVehicle({ id: `veh-${Date.now()}`, vehicleNo: item.vehicleNo });
                              alert(`Saved ${item.vehicleNo} to Directory!`);
                            }}
                          >
                            +Save Veh
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.vehicleNo}
                        list="vehicle-datalist"
                        onChange={(e) => updateLineItem(item.id, { vehicleNo: e.target.value.toUpperCase() })}
                        placeholder="MH46DL7778"
                      />
                    </div>
                  </div>

                  {/* Route & Particulars */}
                  <div className="form-group">
                    <label className="form-label">Particulars / Trip Route</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.particulars}
                      onChange={(e) => updateLineItem(item.id, { particulars: e.target.value })}
                      placeholder="Indev to Ranjangaon"
                    />
                    <div className="preset-pills-row">
                      {routePresets.map((r) => (
                        <span
                          key={r}
                          className="preset-pill"
                          onClick={() => updateLineItem(item.id, { particulars: r })}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Container & Weight */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Container / Size / Pkg</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.containerNo}
                        onChange={(e) => updateLineItem(item.id, { containerNo: e.target.value })}
                        placeholder="1X40'"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Weight / Unit</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.weight}
                        onChange={(e) => updateLineItem(item.id, { weight: e.target.value })}
                        placeholder="FIXED"
                      />
                    </div>
                  </div>

                  <div className="preset-pills-row" style={{ marginTop: -4 }}>
                    {weightPresets.map((w) => (
                      <span
                        key={w}
                        className="preset-pill"
                        onClick={() => updateLineItem(item.id, { containerNo: w, weight: w })}
                      >
                        {w}
                      </span>
                    ))}
                  </div>

                  {/* Amount & Advance */}
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Amount (Gross Freight ₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={item.amount}
                        onChange={(e) =>
                          updateLineItem(item.id, {
                            amount: e.target.value === '' ? '' : Number(e.target.value)
                          })
                        }
                        placeholder="28500"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Line Advance (₹)</label>
                      <input
                        type="text"
                        className="form-input"
                        value={item.advance}
                        onChange={(e) => updateLineItem(item.id, { advance: e.target.value })}
                        placeholder="-"
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Datalist for autocomplete */}
            <datalist id="vehicle-datalist">
              {vehicles.map((v) => (
                <option key={v.id} value={v.vehicleNo}>
                  {v.driverName ? `${v.vehicleNo} (${v.driverName})` : v.vehicleNo}
                </option>
              ))}
            </datalist>
          </div>
        )}

        {/* ================= TAB 2: BILL & CLIENT ================= */}
        {activeSubTab === 'bill' && (
          <div>
            <div className="form-section-title">
              <span>Client / Party Details</span>
              {currentInvoice.clientName && !isCustomerSaved && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '11px' }}
                  onClick={handleSaveCustomerToDirectory}
                >
                  <UserCheck size={12} />
                  Save to Directory
                </button>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Select Customer (or type new)</label>
              <input
                type="text"
                className="form-input"
                list="client-datalist"
                value={currentInvoice.clientName}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                placeholder="Mauli Transport Services"
              />
              <datalist id="client-datalist">
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.phone ? `${c.name} (${c.phone})` : c.name}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Client Address / Station</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={currentInvoice.clientAddress || ''}
                onChange={(e) => updateCurrentInvoice({ clientAddress: e.target.value })}
                placeholder="Office Address / Delivery Point"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Client Phone (for WhatsApp dispatch)</label>
              <input
                type="text"
                className="form-input"
                value={currentInvoice.clientPhone || ''}
                onChange={(e) => updateCurrentInvoice({ clientPhone: e.target.value })}
                placeholder="9820123456"
              />
            </div>

            <div className="form-section-title" style={{ marginTop: 16 }}>
              <span>Invoice Metadata</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Bill Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentInvoice.billNo}
                  onChange={(e) => updateCurrentInvoice({ billNo: e.target.value })}
                  placeholder="064"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Bill Date</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentInvoice.date}
                  onChange={(e) => updateCurrentInvoice({ date: e.target.value })}
                  placeholder="04/08/2026"
                />
              </div>
            </div>

            {/* Ref Doc Type & Number */}
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Ref Doc Type</label>
                <select
                  className="form-select"
                  value={currentInvoice.refDocType || 'BE NO'}
                  onChange={(e) => updateCurrentInvoice({ refDocType: e.target.value })}
                >
                  <option value="BE NO">BE NO</option>
                  <option value="INVOICE NO">INVOICE NO</option>
                  <option value="LR NO">LR NO</option>
                  <option value="LR NOS">LR NOS</option>
                  <option value="CHALLAN NO">CHALLAN NO</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1.5 }}>
                <label className="form-label">Ref Document No</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentInvoice.beNo || ''}
                  onChange={(e) => updateCurrentInvoice({ beNo: e.target.value })}
                  placeholder="BE-994102 or LR-025992"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ref Document Date</label>
              <input
                type="text"
                className="form-input"
                value={currentInvoice.beDate || ''}
                onChange={(e) => updateCurrentInvoice({ beDate: e.target.value })}
                placeholder="01/08/2026"
              />
            </div>

            <div className="form-section-title" style={{ marginTop: 16 }}>
              <span>Deductions & Payment Status</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Advance Deduction (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentInvoice.advanceDeduction || 0}
                  onChange={(e) => updateCurrentInvoice({ advanceDeduction: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Status</label>
                <select
                  className="form-select"
                  value={currentInvoice.paymentStatus || 'UNPAID'}
                  onChange={(e) => updateCurrentInvoice({ paymentStatus: e.target.value as any })}
                >
                  <option value="UNPAID">UNPAID</option>
                  <option value="PARTIAL">PARTIAL</option>
                  <option value="PAID">PAID</option>
                </select>
              </div>
            </div>

            {/* Template Format Switch */}
            <div className="form-section-title" style={{ marginTop: 16 }}>
              <span>Stationery Template</span>
            </div>
            <div className="form-row">
              <button
                type="button"
                className={`btn ${currentInvoice.template !== 'modern' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => updateCurrentInvoice({ template: 'classic' })}
              >
                Classic Stationery (Red)
              </button>
              <button
                type="button"
                className={`btn ${currentInvoice.template === 'modern' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => updateCurrentInvoice({ template: 'modern' })}
              >
                Modern Corporate
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 3: COMPANY PROFILE ================= */}
        {activeSubTab === 'company' && (
          <div>
            <div className="form-section-title">
              <span>Company Information</span>
              <button
                className="btn btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px' }}
                onClick={() => alert('Company profile saved as default!')}
              >
                Save as Default
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                className="form-input"
                value={companyProfile.companyName}
                onChange={(e) => updateCompanyProfile({ companyName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                className="form-input"
                value={companyProfile.tagline}
                onChange={(e) => updateCompanyProfile({ tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Office Address Line 1</label>
              <input
                type="text"
                className="form-input"
                value={companyProfile.addressLine1}
                onChange={(e) => updateCompanyProfile({ addressLine1: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Office Address Line 2</label>
              <input
                type="text"
                className="form-input"
                value={companyProfile.addressLine2}
                onChange={(e) => updateCompanyProfile({ addressLine2: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mobile Numbers</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyProfile.mobiles}
                  onChange={(e) => updateCompanyProfile({ mobiles: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">PAN Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyProfile.panNo}
                  onChange={(e) => updateCompanyProfile({ panNo: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={companyProfile.email}
                onChange={(e) => updateCompanyProfile({ email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Signatory Title</label>
              <input
                type="text"
                className="form-input"
                value={companyProfile.proprietorText}
                onChange={(e) => updateCompanyProfile({ proprietorText: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* ================= TAB 4: BANK REMITTANCE ================= */}
        {activeSubTab === 'bank' && (
          <div>
            <div className="form-section-title">
              <span>Bank & Remittance Details</span>
            </div>

            <div className="form-group">
              <label className="form-label">Bank Name</label>
              <input
                type="text"
                className="form-input"
                value={bankDetails.bankName}
                onChange={(e) => updateBankDetails({ bankName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Branch Name</label>
              <input
                type="text"
                className="form-input"
                value={bankDetails.branch}
                onChange={(e) => updateBankDetails({ branch: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Number</label>
              <input
                type="text"
                className="form-input"
                value={bankDetails.accountNo}
                onChange={(e) => updateBankDetails({ accountNo: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">IFSC Code</label>
              <input
                type="text"
                className="form-input"
                value={bankDetails.ifscCode}
                onChange={(e) => updateBankDetails({ ifscCode: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
