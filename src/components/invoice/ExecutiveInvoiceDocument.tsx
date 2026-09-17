import React from 'react';
import { useStore } from '../../store/useStore';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from '../../utils/invoiceCalculations';
import { numberToIndianWords, toTitleCase } from '../../utils/numberToWords';
import {
  Calendar,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Building2,
  ShieldCheck,
  Truck,
  Package,
  Clock,
  Users
} from 'lucide-react';

interface ExecutiveInvoiceDocumentProps {
  interactive?: boolean;
}

export const ExecutiveInvoiceDocument: React.FC<ExecutiveInvoiceDocumentProps> = ({ interactive = true }) => {
  const { currentInvoice, updateCurrentInvoice, updateLineItem, companyProfile, bankDetails } = useStore();

  const total = calculateBillTotal(currentInvoice.items);
  const advance = calculateAdvanceAmount(currentInvoice.items, currentInvoice.advanceDeduction);
  const balance = calculateBalance(total, advance);

  const amountForWords = balance > 0 ? balance : total;
  const wordsText = currentInvoice.customAmountInWords || toTitleCase(numberToIndianWords(amountForWords));

  // Table filler rows to maintain clean full-page A4 balance (target 8 rows)
  const MIN_ROWS = 8;
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

  const cleanAddress1 = (companyProfile.addressLine1 || '').replace(/^Office Address:\s*/i, '');

  return (
    <div id="printable-invoice-document" className="a4-page executive-invoice-root">
      {/* 1. TOP HEADER BANNER (FULL WIDTH) */}
      <header className="exec-header-banner">
        {/* Left: Brand Monogram & Name */}
        <div className="exec-brand-box">
          <div className="exec-logo-row">
            {/* Custom VS Monogram Vector */}
            <svg className="exec-monogram-svg" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Red 'V' shape */}
              <path d="M 8 10 L 26 58 L 40 58 L 32 10 L 22 10 L 16 38 L 13 10 Z" fill="#d90429" />
              {/* Navy 'S' shape with speed stripe cuts */}
              <path d="M 38 12 C 48 8, 68 8, 76 16 C 68 22, 54 22, 44 24 C 42 30, 48 34, 58 36 C 72 38, 80 44, 78 54 C 74 64, 56 66, 40 64 C 48 58, 62 58, 68 54 C 70 48, 64 45, 52 43 C 38 41, 32 34, 34 24 C 35 18, 38 14, 38 12 Z" fill="#0b223d" />
              {/* Road divider dash inside S */}
              <path d="M 46 29 L 58 31" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>

            <div className="exec-brand-text">
              <h1 className="exec-company-title">
                <span className="red-title">V S </span>
                <span className="navy-title">LOGISTICS</span>
              </h1>
              <p className="exec-company-sub">
                {companyProfile.tagline || 'FLEET OWNER & TRANSPORT & LOGISTICS SERVICES'}
              </p>
              <div className="exec-safely-bar">
                <span className="exec-red-dash" />
                <span className="exec-safely-text">SAFELY &nbsp;|&nbsp; ON TIME &nbsp;|&nbsp; EVERY TIME</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: "Your Cargo Our Commitment" & Icon Badges */}
        <div className="exec-header-center">
          <div className="exec-cargo-title">
            <span className="cargo-navy">Your Cargo</span>
            <span className="cargo-red">Our Commitment</span>
          </div>

          <div className="exec-badge-cluster">
            <div className="exec-badge-pill">
              <div className="badge-circle-icon"><Truck size={12} /></div>
              <span>TRANSPORT</span>
            </div>
            <div className="exec-badge-pill">
              <div className="badge-circle-icon"><Package size={12} /></div>
              <span>LOGISTICS</span>
            </div>
            <div className="exec-badge-pill">
              <div className="badge-circle-icon"><ShieldCheck size={12} /></div>
              <span>SAFE DELIVERY</span>
            </div>
          </div>
        </div>

        {/* Right: Slanted Truck Banner & On-Time Badge */}
        <div className="exec-slanted-hero">
          <div className="exec-truck-frame">
            <img
              src="/assets/truck-banner.jpg"
              alt="Transport Logistics Fleet"
              className="exec-truck-img"
            />
          </div>
          {/* Top-Right Red Corner Ribbon */}
          <div className="exec-corner-badge">
            <span>ON TIME</span>
            <span>ANYWHERE</span>
            <span>ALWAYS</span>
            <div className="exec-badge-underline" />
          </div>
        </div>
      </header>

      {/* 2. MAIN BODY WRAPPER (SIDEBAR + CONTENT) */}
      <div className="exec-body-wrapper">
        {/* LEFT DARK NAVY SIDEBAR */}
        <aside className="exec-sidebar">
          {/* Top: Invoice Title & Big Number */}
          <div className="exec-side-block invoice-num-block">
            <span className="side-inv-label">INVOICE</span>
            <div
              className="side-inv-number"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('billNo', e)}
            >
              #{currentInvoice.billNo || '064'}
            </div>
          </div>

          {/* Date Row */}
          <div className="exec-side-block side-meta-item">
            <div className="side-icon-wrap">
              <Calendar size={13} />
            </div>
            <div>
              <span className="side-meta-lbl">Invoice Date</span>
              <div
                className="side-meta-val"
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('date', e)}
              >
                {currentInvoice.date || '04/08/2026'}
              </div>
            </div>
          </div>

          {/* Reference Doc Row (BE No / LR No) */}
          <div className="exec-side-block side-meta-item">
            <div className="side-icon-wrap">
              <FileText size={13} />
            </div>
            <div>
              <span className="side-meta-lbl">{currentInvoice.refDocType || 'BE No.'}</span>
              <div
                className="side-meta-val"
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('beNo', e)}
              >
                {currentInvoice.beNo || 'BE-994102 dt. 01/08/2026'}
              </div>
            </div>
          </div>

          <div className="exec-side-divider" />

          {/* Bill To Section */}
          <div className="exec-side-block side-client-block">
            <div className="side-client-head">
              <div className="side-icon-wrap">
                <User size={13} />
              </div>
              <span className="side-meta-lbl">Bill To</span>
            </div>
            <div
              className="side-client-name"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('clientName', e)}
            >
              {currentInvoice.clientName || 'M/s. Mauli Transport Services'}
            </div>
            <div
              className="side-client-address"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('clientAddress', e)}
            >
              {currentInvoice.clientAddress || 'Plot No. 18, Transport Nagar, Kalamboli, Navi Mumbai - 410218'}
            </div>
          </div>

          {/* Bottom Sidebar Graphic: Translucent World Map & Highway */}
          <div className="exec-side-bottom-art">
            {/* Translucent dotted world map SVG */}
            <svg className="side-world-map-svg" viewBox="0 0 160 80" fill="none">
              <circle cx="25" cy="30" r="1.5" fill="#ffffff" opacity="0.25" />
              <circle cx="35" cy="25" r="1.5" fill="#ffffff" opacity="0.25" />
              <circle cx="45" cy="35" r="1.5" fill="#ffffff" opacity="0.3" />
              <circle cx="60" cy="40" r="1.5" fill="#ffffff" opacity="0.35" />
              <circle cx="85" cy="25" r="1.5" fill="#ffffff" opacity="0.3" />
              <circle cx="100" cy="35" r="1.5" fill="#ffffff" opacity="0.4" />
              <circle cx="110" cy="45" r="2" fill="#ffffff" opacity="0.5" />
              <circle cx="118" cy="42" r="2.5" fill="#d90429" opacity="0.8" />
              <circle cx="125" cy="48" r="1.5" fill="#ffffff" opacity="0.4" />
              <circle cx="140" cy="55" r="1.5" fill="#ffffff" opacity="0.3" />
            </svg>

            <div className="side-motto-text">
              <span>CONNECTING</span>
              <span>BUSINESSES</span>
              <span>MOVING INDIA</span>
              <div className="side-motto-dash" />
            </div>

            {/* Glowing perspective winding highway lines */}
            <svg className="side-road-svg" viewBox="0 0 160 80" fill="none">
              <path d="M 10 75 C 60 70, 90 40, 145 10" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.4" />
              <path d="M 25 78 C 75 73, 100 45, 150 15" stroke="#38bdf8" strokeWidth="2.5" strokeOpacity="0.7" />
              <path d="M 18 76 C 68 71, 95 42, 147 12" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.6" />
            </svg>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="exec-main-content">
          {/* Contact Pills Strip */}
          <div className="exec-contact-strip">
            <div className="exec-contact-pill address-pill">
              <div className="pill-icon-circle"><MapPin size={11} /></div>
              <span>{cleanAddress1} {companyProfile.addressLine2}</span>
            </div>
            <div className="exec-contact-pill">
              <div className="pill-icon-circle"><Phone size={11} /></div>
              <span>{companyProfile.mobiles}</span>
            </div>
            <div className="exec-contact-pill">
              <div className="pill-icon-circle"><Mail size={11} /></div>
              <span>{companyProfile.email}</span>
            </div>
            <div className="exec-contact-pill">
              <div className="pill-icon-circle"><CreditCard size={11} /></div>
              <span><strong>PAN:</strong> {companyProfile.panNo}</span>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="exec-table-wrap">
            <table className="exec-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }} className="col-center">SR. NO.</th>
                  <th style={{ width: '75px' }} className="col-center">DATE</th>
                  <th style={{ width: '105px' }} className="col-center">VEHICLE NO.</th>
                  <th className="col-left">PARTICULARS</th>
                  <th style={{ width: '100px' }} className="col-center">NO. OF PKG. / SIZE</th>
                  <th style={{ width: '105px' }} className="col-right">AMOUNT (Rs.)</th>
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

                {/* Filler rows */}
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

          {/* Amount in Words & Stacked Totals */}
          <div className="exec-summary-wrap">
            {/* Rupees in words card with circular ₹ red icon */}
            <div className="exec-words-card">
              <div className="rupee-round-icon">₹</div>
              <div className="exec-words-content">
                <span className="exec-words-lbl">Rupees in words:</span>
                <div
                  className="exec-words-val"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleBlur('customAmountInWords', e)}
                >
                  {wordsText}
                </div>
              </div>
            </div>

            {/* Totals box */}
            <div className="exec-totals-box">
              <div className="exec-total-row total-header-row">
                <div className="exec-total-lbl">TOTAL</div>
                <div className="exec-total-val">{formatCurrencySimple(total)} /-</div>
              </div>
              <div className="exec-total-row advance-header-row">
                <div className="exec-total-lbl">ADVANCE</div>
                <div className="exec-total-val">{advance > 0 ? `${formatCurrencySimple(advance)} /-` : '-'}</div>
              </div>
              <div className="exec-total-row balance-header-row">
                <div className="exec-total-lbl">BALANCE</div>
                <div className="exec-total-val balance-white-val">{formatCurrencySimple(balance)} /-</div>
              </div>
            </div>
          </div>

          {/* 3-Column Footer Grid */}
          <div className="exec-bottom-grid">
            {/* Col 1: Bank Details */}
            <div className="exec-sub-card bank-card">
              <div className="exec-sub-header">
                <Building2 size={13} className="sub-header-icon" />
                <span>BANK DETAILS</span>
              </div>
              <div className="exec-sub-body">
                <div className="exec-sub-field">
                  <span className="field-lbl">A/c No.</span>
                  <span className="field-colon">:</span>
                  <span className="field-val font-mono">{bankDetails.accountNo || '30036040000513'}</span>
                </div>
                <div className="exec-sub-field">
                  <span className="field-lbl">IFSC Code</span>
                  <span className="field-colon">:</span>
                  <span className="field-val font-mono">{bankDetails.ifscCode || 'SVCB0000036'}</span>
                </div>
                <div className="exec-sub-field">
                  <span className="field-lbl">Bank Name</span>
                  <span className="field-colon">:</span>
                  <span className="field-val">{bankDetails.bankName || 'SVC CO OPERATIVE BANK'}</span>
                </div>
                <div className="exec-sub-field">
                  <span className="field-lbl">Branch</span>
                  <span className="field-colon">:</span>
                  <span className="field-val">{bankDetails.branch || 'KAMOTHE'}</span>
                </div>
              </div>
            </div>

            {/* Col 2: Terms & Conditions */}
            <div className="exec-sub-card terms-card">
              <div className="exec-sub-header">
                <FileText size={13} className="sub-header-icon" />
                <span>TERMS & CONDITIONS</span>
              </div>
              <ol className="exec-terms-list">
                <li>Payment to be made within 7 days from the date of invoice.</li>
                <li>Goods once dispatched cannot be cancelled.</li>
                <li>We are not responsible for delay due to unforeseen circumstances.</li>
                <li>Subject to Navi Mumbai jurisdiction.</li>
              </ol>
            </div>

            {/* Col 3: Signature & Seal */}
            <div className="exec-sub-card sign-card">
              <div className="exec-sign-title">
                For {companyProfile.companyName || 'V S LOGISTICS'}
              </div>
              <div className="exec-sign-art-wrap">
                {/* Stylized VS Script Signature */}
                <svg className="exec-sig-svg" viewBox="0 0 100 45" fill="none">
                  <path
                    d="M 15 35 C 20 10, 26 5, 32 30 C 35 40, 42 12, 60 8 C 45 15, 40 38, 55 35 C 70 32, 85 10, 88 5"
                    stroke="#0b223d"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="5" y1="40" x2="95" y2="40" stroke="#0b223d" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="exec-sign-footer">
                <div className="exec-proprietor-text">
                  {companyProfile.proprietorText || 'Proprietor'}
                </div>
                <div className="exec-seal-text">COMPANY SEAL</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 3. BOTTOM TRUST BADGES & ANGLED CHEVRON FOOTER */}
      <footer className="exec-footer-wrap">
        {/* 3 Trust Badges */}
        <div className="exec-trust-ribbon">
          <div className="exec-trust-item">
            <div className="trust-circle-icon"><Clock size={16} /></div>
            <div>
              <div className="trust-head">ON TIME DELIVERY</div>
              <div className="trust-sub">Your time matters</div>
            </div>
          </div>

          <div className="exec-trust-item">
            <div className="trust-circle-icon"><ShieldCheck size={16} /></div>
            <div>
              <div className="trust-head">SAFE & SECURE</div>
              <div className="trust-sub">Cargo in safe hands</div>
            </div>
          </div>

          <div className="exec-trust-item">
            <div className="trust-circle-icon"><Users size={16} /></div>
            <div>
              <div className="trust-head">TRUSTED PARTNER</div>
              <div className="trust-sub">For a stronger tomorrow</div>
            </div>
          </div>
        </div>

        {/* Bottom Angled Navy Bar with Chevrons */}
        <div className="exec-bottom-strip">
          <div className="strip-left-chevron" />
          <div className="strip-center-text">
            <span className="strip-dash" />
            <span className="strip-label">TRANSPORTING PROGRESS ACROSS INDIA</span>
            <span className="strip-dash" />
          </div>
          <div className="strip-right-chevron" />
        </div>
      </footer>
    </div>
  );
};
