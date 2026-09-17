import React from 'react';
import {
  FileText,
  Truck,
  LayoutDashboard,
  Plus,
  Save,
  Printer,
  Download,
  Share2,
  FolderOpen,
  Users,
  Layers,
  BookOpen,
  Database,
  Columns,
  Eye,
  Edit3,
  Zap,
  Copy
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  downloadInvoicePDF,
  downloadConsignmentNotePDF,
  downloadAllLRCopiesPDF,
  shareInvoiceOnWhatsApp,
  shareLROnWhatsApp
} from '../utils/exportUtils';

export const HeaderBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    currentInvoice,
    updateCurrentInvoice,
    currentLR,
    savedInvoices,
    savedLRs,
    saveCurrentInvoice,
    saveAndNextInvoice,
    createNewInvoice,
    saveCurrentLR,
    createNewLR,
    setActiveModal,
    updateCurrentLR
  } = useStore();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (activeTab === 'invoice') {
      const elId = 'printable-invoice-document';
      await downloadInvoicePDF(elId, `Invoice_${currentInvoice.billNo.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } else if (activeTab === 'lr') {
      const elId = 'printable-lr-document';
      await downloadConsignmentNotePDF(elId, `LR_${currentLR.lrNo}.pdf`);
    }
  };

  const handle3in1LRPDF = async () => {
    const elId = 'printable-lr-document';
    await downloadAllLRCopiesPDF(
      elId,
      currentLR,
      (newCopy) => updateCurrentLR({ copyType: newCopy }),
      `LR_${currentLR.lrNo}_3in1_Copies.pdf`
    );
  };

  const handleWhatsAppShare = () => {
    if (activeTab === 'invoice') {
      shareInvoiceOnWhatsApp(currentInvoice);
    } else if (activeTab === 'lr') {
      shareLROnWhatsApp(currentLR);
    }
  };

  return (
    <header className="top-header no-print">
      {/* Brand & Document Switcher */}
      <div className="brand-section">
        <div className="brand-logo-badge">VS</div>
        <div className="brand-title-group">
          <h1>V S LOGISTICS</h1>
          <p>Transport & Billing ERP</p>
        </div>

        {/* Tab Switcher */}
        <div className="doc-switcher">
          <button
            className={`doc-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={15} />
            Dashboard
          </button>
          <button
            className={`doc-tab-btn ${activeTab === 'invoice' ? 'active' : ''}`}
            onClick={() => setActiveTab('invoice')}
            title="Create or Edit Tax Invoice"
          >
            <FileText size={15} />
            {savedInvoices.some((i) => i.id === currentInvoice.id)
              ? `Edit #${currentInvoice.billNo}`
              : 'Tax Invoice'}
          </button>
          <button
            className={`doc-tab-btn ${activeTab === 'all-bills' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-bills')}
            title="View, Search & Edit All Saved Invoices"
          >
            <FolderOpen size={15} />
            All Bills ({savedInvoices.length})
          </button>
          <button
            className={`doc-tab-btn ${activeTab === 'lr' ? 'active' : ''}`}
            onClick={() => setActiveTab('lr')}
          >
            <Truck size={15} />
            e-LR (Bilty)
          </button>
        </div>

        {/* Invoice Design Template Switcher */}
        {activeTab === 'invoice' && (
          <div className="template-switcher-pill" title="Choose Invoice Template Design">
            <button
              className={`template-pill-btn ${(!currentInvoice.template || currentInvoice.template === 'classic') ? 'active' : ''}`}
              onClick={() => updateCurrentInvoice({ template: 'classic' })}
              title="Classic Physical Paper Stationery (Red-ruled format)"
            >
              <span className="template-pill-emoji">📜</span>
              <span>Classic</span>
            </button>
            <button
              className={`template-pill-btn ${currentInvoice.template === 'modern' ? 'active' : ''}`}
              onClick={() => updateCurrentInvoice({ template: 'modern' })}
              title="Corporate Modern Design (Top Truck Banner & Cards)"
            >
              <span className="template-pill-emoji">🚀</span>
              <span>Corporate</span>
            </button>
            <button
              className={`template-pill-btn ${currentInvoice.template === 'executive' ? 'active' : ''}`}
              onClick={() => updateCurrentInvoice({ template: 'executive' })}
              title="Executive Sidebar Design (Navy Left Bar & World Map Graphics)"
            >
              <span className="template-pill-emoji">💎</span>
              <span>Executive</span>
            </button>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="header-actions">
        {activeTab !== 'dashboard' && activeTab !== 'all-bills' && (
          <>
            {/* New Button */}
            {activeTab === 'invoice' ? (
              <button className="btn btn-secondary" onClick={createNewInvoice} title="New Invoice">
                <Plus size={15} />
                New Bill
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={createNewLR} title="New Consignment Note">
                <Plus size={15} />
                New LR
              </button>
            )}

            {/* Save Button */}
            <button
              className="btn btn-primary"
              onClick={activeTab === 'invoice' ? saveCurrentInvoice : saveCurrentLR}
              title="Save changes"
            >
              <Save size={15} />
              Save
            </button>

            {/* Save & Next (For fast batch invoicing) */}
            {activeTab === 'invoice' && (
              <button
                className="btn btn-amber"
                onClick={saveAndNextInvoice}
                title="Save this bill and auto-generate next sequential bill"
              >
                <Zap size={15} />
                Save & Next
              </button>
            )}

            {/* Print */}
            <button className="btn btn-secondary" onClick={handlePrint} title="Native Print (Ctrl+P / Cmd+P)">
              <Printer size={15} />
              Print
            </button>

            {/* Download PDF */}
            <button className="btn btn-secondary" onClick={handleDownloadPDF} title="Download High-Res A4 PDF">
              <Download size={15} />
              PDF
            </button>

            {/* 3-in-1 LR PDF */}
            {activeTab === 'lr' && (
              <button
                className="btn btn-secondary"
                onClick={handle3in1LRPDF}
                title="Generate 3-in-1 consolidated PDF (Consignor, Consignee & Driver copies)"
              >
                <Copy size={15} />
                3-in-1 PDF
              </button>
            )}

            {/* WhatsApp Share */}
            <button
              className="btn btn-success"
              onClick={handleWhatsAppShare}
              title="Share formatted summary directly on WhatsApp"
            >
              <Share2 size={15} />
              WhatsApp
            </button>

            {/* View Mode Switcher */}
            <div className="view-toggles" title="Switch layout view">
              <button
                className={`view-btn ${viewMode === 'split' ? 'active' : ''}`}
                onClick={() => setViewMode('split')}
                title="Split View (Form + Preview)"
              >
                <Columns size={14} />
              </button>
              <button
                className={`view-btn ${viewMode === 'preview' ? 'active' : ''}`}
                onClick={() => setViewMode('preview')}
                title="Preview Only"
              >
                <Eye size={14} />
              </button>
              <button
                className={`view-btn ${viewMode === 'editor' ? 'active' : ''}`}
                onClick={() => setViewMode('editor')}
                title="Editor Form Only"
              >
                <Edit3 size={14} />
              </button>
            </div>
          </>
        )}

        {/* Modal Buttons */}
        <div style={{ height: 20, width: 1, backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

        {/* Saved Invoices Modal */}
        <button
          className="btn btn-secondary"
          onClick={() => setActiveModal('saved-invoices')}
          title="Saved Bills History"
        >
          <FolderOpen size={15} />
          Bills
          <span className="btn-badge">{savedInvoices.length}</span>
        </button>

        {/* Saved LRs Modal */}
        <button
          className="btn btn-secondary"
          onClick={() => setActiveModal('saved-lrs')}
          title="Saved Consignment Notes"
        >
          <Layers size={15} />
          LRs
          <span className="btn-badge">{savedLRs.length}</span>
        </button>

        {/* Directory Modal */}
        <button
          className="btn btn-secondary"
          onClick={() => setActiveModal('directory')}
          title="Customer & Vehicle Directory"
        >
          <Users size={15} />
          Directory
        </button>

        {/* Trip Slips */}
        <button
          className="btn btn-secondary"
          onClick={() => setActiveModal('trip-slips')}
          title="Fleet Trip Slips & Diesel Vouchers"
        >
          <Truck size={15} />
          Trip Slips
        </button>

        {/* Party Ledger */}
        <button
          className="btn btn-secondary"
          onClick={() => setActiveModal('party-ledger')}
          title="Party Khata & Outstanding Receivables"
        >
          <BookOpen size={15} />
          Ledger
        </button>

        {/* Backup & Restore */}
        <button
          className="btn btn-secondary btn-icon-only"
          onClick={() => setActiveModal('backup-restore')}
          title="Data Backup & Cloud Sync"
        >
          <Database size={15} />
        </button>
      </div>
    </header>
  );
};
