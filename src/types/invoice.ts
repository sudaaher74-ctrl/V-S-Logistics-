export interface LineItem {
  id: string;
  sn: string;             // Serial Number (e.g., "1")
  date: string;           // Date (e.g., "01/08/2026")
  vehicleNo: string;      // Vehicle Registration (e.g., "MH46DL7778")
  containerNo: string;    // Container & Size or No. of Pkg (e.g., "BEAU5560140\n1X40" or "1X40'")
  particulars: string;    // Trip route/description (e.g., "Indev to Ranjangaon")
  weight: string;         // Weight or Units (e.g., "FIXED", "24 MT", or "1 Pkg")
  advance: string;        // Line item advance (e.g., "5,000.00" or "-")
  amount: number | '';    // Line item gross freight amount (e.g., 28500)
}

export interface BankDetails {
  bankName: string;
  branch: string;
  accountNo: string;
  ifscCode: string;
}

export interface CompanyProfile {
  jurisdiction: string;    // e.g. "Subject To Navi Mumbai Jurisdiction"
  companyName: string;     // e.g. "V S LOGISTICS"
  tagline: string;         // e.g. "FLEET OWNER & TRANSPORT & LOGISTICS SERVICES"
  addressLine1: string;    // e.g. "Office Address: B/204, Shiv Parvati chs, Plot no: 5A"
  addressLine2: string;    // e.g. "Sector - 11, Kamothe, Navi Mumbai - 410206."
  email: string;           // e.g. "vslogistics5372@gmail.com"
  mobiles: string;         // e.g. "8691988840 / 9594608708"
  panNo: string;           // e.g. "ABBFV7425J"
  signatureForText: string;// e.g. "For V S LOGISTICS"
  proprietorText: string;  // e.g. "Proprietor" or "Authorized Signatory"
  terms: string[];
  logoUrl?: string;
  mantras?: string[];      // e.g. ["श्री गणेशाय नमः", "श्री हनुमान प्रसन्न", "आई तुळजा भवानी"]
}

export interface InvoiceData {
  id: string;
  title: string;           // "TAX INVOICE"
  clientName: string;
  clientPhone?: string;
  clientAddress?: string;
  billNo: string;          // Format: "064" or "064/ 2026-27"
  date: string;            // Format: "04/08/2026"
  beNo: string;            // Bill of Entry or Reference Document No
  beDate: string;
  refDocType?: 'BE NO' | 'INVOICE NO' | 'LR NO' | 'LR NOS' | string;
  items: LineItem[];
  company: CompanyProfile;
  bank: BankDetails;
  advanceDeduction: number;
  customAmountInWords?: string;
  customGstPayableBy?: string;
  paymentStatus?: 'PAID' | 'UNPAID' | 'PARTIAL';
  amountReceived?: number;
  paymentDate?: string;
  paymentMode?: 'BANK_TRANSFER' | 'UPI' | 'CHEQUE' | 'CASH' | 'OTHER' | string;
  paymentNotes?: string;
  createdAt: string;
  updatedAt: string;
  template?: 'classic' | 'modern' | 'executive';
}

export type ConsignmentCopyType =
  | 'CONSIGNEE COPY'
  | 'CONSIGNOR COPY'
  | 'DRIVER COPY'
  | 'OFFICE COPY'
  | 'TRANSPORTER COPY';

export interface ConsignmentNote {
  id: string;
  lrNo: string;            // e.g., "025992"
  date: string;
  vehicleNo: string;
  branchName?: string;
  
  // Consignor
  consignorName: string;
  consignorAddress: string;
  consignorGst?: string;
  fromLocation: string;

  // Consignee
  consigneeName: string;
  consigneeAddress: string;
  consigneeGst?: string;
  toLocation: string;

  // Cargo Details
  packagesCount: string;   // e.g., "1X20" or "500 Bags"
  description: string;     // e.g., "Flowlac-100 Lactose"
  containerNo?: string;
  poNumber?: string;
  senderWeight: string;
  weightCharges?: string;

  // Freight Breakdown
  freightType: 'TO PAY' | 'PAID' | 'TBB'; // To-Pay / Paid / To Be Billed
  freightAmount?: number | '';
  collectionCharges?: number | '';
  doorDeliveryCharges?: number | '';
  biltyCharges?: number | '';
  insuranceCharges?: number | '';
  labourCharges?: number | '';
  gstAmount?: number | '';
  totalFreightAmount: number | '';
  freightRemark?: string;

  // Attached Docs & Compliance
  ewayBillNo?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  invoiceValue?: string;
  deliveryType?: 'Godown' | 'Door Delivery' | 'Unloading By Consignee' | 'Unloading By Transport';
  gstPayableBy: 'CONSIGNOR' | 'CONSIGNEE' | 'CARRIER';
  copyType: ConsignmentCopyType;
  company: CompanyProfile;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone?: string;
  gstin?: string;
  address?: string;
}

export interface VehicleRecord {
  id: string;
  vehicleNo: string;
  driverName?: string;
  driverPhone?: string;
  type?: string;           // e.g. "40ft Trailer", "20ft Truck"
}

export interface TripSlip {
  id: string;
  slipNo: string;
  date: string;
  vehicleNo: string;
  driverName: string;
  driverPhone?: string;
  fromLocation: string;
  toLocation: string;
  containerNo?: string;
  dieselLiters?: number | '';
  dieselRate?: number | '';
  dieselAmount?: number | '';
  dieselPumpName?: string;
  driverAdvance?: number | '';
  tollCharges?: number | '';
  otherExpenses?: number | '';
  remarks?: string;
  totalExpense: number;
  company: CompanyProfile;
  createdAt: string;
}
