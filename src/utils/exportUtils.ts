import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { InvoiceData, ConsignmentNote, TripSlip, ConsignmentCopyType } from '../types/invoice';
import { calculateBillTotal, calculateAdvanceAmount, calculateBalance, formatCurrencySimple } from './invoiceCalculations';

/**
 * Strips focus, adds .exporting class to remove contentEditable borders,
 * then generates a high-resolution A4 PDF via html-to-image + jsPDF.
 */
export async function downloadInvoicePDF(
  elementId: string,
  fileName: string = 'Invoice.pdf'
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  // Blur any active element to remove focus outlines
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  node.classList.add('exporting');

  try {
    const dataUrl = await toPng(node, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(fileName);
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    alert('Failed to generate PDF. Please try printing via browser (Ctrl+P / Cmd+P).');
  } finally {
    node.classList.remove('exporting');
  }
}

/**
 * Downloads single Consignment Note / e-LR A4 PDF
 */
export async function downloadConsignmentNotePDF(
  elementId: string,
  fileName: string = 'Consignment_Note.pdf'
): Promise<void> {
  await downloadInvoicePDF(elementId, fileName);
}

/**
 * 3-in-1 LR PDF:
 * Sequentially swaps copy badge to Consignor, Consignee, and Driver copies,
 * captures each page, and compiles them into a single 3-page consolidated PDF.
 */
export async function downloadAllLRCopiesPDF(
  elementId: string,
  lr: ConsignmentNote,
  onCopyChange: (copy: ConsignmentCopyType) => void,
  fileName: string = `LR_${lr.lrNo}_3in1.pdf`
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) return;

  const copies: ConsignmentCopyType[] = ['CONSIGNOR COPY', 'CONSIGNEE COPY', 'DRIVER COPY'];
  const originalCopy = lr.copyType;

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  node.classList.add('exporting');

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < copies.length; i++) {
      const copy = copies[i];
      onCopyChange(copy);
      // Brief delay for DOM re-render
      await new Promise(r => setTimeout(r, 150));

      const dataUrl = await toPng(node, {
        quality: 0.98,
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: '#ffffff'
      });

      if (i > 0) {
        pdf.addPage();
      }
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Failed to generate multi-copy LR PDF:', error);
  } finally {
    node.classList.remove('exporting');
    onCopyChange(originalCopy);
  }
}

/**
 * Downloads A5 / A4 printable Trip Slip PDF
 */
export async function downloadTripSlipPDF(
  elementId: string,
  fileName: string = 'Trip_Slip.pdf'
): Promise<void> {
  const node = document.getElementById(elementId);
  if (!node) return;

  node.classList.add('exporting');

  try {
    const dataUrl = await toPng(node, {
      quality: 0.98,
      pixelRatio: 2.5,
      cacheBust: true,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a5'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
    pdf.save(fileName);
  } catch (error) {
    console.error('Failed to generate Trip Slip PDF:', error);
  } finally {
    node.classList.remove('exporting');
  }
}

/**
 * Generates an emoji-formatted WhatsApp message for an Invoice
 */
export function generateInvoiceWhatsAppText(inv: InvoiceData): string {
  const total = calculateBillTotal(inv.items);
  const adv = calculateAdvanceAmount(inv.items, inv.advanceDeduction);
  const bal = calculateBalance(total, adv);

  const vehicleList = Array.from(new Set(inv.items.map(i => i.vehicleNo).filter(Boolean))).join(', ');
  const routeList = Array.from(new Set(inv.items.map(i => i.particulars).filter(Boolean))).join(' | ');

  return `🚛 *${inv.company.companyName}*
*TAX INVOICE BILL SUMMARY*
----------------------------------
📄 *Bill No:* ${inv.billNo}
📅 *Date:* ${inv.date}
🏢 *Client / Party:* ${inv.clientName}
${inv.refDocType ? `📑 *Ref (${inv.refDocType}):* ${inv.beNo || '-'} dt. ${inv.beDate || '-'}` : ''}
🚚 *Vehicle(s):* ${vehicleList || 'N/A'}
📍 *Route:* ${routeList || 'N/A'}
----------------------------------
💰 *Total Freight:* ₹ ${formatCurrencySimple(total)}
💳 *Advance:* ₹ ${formatCurrencySimple(adv)}
⚖️ *Balance Due:* ₹ ${formatCurrencySimple(bal)}
----------------------------------
🏦 *Bank Details:*
*Bank:* ${inv.bank.bankName}
*A/C No:* ${inv.bank.accountNo}
*IFSC:* ${inv.bank.ifscCode}
*Branch:* ${inv.bank.branch}

📞 Contact: ${inv.company.mobiles}
Thank you for your business!`;
}

/**
 * Opens WhatsApp Web or App with pre-filled message
 */
export function shareInvoiceOnWhatsApp(inv: InvoiceData, phone?: string): void {
  const text = generateInvoiceWhatsAppText(inv);
  const targetPhone = (phone || inv.clientPhone || '').replace(/[^0-9]/g, '');
  const url = targetPhone
    ? `https://api.whatsapp.com/send?phone=91${targetPhone.slice(-10)}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Generates WhatsApp message for a Consignment Note (LR)
 */
export function generateLRWhatsAppText(lr: ConsignmentNote): string {
  return `📋 *${lr.company.companyName}*
*GOODS CONSIGNMENT NOTE (e-LR)*
----------------------------------
№ *LR No:* ${lr.lrNo}
📅 *Date:* ${lr.date}
🚚 *Vehicle No:* ${lr.vehicleNo}
🏢 *Consignor:* ${lr.consignorName} (${lr.fromLocation})
🏬 *Consignee:* ${lr.consigneeName} (${lr.toLocation})
📦 *Packages / Cargo:* ${lr.packagesCount} - ${lr.description}
${lr.containerNo ? `📦 *Container:* ${lr.containerNo}` : ''}
${lr.ewayBillNo ? `📑 *E-Waybill:* ${lr.ewayBillNo}` : ''}
----------------------------------
💵 *Freight Amount:* ₹ ${formatCurrencySimple(lr.totalFreightAmount)} (${lr.freightType})
----------------------------------
📞 Support: ${lr.company.mobiles}
Safe Delivery Promised!`;
}

export function shareLROnWhatsApp(lr: ConsignmentNote, phone?: string): void {
  const text = generateLRWhatsAppText(lr);
  const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  const url = cleanPhone
    ? `https://api.whatsapp.com/send?phone=91${cleanPhone.slice(-10)}&text=${encodeURIComponent(text)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

/**
 * Exports invoices list to RFC 4180 CSV with UTF-8 BOM
 */
export function exportInvoicesToCSV(invoices: InvoiceData[], fileName: string = 'Invoices_Export.csv'): void {
  const headers = [
    'Bill No',
    'Date',
    'Client Name',
    'Phone',
    'Reference Doc',
    'Vehicles',
    'Routes',
    'Bill Total',
    'Advance',
    'Balance',
    'Payment Status',
    'Amount Received',
    'Payment Date',
    'Payment Mode'
  ];

  const rows = invoices.map(inv => {
    const total = calculateBillTotal(inv.items);
    const adv = calculateAdvanceAmount(inv.items, inv.advanceDeduction);
    const bal = calculateBalance(total, adv);
    const vehicles = Array.from(new Set(inv.items.map(i => i.vehicleNo).filter(Boolean))).join('; ');
    const routes = Array.from(new Set(inv.items.map(i => i.particulars).filter(Boolean))).join('; ');

    return [
      `"${inv.billNo}"`,
      `"${inv.date}"`,
      `"${(inv.clientName || '').replace(/"/g, '""')}"`,
      `"${inv.clientPhone || ''}"`,
      `"${inv.refDocType || ''}: ${inv.beNo || ''}"`,
      `"${vehicles}"`,
      `"${routes.replace(/"/g, '""')}"`,
      total.toFixed(2),
      adv.toFixed(2),
      bal.toFixed(2),
      `"${inv.paymentStatus || 'UNPAID'}"`,
      (inv.amountReceived || 0).toFixed(2),
      `"${inv.paymentDate || ''}"`,
      `"${inv.paymentMode || ''}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Exports Client Ledger statement to CSV
 */
export function exportLedgerToCSV(
  clientName: string,
  invoices: InvoiceData[],
  fileName: string = `${clientName}_Ledger.csv`
): void {
  exportInvoicesToCSV(invoices, fileName);
}
