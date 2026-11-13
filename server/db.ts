import { DatabaseSync } from 'node:sqlite';
import { createHmac, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { ENV, DEFAULT_SETTINGS } from './config.js';
import type { Car, Lead, TeamMember, TeamActivity, LeadInteraction, Enquiry, Negotiation, Notification, ShowroomSettings, CustomerInsights } from './types.js';

export const db = new DatabaseSync(ENV.DB_PATH);

// Configure SQLite Pragmas for High Concurrency & Lock Resilience
try {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec('PRAGMA synchronous = NORMAL;');
} catch (pragmaErr) {
  console.warn('SQLite PRAGMA setup notice:', pragmaErr);
}

// Initialize Database Tables
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

// Safe Migrations for Extended Columns
const safeMigrations = [
  "ALTER TABLE leads ADD COLUMN email TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN followup_date TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN assigned_to TEXT DEFAULT 'Rajat (Showroom)'",
  "ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'DIGITAL_SHOWROOM'",
  "ALTER TABLE leads ADD COLUMN budget TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN exchange TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN location TEXT DEFAULT 'Nagpur'",
  "ALTER TABLE leads ADD COLUMN requirements TEXT DEFAULT ''",
  "ALTER TABLE leads ADD COLUMN assigned_member_id INTEGER DEFAULT 1",
  "ALTER TABLE leads ADD COLUMN verification_status TEXT DEFAULT 'VERIFIED'",
  "ALTER TABLE leads ADD COLUMN engagement_score INTEGER DEFAULT 65",
  "ALTER TABLE cars ADD COLUMN dealer_source TEXT DEFAULT 'CBR Own Stock'",
  "ALTER TABLE cars ADD COLUMN dealer_contact TEXT DEFAULT ''",
  "ALTER TABLE cars ADD COLUMN dealer_cost INTEGER DEFAULT 0",
  "ALTER TABLE cars ADD COLUMN verification_status TEXT DEFAULT 'VERIFIED'",
  "ALTER TABLE cars ADD COLUMN verified_by TEXT DEFAULT 'Rajat Sharma (Admin)'",
  "ALTER TABLE cars ADD COLUMN verified_at TEXT DEFAULT ''",
  "ALTER TABLE cars ADD COLUMN verification_notes TEXT DEFAULT 'Showroom vehicle inspection, RTO transfer clearance and insurance verified'",
  "ALTER TABLE cars ADD COLUMN rc_verified INTEGER DEFAULT 1",
  "ALTER TABLE cars ADD COLUMN insurance_verified INTEGER DEFAULT 1",
  "ALTER TABLE cars ADD COLUMN puc_verified INTEGER DEFAULT 1",
  "ALTER TABLE cars ADD COLUMN inspection_verified INTEGER DEFAULT 1",
  "ALTER TABLE cars ADD COLUMN description TEXT DEFAULT ''",
  "ALTER TABLE cars ADD COLUMN location TEXT DEFAULT 'Nagpur (Wardha Road Hub)'",
  "ALTER TABLE cars ADD COLUMN contact_number TEXT DEFAULT '+91 98230 11223'",
];

for (const sql of safeMigrations) {
  try {
    db.exec(sql);
  } catch {
    // Ignore already added columns
  }
}

// Initialize Default Settings if Missing
for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
  db.prepare('INSERT OR IGNORE INTO settings (k, v) VALUES (?, ?)').run(k, v);
}

export function getSettings(): ShowroomSettings {
  const rows = db.prepare('SELECT k, v FROM settings').all() as unknown as { k: string; v: string }[];
  return { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.k, r.v])) };
}

export const slugify = (s: string | number): string =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Intelligent Anti-Fake Indian Mobile Validator (Zero-Cost Telemetry Filter)
export function isValidIndianMobile(phone: string | number | undefined): { ok: boolean; phone?: string; error?: string } {
  const p = String(phone || '').replace(/[^0-9]/g, '').slice(-10);
  if (!/^[6-9][0-9]{9}$/.test(p)) {
    return { ok: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' };
  }
  if (p.split('').every((c) => c === p[0])) {
    return { ok: false, error: 'Please enter your actual personal contact number.' };
  }
  const fakeSequences = ['9876543210', '8765432109', '0123456789', '1234567890', '9012345678', '8901234567'];
  if (fakeSequences.includes(p)) {
    return { ok: false, error: 'Please enter your actual personal contact number.' };
  }
  const uniqueDigits = new Set(p.split('')).size;
  if (uniqueDigits < 4) {
    return { ok: false, error: 'Please enter a genuine mobile number so our showroom manager can confirm availability.' };
  }
  return { ok: true, phone: p };
}

// Password Hashing & Verification (scrypt)
export function hashPassword(password: string, salt: string | null = null): { salt: string; hash: string } {
  const s = salt || randomBytes(16).toString('hex');
  const h = scryptSync(String(password || ''), s, 64).toString('hex');
  return { salt: s, hash: h };
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  const testHash = scryptSync(String(password || ''), salt, 64).toString('hex');
  if (testHash.length !== hash.length) return false;
  return timingSafeEqual(Buffer.from(testHash), Buffer.from(hash));
}

// Session Tokens & Cryptographic Verification
export const signToken = (payload: string): string =>
  createHmac('sha256', ENV.SECRET).update(String(payload)).digest('hex');

export function createUnlockCookie(phone: string): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7-day session
  const data = `${phone}.${exp}`;
  return `${data}.${signToken(data)}`;
}

export function verifyUnlockCookie(cookieVal: string | undefined): string | null {
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

export function createAdminCookie(userOrUsername: TeamMember | string): string {
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

export function verifyAdminCookie(cookieVal: string | undefined): TeamMember | false {
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
  const role = (segs[1] || 'ADMIN') as TeamMember['role'];
  const id = Number(segs[2]) || 1;

  try {
    const member = db.prepare('SELECT * FROM team_members WHERE LOWER(username) = LOWER(?)').get(username) as unknown as TeamMember | undefined;
    if (member) {
      if (member.status === 'INACTIVE') return false;
      return {
        id: member.id,
        username: member.username,
        role: member.role,
        name: member.name,
        email: member.email,
        phone: member.phone,
        responsibilities: member.responsibilities,
        status: member.status,
      };
    }
  } catch {}

  if (username.toLowerCase() === ENV.ADMIN_USER.toLowerCase()) {
    return {
      id: 1,
      username: ENV.ADMIN_USER,
      role: 'ADMIN',
      name: 'Rajat Sharma (Principal)',
      email: 'rajat@carsbyrajat.in',
      phone: '9823011223',
      responsibilities: 'Overall Showroom & Strategic Inventory Operations',
      status: 'ACTIVE',
    };
  }

  return { id, username, role, name: username, status: 'ACTIVE' };
}

// Salted Admin & Team Member Password Verification + Rate Limiter
const ADMIN_SALT = randomBytes(16).toString('hex');
const ADMIN_HASH = scryptSync(ENV.ADMIN_PASS, ADMIN_SALT, 64);
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkAdminLogin(ip: string, username?: string, password?: string): { ok: boolean; user?: TeamMember; error?: string } {
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
    const adminUser: TeamMember = {
      id: 1,
      username: ENV.ADMIN_USER,
      role: 'ADMIN',
      name: 'Rajat Sharma (Principal)',
      email: 'rajat@carsbyrajat.in',
      phone: '9823011223',
      responsibilities: 'Overall Showroom & Strategic Inventory Operations',
      status: 'ACTIVE',
    };
    logTeamActivity(1, adminUser.name, 'LOGIN', 'SYSTEM', '1', 'Master admin signed in');
    return { ok: true, user: adminUser };
  }

  // 2. Check Team Members Table
  try {
    const member = db.prepare('SELECT * FROM team_members WHERE LOWER(username) = LOWER(?)').get(cleanUser) as unknown as (TeamMember & { password_salt: string; password_hash: string }) | undefined;
    if (member) {
      if (member.status === 'INACTIVE') {
        return { ok: false, error: 'This team account is deactivated. Contact dealership admin.' };
      }
      if (verifyPassword(cleanPass, member.password_salt, member.password_hash)) {
        loginAttempts.delete(ip);
        db.prepare("UPDATE team_members SET last_login = datetime('now') WHERE id = ?").run(member.id);
        const userObj: TeamMember = {
          id: member.id,
          username: member.username,
          role: member.role,
          name: member.name,
          email: member.email,
          phone: member.phone,
          responsibilities: member.responsibilities,
          status: member.status,
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

// Activity Logging & Notifications
export function logTeamActivity(
  member_id: number,
  member_name: string,
  action: string,
  target_type: string,
  target_id: string | number,
  details: string
): void {
  try {
    db.prepare(`
      INSERT INTO team_activities (ts, member_id, member_name, action, target_type, target_id, details)
      VALUES (datetime('now'), ?, ?, ?, ?, ?, ?)
    `).run(member_id || 1, member_name || 'System', action, target_type, String(target_id || ''), details || '');
  } catch (err) {
    console.error('Failed to log team activity:', err);
  }
}

export function createNotification(
  recipient_type: 'CUSTOMER' | 'ADMIN_TEAM',
  recipient_target: string,
  title: string,
  message: string,
  event_type: string,
  link_url = ''
): void {
  try {
    db.prepare(`
      INSERT INTO notifications (ts, recipient_type, recipient_target, title, message, event_type, link_url, is_read)
      VALUES (datetime('now'), ?, ?, ?, ?, ?, ?, 0)
    `).run(recipient_type, String(recipient_target), title, message, event_type, link_url);
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}

// Customer Analysis & Lead Insights Calculator
export function calculateCustomerInsights(leadId: number): CustomerInsights | null {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(leadId) as unknown as Lead | undefined;
  if (!lead) return null;

  const enquiries = db.prepare(`
    SELECT e.*, c.make, c.model, c.year, c.direct, c.price 
    FROM enquiries e 
    LEFT JOIN cars c ON c.id = e.car_id 
    WHERE e.lead_id = ? OR e.customer_phone = ?
  `).all(leadId, lead.phone) as unknown as Enquiry[];

  const negotiations = db.prepare(`
    SELECT n.*, c.make, c.model, c.year, c.direct, c.price 
    FROM negotiations n 
    LEFT JOIN cars c ON c.id = n.car_id 
    WHERE n.lead_id = ? OR n.customer_phone = ?
  `).all(leadId, lead.phone) as unknown as Negotiation[];

  const interactions = db.prepare(`
    SELECT * FROM lead_interactions WHERE lead_id = ? ORDER BY id DESC
  `).all(leadId) as unknown as LeadInteraction[];

  const vehicleMentions: Array<{ make: string; model: string; year?: number; direct?: number; price?: number }> = [];
  if (lead.car_id) {
    const primaryCar = db.prepare('SELECT make, model, year, direct, price FROM cars WHERE id = ?').get(lead.car_id) as any;
    if (primaryCar) vehicleMentions.push(primaryCar);
  }
  enquiries.forEach((e) => { if (e.make && e.model) vehicleMentions.push({ make: e.make, model: e.model, year: e.year, direct: e.direct, price: e.price }); });
  negotiations.forEach((n) => { if (n.make && n.model) vehicleMentions.push({ make: n.make, model: n.model, year: n.year, direct: n.listed_price, price: n.listed_price }); });

  const makes = [...new Set(vehicleMentions.map((v) => v.make).filter(Boolean))];
  const preferredVehicles = vehicleMentions
    .map((v) => `${v.year || ''} ${v.make} ${v.model}`.trim())
    .filter((v, i, a) => a.indexOf(v) === i);

  let budgetRange = lead.budget || '';
  if (!budgetRange && vehicleMentions.length > 0) {
    const prices = vehicleMentions.map((v) => v.direct || v.price || 0).filter((p) => p > 0);
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

  let probability: CustomerInsights['conversionProbability'] = 'MEDIUM';
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

// DPDP Auto-purge Leads older than 90 days (Unless DEAL_CLOSED)
export function purgeExpiredLeads(): void {
  try {
    const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare("DELETE FROM leads WHERE ts < ? AND status != 'DEAL_CLOSED'").run(cutoff);
  } catch (err) {
    console.warn('DPDP purgeExpiredLeads skipped due to busy lock:', err);
  }
}
purgeExpiredLeads();
setInterval(purgeExpiredLeads, 12 * 60 * 60 * 1000).unref();
