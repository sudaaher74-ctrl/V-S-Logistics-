import { supabase, isSupabaseConfigured } from './supabase';
import { InvoiceData, ConsignmentNote, CustomerRecord, VehicleRecord, TripSlip } from '../types/invoice';

export const supabaseService = {
  async syncInvoice(invoice: InvoiceData): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('invoices').upsert({
        local_id: invoice.id,
        title: invoice.title,
        client_name: invoice.clientName,
        client_phone: invoice.clientPhone,
        client_address: invoice.clientAddress,
        bill_no: invoice.billNo,
        date: invoice.date,
        be_no: invoice.beNo,
        be_date: invoice.beDate,
        ref_doc_type: invoice.refDocType,
        items: invoice.items,
        company: invoice.company,
        bank: invoice.bank,
        advance_deduction: invoice.advanceDeduction,
        custom_amount_in_words: invoice.customAmountInWords,
        custom_gst_payable_by: invoice.customGstPayableBy,
        payment_status: invoice.paymentStatus,
        amount_received: invoice.amountReceived,
        payment_date: invoice.paymentDate,
        payment_mode: invoice.paymentMode,
        payment_notes: invoice.paymentNotes,
        updated_at: new Date().toISOString()
      }, { onConflict: 'local_id' });

      if (error) {
        console.warn('Supabase invoice sync error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase network error:', err);
      return false;
    }
  },

  async deleteInvoice(localId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('invoices').delete().eq('local_id', localId);
      return !error;
    } catch {
      return false;
    }
  },

  async syncConsignmentNote(lr: ConsignmentNote): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('consignment_notes').upsert({
        local_id: lr.id,
        lr_no: lr.lrNo,
        date: lr.date,
        vehicle_no: lr.vehicleNo,
        branch_name: lr.branchName,
        consignor_name: lr.consignorName,
        consignor_address: lr.consignorAddress,
        consignor_gst: lr.consignorGst,
        from_location: lr.fromLocation,
        consignee_name: lr.consigneeName,
        consignee_address: lr.consigneeAddress,
        consignee_gst: lr.consigneeGst,
        to_location: lr.toLocation,
        packages_count: lr.packagesCount,
        description: lr.description,
        container_no: lr.containerNo,
        po_number: lr.poNumber,
        sender_weight: lr.senderWeight,
        weight_charges: lr.weightCharges,
        freight_type: lr.freightType,
        freight_amount: lr.freightAmount === '' ? 0 : lr.freightAmount,
        collection_charges: lr.collectionCharges === '' ? 0 : lr.collectionCharges,
        door_delivery_charges: lr.doorDeliveryCharges === '' ? 0 : lr.doorDeliveryCharges,
        bilty_charges: lr.biltyCharges === '' ? 0 : lr.biltyCharges,
        insurance_charges: lr.insuranceCharges === '' ? 0 : lr.insuranceCharges,
        labour_charges: lr.labourCharges === '' ? 0 : lr.labourCharges,
        gst_amount: lr.gstAmount === '' ? 0 : lr.gstAmount,
        total_freight_amount: lr.totalFreightAmount === '' ? 0 : lr.totalFreightAmount,
        freight_remark: lr.freightRemark,
        eway_bill_no: lr.ewayBillNo,
        invoice_no: lr.invoiceNo,
        invoice_date: lr.invoiceDate,
        invoice_value: lr.invoiceValue,
        delivery_type: lr.deliveryType,
        gst_payable_by: lr.gstPayableBy,
        copy_type: lr.copyType,
        company: lr.company,
        updated_at: new Date().toISOString()
      }, { onConflict: 'local_id' });

      return !error;
    } catch (err) {
      console.warn('Supabase LR sync error:', err);
      return false;
    }
  },

  async deleteConsignmentNote(localId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('consignment_notes').delete().eq('local_id', localId);
      return !error;
    } catch {
      return false;
    }
  },

  async syncCustomer(cust: CustomerRecord): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('customers').upsert({
        local_id: cust.id,
        name: cust.name,
        phone: cust.phone,
        gstin: cust.gstin,
        address: cust.address
      }, { onConflict: 'local_id' });
      return !error;
    } catch {
      return false;
    }
  },

  async syncVehicle(veh: VehicleRecord): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('vehicles').upsert({
        local_id: veh.id,
        vehicle_no: veh.vehicleNo,
        driver_name: veh.driverName,
        driver_phone: veh.driverPhone,
        type: veh.type
      }, { onConflict: 'local_id' });
      return !error;
    } catch {
      return false;
    }
  },

  async syncTripSlip(trip: TripSlip): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('trip_slips').upsert({
        local_id: trip.id,
        slip_no: trip.slipNo,
        date: trip.date,
        vehicle_no: trip.vehicleNo,
        driver_name: trip.driverName,
        driver_phone: trip.driverPhone,
        from_location: trip.fromLocation,
        to_location: trip.toLocation,
        container_no: trip.containerNo,
        diesel_liters: trip.dieselLiters === '' ? 0 : trip.dieselLiters,
        diesel_rate: trip.dieselRate === '' ? 0 : trip.dieselRate,
        diesel_amount: trip.dieselAmount === '' ? 0 : trip.dieselAmount,
        diesel_pump_name: trip.dieselPumpName,
        driver_advance: trip.driverAdvance === '' ? 0 : trip.driverAdvance,
        toll_charges: trip.tollCharges === '' ? 0 : trip.tollCharges,
        other_expenses: trip.otherExpenses === '' ? 0 : trip.otherExpenses,
        remarks: trip.remarks,
        total_expense: trip.totalExpense,
        company: trip.company
      }, { onConflict: 'local_id' });
      return !error;
    } catch {
      return false;
    }
  }
};
