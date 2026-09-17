# V S LOGISTICS - Enterprise Transport & Billing ERP

An offline-first, cloud-synchronized Enterprise Transport & Logistics Invoicing, Goods Consignment Note (e-LR / Bilty), Fleet Trip Slip, Party Ledger (Khata), and Directory ERP System tailored specifically for **V S LOGISTICS**.

---

## 🚛 Features

- **Classic Transport Stationery (Tax Invoice)**:
  - Exact reproduction of the authentic red-ruled stationery with top auspicious mantras (*श्री गणेशाय नमः | श्री हनुमान प्रसन्न | आई तुळजा भवानी*), bold red header, Kamothe office address, and PAN `ABBFV7425J`.
  - Enforced 12 physical minimum rows with dynamic filler rows.
  - Automatic Indian Rupee Words conversion (Crores, Lakhs, Thousands, Rupees, Paise).
  - Pre-configured SVC Co-operative Bank, Kamothe Branch details.
  - Toggleable **Modern Corporate Invoice** layout.

- **Goods Consignment Note (e-LR / Bilty)**:
  - Indian Carriage by Road Act compliance layout.
  - Multi-copy watermark badges (`CONSIGNEE COPY`, `CONSIGNOR COPY`, `DRIVER COPY`, `OFFICE COPY`, `TRANSPORTER COPY`).
  - 1-Click Convert LR to Tax Invoice.
  - 1-Click Multi-LR Consolidation into a single Tax Invoice.
  - 3-in-1 consolidated LR PDF generation.

- **Fleet Trip Slips & Expense Vouchers**:
  - Trip dispatch vouchers tracking diesel consumption (`Liters × Rate = Amount` + fuel station name), driver advance, toll fees, and miscellaneous expenses.
  - Printable A5/A4 Trip Slip PDF vouchers.

- **Party Ledger (Khata) & Outstanding Balance Tracker**:
  - Filter invoices by customer name and date range.
  - Real-time analytics cards (Total Billed, Total Paid, Total Outstanding).
  - Payment receipt recording (Bank Transfer, UPI, Cheque, Cash).
  - Export formal Client Ledger statements as CSV (Excel compatible with UTF-8 BOM).

- **Master Directory**:
  - Customers master with quick "Apply to Current Bill" button.
  - Fleet vehicles master with driver details and vehicle types.
  - Inline quick-save prompts when typing new customers or vehicles in the invoice editor.

- **Export & Sharing**:
  - High-resolution A4/A5 PDF generation with `html-to-image` at 2.5x pixel ratio and `jspdf`.
  - Clean native browser print styles (`@media print`).
  - Pre-formatted WhatsApp share messages with direct Web/Mobile dispatch.

- **Hybrid Offline Storage & Supabase Cloud Sync**:
  - LocalStorage persistence with Zustand store.
  - Ready-to-deploy Supabase PostgreSQL cloud sync ([supabase_schema.sql](supabase_schema.sql)).
  - Full system JSON backup export and restore.

---

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript (`strict: true`)
- **Build Tool**: Vite
- **Styling**: Vanilla CSS with print media queries
- **State Management**: Zustand
- **Icons**: `lucide-react`
- **PDF Engine**: `html-to-image` + `jspdf`
- **Cloud Backend**: Supabase PostgreSQL client (`@supabase/supabase-js`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```

### 4. Supabase Cloud Sync (Optional)
To enable multi-device sync, create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
Execute the queries in `supabase_schema.sql` within your Supabase SQL Editor.
