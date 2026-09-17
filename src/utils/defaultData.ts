import { CompanyProfile, BankDetails, InvoiceData, ConsignmentNote, CustomerRecord, VehicleRecord, TripSlip } from '../types/invoice';

export const defaultCompanyProfile: CompanyProfile = {
  jurisdiction: 'Subject To Navi Mumbai Jurisdiction',
  companyName: 'V S LOGISTICS',
  tagline: 'FLEET OWNER & TRANSPORT & LOGISTICS SERVICES',
  addressLine1: 'Office Address: B/204, Shiv Parvati chs, Plot no: 5A',
  addressLine2: 'Sector - 11, Kamothe, Navi Mumbai - 410206.',
  email: 'vslogistics5372@gmail.com',
  mobiles: '8691988840 / 9594608708',
  panNo: 'ABBFV7425J',
  signatureForText: 'For V S LOGISTICS',
  proprietorText: 'Proprietor',
  terms: [
    'Subject To Navi Mumbai Jurisdiction.',
    'Payment must be cleared within 15 days of bill presentation.',
    'Interest @ 18% p.a. will be charged after due date.',
    'Goods transported at owner\'s risk unless specially insured.',
    'E. & O. E.'
  ],
  mantras: ['श्री गणेशाय नमः', 'श्री हनुमान प्रसन्न', 'आई तुळजा भवानी']
};

export const defaultBankDetails: BankDetails = {
  bankName: 'SVC CO OPERATIVE BANK',
  branch: 'KAMOTHE',
  accountNo: '30036040000513',
  ifscCode: 'SVCB0000036'
};

export const defaultSampleInvoice: InvoiceData = {
  id: 'inv-064',
  title: 'TAX INVOICE',
  clientName: 'Mauli Transport Services',
  clientPhone: '9820123456',
  clientAddress: 'Plot No. 18, Transport Nagar, Kalamboli, Navi Mumbai - 410218',
  billNo: '064',
  date: '04/08/2026',
  beNo: 'BE-994102',
  beDate: '01/08/2026',
  refDocType: 'BE NO',
  items: [
    {
      id: 'item-1',
      sn: '1',
      date: '01/08/26',
      vehicleNo: 'MH46DL7778',
      containerNo: "1X40'",
      particulars: 'Indev to Ranjangaon',
      weight: 'FIXED',
      advance: '-',
      amount: 28500
    },
    {
      id: 'item-2',
      sn: '2',
      date: '01/08/26',
      vehicleNo: 'MH46DL7778',
      containerNo: '-',
      particulars: 'Emty Charges',
      weight: '-',
      advance: '-',
      amount: 5790
    }
  ],
  company: defaultCompanyProfile,
  bank: defaultBankDetails,
  advanceDeduction: 0,
  paymentStatus: 'PAID',
  amountReceived: 34290,
  paymentDate: '05/08/2026',
  paymentMode: 'BANK_TRANSFER',
  paymentNotes: 'Received via RTGS / NEFT full payment',
  createdAt: '2026-08-04T10:00:00.000Z',
  updatedAt: '2026-08-04T10:00:00.000Z',
  template: 'classic'
};

export const defaultSampleLR: ConsignmentNote = {
  id: 'lr-025992',
  lrNo: '025992',
  date: '01/08/2026',
  vehicleNo: 'MH46DL7778',
  branchName: 'NAVI MUMBAI (KAMOTHE / PANVEL)',
  consignorName: 'Continental Warehousing Corp Ltd',
  consignorAddress: 'JNPT Port CFS Zone, Nhava Sheva, Navi Mumbai - 400707',
  consignorGst: '27AAACC4912K1ZT',
  fromLocation: 'Nhava Sheva / Indev',
  consigneeName: 'Mauli Transport Services (A/c Whirlpool India)',
  consigneeAddress: 'MIDC Ranjangaon, Pune - 412220',
  consigneeGst: '27AABCM8291F1ZH',
  toLocation: 'Ranjangaon, Pune',
  packagesCount: "1X40' HC Container",
  description: 'Flowlac-100 Industrial Bulk Cartons (Said to Contain)',
  containerNo: 'BEAU5560140 / 40HC',
  poNumber: 'PO-RNJ-88219',
  senderWeight: '24.50 MT',
  weightCharges: 'FIXED RATE',
  freightType: 'TBB',
  freightAmount: 28500,
  collectionCharges: 0,
  doorDeliveryCharges: 0,
  biltyCharges: 100,
  insuranceCharges: 0,
  labourCharges: 0,
  gstAmount: 0,
  totalFreightAmount: 28600,
  freightRemark: 'Empty container to be returned to CFS depot',
  ewayBillNo: '241088491200',
  invoiceNo: 'CWCL/2026/8941',
  invoiceDate: '01/08/2026',
  invoiceValue: '₹ 45,50,000.00',
  deliveryType: 'Door Delivery',
  gstPayableBy: 'CONSIGNEE',
  copyType: 'CONSIGNEE COPY',
  company: defaultCompanyProfile,
  createdAt: '2026-08-01T09:00:00.000Z',
  updatedAt: '2026-08-01T09:00:00.000Z'
};

export const defaultCustomers: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'Mauli Transport Services',
    phone: '9820123456',
    gstin: '27AABCM8291F1ZH',
    address: 'Plot No. 18, Transport Nagar, Kalamboli, Navi Mumbai - 410218'
  },
  {
    id: 'cust-2',
    name: 'Continental Warehousing Corp Ltd',
    phone: '9833445566',
    gstin: '27AAACC4912K1ZT',
    address: 'JNPT Port CFS Zone, Nhava Sheva, Navi Mumbai - 400707'
  },
  {
    id: 'cust-3',
    name: 'Swami Krupa Roadlines',
    phone: '9819001122',
    gstin: '27AAKFS1234D1Z2',
    address: 'Shop No. 4, APMC Market-1, Vashi, Navi Mumbai - 400705'
  }
];

export const defaultVehicles: VehicleRecord[] = [
  {
    id: 'veh-1',
    vehicleNo: 'MH46DL7778',
    driverName: 'Rameshwar Patil',
    driverPhone: '9822998811',
    type: '40ft High Bed Trailer'
  },
  {
    id: 'veh-2',
    vehicleNo: 'MH46BB4590',
    driverName: 'Sanjay Shinde',
    driverPhone: '9920114477',
    type: '20ft Container Truck'
  },
  {
    id: 'veh-3',
    vehicleNo: 'MH04GP3312',
    driverName: 'Balaji Kadam',
    driverPhone: '9890223344',
    type: '32ft Multi-Axle'
  }
];

export const defaultTripSlips: TripSlip[] = [
  {
    id: 'trip-1',
    slipNo: 'TS-101',
    date: '01/08/2026',
    vehicleNo: 'MH46DL7778',
    driverName: 'Rameshwar Patil',
    driverPhone: '9822998811',
    fromLocation: 'Nhava Sheva CFS',
    toLocation: 'Ranjangaon MIDC',
    containerNo: 'BEAU5560140',
    dieselLiters: 110,
    dieselRate: 92.5,
    dieselAmount: 10175,
    dieselPumpName: 'Indian Oil Kamothe Highway Hub',
    driverAdvance: 3500,
    tollCharges: 1450,
    otherExpenses: 500,
    remarks: 'Unloading completed on time. Empty returned.',
    totalExpense: 15625,
    company: defaultCompanyProfile,
    createdAt: '2026-08-01T11:00:00.000Z'
  }
];
