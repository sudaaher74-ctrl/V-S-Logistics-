import React from 'react';
import { useStore } from '../../store/useStore';
import { ConsignmentCopyType } from '../../types/invoice';
import { ArrowRight, Save, Plus } from 'lucide-react';

export const ConsignmentNoteEditor: React.FC = () => {
  const {
    currentLR,
    updateCurrentLR,
    saveCurrentLR,
    createNewLR,
    convertLRToInvoice,
    customers,
    vehicles
  } = useStore();

  const copies: ConsignmentCopyType[] = [
    'CONSIGNEE COPY',
    'CONSIGNOR COPY',
    'DRIVER COPY',
    'OFFICE COPY',
    'TRANSPORTER COPY'
  ];

  const handleFreightChange = (field: string, val: string) => {
    const num = val === '' ? '' : parseFloat(val);
    const updated = { ...currentLR, [field]: num };

    // Auto calculate total freight
    const fAmt = typeof updated.freightAmount === 'number' ? updated.freightAmount : 0;
    const bAmt = typeof updated.biltyCharges === 'number' ? updated.biltyCharges : 0;
    const dAmt = typeof updated.doorDeliveryCharges === 'number' ? updated.doorDeliveryCharges : 0;
    const gAmt = typeof updated.gstAmount === 'number' ? updated.gstAmount : 0;

    const total = fAmt + bAmt + dAmt + gAmt;
    updateCurrentLR({ ...updated, totalFreightAmount: total > 0 ? total : '' });
  };

  return (
    <div className="editor-sidebar no-print">
      <div className="sidebar-tabs">
        <button className="sidebar-tab active">
          e-LR Consignment Note Form
        </button>
      </div>

      <div className="sidebar-content">
        {/* Quick Convert Action Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            padding: '12px 14px',
            borderRadius: '8px',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>Convert to Tax Invoice</div>
            <div style={{ fontSize: '11px', opacity: 0.85 }}>Transposes Route, Consignee & Freight into Invoice</div>
          </div>
          <button
            className="btn btn-amber"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            onClick={() => convertLRToInvoice(currentLR)}
          >
            Convert <ArrowRight size={13} />
          </button>
        </div>

        {/* Copy Type Selector */}
        <div className="form-group">
          <label className="form-label">Active Document Copy Stamp</label>
          <select
            className="form-select"
            value={currentLR.copyType}
            onChange={(e) => updateCurrentLR({ copyType: e.target.value as ConsignmentCopyType })}
          >
            {copies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Basic Identification */}
        <div className="form-section-title">
          <span>Identification</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">LR / GC No.</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.lrNo}
              onChange={(e) => updateCurrentLR({ lrNo: e.target.value })}
              placeholder="025992"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.date}
              onChange={(e) => updateCurrentLR({ date: e.target.value })}
              placeholder="01/08/2026"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Vehicle Registration No.</label>
          <input
            type="text"
            className="form-input"
            list="lr-vehicles"
            value={currentLR.vehicleNo}
            onChange={(e) => updateCurrentLR({ vehicleNo: e.target.value.toUpperCase() })}
            placeholder="MH46DL7778"
          />
          <datalist id="lr-vehicles">
            {vehicles.map((v) => (
              <option key={v.id} value={v.vehicleNo}>
                {v.driverName ? `${v.vehicleNo} (${v.driverName})` : v.vehicleNo}
              </option>
            ))}
          </datalist>
        </div>

        {/* Consignor Details */}
        <div className="form-section-title" style={{ marginTop: 12 }}>
          <span>Consignor (Sender / Pickup)</span>
        </div>

        <div className="form-group">
          <label className="form-label">Consignor Name</label>
          <input
            type="text"
            className="form-input"
            list="lr-consignors"
            value={currentLR.consignorName}
            onChange={(e) => updateCurrentLR({ consignorName: e.target.value })}
            placeholder="Continental Warehousing Corp Ltd"
          />
          <datalist id="lr-consignors">
            {customers.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1.5 }}>
            <label className="form-label">From Station / City</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.fromLocation}
              onChange={(e) => updateCurrentLR({ fromLocation: e.target.value })}
              placeholder="Nhava Sheva / Indev"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Consignor GST</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.consignorGst || ''}
              onChange={(e) => updateCurrentLR({ consignorGst: e.target.value })}
              placeholder="27AAACC4912K1ZT"
            />
          </div>
        </div>

        {/* Consignee Details */}
        <div className="form-section-title" style={{ marginTop: 12 }}>
          <span>Consignee (Receiver / Delivery)</span>
        </div>

        <div className="form-group">
          <label className="form-label">Consignee Name</label>
          <input
            type="text"
            className="form-input"
            list="lr-consignees"
            value={currentLR.consigneeName}
            onChange={(e) => updateCurrentLR({ consigneeName: e.target.value })}
            placeholder="Mauli Transport Services"
          />
          <datalist id="lr-consignees">
            {customers.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1.5 }}>
            <label className="form-label">To Station / City</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.toLocation}
              onChange={(e) => updateCurrentLR({ toLocation: e.target.value })}
              placeholder="Ranjangaon, Pune"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Consignee GST</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.consigneeGst || ''}
              onChange={(e) => updateCurrentLR({ consigneeGst: e.target.value })}
              placeholder="27AABCM8291F1ZH"
            />
          </div>
        </div>

        {/* Cargo Specification */}
        <div className="form-section-title" style={{ marginTop: 12 }}>
          <span>Cargo & Containers</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Packages Count</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.packagesCount}
              onChange={(e) => updateCurrentLR({ packagesCount: e.target.value })}
              placeholder="1X40' HC"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Container No.</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.containerNo || ''}
              onChange={(e) => updateCurrentLR({ containerNo: e.target.value })}
              placeholder="BEAU5560140"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description (Said to Contain)</label>
          <input
            type="text"
            className="form-input"
            value={currentLR.description}
            onChange={(e) => updateCurrentLR({ description: e.target.value })}
            placeholder="Flowlac-100 Lactose Material"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Sender Weight</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.senderWeight}
              onChange={(e) => updateCurrentLR({ senderWeight: e.target.value })}
              placeholder="24.50 MT"
            />
          </div>
          <div className="form-group">
            <label className="form-label">PO / Job Ref Number</label>
            <input
              type="text"
              className="form-input"
              value={currentLR.poNumber || ''}
              onChange={(e) => updateCurrentLR({ poNumber: e.target.value })}
              placeholder="PO-RNJ-88219"
            />
          </div>
        </div>

        {/* Freight Calculation */}
        <div className="form-section-title" style={{ marginTop: 12 }}>
          <span>Freight Breakdown</span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Freight Type</label>
            <select
              className="form-select"
              value={currentLR.freightType}
              onChange={(e) => updateCurrentLR({ freightType: e.target.value as any })}
            >
              <option value="TBB">T.B.B. (To Be Billed)</option>
              <option value="PAID">PAID</option>
              <option value="TO PAY">TO PAY</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">GST Payable By</label>
            <select
              className="form-select"
              value={currentLR.gstPayableBy}
              onChange={(e) => updateCurrentLR({ gstPayableBy: e.target.value as any })}
            >
              <option value="CONSIGNEE">CONSIGNEE</option>
              <option value="CONSIGNOR">CONSIGNOR</option>
              <option value="CARRIER">CARRIER</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Freight Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              value={currentLR.freightAmount}
              onChange={(e) => handleFreightChange('freightAmount', e.target.value)}
              placeholder="28500"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Bilty Charges (₹)</label>
            <input
              type="number"
              className="form-input"
              value={currentLR.biltyCharges || 0}
              onChange={(e) => handleFreightChange('biltyCharges', e.target.value)}
              placeholder="100"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Total Freight (₹)</label>
            <input
              type="number"
              className="form-input"
              value={currentLR.totalFreightAmount}
              onChange={(e) => updateCurrentLR({ totalFreightAmount: e.target.value === '' ? '' : Number(e.target.value) })}
              placeholder="28600"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Delivery Type</label>
            <select
              className="form-select"
              value={currentLR.deliveryType || 'Door Delivery'}
              onChange={(e) => updateCurrentLR({ deliveryType: e.target.value as any })}
            >
              <option value="Door Delivery">Door Delivery</option>
              <option value="Godown">Godown</option>
              <option value="Unloading By Consignee">Unloading By Consignee</option>
              <option value="Unloading By Transport">Unloading By Transport</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">E-Waybill Number</label>
          <input
            type="text"
            className="form-input"
            value={currentLR.ewayBillNo || ''}
            onChange={(e) => updateCurrentLR({ ewayBillNo: e.target.value })}
            placeholder="241088491200"
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: 16 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveCurrentLR}>
            <Save size={14} /> Save LR
          </button>
          <button className="btn btn-secondary" onClick={createNewLR}>
            <Plus size={14} /> New LR
          </button>
        </div>
      </div>
    </div>
  );
};
