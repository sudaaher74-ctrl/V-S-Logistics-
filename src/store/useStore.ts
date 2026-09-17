import { create } from 'zustand';
import {
  InvoiceData,
  ConsignmentNote,
  CustomerRecord,
  VehicleRecord,
  TripSlip,
  CompanyProfile,
  BankDetails,
  LineItem
} from '../types/invoice';
import {
  defaultCompanyProfile,
  defaultBankDetails,
  defaultSampleInvoice,
  defaultSampleLR,
  defaultCustomers,
  defaultVehicles,
  defaultTripSlips
} from '../utils/defaultData';
import { getNextBillNumber, getNextLRNumber, extractBillSequenceNumber } from '../utils/billNumberUtils';
import { supabaseService } from '../utils/supabaseService';
import { apiService } from '../utils/apiService';

export type AppTab = 'dashboard' | 'invoice' | 'all-bills' | 'lr';
export type ViewMode = 'split' | 'preview' | 'editor';
export type ModalType =
  | null
  | 'saved-invoices'
  | 'saved-lrs'
  | 'directory'
  | 'trip-slips'
  | 'party-ledger'
  | 'backup-restore'
  | 'payment';

interface ERPStore {
  // Navigation & UI State
  activeTab: AppTab;
  viewMode: ViewMode;
  zoom: number;
  activeModal: ModalType;
  selectedPaymentInvoiceId: string | null;
  toastMessage: string | null;

  // Active Document State
  currentInvoice: InvoiceData;
  currentLR: ConsignmentNote;

  // Saved Data
  savedInvoices: InvoiceData[];
  savedLRs: ConsignmentNote[];
  customers: CustomerRecord[];
  vehicles: VehicleRecord[];
  tripSlips: TripSlip[];

  // Settings
  companyProfile: CompanyProfile;
  bankDetails: BankDetails;

  // UI Actions
  setActiveTab: (tab: AppTab) => void;
  setViewMode: (mode: ViewMode) => void;
  setZoom: (zoom: number | ((prev: number) => number)) => void;
  setActiveModal: (modal: ModalType) => void;
  setSelectedPaymentInvoiceId: (id: string | null) => void;
  setToastMessage: (msg: string | null) => void;

  // Invoice Actions
  setCurrentInvoice: (inv: InvoiceData) => void;
  updateCurrentInvoice: (partial: Partial<InvoiceData>) => void;
  updateLineItem: (id: string, partial: Partial<LineItem>) => void;
  addLineItem: (item?: Partial<LineItem>) => void;
  removeLineItem: (id: string) => void;
  cloneLineItem: (id: string) => void;
  saveCurrentInvoice: () => void;
  saveAndNextInvoice: () => void;
  deleteInvoice: (id: string) => void;
  createNewInvoice: () => void;

  // LR / Consignment Actions
  setCurrentLR: (lr: ConsignmentNote) => void;
  updateCurrentLR: (partial: Partial<ConsignmentNote>) => void;
  saveCurrentLR: () => void;
  deleteLR: (id: string) => void;
  createNewLR: () => void;
  convertLRToInvoice: (lr: ConsignmentNote) => void;
  consolidateLRsToInvoice: (lrIds: string[]) => void;

  // Directory Actions
  saveCustomer: (customer: CustomerRecord) => void;
  deleteCustomer: (id: string) => void;
  saveVehicle: (vehicle: VehicleRecord) => void;
  deleteVehicle: (id: string) => void;

  // Trip Slips Actions
  saveTripSlip: (slip: TripSlip) => void;
  deleteTripSlip: (id: string) => void;

  // Company / Bank Settings
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => void;
  updateBankDetails: (bank: Partial<BankDetails>) => void;

  // Payment Tracking
  recordPayment: (
    invoiceId: string,
    paymentData: {
      amountReceived: number;
      paymentDate: string;
      paymentMode: string;
      paymentNotes: string;
      paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
    }
  ) => void;

  // Backup & Restore
  exportBackupJSON: () => string;
  restoreFromJSON: (jsonStr: string, mode: 'replace' | 'merge') => boolean;
  resetToDemo: () => void;
}

// LocalStorage Persistence Keys
const STORAGE_KEYS = {
  INVOICES: 'vs_logistics_invoices_v1',
  LRS: 'vs_logistics_lrs_v1',
  CUSTOMERS: 'vs_logistics_customers_v1',
  VEHICLES: 'vs_logistics_vehicles_v1',
  TRIP_SLIPS: 'vs_logistics_trip_slips_v1',
  COMPANY: 'vs_logistics_company_v1',
  BANK: 'vs_logistics_bank_v1'
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to parse localStorage key ${key}:`, e);
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save to localStorage key ${key}:`, e);
  }
}

export const useStore = create<ERPStore>((set, get) => {
  const initialCompany = loadStorage<CompanyProfile>(STORAGE_KEYS.COMPANY, defaultCompanyProfile);
  const initialBank = loadStorage<BankDetails>(STORAGE_KEYS.BANK, defaultBankDetails);
  const initialInvoices = loadStorage<InvoiceData[]>(STORAGE_KEYS.INVOICES, [defaultSampleInvoice]);
  const initialLRs = loadStorage<ConsignmentNote[]>(STORAGE_KEYS.LRS, [defaultSampleLR]);
  const initialCustomers = loadStorage<CustomerRecord[]>(STORAGE_KEYS.CUSTOMERS, defaultCustomers);
  const initialVehicles = loadStorage<VehicleRecord[]>(STORAGE_KEYS.VEHICLES, defaultVehicles);
  const initialTripSlips = loadStorage<TripSlip[]>(STORAGE_KEYS.TRIP_SLIPS, defaultTripSlips);

  return {
    activeTab: 'invoice',
    viewMode: 'split',
    zoom: 1.0,
    activeModal: null,
    selectedPaymentInvoiceId: null,
    toastMessage: null,

    companyProfile: initialCompany,
    bankDetails: initialBank,
    savedInvoices: initialInvoices,
    savedLRs: initialLRs,
    customers: initialCustomers,
    vehicles: initialVehicles,
    tripSlips: initialTripSlips,

    currentInvoice: initialInvoices[0] || defaultSampleInvoice,
    currentLR: initialLRs[0] || defaultSampleLR,

    setActiveTab: (tab) => set({ activeTab: tab }),
    setViewMode: (viewMode) => set({ viewMode }),
    setZoom: (zoom) =>
      set((state) => ({
        zoom: typeof zoom === 'function' ? Math.min(1.5, Math.max(0.45, zoom(state.zoom))) : Math.min(1.5, Math.max(0.45, zoom))
      })),
    setActiveModal: (activeModal) => set({ activeModal }),
    setSelectedPaymentInvoiceId: (selectedPaymentInvoiceId) => set({ selectedPaymentInvoiceId }),
    setToastMessage: (toastMessage) => set({ toastMessage }),

    // INVOICE ACTIONS
    setCurrentInvoice: (currentInvoice) => set({ currentInvoice }),

    updateCurrentInvoice: (partial) =>
      set((state) => {
        const nextInv = {
          ...state.currentInvoice,
          ...partial,
          updatedAt: new Date().toISOString()
        };
        const existingIdx = state.savedInvoices.findIndex((inv) => inv.id === nextInv.id);
        let updatedSaved = state.savedInvoices;
        if (existingIdx >= 0) {
          updatedSaved = [...state.savedInvoices];
          updatedSaved[existingIdx] = nextInv;
          saveStorage(STORAGE_KEYS.INVOICES, updatedSaved);
          apiService.saveInvoice(nextInv);
        }
        return {
          currentInvoice: nextInv,
          savedInvoices: updatedSaved
        };
      }),

    updateLineItem: (id, partial) =>
      set((state) => {
        const nextItems = state.currentInvoice.items.map((item) =>
          item.id === id ? { ...item, ...partial } : item
        );
        const nextInv = {
          ...state.currentInvoice,
          items: nextItems,
          updatedAt: new Date().toISOString()
        };
        const existingIdx = state.savedInvoices.findIndex((inv) => inv.id === nextInv.id);
        let updatedSaved = state.savedInvoices;
        if (existingIdx >= 0) {
          updatedSaved = [...state.savedInvoices];
          updatedSaved[existingIdx] = nextInv;
          saveStorage(STORAGE_KEYS.INVOICES, updatedSaved);
          apiService.saveInvoice(nextInv);
        }
        return {
          currentInvoice: nextInv,
          savedInvoices: updatedSaved
        };
      }),

    addLineItem: (item = {}) =>
      set((state) => {
        const nextSn = String(state.currentInvoice.items.length + 1);
        const newItem: LineItem = {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sn: nextSn,
          date: state.currentInvoice.date || '01/08/26',
          vehicleNo: '',
          containerNo: '-',
          particulars: '',
          weight: 'FIXED',
          advance: '-',
          amount: '',
          ...item
        };
        const nextInv = {
          ...state.currentInvoice,
          items: [...state.currentInvoice.items, newItem],
          updatedAt: new Date().toISOString()
        };
        const existingIdx = state.savedInvoices.findIndex((inv) => inv.id === nextInv.id);
        let updatedSaved = state.savedInvoices;
        if (existingIdx >= 0) {
          updatedSaved = [...state.savedInvoices];
          updatedSaved[existingIdx] = nextInv;
          saveStorage(STORAGE_KEYS.INVOICES, updatedSaved);
          apiService.saveInvoice(nextInv);
        }
        return {
          currentInvoice: nextInv,
          savedInvoices: updatedSaved
        };
      }),

    removeLineItem: (id) =>
      set((state) => {
        const nextItems = state.currentInvoice.items
          .filter((item) => item.id !== id)
          .map((item, idx) => ({ ...item, sn: String(idx + 1) }));
        const nextInv = {
          ...state.currentInvoice,
          items: nextItems,
          updatedAt: new Date().toISOString()
        };
        const existingIdx = state.savedInvoices.findIndex((inv) => inv.id === nextInv.id);
        let updatedSaved = state.savedInvoices;
        if (existingIdx >= 0) {
          updatedSaved = [...state.savedInvoices];
          updatedSaved[existingIdx] = nextInv;
          saveStorage(STORAGE_KEYS.INVOICES, updatedSaved);
          apiService.saveInvoice(nextInv);
        }
        return {
          currentInvoice: nextInv,
          savedInvoices: updatedSaved
        };
      }),

    cloneLineItem: (id) =>
      set((state) => {
        const target = state.currentInvoice.items.find((i) => i.id === id);
        if (!target) return state;
        const cloned: LineItem = {
          ...target,
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sn: String(state.currentInvoice.items.length + 1)
        };
        const nextInv = {
          ...state.currentInvoice,
          items: [...state.currentInvoice.items, cloned],
          updatedAt: new Date().toISOString()
        };
        const existingIdx = state.savedInvoices.findIndex((inv) => inv.id === nextInv.id);
        let updatedSaved = state.savedInvoices;
        if (existingIdx >= 0) {
          updatedSaved = [...state.savedInvoices];
          updatedSaved[existingIdx] = nextInv;
          saveStorage(STORAGE_KEYS.INVOICES, updatedSaved);
          apiService.saveInvoice(nextInv);
        }
        return {
          currentInvoice: nextInv,
          savedInvoices: updatedSaved
        };
      }),

    saveCurrentInvoice: () => {
      const { currentInvoice, savedInvoices } = get();
      const existingIdx = savedInvoices.findIndex((inv) => inv.id === currentInvoice.id);
      let updated: InvoiceData[];

      if (existingIdx >= 0) {
        updated = [...savedInvoices];
        updated[existingIdx] = currentInvoice;
      } else {
        updated = [currentInvoice, ...savedInvoices];
      }

      saveStorage(STORAGE_KEYS.INVOICES, updated);
      set({
        savedInvoices: updated,
        toastMessage: `✅ Bill #${currentInvoice.billNo} saved to database! You can view or edit it anytime.`
      });
      setTimeout(() => {
        set((state) => (state.toastMessage?.includes(currentInvoice.billNo) ? { toastMessage: null } : {}));
      }, 3500);

      apiService.saveInvoice(currentInvoice);
      supabaseService.syncInvoice(currentInvoice);
    },

    saveAndNextInvoice: () => {
      const { saveCurrentInvoice, savedInvoices, currentInvoice, companyProfile, bankDetails } = get();
      saveCurrentInvoice();

      const allBillNos = savedInvoices.map((i) => i.billNo);
      if (!allBillNos.includes(currentInvoice.billNo)) {
        allBillNos.push(currentInvoice.billNo);
      }

      const nextBillNo = getNextBillNumber(allBillNos, false);
      const todayStr = new Date().toLocaleDateString('en-GB');

      const nextInvoice: InvoiceData = {
        id: `inv-${Date.now()}`,
        title: 'TAX INVOICE',
        clientName: '',
        clientPhone: '',
        clientAddress: '',
        billNo: nextBillNo,
        date: todayStr,
        beNo: '',
        beDate: '',
        refDocType: 'BE NO',
        items: [
          {
            id: `item-${Date.now()}-1`,
            sn: '1',
            date: todayStr,
            vehicleNo: '',
            containerNo: '-',
            particulars: '',
            weight: 'FIXED',
            advance: '-',
            amount: ''
          }
        ],
        company: companyProfile,
        bank: bankDetails,
        advanceDeduction: 0,
        paymentStatus: 'UNPAID',
        amountReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        template: currentInvoice.template || 'classic'
      };

      set({ currentInvoice: nextInvoice });
    },

    deleteInvoice: (id) => {
      const { savedInvoices } = get();
      const filtered = savedInvoices.filter((inv) => inv.id !== id);
      saveStorage(STORAGE_KEYS.INVOICES, filtered);
      set({ savedInvoices: filtered });
      apiService.deleteInvoice(id);
      supabaseService.deleteInvoice(id);
    },

    createNewInvoice: () => {
      const { savedInvoices, companyProfile, bankDetails, currentInvoice } = get();
      const allBillNos = savedInvoices.map((i) => i.billNo);
      const nextBillNo = getNextBillNumber(allBillNos, false);
      const todayStr = new Date().toLocaleDateString('en-GB');

      const newInv: InvoiceData = {
        id: `inv-${Date.now()}`,
        title: 'TAX INVOICE',
        clientName: '',
        clientPhone: '',
        clientAddress: '',
        billNo: nextBillNo,
        date: todayStr,
        beNo: '',
        beDate: '',
        refDocType: 'BE NO',
        items: [
          {
            id: `item-${Date.now()}-1`,
            sn: '1',
            date: todayStr,
            vehicleNo: '',
            containerNo: '-',
            particulars: '',
            weight: 'FIXED',
            advance: '-',
            amount: ''
          }
        ],
        company: companyProfile,
        bank: bankDetails,
        advanceDeduction: 0,
        paymentStatus: 'UNPAID',
        amountReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        template: currentInvoice.template || 'classic'
      };

      set({ currentInvoice: newInv, activeTab: 'invoice' });
    },

    // LR ACTIONS
    setCurrentLR: (currentLR) => set({ currentLR }),

    updateCurrentLR: (partial) =>
      set((state) => ({
        currentLR: {
          ...state.currentLR,
          ...partial,
          updatedAt: new Date().toISOString()
        }
      })),

    saveCurrentLR: () => {
      const { currentLR, savedLRs } = get();
      const existingIdx = savedLRs.findIndex((lr) => lr.id === currentLR.id);
      let updated: ConsignmentNote[];

      if (existingIdx >= 0) {
        updated = [...savedLRs];
        updated[existingIdx] = currentLR;
      } else {
        updated = [currentLR, ...savedLRs];
      }

      saveStorage(STORAGE_KEYS.LRS, updated);
      set({ savedLRs: updated });
      apiService.saveLR(currentLR);
      supabaseService.syncConsignmentNote(currentLR);
    },

    deleteLR: (id) => {
      const { savedLRs } = get();
      const filtered = savedLRs.filter((lr) => lr.id !== id);
      saveStorage(STORAGE_KEYS.LRS, filtered);
      set({ savedLRs: filtered });
      apiService.deleteLR(id);
      supabaseService.deleteConsignmentNote(id);
    },

    createNewLR: () => {
      const { savedLRs, companyProfile } = get();
      const nextLRNo = getNextLRNumber(savedLRs.map((l) => l.lrNo));
      const todayStr = new Date().toLocaleDateString('en-GB');

      const newLR: ConsignmentNote = {
        id: `lr-${Date.now()}`,
        lrNo: nextLRNo,
        date: todayStr,
        vehicleNo: '',
        branchName: 'NAVI MUMBAI (KAMOTHE / PANVEL)',
        consignorName: '',
        consignorAddress: '',
        fromLocation: '',
        consigneeName: '',
        consigneeAddress: '',
        toLocation: '',
        packagesCount: '1X40',
        description: 'Goods Said to Contain',
        senderWeight: 'FIXED',
        freightType: 'TBB',
        freightAmount: '',
        collectionCharges: 0,
        doorDeliveryCharges: 0,
        biltyCharges: 100,
        insuranceCharges: 0,
        labourCharges: 0,
        gstAmount: 0,
        totalFreightAmount: '',
        deliveryType: 'Door Delivery',
        gstPayableBy: 'CONSIGNEE',
        copyType: 'CONSIGNEE COPY',
        company: companyProfile,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      set({ currentLR: newLR, activeTab: 'lr' });
    },

    convertLRToInvoice: (lr) => {
      const { savedInvoices, companyProfile, bankDetails } = get();
      const nextBillNo = getNextBillNumber(savedInvoices.map((i) => i.billNo), false);
      const clientName = lr.consigneeName || lr.consignorName;
      const clientAddress = lr.consigneeAddress || lr.consignorAddress;
      const particulars = `${lr.fromLocation || 'PORT'} TO ${lr.toLocation || 'DESTINATION'}`;

      const newInv: InvoiceData = {
        id: `inv-${Date.now()}`,
        title: 'TAX INVOICE',
        clientName,
        clientPhone: '',
        clientAddress,
        billNo: nextBillNo,
        date: lr.date || new Date().toLocaleDateString('en-GB'),
        beNo: lr.lrNo,
        beDate: lr.date,
        refDocType: 'LR NO',
        items: [
          {
            id: `item-${Date.now()}-1`,
            sn: '1',
            date: lr.date,
            vehicleNo: lr.vehicleNo,
            containerNo: lr.containerNo || lr.packagesCount || '-',
            particulars,
            weight: lr.senderWeight || 'FIXED',
            advance: '-',
            amount: lr.totalFreightAmount || lr.freightAmount || 0
          }
        ],
        company: companyProfile,
        bank: bankDetails,
        advanceDeduction: 0,
        paymentStatus: 'UNPAID',
        amountReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        template: 'classic'
      };

      set({ currentInvoice: newInv, activeTab: 'invoice' });
    },

    consolidateLRsToInvoice: (lrIds) => {
      const { savedLRs, savedInvoices, companyProfile, bankDetails } = get();
      const selected = savedLRs.filter((lr) => lrIds.includes(lr.id));
      if (selected.length === 0) return;

      const nextBillNo = getNextBillNumber(savedInvoices.map((i) => i.billNo), false);
      const primary = selected[0];
      const allLrNos = selected.map((l) => l.lrNo).join(', ');

      const items: LineItem[] = selected.map((lr, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        sn: String(idx + 1),
        date: lr.date,
        vehicleNo: lr.vehicleNo,
        containerNo: lr.containerNo || lr.packagesCount || '-',
        particulars: `${lr.fromLocation} TO ${lr.toLocation} (LR: ${lr.lrNo})`,
        weight: lr.senderWeight || 'FIXED',
        advance: '-',
        amount: lr.totalFreightAmount || lr.freightAmount || 0
      }));

      const newInv: InvoiceData = {
        id: `inv-${Date.now()}`,
        title: 'TAX INVOICE',
        clientName: primary.consigneeName || primary.consignorName,
        clientPhone: '',
        clientAddress: primary.consigneeAddress || primary.consignorAddress,
        billNo: nextBillNo,
        date: new Date().toLocaleDateString('en-GB'),
        beNo: allLrNos,
        beDate: primary.date,
        refDocType: 'LR NOS',
        items,
        company: companyProfile,
        bank: bankDetails,
        advanceDeduction: 0,
        paymentStatus: 'UNPAID',
        amountReceived: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        template: 'classic'
      };

      set({ currentInvoice: newInv, activeTab: 'invoice', activeModal: null });
    },

    // DIRECTORY ACTIONS
    saveCustomer: (cust) => {
      const { customers } = get();
      const idx = customers.findIndex((c) => c.id === cust.id);
      let updated: CustomerRecord[];
      if (idx >= 0) {
        updated = [...customers];
        updated[idx] = cust;
      } else {
        updated = [cust, ...customers];
      }
      saveStorage(STORAGE_KEYS.CUSTOMERS, updated);
      set({ customers: updated });
      apiService.saveCustomer(cust);
      supabaseService.syncCustomer(cust);
    },

    deleteCustomer: (id) => {
      const { customers } = get();
      const filtered = customers.filter((c) => c.id !== id);
      saveStorage(STORAGE_KEYS.CUSTOMERS, filtered);
      set({ customers: filtered });
      apiService.deleteCustomer(id);
    },

    saveVehicle: (veh) => {
      const { vehicles } = get();
      const idx = vehicles.findIndex((v) => v.id === veh.id);
      let updated: VehicleRecord[];
      if (idx >= 0) {
        updated = [...vehicles];
        updated[idx] = veh;
      } else {
        updated = [veh, ...vehicles];
      }
      saveStorage(STORAGE_KEYS.VEHICLES, updated);
      set({ vehicles: updated });
      apiService.saveVehicle(veh);
      supabaseService.syncVehicle(veh);
    },

    deleteVehicle: (id) => {
      const { vehicles } = get();
      const filtered = vehicles.filter((v) => v.id !== id);
      saveStorage(STORAGE_KEYS.VEHICLES, filtered);
      set({ vehicles: filtered });
      apiService.deleteVehicle(id);
    },

    // TRIP SLIP ACTIONS
    saveTripSlip: (slip) => {
      const { tripSlips } = get();
      const idx = tripSlips.findIndex((t) => t.id === slip.id);
      let updated: TripSlip[];
      if (idx >= 0) {
        updated = [...tripSlips];
        updated[idx] = slip;
      } else {
        updated = [slip, ...tripSlips];
      }
      saveStorage(STORAGE_KEYS.TRIP_SLIPS, updated);
      set({ tripSlips: updated });
      apiService.saveTripSlip(slip);
      supabaseService.syncTripSlip(slip);
    },

    deleteTripSlip: (id) => {
      const { tripSlips } = get();
      const filtered = tripSlips.filter((t) => t.id !== id);
      saveStorage(STORAGE_KEYS.TRIP_SLIPS, filtered);
      set({ tripSlips: filtered });
      apiService.deleteTripSlip(id);
    },

    // SETTINGS ACTIONS
    updateCompanyProfile: (profile) => {
      const { companyProfile, currentInvoice, currentLR } = get();
      const updated = { ...companyProfile, ...profile };
      saveStorage(STORAGE_KEYS.COMPANY, updated);
      set({
        companyProfile: updated,
        currentInvoice: { ...currentInvoice, company: updated },
        currentLR: { ...currentLR, company: updated }
      });
    },

    updateBankDetails: (bank) => {
      const { bankDetails, currentInvoice } = get();
      const updated = { ...bankDetails, ...bank };
      saveStorage(STORAGE_KEYS.BANK, updated);
      set({
        bankDetails: updated,
        currentInvoice: { ...currentInvoice, bank: updated }
      });
    },

    // PAYMENT RECORDING
    recordPayment: (invoiceId, paymentData) => {
      const { savedInvoices, currentInvoice } = get();
      const updated = savedInvoices.map((inv) => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            ...paymentData,
            updatedAt: new Date().toISOString()
          };
        }
        return inv;
      });

      saveStorage(STORAGE_KEYS.INVOICES, updated);

      let updatedCurrent = currentInvoice;
      if (currentInvoice.id === invoiceId) {
        updatedCurrent = { ...currentInvoice, ...paymentData };
      }

      set({
        savedInvoices: updated,
        currentInvoice: updatedCurrent,
        activeModal: null,
        selectedPaymentInvoiceId: null
      });

      const target = updated.find((i) => i.id === invoiceId);
      if (target) {
        supabaseService.syncInvoice(target);
      }
    },

    // BACKUP & RESTORE
    exportBackupJSON: () => {
      const {
        savedInvoices,
        savedLRs,
        customers,
        vehicles,
        tripSlips,
        companyProfile,
        bankDetails
      } = get();

      const backup = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        companyProfile,
        bankDetails,
        savedInvoices,
        savedLRs,
        customers,
        vehicles,
        tripSlips
      };

      return JSON.stringify(backup, null, 2);
    },

    restoreFromJSON: (jsonStr, mode) => {
      try {
        const data = JSON.parse(jsonStr);
        if (!data || typeof data !== 'object') return false;

        const current = get();

        let newInvoices = data.savedInvoices || [];
        let newLRs = data.savedLRs || [];
        let newCustomers = data.customers || [];
        let newVehicles = data.vehicles || [];
        let newTripSlips = data.tripSlips || [];

        if (mode === 'merge') {
          const invMap = new Map(current.savedInvoices.map((i) => [i.id, i]));
          newInvoices.forEach((i: InvoiceData) => invMap.set(i.id, i));
          newInvoices = Array.from(invMap.values());

          const lrMap = new Map(current.savedLRs.map((l) => [l.id, l]));
          newLRs.forEach((l: ConsignmentNote) => lrMap.set(l.id, l));
          newLRs = Array.from(lrMap.values());

          const custMap = new Map(current.customers.map((c) => [c.id, c]));
          newCustomers.forEach((c: CustomerRecord) => custMap.set(c.id, c));
          newCustomers = Array.from(custMap.values());

          const vehMap = new Map(current.vehicles.map((v) => [v.id, v]));
          newVehicles.forEach((v: VehicleRecord) => vehMap.set(v.id, v));
          newVehicles = Array.from(vehMap.values());

          const tripMap = new Map(current.tripSlips.map((t) => [t.id, t]));
          newTripSlips.forEach((t: TripSlip) => tripMap.set(t.id, t));
          newTripSlips = Array.from(tripMap.values());
        }

        saveStorage(STORAGE_KEYS.INVOICES, newInvoices);
        saveStorage(STORAGE_KEYS.LRS, newLRs);
        saveStorage(STORAGE_KEYS.CUSTOMERS, newCustomers);
        saveStorage(STORAGE_KEYS.VEHICLES, newVehicles);
        saveStorage(STORAGE_KEYS.TRIP_SLIPS, newTripSlips);

        if (data.companyProfile) {
          saveStorage(STORAGE_KEYS.COMPANY, data.companyProfile);
        }
        if (data.bankDetails) {
          saveStorage(STORAGE_KEYS.BANK, data.bankDetails);
        }

        set({
          savedInvoices: newInvoices,
          savedLRs: newLRs,
          customers: newCustomers,
          vehicles: newVehicles,
          tripSlips: newTripSlips,
          companyProfile: data.companyProfile || current.companyProfile,
          bankDetails: data.bankDetails || current.bankDetails,
          currentInvoice: newInvoices[0] || current.currentInvoice,
          currentLR: newLRs[0] || current.currentLR,
          activeModal: null
        });

        return true;
      } catch (err) {
        console.error('Failed to parse backup JSON:', err);
        return false;
      }
    },

    resetToDemo: () => {
      saveStorage(STORAGE_KEYS.INVOICES, [defaultSampleInvoice]);
      saveStorage(STORAGE_KEYS.LRS, [defaultSampleLR]);
      saveStorage(STORAGE_KEYS.CUSTOMERS, defaultCustomers);
      saveStorage(STORAGE_KEYS.VEHICLES, defaultVehicles);
      saveStorage(STORAGE_KEYS.TRIP_SLIPS, defaultTripSlips);
      saveStorage(STORAGE_KEYS.COMPANY, defaultCompanyProfile);
      saveStorage(STORAGE_KEYS.BANK, defaultBankDetails);

      set({
        savedInvoices: [defaultSampleInvoice],
        savedLRs: [defaultSampleLR],
        customers: defaultCustomers,
        vehicles: defaultVehicles,
        tripSlips: defaultTripSlips,
        companyProfile: defaultCompanyProfile,
        bankDetails: defaultBankDetails,
        currentInvoice: defaultSampleInvoice,
        currentLR: defaultSampleLR,
        activeModal: null
      });
    }
  };
});
