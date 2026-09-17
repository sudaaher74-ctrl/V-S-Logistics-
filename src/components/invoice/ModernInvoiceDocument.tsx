import React from 'react';
import { useStore } from '../../store/useStore';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from '../../utils/invoiceCalculations';
import { numberToIndianWords, toTitleCase } from '../../utils/numberToWords';
import { MapPin, Phone, Mail, CreditCard, Truck, Package, ShieldCheck, Handshake } from 'lucide-react';

interface ModernInvoiceDocumentProps {
  interactive?: boolean;
}

export const ModernInvoiceDocument: React.FC<ModernInvoiceDocumentProps> = ({ interactive = true }) => {
  const { currentInvoice, updateCurrentInvoice, updateLineItem, companyProfile, bankDetails } = useStore();

  const total = calculateBillTotal(currentInvoice.items);
  const advance = calculateAdvanceAmount(currentInvoice.items, currentInvoice.advanceDeduction);
  const balance = calculateBalance(total, advance);

  const amountForWords = balance > 0 ? balance : total;
  const wordsText = currentInvoice.customAmountInWords || toTitleCase(numberToIndianWords(amountForWords));

  // Table filler rows to maintain clean full-page A4 balance (target 10 rows minimum)
  const MIN_ROWS = 10;
  const activeItemsCount = currentInvoice.items.length;
  const fillerRowsCount = Math.max(0, MIN_ROWS - activeItemsCount);
  const fillerRows = Array.from({ length: fillerRowsCount });

  const handleBlur = (field: keyof typeof currentInvoice, e: React.FocusEvent<HTMLElement>) => {
    if (!interactive) return;
    const text = e.currentTarget.innerText.trim();
    updateCurrentInvoice({ [field]: text });
  };

  const handleItemBlur = (itemId: string, field: string, e: React.FocusEvent<HTMLElement>) => {
    if (!interactive) return;
    const text = e.currentTarget.innerText.trim();
    if (field === 'amount') {
      const cleanAmt = parseFloat(text.replace(/[^0-9.]/g, ''));
      updateLineItem(itemId, { amount: isNaN(cleanAmt) ? '' : cleanAmt });
    } else {
      updateLineItem(itemId, { [field]: text });
    }
  };

  return (
    <div id="printable-invoice-document" className="a4-page modern-invoice-root">
      {/* 1. TOP HEADER BANNER */}
      <div className="modern-header-banner">
        {/* Left Branding */}
        <div className="modern-brand-col">
          <div className="modern-logo-row">
            {/* Custom Roadway Vector Logo */}
            <svg className="modern-road-logo" viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Left red curved road boundary */}
              <path d="M 10 72 C 12 32, 44 16, 68 12 C 48 22, 24 38, 22 72 Z" fill="#d90429" />
              {/* Center asphalt highway in deep navy */}
              <path d="M 24 72 C 26 38, 50 20, 69 12 C 78 10, 84 12, 88 15 C 75 26, 60 45, 58 72 Z" fill="#0b223d" />
              {/* White dashed highway lane divider */}
              <path d="M 41 72 C 44 48, 59 29, 76 13" stroke="#ffffff" strokeWidth="2.8" strokeDasharray="5 4" strokeLinecap="round" />
            </svg>

            <div className="modern-logo-text">
              <h1 className="modern-main-title">
                <span className="text-red">V S </span>
                <span className="text-navy">LOGISTICS</span>
              </h1>
              <p className="modern-service-subtitle">
                {companyProfile.tagline || 'FLEET OWNER & TRANSPORT & LOGISTICS SERVICES'}
              </p>
              <div className="modern-slogan-line">
                <span className="slogan-dash" />
                <span className="slogan-text">YOUR CARGO &nbsp; OUR COMMITMENT</span>
                <span className="slogan-dash" />
              </div>
            </div>
          </div>

          {/* Trust Badges Ribbon */}
          <div className="modern-trust-badges">
            <div className="trust-badge-item">
              <Truck size={14} className="badge-icon" />
              <span>TRANSPORT</span>
            </div>
            <div className="trust-badge-item">
              <Package size={14} className="badge-icon" />
              <span>LOGISTICS</span>
            </div>
            <div className="trust-badge-item">
              <ShieldCheck size={14} className="badge-icon" />
              <span>SAFE DELIVERY</span>
            </div>
            <div className="trust-badge-item">
              <Handshake size={14} className="badge-icon" />
              <span>RELIABLE SERVICE</span>
            </div>
          </div>
        </div>

        {/* Right Slanted Graphic Banner with Truck & Angled Polygons */}
        <div className="modern-slanted-hero">
          {/* Slanted Navy Bar with Slogan */}
          <div className="modern-slant-navy">
            <div className="slant-motto">
              <span>MOVE</span>
              <span>BUSINESS</span>
              <span>FORWARD</span>
            </div>
          </div>

          {/* Modern Highway Container Truck Image */}
          <div className="modern-truck-frame">
            <img
              src="/assets/truck-banner.jpg"
              alt="Transport Truck on Highway"
              className="modern-truck-img"
            />
          </div>

          {/* Top-Right Red Corner Badge */}
          <div className="modern-corner-badge">
            <span>ON TIME</span>
            <span>ANYWHERE</span>
            <span>ALWAYS</span>
          </div>
        </div>
      </div>

      {/* 2. CONTACT DETAILS & TAX INVOICE ROW */}
      <div className="modern-meta-strip">
        {/* Left Office Address & Identifiers */}
        <div className="modern-office-col">
          <div className="office-item address-item">
            <MapPin size={14} className="meta-icon" />
            <div>
              <strong>Office Address:</strong>
              <div
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('company', e)}
              >
                {(companyProfile.addressLine1 || '').replace(/^Office Address:\s*/i, '')} {companyProfile.addressLine2}
              </div>
            </div>
          </div>

          <div className="office-item">
            <Phone size={14} className="meta-icon" />
            <span>{companyProfile.mobiles}</span>
          </div>

          <div className="office-item">
            <Mail size={14} className="meta-icon" />
            <span>{companyProfile.email}</span>
          </div>

          <div className="office-item pan-item">
            <CreditCard size={14} className="meta-icon" />
            <span>
              <strong>PAN:</strong> {companyProfile.panNo}
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="modern-meta-vdivider" />

        {/* Right Tax Invoice Title & Bill Meta */}
        <div className="modern-invoice-title-col">
          <div className="modern-tax-title">
            <span className="navy-word">TAX </span>
            <span className="red-word">INVOICE</span>
          </div>

          <div className="modern-meta-table">
            <div className="modern-meta-row">
              <span className="meta-key">Bill No.</span>
              <span className="meta-colon">:</span>
              <span
                className="meta-val bold-val"
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('billNo', e)}
              >
                {currentInvoice.billNo || '064'}
              </span>
            </div>
            <div className="modern-meta-row">
              <span className="meta-key">Date</span>
              <span className="meta-colon">:</span>
              <span
                className="meta-val bold-val"
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('date', e)}
              >
                {currentInvoice.date || '04/08/2026'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TWO CARDS ROW (BILL TO & DELIVERING TRUST) */}
      <div className="modern-cards-row">
        {/* Left Card: BILL TO */}
        <div className="modern-card bill-to-card">
          <div className="bill-to-badge">BILL TO</div>
          <div className="bill-to-content">
            <h3
              className="client-name"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('clientName', e)}
            >
              {currentInvoice.clientName || 'M/S. Mauli Transport Services'}
            </h3>
            <p
              className="client-address"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('clientAddress', e)}
            >
              {currentInvoice.clientAddress || 'Plot No. 18, Transport Nagar, Kalamboli, Navi Mumbai - 410218.'}
            </p>
            <div className="client-ref">
              <strong>{currentInvoice.refDocType || 'BE NO'}: </strong>
              <span
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('beNo', e)}
              >
                {currentInvoice.beNo || 'BE-994102 dt. 01/08/2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Speed Line Truck & Slogan */}
        <div className="modern-card trust-banner-card">
          {/* Moving Line-Art Speed Truck SVG */}
          <div className="speed-truck-box">
            <svg className="speed-truck-svg" viewBox="0 0 160 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Motion speed trails */}
              <line x1="8" y1="23" x2="52" y2="23" stroke="#0b223d" strokeWidth="2" strokeLinecap="round" />
              <line x1="2" y1="33" x2="44" y2="33" stroke="#0b223d" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="43" x2="55" y2="43" stroke="#0b223d" strokeWidth="2" strokeLinecap="round" />
              <line x1="4" y1="52" x2="48" y2="52" stroke="#0b223d" strokeWidth="2" strokeLinecap="round" />
              {/* Cargo container body */}
              <rect x="52" y="14" width="68" height="36" rx="2" stroke="#0b223d" strokeWidth="2.4" fill="#ffffff" />
              {/* Truck cabin */}
              <path d="M 120 22 L 136 22 C 138 22, 140 24, 142 27 L 148 37 C 149 39, 149 41, 149 43 L 149 50 L 120 50 Z" stroke="#0b223d" strokeWidth="2.4" fill="#ffffff" />
              {/* Cabin window */}
              <path d="M 125 26 L 134 26 L 141 36 L 125 36 Z" fill="#0b223d" />
              {/* Wheels */}
              <circle cx="66" cy="50" r="7" stroke="#0b223d" strokeWidth="2.5" fill="#ffffff" />
              <circle cx="66" cy="50" r="2.5" fill="#0b223d" />
              <circle cx="106" cy="50" r="7" stroke="#0b223d" strokeWidth="2.5" fill="#ffffff" />
              <circle cx="106" cy="50" r="2.5" fill="#0b223d" />
              <circle cx="138" cy="50" r="7" stroke="#0b223d" strokeWidth="2.5" fill="#ffffff" />
              <circle cx="138" cy="50" r="2.5" fill="#0b223d" />
            </svg>
          </div>

          <div className="trust-card-vdivider" />

          {/* Slogan */}
          <div className="trust-text-box">
            <span className="trust-label">DELIVERING</span>
            <span className="trust-strong">TRUST</span>
            <span className="trust-strong">ACROSS</span>
            <span className="trust-strong">DISTANCES</span>
            <div className="trust-red-bar" />
          </div>
        </div>
      </div>

      {/* 4. LINE ITEMS TABLE */}
      <div className="modern-table-container">
        <table className="modern-grid-table">
          <thead>
            <tr>
              <th style={{ width: '55px' }} className="col-center">Sr. No.</th>
              <th style={{ width: '85px' }} className="col-center">Date</th>
              <th style={{ width: '125px' }} className="col-center">Vehicle No.</th>
              <th className="col-left">Particulars</th>
              <th style={{ width: '135px' }} className="col-center">No. of Pkg. / Size</th>
              <th style={{ width: '120px' }} className="col-right">Amount (Rs.)</th>
            </tr>
          </thead>
          <tbody>
            {currentInvoice.items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 1 ? 'row-alt' : 'row-even'}>
                <td className="col-center sn-cell">{item.sn || idx + 1}</td>
                <td
                  className="col-center date-cell"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'date', e)}
                >
                  {item.date}
                </td>
                <td
                  className="col-center vehicle-cell"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'vehicleNo', e)}
                >
                  {item.vehicleNo}
                </td>
                <td
                  className="col-left particular-cell"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'particulars', e)}
                >
                  {item.particulars}
                </td>
                <td
                  className="col-center pkg-cell"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'containerNo', e)}
                >
                  {item.containerNo || '-'}
                </td>
                <td
                  className="col-right amount-cell"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'amount', e)}
                >
                  {item.amount !== '' ? `${formatCurrencySimple(item.amount)} /-` : '-'}
                </td>
              </tr>
            ))}

            {/* Filler rows for uniform full-page layout */}
            {fillerRows.map((_, fIdx) => (
              <tr key={`filler-${fIdx}`} className={(activeItemsCount + fIdx) % 2 === 1 ? 'row-alt filler-row' : 'row-even filler-row'}>
                <td className="col-center">&nbsp;</td>
                <td className="col-center">&nbsp;</td>
                <td className="col-center">&nbsp;</td>
                <td className="col-left">&nbsp;</td>
                <td className="col-center">&nbsp;</td>
                <td className="col-right">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. AMOUNT IN WORDS & TOTALS SECTION */}
      <div className="modern-summary-section">
        {/* Words Container */}
        <div className="modern-words-card">
          <div className="words-accent-bar" />
          <div className="words-content">
            <span className="words-label">Rupees in words:</span>
            <div
              className="words-text"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('customAmountInWords', e)}
            >
              {wordsText}
            </div>
          </div>
        </div>

        {/* Totals Table Box */}
        <div className="modern-totals-card">
          <div className="totals-row total-row">
            <div className="totals-label">TOTAL</div>
            <div className="totals-val">{formatCurrencySimple(total)} /-</div>
          </div>
          <div className="totals-row advance-row">
            <div className="totals-label">ADVANCE</div>
            <div className="totals-val">{advance > 0 ? `${formatCurrencySimple(advance)} /-` : '-'}</div>
          </div>
          <div className="totals-row balance-row">
            <div className="totals-label">BALANCE</div>
            <div className="totals-val">{formatCurrencySimple(balance)} /-</div>
          </div>
        </div>
      </div>

      {/* 6. BOTTOM 3-COLUMN DETAILS & SIGNATURES */}
      <div className="modern-footer-grid">
        {/* Column 1: Bank Details */}
        <div className="modern-sub-box bank-sub-box">
          <div className="bank-header-badge">BANK DETAILS</div>
          <div className="bank-details-body">
            <div className="bank-field">
              <span className="bf-key">A/c No.</span>
              <span className="bf-colon">:</span>
              <span className="bf-val font-mono">{bankDetails.accountNo || '30036040000513'}</span>
            </div>
            <div className="bank-field">
              <span className="bf-key">IFSC Code</span>
              <span className="bf-colon">:</span>
              <span className="bf-val font-mono">{bankDetails.ifscCode || 'SVCB0000036'}</span>
            </div>
            <div className="bank-field">
              <span className="bf-key">Bank Name</span>
              <span className="bf-colon">:</span>
              <span className="bf-val">{bankDetails.bankName || 'SVC CO OPERATIVE BANK'}</span>
            </div>
            <div className="bank-field">
              <span className="bf-key">Branch</span>
              <span className="bf-colon">:</span>
              <span className="bf-val">{bankDetails.branch || 'KAMOTHE'}</span>
            </div>
          </div>
        </div>

        {/* Column 2: Legal Notice & Thank You */}
        <div className="modern-sub-box legal-sub-box">
          <div className="legal-eoe">E. & O. E.</div>
          <div className="legal-hdivider" />
          <div className="legal-gst-text">
            SERVICE TAX / GST PAYABLE BY
            <br />
            CONSIGNOR / CONSIGNEE
          </div>
          <div className="legal-thank-you">Thank You!</div>
          <div className="legal-biz-text">FOR YOUR BUSINESS</div>
        </div>

        {/* Column 3: For V S LOGISTICS & Signature */}
        <div className="modern-sub-box sign-sub-box">
          <div className="sign-company-title">
            For {companyProfile.companyName || 'V S LOGISTICS'}
          </div>
          <div className="sign-space-gap" />
          <div className="sign-rule-wrap">
            <div className="sign-rule-line" />
            <div className="sign-proprietor-text">
              {companyProfile.proprietorText || 'Proprietor'}
            </div>
            <div className="sign-seal-text">COMPANY SEAL</div>
          </div>
        </div>
      </div>

      {/* 7. FULL-WIDTH BOTTOM RIBBON */}
      <footer className="modern-bottom-ribbon">
        <div className="ribbon-contacts">
          <div className="ribbon-item">
            <Phone size={13} className="ribbon-icon" />
            <span>{companyProfile.mobiles || '8691988840 / 9594608708'}</span>
          </div>
          <div className="ribbon-item">
            <Mail size={13} className="ribbon-icon" />
            <span>{companyProfile.email || 'vslogistics5372@gmail.com'}</span>
          </div>
        </div>

        {/* Angled Red Location Tag */}
        <div className="ribbon-location-tag">
          <MapPin size={13} className="ribbon-icon" />
          <span>Kamothe, Navi Mumbai - 410206</span>
        </div>
      </footer>
    </div>
  );
};
