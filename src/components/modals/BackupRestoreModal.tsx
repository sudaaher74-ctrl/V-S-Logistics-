import React, { useState, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { X, Database, Download, Upload, RefreshCw, AlertTriangle, Cloud } from 'lucide-react';
import { isSupabaseConfigured } from '../../utils/supabase';

export const BackupRestoreModal: React.FC = () => {
  const {
    exportBackupJSON,
    restoreFromJSON,
    resetToDemo,
    setActiveModal,
    savedInvoices,
    savedLRs,
    customers,
    vehicles,
    tripSlips
  } = useStore();

  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('merge');
  const [jsonText, setJsonText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportBackup = () => {
    const json = exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `VS_Logistics_Backup_${timestamp}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setJsonText(content);
      }
    };
    reader.readAsText(file);
  };

  const handlePerformRestore = () => {
    if (!jsonText.trim()) {
      alert('Please select a backup file or paste valid backup JSON.');
      return;
    }
    const success = restoreFromJSON(jsonText, restoreMode);
    if (success) {
      alert('System data restored successfully!');
      setActiveModal(null);
    } else {
      alert('Failed to restore data. Please verify the JSON format.');
    }
  };

  const handleResetToDemo = () => {
    if (
      confirm(
        'Are you sure you want to reset all data to default transport demo records? Any unsaved changes will be overwritten.'
      )
    ) {
      resetToDemo();
      alert('Database reset to official V S LOGISTICS demo records!');
      setActiveModal(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setActiveModal(null)}>
      <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Database size={18} color="#38bdf8" />
            <span>Database Backup, Restore & Cloud Sync</span>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Cloud Sync Status Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: isSupabaseConfigured ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              border: `1px solid ${isSupabaseConfigured ? '#10b981' : '#3b82f6'}`,
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Cloud size={20} color={isSupabaseConfigured ? '#10b981' : '#3b82f6'} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>
                  {isSupabaseConfigured
                    ? 'Cloud Synchronization: CONNECTED (Supabase)'
                    : 'Offline Storage: ACTIVE (Local Cache)'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {isSupabaseConfigured
                    ? 'Invoices and consignment notes are continuously synced to PostgreSQL.'
                    : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable multi-device sync.'}
                </div>
              </div>
            </div>
          </div>

          {/* Stats on Current Database */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            <div style={{ background: '#141f32', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#38bdf8' }}>{savedInvoices.length}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Invoices</div>
            </div>
            <div style={{ background: '#141f32', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#ef4444' }}>{savedLRs.length}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>e-LR Bilty</div>
            </div>
            <div style={{ background: '#141f32', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#10b981' }}>{customers.length}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Clients</div>
            </div>
            <div style={{ background: '#141f32', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#f59e0b' }}>{vehicles.length}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Vehicles</div>
            </div>
          </div>

          {/* Section 1: Full System Export */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              1. Full Database Export (JSON Backup)
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
              Generates a single self-contained JSON backup containing all bills, consignment notes, directory masters, and trip slips.
            </p>
            <button className="btn btn-primary" onClick={handleExportBackup}>
              <Download size={14} /> Download System Backup JSON
            </button>
          </div>

          {/* Section 2: Restore */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#f8fafc' }}>
              2. Restore from JSON Backup
            </h4>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Select Backup File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: '#94a3b8' }}>Restore Mode:</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="restoreMode"
                    value="merge"
                    checked={restoreMode === 'merge'}
                    onChange={() => setRestoreMode('merge')}
                  />
                  Merge Unique
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="restoreMode"
                    value="replace"
                    checked={restoreMode === 'replace'}
                    onChange={() => setRestoreMode('replace')}
                  />
                  Replace All
                </label>
              </div>
            </div>

            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Or paste backup JSON text here..."
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              style={{ fontFamily: 'monospace', fontSize: '11px' }}
            />

            <div style={{ marginTop: '10px' }}>
              <button className="btn btn-success" onClick={handlePerformRestore}>
                <Upload size={14} /> Confirm & Restore
              </button>
            </div>
          </div>

          {/* Section 3: Reset to Demo */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#f87171' }}>
              3. Reset to Demo Records
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '10px' }}>
              Restores authentic V S LOGISTICS sample transport data from the physical paper bill.
            </p>
            <button className="btn btn-secondary" style={{ color: '#ef4444' }} onClick={handleResetToDemo}>
              <RefreshCw size={14} /> Reset to Demo Data
            </button>
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
