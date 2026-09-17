import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Search, Trash2, Edit3, Share2, Layers, CheckSquare, Square } from 'lucide-react';
import { shareLROnWhatsApp } from '../../utils/exportUtils';
import { formatCurrencySimple } from '../../utils/invoiceCalculations';
import { ConsignmentNote } from '../../types/invoice';

export const SavedConsignmentNotesModal: React.FC = () => {
  const {
    savedLRs,
    setCurrentLR,
    deleteLR,
    consolidateLRsToInvoice,
    setActiveModal,
    setActiveTab
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = savedLRs.filter((lr) => {
    return (
      lr.lrNo.toLowerCase().includes(search.toLowerCase()) ||
      lr.consignorName.toLowerCase().includes(search.toLowerCase()) ||
      lr.consigneeName.toLowerCase().includes(search.toLowerCase()) ||
      lr.vehicleNo.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((l) => l.id));
    }
  };

  const handleOpen = (lr: ConsignmentNote) => {
    setCurrentLR(lr);
    setActiveTab('lr');
    setActiveModal(null);
  };

  const handleConsolidate = () => {
    if (selectedIds.length === 0) {
      alert('Please select at least one Consignment Note to consolidate.');
      return;
    }
    consolidateLRsToInvoice(selectedIds);
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Layers size={18} color="#ef4444" />
            <span>Saved Goods Consignment Notes (e-LR / Bilty) ({savedLRs.length})</span>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
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
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Search by LR No, Consignor, Consignee, Vehicle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8' }} />
          </div>

          <button
            className="btn btn-primary"
            disabled={selectedIds.length === 0}
            onClick={handleConsolidate}
            title="Combine selected LRs into a consolidated Tax Invoice"
          >
            <Layers size={14} /> Consolidate Selected ({selectedIds.length}) into Invoice
          </button>
        </div>

        {/* Table Body */}
        <div className="modal-body" style={{ padding: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No consignment notes found.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <span onClick={toggleSelectAll} style={{ cursor: 'pointer' }}>
                      {selectedIds.length === filtered.length && filtered.length > 0 ? (
                        <CheckSquare size={16} color="#38bdf8" />
                      ) : (
                        <Square size={16} color="#94a3b8" />
                      )}
                    </span>
                  </th>
                  <th>LR No</th>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Consignor (From)</th>
                  <th>Consignee (To)</th>
                  <th>Cargo / Container</th>
                  <th>Freight (₹)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((lr) => {
                  const isSelected = selectedIds.includes(lr.id);
                  return (
                    <tr key={lr.id} style={{ background: isSelected ? 'rgba(56, 189, 248, 0.08)' : undefined }}>
                      <td>
                        <span onClick={() => toggleSelect(lr.id)} style={{ cursor: 'pointer' }}>
                          {isSelected ? (
                            <CheckSquare size={16} color="#38bdf8" />
                          ) : (
                            <Square size={16} color="#94a3b8" />
                          )}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#ef4444' }}>№ {lr.lrNo}</td>
                      <td style={{ color: '#94a3b8' }}>{lr.date}</td>
                      <td style={{ fontWeight: 700, color: '#60a5fa' }}>{lr.vehicleNo}</td>
                      <td style={{ fontSize: '12px' }}>
                        <div><b>{lr.consignorName}</b></div>
                        <div style={{ color: '#94a3b8' }}>From: {lr.fromLocation}</div>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        <div><b>{lr.consigneeName}</b></div>
                        <div style={{ color: '#94a3b8' }}>To: {lr.toLocation}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                        <div>{lr.packagesCount}</div>
                        {lr.containerNo && <div>Cont: {lr.containerNo}</div>}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        ₹ {formatCurrencySimple(lr.totalFreightAmount || lr.freightAmount)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => handleOpen(lr)}
                            title="Open in LR Editor"
                          >
                            <Edit3 size={13} /> Open
                          </button>

                          <button
                            className="btn btn-secondary btn-icon-only"
                            style={{ color: '#22c55e' }}
                            onClick={() => shareLROnWhatsApp(lr)}
                            title="Share on WhatsApp"
                          >
                            <Share2 size={13} />
                          </button>

                          <button
                            className="btn btn-secondary btn-icon-only"
                            style={{ color: '#ef4444' }}
                            onClick={() => {
                              if (confirm(`Delete LR № ${lr.lrNo}?`)) {
                                deleteLR(lr.id);
                              }
                            }}
                            title="Delete LR"
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
