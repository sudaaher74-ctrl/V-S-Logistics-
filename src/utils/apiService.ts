import { InvoiceData, ConsignmentNote, CustomerRecord, VehicleRecord, TripSlip, CompanyProfile, BankDetails } from '../types/invoice';

const API_BASE = '/api';

export const apiService = {
  async checkStatus(): Promise<{ online: boolean; database?: string; dbPath?: string }> {
    try {
      const res = await fetch(`${API_BASE}/status`);
      if (!res.ok) return { online: false };
      const data = await res.json();
      return { online: true, database: data.database, dbPath: data.dbPath };
    } catch {
      return { online: false };
    }
  },

  async fetchAllData(): Promise<{
    invoices?: InvoiceData[];
    lrs?: ConsignmentNote[];
    customers?: CustomerRecord[];
    vehicles?: VehicleRecord[];
    tripSlips?: TripSlip[];
    company?: CompanyProfile | null;
    bank?: BankDetails | null;
  } | null> {
    try {
      const res = await fetch(`${API_BASE}/data`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveInvoice(invoice: InvoiceData): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteInvoice(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/invoices/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async saveLR(lr: ConsignmentNote): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/lrs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lr)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteLR(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/lrs/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async saveCustomer(cust: CustomerRecord): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cust)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteCustomer(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async saveVehicle(veh: VehicleRecord): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veh)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteVehicle(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/vehicles/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async saveTripSlip(slip: TripSlip): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/trip-slips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slip)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteTripSlip(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/trip-slips/${id}`, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  },

  async saveSetting(key: 'company' | 'bank', data: any): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/settings/${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
