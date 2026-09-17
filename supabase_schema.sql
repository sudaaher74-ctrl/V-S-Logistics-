-- Supabase PostgreSQL Schema for V S LOGISTICS ERP
-- Run this in your Supabase SQL Editor to set up cloud synchronization

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id TEXT NOT NULL UNIQUE,
    title TEXT,
    client_name TEXT,
    client_phone TEXT,
    client_address TEXT,
    bill_no TEXT,
    date TEXT,
    be_no TEXT,
    be_date TEXT,
    ref_doc_type TEXT,
    items JSONB,
    company JSONB,
    bank JSONB,
    advance_deduction NUMERIC DEFAULT 0,
    custom_amount_in_words TEXT,
    custom_gst_payable_by TEXT,
    payment_status TEXT DEFAULT 'UNPAID',
    amount_received NUMERIC DEFAULT 0,
    payment_date TEXT,
    payment_mode TEXT,
    payment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    gstin TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id TEXT NOT NULL UNIQUE,
    vehicle_no TEXT NOT NULL,
    driver_name TEXT,
    driver_phone TEXT,
    type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_slips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id TEXT NOT NULL UNIQUE,
    slip_no TEXT,
    date TEXT,
    vehicle_no TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    from_location TEXT,
    to_location TEXT,
    container_no TEXT,
    diesel_liters NUMERIC,
    diesel_rate NUMERIC,
    diesel_amount NUMERIC,
    diesel_pump_name TEXT,
    driver_advance NUMERIC,
    toll_charges NUMERIC,
    other_expenses NUMERIC,
    remarks TEXT,
    total_expense NUMERIC,
    company JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consignment_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id TEXT NOT NULL UNIQUE,
    lr_no TEXT,
    date TEXT,
    vehicle_no TEXT,
    branch_name TEXT,
    consignor_name TEXT,
    consignor_address TEXT,
    consignor_gst TEXT,
    from_location TEXT,
    consignee_name TEXT,
    consignee_address TEXT,
    consignee_gst TEXT,
    to_location TEXT,
    packages_count TEXT,
    description TEXT,
    container_no TEXT,
    po_number TEXT,
    sender_weight TEXT,
    weight_charges TEXT,
    freight_type TEXT,
    freight_amount NUMERIC,
    collection_charges NUMERIC,
    door_delivery_charges NUMERIC,
    bilty_charges NUMERIC,
    insurance_charges NUMERIC,
    labour_charges NUMERIC,
    gst_amount NUMERIC,
    total_freight_amount NUMERIC,
    freight_remark TEXT,
    eway_bill_no TEXT,
    invoice_no TEXT,
    invoice_date TEXT,
    invoice_value TEXT,
    delivery_type TEXT,
    gst_payable_by TEXT,
    copy_type TEXT,
    company JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE consignment_notes ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for anonymous demo/single-tenant client usage
-- (Can be restricted later with Supabase Auth policies)
CREATE POLICY "Allow anon all on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on vehicles" ON vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on trip_slips" ON trip_slips FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon all on consignment_notes" ON consignment_notes FOR ALL USING (true) WITH CHECK (true);
