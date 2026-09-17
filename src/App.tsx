import React from 'react';
import { useStore } from './store/useStore';
import { HeaderBar } from './components/HeaderBar';
import { Dashboard } from './components/Dashboard';
import { InvoiceEditor } from './components/invoice/InvoiceEditor';
import { InvoiceDocument } from './components/invoice/InvoiceDocument';
import { ModernInvoiceDocument } from './components/invoice/ModernInvoiceDocument';
import { ConsignmentNoteEditor } from './components/lr/ConsignmentNoteEditor';
import { ConsignmentNoteDocument } from './components/lr/ConsignmentNoteDocument';
import { SavedInvoicesModal } from './components/modals/SavedInvoicesModal';
import { SavedConsignmentNotesModal } from './components/modals/SavedConsignmentNotesModal';
import { DirectoryModal } from './components/modals/DirectoryModal';
import { TripSlipModal } from './components/modals/TripSlipModal';
import { PartyLedgerModal } from './components/modals/PartyLedgerModal';
import { PaymentRecordModal } from './components/modals/PaymentRecordModal';
import { BackupRestoreModal } from './components/modals/BackupRestoreModal';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

import './styles/app.css';
import './styles/invoice.css';
import './styles/modern-invoice.css';
import './styles/bilty.css';

export const App: React.FC = () => {
  const {
    activeTab,
    viewMode,
    zoom,
    setZoom,
    currentInvoice,
    activeModal
  } = useStore();

  const handleZoomIn = () => setZoom((z) => Math.min(1.5, z + 0.1));
  const handleZoomOut = () => setZoom((z) => Math.max(0.45, z - 0.1));
  const handleZoomReset = () => setZoom(1.0);

  return (
    <div className="app-shell">
      {/* Top Control Bar */}
      <HeaderBar />

      {/* Main Content Area */}
      {activeTab === 'dashboard' ? (
        <Dashboard />
      ) : (
        <div className="workspace-container">
          {/* Left Form Editor */}
          {viewMode !== 'preview' && (
            <div style={{ flex: viewMode === 'editor' ? 1 : undefined }}>
              {activeTab === 'invoice' ? <InvoiceEditor /> : <ConsignmentNoteEditor />}
            </div>
          )}

          {/* Right Live WYSIWYG A4 Canvas */}
          {viewMode !== 'editor' && (
            <div className="preview-pane">
              <div className="a4-page-wrapper">
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
                  {activeTab === 'invoice' ? (
                    currentInvoice.template === 'modern' ? (
                      <ModernInvoiceDocument />
                    ) : (
                      <InvoiceDocument />
                    )
                  ) : (
                    <ConsignmentNoteDocument />
                  )}
                </div>
              </div>

              {/* Floating Zoom Controls */}
              <div className="zoom-controls no-print">
                <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">
                  <ZoomOut size={15} />
                </button>
                <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">
                  <ZoomIn size={15} />
                </button>
                <button className="zoom-btn" onClick={handleZoomReset} title="Reset Zoom to 100%">
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {activeModal === 'saved-invoices' && <SavedInvoicesModal />}
      {activeModal === 'saved-lrs' && <SavedConsignmentNotesModal />}
      {activeModal === 'directory' && <DirectoryModal />}
      {activeModal === 'trip-slips' && <TripSlipModal />}
      {activeModal === 'party-ledger' && <PartyLedgerModal />}
      {activeModal === 'payment' && <PaymentRecordModal />}
      {activeModal === 'backup-restore' && <BackupRestoreModal />}
    </div>
  );
};

export default App;
