import React from 'react';
import { useStore } from '../../store/useStore';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from '../../utils/invoiceCalculations';
import { numberToIndianWords, toTitleCase } from '../../utils/numberToWords';

interface InvoiceDocumentProps {
  interactive?: boolean;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ interactive = true }) => {
  const { currentInvoice, updateCurrentInvoice, updateLineItem, companyProfile, bankDetails } = useStore();

  const total = calculateBillTotal(currentInvoice.items);
  const advance = calculateAdvanceAmount(currentInvoice.items, currentInvoice.advanceDeduction);
  const balance = calculateBalance(total, advance);

  const amountForWords = balance > 0 ? balance : total;
  const wordsText = currentInvoice.customAmountInWords || toTitleCase(numberToIndianWords(amountForWords));

  // Ensure minimum 12 rows to preserve physical paper height
  const MIN_ROWS = 12;
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

  const mantras = companyProfile.mantras || ['श्री गणेशाय नमः', 'श्री हनुमान प्रसन्न', 'आई तुळजा भवानी'];

  return (
    <div id="printable-invoice-document" className="a4-page">
      {/* Top Auspicious Mantras */}
      <div className="mantras-bar">
        <span>{mantras[0]}</span>
        <span>{mantras[1]}</span>
        <span>{mantras[2]}</span>
      </div>

      {/* Main Stationery Header */}
      <header className="stationery-header">
        <h1
          className="stationery-title"
          contentEditable={interactive}
          suppressContentEditableWarning
          onBlur={(e) => handleBlur('title', e)}
        >
          {companyProfile.companyName || 'V S LOGISTICS'}
        </h1>

        <div className="stationery-subtitle">
          {companyProfile.tagline || 'FLEET OWNER & TRANSPORT & LOGISTICS SERVICES'}
        </div>

        <div className="stationery-address">
          {companyProfile.addressLine1} {companyProfile.addressLine2}
        </div>

        <div className="stationery-contacts">
          Mob: {companyProfile.mobiles} | Email: {companyProfile.email}
        </div>

        <div className="stationery-pan">
          PAN: {companyProfile.panNo}
        </div>
      </header>

      {/* Bill Meta Grid (M/S, A/c, Bill No, Date) */}
      <div className="bill-meta-grid">
        <div className="bill-meta-row">
          <div className="meta-field">
            <span className="meta-label">M/S.</span>
            <span
              className="meta-val-client"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('clientName', e)}
            >
              {currentInvoice.clientName || 'Mauli Transport Services'}
            </span>
          </div>
          <div className="meta-field">
            <span className="meta-label">Bill No.</span>
            <span
              className="meta-val-billno"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('billNo', e)}
            >
              {currentInvoice.billNo || '064'}
            </span>
          </div>
        </div>

        <div className="bill-meta-row" style={{ marginTop: 4 }}>
          <div className="meta-field">
            <span className="meta-label">A/c</span>
            <span
              style={{ minWidth: 320, borderBottom: '1px dashed #777', display: 'inline-block' }}
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('clientAddress', e)}
            >
              {currentInvoice.clientAddress || ''}
            </span>
          </div>
          <div className="meta-field">
            <span className="meta-label">Date :</span>
            <span
              className="meta-val-date"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('date', e)}
            >
              {currentInvoice.date || '04/08/26'}
            </span>
          </div>
        </div>

        {/* Optional Reference Document Row (BE No / LR No) */}
        {(currentInvoice.beNo || currentInvoice.refDocType) && (
          <div className="bill-meta-row" style={{ marginTop: 4, fontSize: '12px' }}>
            <div className="meta-field">
              <span className="meta-label">{currentInvoice.refDocType || 'REF NO'}:</span>
              <span
                style={{ fontWeight: 600, color: 'var(--ink-blue)', minWidth: 200 }}
                contentEditable={interactive}
                suppressContentEditableWarning
                onBlur={(e) => handleBlur('beNo', e)}
              >
                {currentInvoice.beNo} {currentInvoice.beDate ? `dt. ${currentInvoice.beDate}` : ''}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Red Ruled Table */}
      <div className="transport-table-container">
        <table className="transport-table">
          <thead>
            <tr>
              <th className="col-date">Date</th>
              <th className="col-veh">Vehicle No.</th>
              <th className="col-part">Particulars</th>
              <th className="col-pkg">No.of Pkg. / Size</th>
              <th className="col-amt">Amount Rs.</th>
            </tr>
          </thead>
          <tbody>
            {currentInvoice.items.map((item) => (
              <tr key={item.id}>
                <td
                  className="col-date"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'date', e)}
                >
                  {item.date}
                </td>
                <td
                  className="col-veh"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'vehicleNo', e)}
                >
                  {item.vehicleNo}
                </td>
                <td
                  className="col-part"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'particulars', e)}
                >
                  {item.particulars}
                </td>
                <td
                  className="col-pkg"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'containerNo', e)}
                >
                  {item.containerNo}
                </td>
                <td
                  className="col-amt"
                  contentEditable={interactive}
                  suppressContentEditableWarning
                  onBlur={(e) => handleItemBlur(item.id, 'amount', e)}
                >
                  {item.amount !== '' ? `${formatCurrencySimple(item.amount)} /-` : '-'}
                </td>
              </tr>
            ))}

            {/* Filler Rows to maintain exact physical paper height */}
            {fillerRows.map((_, i) => (
              <tr key={`filler-${i}`} className="filler-row">
                <td className="col-date">&nbsp;</td>
                <td className="col-veh">&nbsp;</td>
                <td className="col-part">&nbsp;</td>
                <td className="col-pkg">&nbsp;</td>
                <td className="col-amt">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Block: PAN, Words, Totals */}
      <div className="bill-summary-container">
        <div className="summary-left-words">
          <div className="pan-inline-stamp">
            PAN No.: {companyProfile.panNo || 'ABBFV7425J'}
          </div>
          <div className="words-row">
            <span className="words-label">Rupees in words:</span>
            <span
              className="words-value"
              contentEditable={interactive}
              suppressContentEditableWarning
              onBlur={(e) => handleBlur('customAmountInWords', e)}
            >
              {wordsText}
            </span>
          </div>
        </div>

        {/* Right summary table */}
        <div className="summary-right-numbers">
          <div className="summary-num-row">
            <span className="summary-num-label">TOTAL</span>
            <span className="summary-num-val">{formatCurrencySimple(total)} /-</span>
          </div>
          <div className="summary-num-row">
            <span className="summary-num-label">ADVANCE</span>
            <span className="summary-num-val">
              {advance > 0 ? `${formatCurrencySimple(advance)} /-` : '-'}
            </span>
          </div>
          <div className="summary-num-row">
            <span className="summary-num-label">BALANCE</span>
            <span className="summary-num-val" style={{ color: '#c00000' }}>
              {formatCurrencySimple(balance)} /-
            </span>
          </div>
        </div>
      </div>

      {/* Footer Section: Bank Details, Terms & Signatory */}
      <footer className="stationery-footer">
        {/* Left Col: Bank Details */}
        <div className="footer-col">
          <div className="bank-details-title">Bank Details</div>
          <div className="bank-line">
            <span className="bank-label">Ac No.: </span>
            <span className="bank-val">{bankDetails.accountNo}</span>
          </div>
          <div className="bank-line">
            <span className="bank-label">IFSC Code.: </span>
            <span className="bank-val">{bankDetails.ifscCode}</span>
          </div>
          <div className="bank-line">
            <span className="bank-label">Bank name:- </span>
            <span className="bank-val">{bankDetails.bankName}</span>
          </div>
          <div className="bank-line">
            <span className="bank-label">BRANCH :- </span>
            <span className="bank-val">{bankDetails.branch}</span>
          </div>
        </div>

        {/* Middle Col: Terms & GST Notice */}
        <div className="footer-col" style={{ textAlign: 'center' }}>
          <div className="terms-eoe">E. & O. E.</div>
          <div className="tax-liability-notice">
            {currentInvoice.customGstPayableBy || 'SERVICE TAX / GST PAYABLE BY CONSIGNOR / CONSIGNEE'}
          </div>
        </div>

        {/* Right Col: Signature & Proprietor */}
        <div className="footer-col signature-col">
          <div className="for-company">
            For {companyProfile.companyName || 'V S LOGISTICS'}
          </div>
          <div className="signature-space">
            {/* Signature or Seal line */}
            <div style={{ width: 120, borderBottom: '1px solid #777', margin: 'auto 0 0 auto' }} />
          </div>
          <div>
            <div className="signatory-title">
              {companyProfile.proprietorText || 'Proprietor'}
            </div>
            <div className="seal-watermark">
              COMPANY SEAL
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
