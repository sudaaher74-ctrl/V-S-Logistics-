import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Search, Plus, Trash2, Edit2, Users, Truck, Check } from 'lucide-react';
import { CustomerRecord, VehicleRecord } from '../../types/invoice';

export const DirectoryModal: React.FC = () => {
  const {
    customers,
    vehicles,
    saveCustomer,
    deleteCustomer,
    saveVehicle,
    deleteVehicle,
    updateCurrentInvoice,
    setActiveModal
  } = useStore();

  const [activeTab, setActiveTab] = useState<'customers' | 'vehicles'>('customers');
  const [search, setSearch] = useState('');

  // Customer Edit State
  const [editingCust, setEditingCust] = useState<CustomerRecord | null>(null);
  const [custForm, setCustForm] = useState({ name: '', phone: '', gstin: '', address: '' });

  // Vehicle Edit State
  const [editingVeh, setEditingVeh] = useState<VehicleRecord | null>(null);
  const [vehForm, setVehForm] = useState({ vehicleNo: '', driverName: '', driverPhone: '', type: '' });

  // Customer Handlers
  const handleSaveCust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custForm.name.trim()) return;
    saveCustomer({
      id: editingCust ? editingCust.id : `cust-${Date.now()}`,
      name: custForm.name.trim(),
      phone: custForm.phone.trim(),
      gstin: custForm.gstin.trim().toUpperCase(),
      address: custForm.address.trim()
    });
    setEditingCust(null);
    setCustForm({ name: '', phone: '', gstin: '', address: '' });
  };

  const handleEditCust = (cust: CustomerRecord) => {
    setEditingCust(cust);
    setCustForm({
      name: cust.name,
      phone: cust.phone || '',
      gstin: cust.gstin || '',
      address: cust.address || ''
    });
  };

  const handleApplyCustomerToBill = (cust: CustomerRecord) => {
    updateCurrentInvoice({
      clientName: cust.name,
      clientPhone: cust.phone || '',
      clientAddress: cust.address || ''
    });
    alert(`Applied ${cust.name} to active bill!`);
    setActiveModal(null);
  };

  // Vehicle Handlers
  const handleSaveVeh = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehForm.vehicleNo.trim()) return;
    saveVehicle({
      id: editingVeh ? editingVeh.id : `veh-${Date.now()}`,
      vehicleNo: vehForm.vehicleNo.trim().toUpperCase(),
      driverName: vehForm.driverName.trim(),
      driverPhone: vehForm.driverPhone.trim(),
      type: vehForm.type.trim()
    });
    setEditingVeh(null);
    setVehForm({ vehicleNo: '', driverName: '', driverPhone: '', type: '' });
  };

  const handleEditVeh = (veh: VehicleRecord) => {
    setEditingVeh(veh);
    setVehForm({
      vehicleNo: veh.vehicleNo,
      driverName: veh.driverName || '',
      driverPhone: veh.driverPhone || '',
      type: veh.type || ''
    });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
      (v.driverName && v.driverName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Users size={18} color="#10b981" />
            <span>Master Directory & Fleet Records</span>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div
          style={{
            padding: '12px 20px',
            background: '#151e2d',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div className="doc-switcher">
            <button
              className={`doc-tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('customers');
                setEditingCust(null);
              }}
            >
              <Users size={14} />
              Customers ({customers.length})
            </button>
            <button
              className={`doc-tab-btn ${activeTab === 'vehicles' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('vehicles');
                setEditingVeh(null);
              }}
            >
              <Truck size={14} />
              Fleet Vehicles ({vehicles.length})
            </button>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px' }}
              placeholder={`Search ${activeTab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          </div>
        </div>

        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Left Column: Data List */}
          <div style={{ overflowY: 'auto', maxHeight: '55vh', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            {activeTab === 'customers' ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Phone / GST</th>
                    <th>Address</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>{c.name}</td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                        <div>{c.phone || '-'}</div>
                        {c.gstin && <div style={{ color: '#38bdf8' }}>{c.gstin}</div>}
                      </td>
                      <td style={{ fontSize: '12px', color: '#94a3b8', maxWidth: '180px' }}>
                        {c.address || '-'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '11px', color: '#38bdf8' }}
                            title="Apply to Current Bill"
                            onClick={() => handleApplyCustomerToBill(c)}
                          >
                            Apply
                          </button>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            onClick={() => handleEditCust(c)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            style={{ color: '#ef4444' }}
                            onClick={() => {
                              if (confirm(`Delete customer "${c.name}"?`)) {
                                deleteCustomer(c.id);
                              }
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Vehicle No</th>
                    <th>Driver & Phone</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 800, color: '#60a5fa' }}>{v.vehicleNo}</td>
                      <td style={{ fontSize: '12px' }}>
                        <div><b>{v.driverName || '-'}</b></div>
                        <div style={{ color: '#94a3b8' }}>{v.driverPhone || '-'}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>{v.type || 'Trailer'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            onClick={() => handleEditVeh(v)}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="btn btn-secondary btn-icon-only"
                            style={{ color: '#ef4444' }}
                            onClick={() => {
                              if (confirm(`Delete vehicle ${v.vehicleNo}?`)) {
                                deleteVehicle(v.id);
                              }
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Right Column: Add / Edit Form */}
          <div style={{ background: '#141f32', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
            {activeTab === 'customers' ? (
              <form onSubmit={handleSaveCust}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', color: '#f8fafc' }}>
                  {editingCust ? 'Edit Customer' : '+ Add New Customer'}
                </div>

                <div className="form-group">
                  <label className="form-label">Customer / Party Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={custForm.name}
                    onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                    placeholder="e.g. Continental Logistics Ltd"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (WhatsApp)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={custForm.phone}
                    onChange={(e) => setCustForm({ ...custForm, phone: e.target.value })}
                    placeholder="9820123456"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">GSTIN / Tax ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={custForm.gstin}
                    onChange={(e) => setCustForm({ ...custForm, gstin: e.target.value })}
                    placeholder="27AABCM8291F1ZH"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address / Station Details</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    value={custForm.address}
                    onChange={(e) => setCustForm({ ...custForm, address: e.target.value })}
                    placeholder="Plot / Warehouse Address, City"
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Check size={14} /> {editingCust ? 'Update Customer' : 'Save Customer'}
                  </button>
                  {editingCust && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingCust(null);
                        setCustForm({ name: '', phone: '', gstin: '', address: '' });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveVeh}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '14px', color: '#f8fafc' }}>
                  {editingVeh ? 'Edit Vehicle' : '+ Add Fleet Vehicle'}
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Registration Number *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={vehForm.vehicleNo}
                    onChange={(e) => setVehForm({ ...vehForm, vehicleNo: e.target.value.toUpperCase() })}
                    placeholder="MH46DL7778"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Driver Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={vehForm.driverName}
                    onChange={(e) => setVehForm({ ...vehForm, driverName: e.target.value })}
                    placeholder="Driver Name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Driver Phone Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={vehForm.driverPhone}
                    onChange={(e) => setVehForm({ ...vehForm, driverPhone: e.target.value })}
                    placeholder="9822998811"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Type / Configuration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={vehForm.type}
                    onChange={(e) => setVehForm({ ...vehForm, type: e.target.value })}
                    placeholder="40ft Trailer, 20ft Truck, etc."
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    <Check size={14} /> {editingVeh ? 'Update Vehicle' : 'Save Vehicle'}
                  </button>
                  {editingVeh && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingVeh(null);
                        setVehForm({ vehicleNo: '', driverName: '', driverPhone: '', type: '' });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
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
