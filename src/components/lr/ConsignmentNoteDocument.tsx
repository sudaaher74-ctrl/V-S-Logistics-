import React from 'react';
import { useStore } from '../../store/useStore';
import { ConsignmentCopyType } from '../../types/invoice';
import { formatCurrencySimple } from '../../utils/invoiceCalculations';

interface ConsignmentNoteDocumentProps {
  interactive?: boolean;
}

export const ConsignmentNoteDocument: React.FC<ConsignmentNoteDocumentProps> = ({ interactive = true }) => {
  const { currentLR, updateCurrentLR, companyProfile } = useStore();

  const copies: ConsignmentCopyType[] = [
    'CONSIGNEE COPY',
    'CONSIGNOR COPY',
    'DRIVER COPY',
    'OFFICE COPY',
    'TRANSPORTER COPY'
  ];

  const handleCopyCycle = () => {
    if (!interactive) return;
    const currentIdx = copies.indexOf(currentLR.copyType);
    const nextCopy = copies[(currentIdx + 1) % copies.length];
    updateCurrentLR({ copyType: nextCopy });
  };

  const handleBlur = (field: keyof typeof currentLR, e: React.FocusEvent<HTMLElement>) => {
    if (!interactive) return;
    const text = e.currentTarget.innerText.trim();
    updateCurrentLR({ [field]: text });
  };

  return (
    <div id="printable-lr-document" className="a4-page bilty-page">
      {/* Interactive Watermark Copy Badge */}
      <div
        className="bilty-copy-badge"
        onClick={handleCopyCycle}
        title="Click to cycle copy type"
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        {currentLR.copyType}
      </div>

      {/* Center Diagonal Watermark */}
      <div className="bilty-watermark-center">
        {currentLR.copyType}
      </div>

      {/* Header Bar */}
      <header className="bilty-header-bar">
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#c00000', letterSpacing: '0.5px' }}>
          SUBJECT TO NAVI MUMBAI JURISDICTION &bull; AT OWNER'S RISK
        </div>
        <div className="bilty-title">GOODS CONSIGNMENT NOTE</div>
        <h1
          className="bilty-company-name"
          contentEditable={interactive}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur('consignorName', e)}
        >
          {companyProfile.companyName || 'V S LOGISTICS'}
        </h1>
        <div className="bilty-subtitle">
          {companyProfile.tagline || 'FLEET OWNER & TRANSPORT & LOGISTICS SERVICES'}
        </div>
        <div className="bilty-office-address">
          {companyProfile.addressLine1} {companyProfile.addressLine2}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#c00000' }}>
          Branch: {currentLR.branchName || 'NAVI MUMBAI (KAMOTHE / PANVEL)'} | Mob: {companyProfile.mobiles}
        </div>
      </header>

      {/* Identification Grid */}
      <div className="bilty-id-grid">
        <div className="bilty-id-item">
          <span className="bilty-id-label">LR / GC No:</span>
          <span
            className="bilty-id-val lr-number"
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('lrNo', e)}
          >
            № {currentLR.lrNo}
          </span>
        </div>
        <div className="bilty-id-item">
          <span className="bilty-id-label">Date:</span>
          <span
            className="bilty-id-val"
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('date', e)}
          >
            {currentLR.date}
          </span>
        </div>
        <div className="bilty-id-item">
          <span className="bilty-id-label">Vehicle No:</span>
          <span
            className="bilty-id-val"
            style={{ color: '#003399' }}
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('vehicleNo', e)}
          >
            {currentLR.vehicleNo || 'MH46DL7778'}
          </span>
        </div>
        <div className="bilty-id-item" style={{ justifyContent: 'flex-end' }}>
          <span className="bilty-id-label">PAN:</span>
          <span className="bilty-id-val">{companyProfile.panNo}</span>
        </div>
      </div>

      {/* Consignor & Consignee Box */}
      <div className="bilty-parties-grid">
        {/* Consignor */}
        <div className="bilty-party-col">
          <div className="bilty-party-title">CONSIGNOR (FROM)</div>
          <div
            className="bilty-party-name"
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('consignorName', e)}
          >
            {currentLR.consignorName || 'Consignor Name'}
          </div>
          <div
            className="bilty-party-line"
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('consignorAddress', e)}
          >
            {currentLR.consignorAddress || 'Consignor Address, Pickup Station'}
          </div>
          <div className="bilty-party-line">
            <b>From: </b>
            <span
              style={{ color: '#003399', fontWeight: 'bold' }}
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('fromLocation', e)}
            >
              {currentLR.fromLocation || 'Nhava Sheva / Indev'}
            </span>
          </div>
          {currentLR.consignorGst && (
            <div className="bilty-party-line">
              <b>GSTIN: </b>
              <span>{currentLR.consignorGst}</span>
            </div>
          )}
        </div>

        {/* Consignee */}
        <div className="bilty-party-col">
          <div className="bilty-party-title">CONSIGNEE (TO)</div>
          <div
            className="bilty-party-name"
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('consigneeName', e)}
          >
            {currentLR.consigneeName || 'Consignee / Recipient Name'}
          </div>
          <div
            className="bilty-party-line"
            contentEditable={interactive}
            suppressContentEditableWarning
            onBlur={(e) => handleBlur('consigneeAddress', e)}
          >
            {currentLR.consigneeAddress || 'Consignee Delivery Station'}
          </div>
          <div className="bilty-party-line">
            <b>To: </b>
            <span
              style={{ color: '#003399', fontWeight: 'bold' }}
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('toLocation', e)}
            >
              {currentLR.toLocation || 'Ranjangaon, Pune'}
            </span>
          </div>
          {currentLR.consigneeGst && (
            <div className="bilty-party-line">
              <b>GSTIN: </b>
              <span>{currentLR.consigneeGst}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cargo Specification Grid */}
      <table className="bilty-cargo-table">
        <thead>
          <tr>
            <th style={{ width: '110px' }}>No. of Pkgs.</th>
            <th>Description (Said to Contain)</th>
            <th style={{ width: '150px' }}>Container / PO No.</th>
            <th style={{ width: '120px' }}>Actual / Charged Wt</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ minHeight: '80px' }}>
            <td
              style={{ textAlign: 'center', fontWeight: 'bold' }}
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('packagesCount', e)}
            >
              {currentLR.packagesCount || "1X40'"}
            </td>
            <td>
              <div
                style={{ fontWeight: 'bold', fontSize: '13.5px' }}
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('description', e)}
              >
                {currentLR.description || 'Flowlac-100 Bulk Material'}
              </div>
              <div style={{ fontSize: '11.5px', color: '#555', marginTop: 4 }}>
                Transported in sound dry conditions without intermediate transshipment.
              </div>
            </td>
            <td>
              <div><b>Cont: </b>{currentLR.containerNo || '-'}</div>
              <div><b>PO: </b>{currentLR.poNumber || '-'}</div>
            </td>
            <td style={{ textAlign: 'center' }}>
              <div><b>{currentLR.senderWeight || '24.50 MT'}</b></div>
              <div style={{ fontSize: '11px', color: '#666' }}>{currentLR.weightCharges || 'Fixed'}</div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Freight & Attached Compliance Documents */}
      <div className="bilty-bottom-split">
        {/* Attached Docs & Delivery Type */}
        <div className="bilty-docs-section">
          <div style={{ fontWeight: 'bold', color: '#c00000', marginBottom: 6 }}>
            COMPLIANCE & ATTACHED DOCUMENTS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div><b>E-Waybill No:</b> {currentLR.ewayBillNo || '241088491200'}</div>
            <div><b>Invoice No:</b> {currentLR.invoiceNo || '-'}</div>
            <div><b>Invoice Date:</b> {currentLR.invoiceDate || '-'}</div>
            <div><b>Invoice Value:</b> {currentLR.invoiceValue || '-'}</div>
          </div>

          <div style={{ marginTop: 10 }}>
            <b>Delivery Type: </b>
            <span style={{ color: '#003399', fontWeight: 'bold' }}>
              {currentLR.deliveryType || 'Door Delivery'}
            </span>
          </div>

          <div style={{ marginTop: 10, padding: '6px 8px', background: '#fdf2f2', borderRadius: '4px' }}>
            <b>GST PAYABLE BY: </b>
            <span style={{ color: '#c00000', fontWeight: 'bold' }}>
              [{currentLR.gstPayableBy || 'CONSIGNEE'}]
            </span>
          </div>

          <div style={{ marginTop: 8 }}>
            <span className="at-owners-risk-badge">AT OWNER'S RISK</span>
          </div>
        </div>

        {/* Freight Calculation Box */}
        <div>
          <div className="freight-type-pills">
            <span className={currentLR.freightType === 'TO PAY' ? 'freight-pill-active' : ''}>
              [ {currentLR.freightType === 'TO PAY' ? '✓' : ' '} ] TO PAY
            </span>
            <span className={currentLR.freightType === 'PAID' ? 'freight-pill-active' : ''}>
              [ {currentLR.freightType === 'PAID' ? '✓' : ' '} ] PAID
            </span>
            <span className={currentLR.freightType === 'TBB' ? 'freight-pill-active' : ''}>
              [ {currentLR.freightType === 'TBB' ? '✓' : ' '} ] T.B.B.
            </span>
          </div>

          <table className="bilty-freight-table">
            <tbody>
              <tr>
                <td>Freight Amount:</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                  ₹ {formatCurrencySimple(currentLR.freightAmount || 0)}
                </td>
              </tr>
              <tr>
                <td>Bilty / Documentation:</td>
                <td style={{ textAlign: 'right' }}>
                  ₹ {formatCurrencySimple(currentLR.biltyCharges || 0)}
                </td>
              </tr>
              <tr>
                <td>Door Delivery / Unloading:</td>
                <td style={{ textAlign: 'right' }}>
                  ₹ {formatCurrencySimple(currentLR.doorDeliveryCharges || 0)}
                </td>
              </tr>
              <tr>
                <td>GST (if applicable):</td>
                <td style={{ textAlign: 'right' }}>
                  ₹ {formatCurrencySimple(currentLR.gstAmount || 0)}
                </td>
              </tr>
              <tr>
                <td>TOTAL FREIGHT:</td>
                <td style={{ textAlign: 'right' }}>
                  ₹ {formatCurrencySimple(currentLR.totalFreightAmount || currentLR.freightAmount || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer & Declarations */}
      <footer className="bilty-footer-bar">
        <div className="bilty-legal-notice">
          <b>Notice: </b>
          The consignor has certified that the goods are non-hazardous and packed in accordance with Carriage by Road Act.
          No responsibility accepted for delay, fire, collision, or acts of God. E. & O. E.
          <div style={{ marginTop: 4 }}>
            <b>Remarks: </b>{currentLR.freightRemark || 'Empty container to be offloaded at designated yard.'}
          </div>
        </div>

        <div className="bilty-sig-box">
          <div style={{ fontWeight: 'bold', color: '#c00000' }}>
            For {companyProfile.companyName || 'V S LOGISTICS'}
          </div>
          <div style={{ height: 40 }} />
          <div style={{ fontWeight: 'bold', fontSize: '11px' }}>
            Authorized Signatory / Driver
          </div>
        </div>
      </footer>
    </div>
  );
};
