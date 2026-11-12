import { DatabaseSync } from 'node:sqlite';
import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

export const ENV = {
  PORT: Number(process.env.PORT || 3000),
  BASE_URL: (process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, ''),
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin123',
  SECRET: process.env.SECRET || 'neurox-carsbyrajat-hmac-secret-2026',
  WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN || 'neurox-whatsapp-stop-webhook-secret-2026',
  ADSENSE_ID: process.env.ADSENSE_ID || '',
  DB_PATH: process.env.DB || 'data.db',
};

export const db = new DatabaseSync(ENV.DB_PATH);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    km INTEGER NOT NULL,
    fuel TEXT NOT NULL,
    tr TEXT NOT NULL,
    tr_detail TEXT DEFAULT '',
    own INTEGER DEFAULT 1,
    rto TEXT DEFAULT 'MH-31',
    ins TEXT DEFAULT 'Comprehensive',
    feat TEXT DEFAULT '',
    price INTEGER NOT NULL,
    direct INTEGER NOT NULL,
    photos TEXT DEFAULT '',
    reel TEXT DEFAULT '',
    status TEXT DEFAULT 'AVAILABLE',
    insp_engine TEXT DEFAULT 'Compression & idle smooth | Clutch bite & gear shifts verified | Zero oil or coolant leaks',
    insp_tyres TEXT DEFAULT '75%+ tread depth remaining | Factory alloy wheels intact | Spare tyre unused & healthy',
    insp_chassis TEXT DEFAULT '100% Non-accidental guarantee | Original factory paint thickness verified | Zero rust or flood history',
    insp_elec TEXT DEFAULT 'AC chilling at 4.2°C | Power windows, sunroof & infotainment tested | All airbag & ABS sensors active',
    keys_count TEXT DEFAULT 'Original 2 Smart Keys Available',
    service_hist TEXT DEFAULT 'Authorized Service Centre Records Verified',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    name TEXT DEFAULT '-',
    car_id INTEGER,
    status TEXT DEFAULT 'NEW',
    note TEXT DEFAULT '',
    trail TEXT DEFAULT '',
    consent INTEGER DEFAULT 1,
    consent_ts TEXT NOT NULL,
    email TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS settings (
    k TEXT PRIMARY KEY,
    v TEXT
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'SALES_REP',
    responsibilities TEXT DEFAULT '',
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS team_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT DEFAULT (datetime('now')),
    member_id INTEGER,
    member_name TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lead_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    ts TEXT DEFAULT (datetime('now')),
    type TEXT NOT NULL,
    outcome TEXT DEFAULT '',
    customer_response TEXT DEFAULT '',
    decision_notes TEXT DEFAULT '',
    next_followup_date TEXT DEFAULT '',
    created_by TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT DEFAULT (datetime('now')),
    lead_id INTEGER,
    car_id INTEGER,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT DEFAULT '',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    assigned_to TEXT DEFAULT 'Rajat (Showroom)',
    assigned_member_id INTEGER DEFAULT 1,
    response_notes TEXT DEFAULT '',
    responded_at TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS negotiations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    lead_id INTEGER,
    listed_price INTEGER NOT NULL,
    current_customer_offer INTEGER NOT NULL,
    current_vendor_offer INTEGER,
    status TEXT DEFAULT 'PENDING',
    assigned_to TEXT DEFAULT 'Rajat (Showroom)',
    assigned_member_id INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS negotiation_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    negotiation_id INTEGER NOT NULL,
    sender_type TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    offered_price INTEGER NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT DEFAULT 'SUBMITTED',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ts TEXT DEFAULT (datetime('now')),
    recipient_type TEXT NOT NULL,
    recipient_target TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    event_type TEXT NOT NULL,
    link_url TEXT DEFAULT '',
    is_read INTEGER DEFAULT 0
  );
`);

try {
  db.exec("ALTER TABLE leads ADD COLUMN email TEXT DEFAULT ''");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN followup_date TEXT DEFAULT ''");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN assigned_to TEXT DEFAULT 'Rajat (Showroom)'");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'DIGITAL_SHOWROOM'");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN budget TEXT DEFAULT ''");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN exchange TEXT DEFAULT ''");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN location TEXT DEFAULT 'Nagpur'");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN requirements TEXT DEFAULT ''");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN assigned_member_id INTEGER DEFAULT 1");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN verification_status TEXT DEFAULT 'VERIFIED'");
} catch {}
try {
  db.exec("ALTER TABLE leads ADD COLUMN engagement_score INTEGER DEFAULT 65");
} catch {}

try {
  db.exec("ALTER TABLE cars ADD COLUMN dealer_source TEXT DEFAULT 'CBR Own Stock'");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN dealer_contact TEXT DEFAULT ''");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN dealer_cost INTEGER DEFAULT 0");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN verification_status TEXT DEFAULT 'VERIFIED'");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN verified_by TEXT DEFAULT 'Rajat Sharma (Admin)'");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN verified_at TEXT DEFAULT (datetime('now'))");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN verification_notes TEXT DEFAULT 'Showroom vehicle inspection, RTO transfer clearance and insurance verified'");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN rc_verified INTEGER DEFAULT 1");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN insurance_verified INTEGER DEFAULT 1");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN puc_verified INTEGER DEFAULT 1");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN inspection_verified INTEGER DEFAULT 1");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN description TEXT DEFAULT ''");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN location TEXT DEFAULT 'Nagpur (Wardha Road Hub)'");
} catch {}
try {
  db.exec("ALTER TABLE cars ADD COLUMN contact_number TEXT DEFAULT '+91 98230 11223'");
} catch {}

// Intelligent Anti-Fake Indian Mobile Number Heuristic Validator (Zero-Cost Verification)
export function isValidIndianMobile(phone) {
  const p = String(phone || '').replace(/[^0-9]/g, '').slice(-10);
  if (!/^[6-9][0-9]{9}$/.test(p)) {
    return { ok: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' };
  }
  // Reject all identical repeating digits (e.g. 9999999999, 8888888888)
  if (p.split('').every((c) => c === p[0])) {
    return { ok: false, error: 'Please enter your actual personal contact number.' };
  }
  // Reject common sequential patterns (e.g. 9876543210, 1234567890)
  const fakeSequences = ['9876543210', '8765432109', '0123456789', '1234567890', '9012345678', '8901234567'];
  if (fakeSequences.includes(p)) {
    return { ok: false, error: 'Please enter your actual personal contact number.' };
  }
  // Reject numbers with fewer than 4 unique digits (e.g. 9898989898, 9191919191)
  const uniqueDigits = new Set(p.split('')).size;
  if (uniqueDigits < 4) {
    return { ok: false, error: 'Please enter a genuine mobile number so our showroom manager can confirm availability.' };
  }
  return { ok: true, phone: p };
}

export const DEFAULT_SETTINGS = {
  name: 'Cars By Rajat',
  tagline: "Nagpur's #1 Certified Pre-Owned Luxury & Fleet Hub",
  address: 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur, Maharashtra 440015',
  phone: '+91 98230 11223',
  whatsapp: '919823011223',
  insta: 'carsbyrajat',
  followers: '48.2K',
  officer: 'Rajat Sharma (Data Protection & Grievance Officer)',
  officer_email: 'grievance@carsbyrajat.in',
  lat: '21.1145',
  lng: '79.0682',
  hours: 'Mo-Su 10:00-20:30',
  adsense_id: ENV.ADSENSE_ID,
};

for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
  db.prepare('INSERT OR IGNORE INTO settings (k, v) VALUES (?, ?)').run(k, v);
}

export function getSettings() {
  const rows = db.prepare('SELECT k, v FROM settings').all();
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.k, r.v])) };
}

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Seed 12 Curated Nagpur Pre-Owned Vehicles with Real Multi-Angle Automotive Photography
const carCount = db.prepare('SELECT COUNT(*) AS n FROM cars').get().n;
if (!carCount) {
  const ins = db.prepare(`
    INSERT INTO cars (
      slug, make, model, year, km, fuel, tr, tr_detail, own, rto, ins, feat, price, direct, photos, reel, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE')
  `);

  const seedCars = [
    [
      'Hyundai', 'Creta SX (O) Turbo', 2021, 32500, 'Diesel', 'Automatic', 'Torque Converter', 1, 'MH-31',
      'Zero Dep valid Oct 2027', 'Panoramic Sunroof, Ventilated Seats, Bose 8-Speaker Audio, Bluelink',
      1490000, 1435000,
      [
        'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Kia', 'Seltos GTX+ 1.4', 2022, 21000, 'Petrol', 'Automatic', '7-Speed DCT', 1, 'MH-40',
      'Comprehensive valid Mar 2027', 'Sunroof, 360 Camera, Heads-Up Display, Ventilated Seats, 6 Airbags',
      1650000, 1565000,
      [
        'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'BMW', '3 Series 320d Luxury Line', 2021, 29000, 'Diesel', 'Automatic', '8-Speed Steptronic', 1, 'MH-31',
      'Zero Dep valid Sep 2027', 'Sunroof, Ambient Lighting, Vernasca Leather, iDrive 7.0, Wireless CarPlay',
      3650000, 3490000,
      [
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1556189250-72ba954cfc2b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Mahindra', 'XUV700 AX7 Luxury AWD', 2022, 28000, 'Diesel', 'Automatic', 'Torque Converter', 1, 'MH-40',
      'Zero Dep valid Jun 2027', 'Skyroof, ADAS Level 2, 4x4 AWD, Sony 3D Audio, 360 Surround View',
      2280000, 2175000,
      [
        'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Honda', 'City ZX CVT (5th Gen)', 2020, 36000, 'Petrol', 'Automatic', 'CVT Paddle Shift', 1, 'MH-49',
      'Zero Dep valid Aug 2027', 'Electric Sunroof, LaneWatch Camera, Full LED Headlamps, Alexa Remote',
      1040000, 975000,
      [
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Toyota', 'Innova Crysta 2.4 ZX', 2020, 64000, 'Diesel', 'Manual', '5-Speed Manual', 1, 'MH-31',
      'Comprehensive valid Feb 2027', 'Captain Seats, Tan Leather Interior, Cruise Control, 7 Airbags',
      1890000, 1795000,
      [
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Tata', 'Nexon EV Max XZ+ Lux', 2023, 12000, 'Electric', 'Automatic', 'Single-Speed EV', 1, 'MH-31',
      'Comprehensive valid Dec 2027', 'Sunroof, Ventilated Leatherette Seats, 453 KM Range, Electronic Parking Brake',
      1620000, 1520000,
      [
        'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Mercedes-Benz', 'C-Class C220d Progressive', 2020, 38000, 'Diesel', 'Automatic', '9G-TRONIC', 1, 'MH-31',
      'Zero Dep valid May 2027', 'Panoramic Sunroof, Burmester Surround Sound, 64-Color Ambient Light, Memory Seats',
      3390000, 3220000,
      [
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Maruti Suzuki', 'Swift ZXi+ DualJet', 2021, 31000, 'Petrol', 'Manual', '5-Speed Manual', 1, 'MH-31',
      'Comprehensive valid Jan 2027', '7-Inch SmartPlay Studio, Cruise Control, Auto Fold ORVMs, Alloy Wheels',
      640000, 595000,
      [
        'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Hyundai', 'i20 Asta (O) 1.2', 2021, 24000, 'Petrol', 'Manual', '5-Speed Manual', 1, 'MH-40',
      'Comprehensive valid Apr 2027', 'Sunroof, Bose 7-Speaker System, Digital Cluster, Wireless Charger',
      840000, 785000,
      [
        'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Maruti Suzuki', 'WagonR VXi S-CNG', 2019, 48000, 'CNG', 'Manual', '5-Speed Manual', 2, 'MH-31',
      'Third Party valid Nov 2026', 'Factory Fitted S-CNG (32 km/kg), Power Windows, Central Locking, Bluetooth',
      465000, 425000,
      [
        'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
    [
      'Toyota', 'Camry Hybrid 2.5 Luxury', 2019, 44000, 'Hybrid', 'Automatic', 'e-CVT Hybrid', 1, 'MH-31',
      'Zero Dep valid Jul 2027', 'Reclining Rear Power Seats, JBL 9-Speaker Audio, 3-Zone Climate, 23 km/l Hybrid',
      2450000, 2290000,
      [
        'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1000&q=80',
      ].join(','),
      'https://www.instagram.com/carsbyrajat/'
    ],
  ];

  for (const row of seedCars) {
    ins.run(slugify(`${row[0]} ${row[1]} ${row[2]}`), ...row);
  }
}

// Seed 2 Sample Leads so the Admin CRM is immediately rich for client demos
const leadCount = db.prepare('SELECT COUNT(*) AS n FROM leads').get().n;
if (!leadCount) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO leads (ts, phone, name, car_id, status, note, trail, consent, consent_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    now,
    '9823055667',
    'Vikram Deshmukh',
    1,
    'NEW',
    'Interested in exchange with 2017 Swift Dzire. Wants test drive this Saturday.',
    'Viewed 2022 Kia Seltos GTX+ 1.4 → Viewed 2022 Mahindra XUV700 AX7 Luxury AWD → Unlocked price for 2021 Hyundai Creta SX (O) Turbo',
    now
  );
  db.prepare(`
    INSERT INTO leads (ts, phone, name, car_id, status, note, trail, consent, consent_ts)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    now,
    '9765411220',
    'Dr. Ananya Joshi',
    3,
    'TEST_DRIVE_SCHEDULED',
    'Test drive booked for Wardha Road Hub (Afternoon slot). Pre-approved HDFC loan.',
    'Viewed 2020 Mercedes-Benz C-Class C220d Progressive → Unlocked price for 2021 BMW 3 Series 320d Luxury Line → Booked test drive',
    now
  );
}

// DPDP Act 2023 Compliance: Auto-purge leads older than 90 days
export function purgeExpiredLeads() {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare("DELETE FROM leads WHERE ts < ? AND status != 'DEAL_CLOSED'").run(cutoff);
}
purgeExpiredLeads();
setInterval(purgeExpiredLeads, 12 * 60 * 60 * 1000).unref();

// Cryptographic Password Hashing & Helpers
export function hashPassword(password, salt = null) {
  const s = salt || randomBytes(16).toString('hex');
  const h = scryptSync(String(password || ''), s, 64).toString('hex');
  return { salt: s, hash: h };
}

export function verifyPassword(password, salt, hash) {
  const testHash = scryptSync(String(password || ''), salt, 64).toString('hex');
  if (testHash.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(testHash), Buffer.from(hash));
}

// Seed Initial Team Members & Seed CRM / Negotiation / Enquiry / Notification Data
const memberCount = db.prepare('SELECT COUNT(*) AS n FROM team_members').get().n;
if (!memberCount) {
  const insMember = db.prepare(`
    INSERT INTO team_members (username, password_hash, password_salt, name, email, phone, role, responsibilities, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
  `);

  const initialMembers = [
    ['admin', 'admin123', 'Rajat Sharma (Principal)', 'rajat@carsbyrajat.in', '9823011223', 'ADMIN', 'Overall Showroom & Strategic Inventory Operations'],
    ['vikas_mgr', 'manager123', 'Vikas Agrawal', 'vikas@carsbyrajat.in', '9823044112', 'SALES_MANAGER', 'Lead Distribution, Team Oversight & Closing Approval'],
    ['sachin_rep', 'rep123', 'Sachin Mendhe', 'sachin@carsbyrajat.in', '9823077881', 'SALES_REP', 'Luxury Fleet Test Drives & Client Inquiries'],
    ['priya_rep', 'rep123', 'Priya Patil', 'priya@carsbyrajat.in', '9823088992', 'SALES_REP', 'Customer Negotiation Follow-ups & Finance Desk'],
    ['amit_inv', 'inventory123', 'Amit Deshmukh', 'amit@carsbyrajat.in', '9823099003', 'INVENTORY_MANAGER', 'Showroom Physical Inspection & RTO Document Verification'],
  ];

  for (const [u, p, name, email, phone, role, resp] of initialMembers) {
    const { salt, hash } = hashPassword(p);
    insMember.run(u, hash, salt, name, email, phone, role, resp);
  }
}

// Populate Vehicle Description & Location Defaults if empty
try {
  db.prepare(`
    UPDATE cars SET 
      description = CASE 
        WHEN description IS NULL OR description = '' THEN 
          'Immaculate condition, certified showroom vehicle inspection completed at Cars By Rajat Nagpur. Non-accidental, original factory paint, complete service history, comprehensive insurance and clear RTO transfer paperwork verified.'
        ELSE description 
      END,
      location = CASE 
        WHEN location IS NULL OR location = '' THEN 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur'
        ELSE location
      END,
      contact_number = CASE
        WHEN contact_number IS NULL OR contact_number = '' THEN '+91 98230 11223'
        ELSE contact_number
      END
  `).run();
} catch {}

// Seed Sample Enquiries
const enquiryCount = db.prepare('SELECT COUNT(*) AS n FROM enquiries').get().n;
if (!enquiryCount) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO enquiries (ts, lead_id, car_id, customer_name, customer_phone, customer_email, message, status, assigned_to, assigned_member_id, response_notes, responded_at)
    VALUES (?, 1, 1, 'Vikram Deshmukh', '9823055667', 'vikram.deshmukh@gmail.com', 'Interested in Creta SX Turbo. Can we do exchange evaluation this Saturday morning?', 'RESPONDED', 'Rajat (Showroom)', 1, 'Confirmed appointment for Saturday 11:30 AM at Wardha Road Hub.', ?)
  `).run(now, now);
  db.prepare(`
    INSERT INTO enquiries (ts, lead_id, car_id, customer_name, customer_phone, customer_email, message, status, assigned_to, assigned_member_id, response_notes, responded_at)
    VALUES (?, 2, 3, 'Dr. Ananya Joshi', '9765411220', 'ananya.joshi@aiims.edu', 'Checking availability of BMW 320d Luxury Line. Please share service history records.', 'IN_REVIEW', 'Sachin Mendhe', 3, 'Service records requested from BMW authorized center.', ?)
  `).run(now, now);
}

// Seed Sample Negotiations
const negCount = db.prepare('SELECT COUNT(*) AS n FROM negotiations').get().n;
if (!negCount) {
  const now = new Date().toISOString();
  const negId = db.prepare(`
    INSERT INTO negotiations (car_id, customer_phone, customer_name, lead_id, listed_price, current_customer_offer, current_vendor_offer, status, assigned_to, assigned_member_id, created_at, updated_at)
    VALUES (1, '9823055667', 'Vikram Deshmukh', 1, 1435000, 1380000, 1410000, 'VENDOR_COUNTERED', 'Rajat (Showroom)', 1, ?, ?)
  `).run(now, now).lastInsertRowid;

  db.prepare(`
    INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
    VALUES (?, 'CUSTOMER', 'Vikram Deshmukh', 1380000, 'Immediate payment ready if agreed at 13.8L with RC transfer.', 'SUBMITTED', ?)
  `).run(negId, now);

  db.prepare(`
    INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
    VALUES (?, 'VENDOR', 'Rajat Sharma (Principal)', 1410000, 'Counteroffer: ₹14,10,000 including complimentary RTO transfer and 1-Year Comprehensive Warranty.', 'COUNTERED', ?)
  `).run(negId, now);
}

// Seed Sample Lead Interactions
const interCount = db.prepare('SELECT COUNT(*) AS n FROM lead_interactions').get().n;
if (!interCount) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, next_followup_date, created_by)
    VALUES (1, ?, 'CALL', 'Discussed Creta SX Turbo and Swift exchange', 'Customer interested in visiting showroom with spouse', 'Offered exchange valuation at Wardha Road hub', '2026-11-06', 'Rajat Sharma')
  `).run(now);
  db.prepare(`
    INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, next_followup_date, created_by)
    VALUES (1, ?, 'OFFER', 'Customer submitted purchase offer of ₹13,80,000', 'Negotiating margin', 'Vendor countered at ₹14,10,000 with warranty package', '2026-11-06', 'Rajat Sharma')
  `).run(now);
  db.prepare(`
    INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, next_followup_date, created_by)
    VALUES (2, ?, 'MEETING', 'Completed test drive of BMW 320d Luxury Line', 'Very satisfied with ride and interior condition', 'Customer arranging HDFC pre-approved loan disbursement', '2026-11-07', 'Sachin Mendhe')
  `).run(now);
}

// Seed Notifications
const notifCount = db.prepare('SELECT COUNT(*) AS n FROM notifications').get().n;
if (!notifCount) {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO notifications (ts, recipient_type, recipient_target, title, message, event_type, link_url, is_read)
    VALUES (?, 'ADMIN_TEAM', 'ALL', 'New Car Enquiry Received', 'Vikram Deshmukh enquired about 2021 Hyundai Creta SX (O) Turbo', 'NEW_ENQUIRY', '/admin/enquiries', 0)
  `).run(now);
  db.prepare(`
    INSERT INTO notifications (ts, recipient_type, recipient_target, title, message, event_type, link_url, is_read)
    VALUES (?, 'ADMIN_TEAM', 'ALL', 'Price Offer Submitted', 'New negotiation offer of ₹13,80,000 received for Hyundai Creta', 'NEW_OFFER', '/admin/negotiations', 0)
  `).run(now);
  db.prepare(`
    INSERT INTO notifications (ts, recipient_type, recipient_target, title, message, event_type, link_url, is_read)
    VALUES (?, 'CUSTOMER', '9823055667', 'Vendor Counteroffer Received', 'Rajat countered with ₹14,10,000 for Hyundai Creta with 1-Year Warranty', 'COUNTER_OFFER', '/dashboard', 0)
  `).run(now);
}

// Activity Logging Helper
export function logTeamActivity(member_id, member_name, action, target_type, target_id, details) {
  try {
    db.prepare(`
      INSERT INTO team_activities (ts, member_id, member_name, action, target_type, target_id, details)
      VALUES (datetime('now'), ?, ?, ?, ?, ?, ?)
    `).run(member_id || 1, member_name || 'System', action, target_type, String(target_id || ''), details || '');
  } catch (err) {
    console.error('Failed to log team activity:', err);
  }
}

// In-App Notification Helper
export function createNotification(recipient_type, recipient_target, title, message, event_type, link_url = '') {
  try {
    db.prepare(`
      INSERT INTO notifications (ts, recipient_type, recipient_target, title, message, event_type, link_url, is_read)
      VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, 0)
    `).run(recipient_type, String(recipient_target), title, message, event_type, link_url);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

// Customer Analysis & Lead Insights Helper
export function calculateCustomerInsights(leadId) {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId);
  if (!lead) return null;

  const enquiries = db.prepare('SELECT e.*, c.make, c.model, c.year, c.direct, c.price FROM enquiries e LEFT JOIN cars c ON c.id = e.car_id WHERE e.lead_id = ? OR e.customer_phone = ?').all(leadId, lead.phone);
  const negotiations = db.prepare('SELECT n.*, c.make, c.model, c.year, c.direct, c.price FROM negotiations n LEFT JOIN cars c ON c.id = n.car_id WHERE n.lead_id = ? OR n.customer_phone = ?').all(leadId, lead.phone);
  const interactions = db.prepare('SELECT * FROM lead_interactions WHERE lead_id = ? ORDER BY id DESC').all(leadId);

  const vehicleMentions = [];
  if (lead.car_id) {
    const primaryCar = db.prepare('SELECT make, model, year, direct, price FROM cars WHERE id = ?').get(lead.car_id);
    if (primaryCar) vehicleMentions.push(primaryCar);
  }
  enquiries.forEach((e) => { if (e.make) vehicleMentions.push(e); });
  negotiations.forEach((n) => { if (n.make) vehicleMentions.push(n); });

  const makes = [...new Set(vehicleMentions.map((v) => v.make).filter(Boolean))];
  const preferredVehicles = vehicleMentions.map((v) => `${v.year || ''} ${v.make} ${v.model}`.trim()).filter((v, i, a) => a.indexOf(v) === i);

  let budgetRange = lead.budget || '';
  if (!budgetRange && vehicleMentions.length > 0) {
    const prices = vehicleMentions.map((v) => v.direct || v.price).filter(Boolean);
    if (prices.length > 0) {
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      budgetRange = minP === maxP ? `Approx. ₹${(minP / 100000).toFixed(2)} Lakh` : `₹${(minP / 100000).toFixed(2)} - ${(maxP / 100000).toFixed(2)} Lakh`;
    }
  }

  let score = 50;
  score += enquiries.length * 10;
  score += negotiations.length * 15;
  score += interactions.length * 5;
  if (lead.status === 'TEST_DRIVE_SCHEDULED') score += 15;
  if (lead.status === 'NEGOTIATION') score += 20;
  if (lead.status === 'DEAL_CLOSED') score += 30;
  if (lead.status === 'OPTED_OUT' || lead.status === 'LOST') score = Math.min(score, 20);
  score = Math.min(Math.max(score, 10), 100);

  let probability = 'MEDIUM';
  let probabilityColor = '#f59e0b';
  if (score >= 80 || lead.status === 'NEGOTIATION' || (lead.status === 'TEST_DRIVE_SCHEDULED' && negotiations.length > 0)) {
    probability = 'HOT 🔥';
    probabilityColor = '#ef4444';
  } else if (score >= 65) {
    probability = 'HIGH';
    probabilityColor = '#22c55e';
  } else if (score < 40 || lead.status === 'OPTED_OUT' || lead.status === 'LOST') {
    probability = 'LOW';
    probabilityColor = '#64748b';
  }

  return {
    lead,
    enquiries,
    negotiations,
    interactions,
    preferredMakes: makes,
    preferredVehicles,
    budgetRange: budgetRange || '₹8 - 18 Lakh (Mid-Premium)',
    engagementScore: score,
    conversionProbability: probability,
    probabilityColor,
    totalEnquiries: enquiries.length,
    totalNegotiations: negotiations.length,
    totalInteractions: interactions.length,
  };
}

// Cryptographic Helpers & Rate Limiting
export const signToken = (payload) =>
  createHmac('sha256', ENV.SECRET).update(String(payload)).digest('hex');

export function createUnlockCookie(phone) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7-day session
  const data = `${phone}.${exp}`;
  return `${data}.${signToken(data)}`;
}

export function verifyUnlockCookie(cookieVal) {
  if (!cookieVal) return null;
  const parts = String(cookieVal).split('.');
  if (parts.length !== 3) return null;
  const [phone, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return null;
  const expected = signToken(`${phone}.${expStr}`);
  if (sig.length !== expected.length) return null;
  const valid = timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  return valid ? phone : null;
}

export function createAdminCookie(userOrUsername) {
  const exp = Date.now() + 24 * 60 * 60 * 1000;
  let tokenData = '';
  if (typeof userOrUsername === 'object' && userOrUsername !== null) {
    tokenData = `${userOrUsername.username}__${userOrUsername.role || 'ADMIN'}__${userOrUsername.id || 1}`;
  } else {
    tokenData = `${userOrUsername || 'admin'}__ADMIN__1`;
  }
  const data = `${tokenData}.${exp}`;
  return `${data}.${signToken(data)}`;
}

export function verifyAdminCookie(cookieVal) {
  if (!cookieVal) return false;
  const parts = String(cookieVal).split('.');
  if (parts.length !== 3) return false;
  const [userToken, expStr, sig] = parts;
  const exp = Number(expStr);
  if (!exp || Date.now() > exp) return false;
  const expected = signToken(`${userToken}.${expStr}`);
  if (sig.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;

  const segs = userToken.split('__');
  const username = segs[0];
  const role = segs[1] || 'ADMIN';
  const id = Number(segs[2]) || 1;

  // Verify against team_members table for active status
  try {
    const member = db.prepare('SELECT * FROM team_members WHERE LOWER(username) = LOWER(?)').get(username);
    if (member) {
      if (member.status === 'INACTIVE') return false;
      return {
        id: member.id,
        username: member.username,
        role: member.role,
        name: member.name,
        email: member.email,
        phone: member.phone,
        responsibilities: member.responsibilities
      };
    }
  } catch {}

  // Fallback for primary master admin
  if (username.toLowerCase() === ENV.ADMIN_USER.toLowerCase()) {
    return {
      id: 1,
      username: ENV.ADMIN_USER,
      role: 'ADMIN',
      name: 'Rajat Sharma (Principal)',
      email: 'rajat@carsbyrajat.in',
      phone: '9823011223',
      responsibilities: 'Overall Showroom & Strategic Inventory Operations'
    };
  }

  return { id, username, role, name: username };
}

// Salted Admin & Team Member Password Verification + Rate Limiter
const ADMIN_SALT = randomBytes(16).toString('hex');
const ADMIN_HASH = scryptSync(ENV.ADMIN_PASS, ADMIN_SALT, 64);
const loginAttempts = new Map();

export function checkAdminLogin(ip, username, password) {
  const now = Date.now();
  const rec = loginAttempts.get(ip) || { count: 0, resetAt: now + 15 * 60 * 1000 };
  if (now > rec.resetAt) {
    rec.count = 0;
    rec.resetAt = now + 15 * 60 * 1000;
  }
  if (rec.count >= 15) {
    return { ok: false, error: 'Too many login attempts. Please wait 15 minutes.' };
  }

  const cleanUser = String(username || '').trim().toLowerCase();
  const cleanPass = String(password || '');

  // 1. Check Master Admin Credentials
  const isMasterUser = cleanUser === ENV.ADMIN_USER.toLowerCase();
  const inputHash = scryptSync(cleanPass, ADMIN_SALT, 64);
  const isMasterPass = timingSafeEqual(inputHash, ADMIN_HASH);

  if (isMasterUser && isMasterPass) {
    loginAttempts.delete(ip);
    const adminUser = {
      id: 1,
      username: ENV.ADMIN_USER,
      role: 'ADMIN',
      name: 'Rajat Sharma (Principal)',
      email: 'rajat@carsbyrajat.in',
      phone: '9823011223',
      responsibilities: 'Overall Showroom & Strategic Inventory Operations'
    };
    logTeamActivity(1, adminUser.name, 'LOGIN', 'SYSTEM', '1', 'Master admin signed in');
    return { ok: true, user: adminUser };
  }

  // 2. Check Team Members Table
  try {
    const member = db.prepare('SELECT * FROM team_members WHERE LOWER(username) = LOWER(?)').get(cleanUser);
    if (member) {
      if (member.status === 'INACTIVE') {
        return { ok: false, error: 'This team account is deactivated. Contact dealership admin.' };
      }
      if (verifyPassword(cleanPass, member.password_salt, member.password_hash)) {
        loginAttempts.delete(ip);
        db.prepare("UPDATE team_members SET last_login = datetime('now') WHERE id = ?").run(member.id);
        const userObj = {
          id: member.id,
          username: member.username,
          role: member.role,
          name: member.name,
          email: member.email,
          phone: member.phone,
          responsibilities: member.responsibilities
        };
        logTeamActivity(member.id, member.name, 'LOGIN', 'SYSTEM', String(member.id), `Team member logged in (${member.role})`);
        return { ok: true, user: userObj };
      }
    }
  } catch (err) {
    console.error('Error during team login check:', err);
  }

  rec.count += 1;
  loginAttempts.set(ip, rec);
  return { ok: false, error: 'Invalid username or password. Default is admin / admin123 or team login.' };
}
