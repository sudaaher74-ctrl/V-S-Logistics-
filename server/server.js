import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'vs_logistics.db');
const db = new DatabaseSync(dbPath);

// Initialize SQLite Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    bill_no TEXT,
    client_name TEXT,
    date TEXT,
    data TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS consignment_notes (
    id TEXT PRIMARY KEY,
    lr_no TEXT,
    vehicle_no TEXT,
    date TEXT,
    data TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT,
    data TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    vehicle_no TEXT,
    data TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS trip_slips (
    id TEXT PRIMARY KEY,
    slip_no TEXT,
    date TEXT,
    data TEXT NOT NULL,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

console.log(`[SQLite Database] Connected successfully to ${dbPath}`);

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    database: 'SQLite (node:sqlite)',
    dbPath,
    free: true,
    serverTime: new Date().toISOString()
  });
});

// Load all ERP data
app.get('/api/data', (req, res) => {
  try {
    const invoices = db.prepare('SELECT data FROM invoices ORDER BY updated_at DESC').all().map(r => JSON.parse(r.data));
    const lrs = db.prepare('SELECT data FROM consignment_notes ORDER BY updated_at DESC').all().map(r => JSON.parse(r.data));
    const customers = db.prepare('SELECT data FROM customers ORDER BY updated_at DESC').all().map(r => JSON.parse(r.data));
    const vehicles = db.prepare('SELECT data FROM vehicles ORDER BY updated_at DESC').all().map(r => JSON.parse(r.data));
    const tripSlips = db.prepare('SELECT data FROM trip_slips ORDER BY updated_at DESC').all().map(r => JSON.parse(r.data));

    const settingsRows = db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    settingsRows.forEach(r => {
      try {
        settings[r.key] = JSON.parse(r.value);
      } catch {
        settings[r.key] = r.value;
      }
    });

    res.json({
      invoices,
      lrs,
      customers,
      vehicles,
      tripSlips,
      company: settings.company || null,
      bank: settings.bank || null
    });
  } catch (err) {
    console.error('Error fetching data:', err);
    res.status(500).json({ error: err.message });
  }
});

// INVOICES
app.post('/api/invoices', (req, res) => {
  try {
    const inv = req.body;
    if (!inv || !inv.id) return res.status(400).json({ error: 'Invoice id required' });

    const stmt = db.prepare(`
      INSERT INTO invoices (id, bill_no, client_name, date, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        bill_no = excluded.bill_no,
        client_name = excluded.client_name,
        date = excluded.date,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    stmt.run(inv.id, inv.billNo || '', inv.clientName || '', inv.date || '', JSON.stringify(inv), new Date().toISOString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CONSIGNMENT NOTES (LRs)
app.post('/api/lrs', (req, res) => {
  try {
    const lr = req.body;
    if (!lr || !lr.id) return res.status(400).json({ error: 'LR id required' });

    const stmt = db.prepare(`
      INSERT INTO consignment_notes (id, lr_no, vehicle_no, date, data, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        lr_no = excluded.lr_no,
        vehicle_no = excluded.vehicle_no,
        date = excluded.date,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    stmt.run(lr.id, lr.lrNo || '', lr.vehicleNo || '', lr.date || '', JSON.stringify(lr), new Date().toISOString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/lrs/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM consignment_notes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CUSTOMERS
app.post('/api/customers', (req, res) => {
  try {
    const cust = req.body;
    if (!cust || !cust.id) return res.status(400).json({ error: 'Customer id required' });

    const stmt = db.prepare(`
      INSERT INTO customers (id, name, data, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    stmt.run(cust.id, cust.name || '', JSON.stringify(cust), new Date().toISOString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/customers/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VEHICLES
app.post('/api/vehicles', (req, res) => {
  try {
    const veh = req.body;
    if (!veh || !veh.id) return res.status(400).json({ error: 'Vehicle id required' });

    const stmt = db.prepare(`
      INSERT INTO vehicles (id, vehicle_no, data, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        vehicle_no = excluded.vehicle_no,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    stmt.run(veh.id, veh.vehicleNo || '', JSON.stringify(veh), new Date().toISOString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vehicles/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// TRIP SLIPS
app.post('/api/trip-slips', (req, res) => {
  try {
    const slip = req.body;
    if (!slip || !slip.id) return res.status(400).json({ error: 'Trip Slip id required' });

    const stmt = db.prepare(`
      INSERT INTO trip_slips (id, slip_no, date, data, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        slip_no = excluded.slip_no,
        date = excluded.date,
        data = excluded.data,
        updated_at = excluded.updated_at
    `);

    stmt.run(slip.id, slip.slipNo || '', slip.date || '', JSON.stringify(slip), new Date().toISOString());
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/trip-slips/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM trip_slips WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SETTINGS (Company & Bank)
app.post('/api/settings/:key', (req, res) => {
  try {
    const key = req.params.key;
    const value = JSON.stringify(req.body);

    const stmt = db.prepare(`
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    stmt.run(key, value);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[V S LOGISTICS API] Server running at http://localhost:${PORT}`);
});
