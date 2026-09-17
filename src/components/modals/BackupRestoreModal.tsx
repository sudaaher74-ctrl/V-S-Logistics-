import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
  X,
  Database,
  Download,
  Upload,
  RefreshCw,
  Server,
  Cloud,
  CheckCircle,
  AlertCircle,
  Key,
  ExternalLink,
  Save
} from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  getSupabaseClient
} from '../../utils/supabase';
import { apiService } from '../../utils/apiService';

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

  // SQLite Database status
  const [sqliteStatus, setSqliteStatus] = useState<{ online: boolean; dbPath?: string }>({ online: false });
  const [isSyncingSqlite, setIsSyncingSqlite] = useState(false);

  // Supabase Cloud state
  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.key);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [cloudMessage, setCloudMessage] = useState('');

  useEffect(() => {
    // Check local SQLite backend
    apiService.checkStatus().then((res) => {
      setSqliteStatus({ online: res.online, dbPath: res.dbPath });
    });

    // Check Supabase if configured
    if (creds.url && creds.key) {
      testCloudConnection(creds.url, creds.key);
    }
  }, []);

  const testCloudConnection = async (url: string, key: string) => {
    if (!url || !key) {
      setCloudStatus('disconnected');
      return;
    }
    setCloudStatus('testing');
    try {
      const client = getSupabaseClient();
      if (!client) throw new Error('Could not create Supabase client');

      const { error } = await client.from('invoices').select('id').limit(1);
      if (error) {
        setCloudStatus('disconnected');
        setCloudMessage(error.message || 'Connection failed');
      } else {
        setCloudStatus('connected');
        setCloudMessage('Connected successfully to free PostgreSQL database!');
      }
    } catch (err: any) {
      setCloudStatus('disconnected');
      setCloudMessage(err.message || 'Connection failed');
    }
  };

  const handleSaveCloudCredentials = () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Please provide both Supabase Project URL and Anon API Key.');
      return;
    }
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    testCloudConnection(supabaseUrl, supabaseKey);
    alert('Supabase credentials saved!');
  };

  // Sync everything into local SQLite database
  const handleSyncToSQLite = async () => {
    setIsSyncingSqlite(true);
    try {
      let count = 0;
      for (const inv of savedInvoices) {
        await apiService.saveInvoice(inv);
        count++;
      }
      for (const lr of savedLRs) {
        await apiService.saveLR(lr);
      }
      for (const c of customers) {
        await apiService.saveCustomer(c);
      }
      for (const v of vehicles) {
        await apiService.saveVehicle(v);
      }
      for (const s of tripSlips) {
        await apiService.saveTripSlip(s);
      }
      alert(`Successfully saved ${count} invoices, ${savedLRs.length} LRs, and directory to local SQLite database (data/vs_logistics.db)!`);
    } catch (err: any) {
      alert(`Error saving to SQLite: ${err.message}`);
    } finally {
      setIsSyncingSqlite(false);
    }
  };

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
      <div className="modal-content" style={{ maxWidth: '820px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Database size={18} color="#38bdf8" />
            <span>Database Management & Cloud Sync</span>
          </div>
          <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {/* OPTION 1: BUILT-IN LOCAL SQLITE DATABASE (100% FREE FOREVER) */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#141f32',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Server size={22} color={sqliteStatus.online ? '#10b981' : '#f59e0b'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                    1. Built-in Local SQLite Database (100% Free Forever)
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {sqliteStatus.online
                      ? `Active: Storing all data on your computer in data/vs_logistics.db`
                      : `Server starting on http://localhost:5000`}
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: sqliteStatus.online ? '#064e3b' : '#78350f',
                  color: '#ffffff'
                }}
              >
                {sqliteStatus.online ? '● Online (SQLite)' : 'Offline'}
              </span>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn btn-primary"
                style={{ fontSize: '12px' }}
                disabled={isSyncingSqlite}
                onClick={handleSyncToSQLite}
              >
                <Save size={13} /> {isSyncingSqlite ? 'Syncing...' : 'Save All Current Records to SQLite Database'}
              </button>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Zero signup required &bull; 100% offline & persistent
              </span>
            </div>
          </div>

          {/* OPTION 2: FREE CLOUD DATABASE (SUPABASE POSTGRESQL) */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#141f32',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Cloud size={22} color={cloudStatus === 'connected' ? '#10b981' : '#38bdf8'} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#f8fafc' }}>
                    2. Free Cloud Database (Supabase PostgreSQL)
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Access your transport billing from any mobile, tablet, or laptop.
                  </div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background:
                    cloudStatus === 'connected'
                      ? '#064e3b'
                      : cloudStatus === 'testing'
                      ? '#1e3a8a'
                      : '#334155',
                  color: '#ffffff'
                }}
              >
                {cloudStatus === 'connected' ? '● Connected' : cloudStatus === 'testing' ? 'Testing...' : 'Not Connected'}
              </span>
            </div>

            {/* Quick 3-Step Setup Instructions */}
            <div
              style={{
                background: '#0b1322',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                color: '#cbd5e1',
                lineHeight: 1.5,
                marginBottom: '12px'
              }}
            >
              <b>How to get your 100% Free Cloud Database in 2 minutes:</b>
              <ol style={{ paddingLeft: '18px', marginTop: '4px' }}>
                <li>
                  Go to{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#38bdf8', textDecoration: 'underline' }}
                  >
                    supabase.com <ExternalLink size={11} style={{ display: 'inline' }} />
                  </a>{' '}
                  and click <b>"Start your project"</b> (Free forever, no credit card required).
                </li>
                <li>
                  Create a new project (e.g. <code>vs-logistics</code>), then open <b>SQL Editor</b> and paste the contents of{' '}
                  <b>supabase_schema.sql</b>.
                </li>
                <li>
                  Go to <b>Project Settings → API</b> and paste your <b>Project URL</b> and <b>anon public key</b> below:
                </li>
              </ol>
            </div>

            <div className="form-row" style={{ marginBottom: '10px' }}>
              <div className="form-group" style={{ flex: 1.2 }}>
                <label className="form-label">Supabase Project URL</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://your-project-id.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ flex: 1.5 }}>
                <label className="form-label">Supabase Anon Public Key</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="btn btn-primary" onClick={handleSaveCloudCredentials}>
                <Key size={14} /> Save & Connect Cloud Database
              </button>
              {supabaseUrl && (
                <button
                  className="btn btn-secondary"
                  onClick={() => testCloudConnection(supabaseUrl, supabaseKey)}
                >
                  <RefreshCw size={13} /> Test Connection
                </button>
              )}
              {cloudMessage && (
                <span
                  style={{
                    fontSize: '11px',
                    color: cloudStatus === 'connected' ? '#34d399' : '#f87171',
                    marginLeft: '8px'
                  }}
                >
                  {cloudMessage}
                </span>
              )}
            </div>
          </div>

          {/* SECTION 3: JSON BACKUP & RESTORE */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: '#141f32',
              border: '1px solid var(--border-color)'
            }}
          >
            <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '6px', color: '#f8fafc' }}>
              3. Offline File Backup (JSON Export / Restore)
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
              Export a complete timestamped backup file to save on your USB drive or computer.
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
              <button className="btn btn-secondary" onClick={handleExportBackup}>
                <Download size={14} /> Download Backup (.json)
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} /> Restore from File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <button className="btn btn-secondary" style={{ color: '#ef4444' }} onClick={handleResetToDemo}>
                <RefreshCw size={13} /> Reset to Demo
              </button>
            </div>

            {jsonText && (
              <div style={{ marginTop: '10px' }}>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '11px', marginBottom: '8px' }}
                />
                <button className="btn btn-success" onClick={handlePerformRestore}>
                  <Upload size={14} /> Confirm & Apply Restore
                </button>
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
