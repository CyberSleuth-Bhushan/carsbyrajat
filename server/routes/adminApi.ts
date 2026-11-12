import { Router, Request, Response, NextFunction } from 'express';
import {
  db,
  getSettings,
  createAdminCookie,
  verifyAdminCookie,
  checkAdminLogin,
  logTeamActivity,
  createNotification,
  calculateCustomerInsights,
  hashPassword,
  slugify,
} from '../db.js';
import type { Car, Lead, TeamMember, Enquiry, Negotiation } from '../types.js';

export const adminApi = Router();

// Middleware: Authenticate Admin & Staff Session
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const staff = verifyAdminCookie(req.cookies.cbr_admin);
  if (!staff) {
    return res.status(401).json({ ok: false, error: 'Unauthorized. Staff login required.' });
  }
  (req as any).user = staff;
  next();
}

// POST /api/admin/auth/login
adminApi.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || 'local';
    const auth = checkAdminLogin(ip, username, password);

    if (!auth.ok || !auth.user) {
      return res.status(401).json({ ok: false, error: auth.error });
    }

    const token = createAdminCookie(auth.user);
    res.cookie('cbr_admin', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      user: auth.user,
      message: 'Signed in to Dealership Command Deck.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/auth/logout
adminApi.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie('cbr_admin', { path: '/' });
  return res.json({ ok: true, message: 'Logged out successfully.' });
});

// GET /api/admin/auth/me - Current Staff Session
adminApi.get('/auth/me', (req: Request, res: Response) => {
  const staff = verifyAdminCookie(req.cookies.cbr_admin);
  if (!staff) {
    return res.json({ ok: true, authenticated: false, user: null });
  }
  return res.json({ ok: true, authenticated: true, user: staff });
});

// Protected routes below
adminApi.use(requireAdminAuth);

// GET /api/admin/dashboard-stats - KPI Overview
adminApi.get('/dashboard-stats', (_req: Request, res: Response) => {
  try {
    const totalLeads = (db.prepare('SELECT COUNT(*) AS n FROM leads').get() as any).n;
    const newLeads = (db.prepare("SELECT COUNT(*) AS n FROM leads WHERE status = 'NEW'").get() as any).n;
    const activeTestDrives = (db.prepare("SELECT COUNT(*) AS n FROM leads WHERE status = 'TEST_DRIVE_SCHEDULED'").get() as any).n;
    const activeNegotiations = (db.prepare("SELECT COUNT(*) AS n FROM negotiations WHERE status IN ('PENDING', 'VENDOR_COUNTERED', 'CUSTOMER_COUNTERED')").get() as any).n;
    const closedDeals = (db.prepare("SELECT COUNT(*) AS n FROM leads WHERE status = 'DEAL_CLOSED'").get() as any).n;
    const totalFleet = (db.prepare("SELECT COUNT(*) AS n FROM cars WHERE status = 'AVAILABLE'").get() as any).n;
    const pendingEnquiries = (db.prepare("SELECT COUNT(*) AS n FROM enquiries WHERE status = 'PENDING'").get() as any).n;

    return res.json({
      ok: true,
      stats: {
        totalLeads,
        newLeads,
        activeTestDrives,
        activeNegotiations,
        closedDeals,
        totalFleet,
        pendingEnquiries,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/leads - Pipeline CRM List
adminApi.get('/leads', (req: Request, res: Response) => {
  try {
    const { status, q } = req.query;
    let sql = `
      SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost 
      FROM leads l 
      LEFT JOIN cars c ON c.id = l.car_id
    `;
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (status && typeof status === 'string' && status !== 'ALL') {
      conditions.push('l.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY l.id DESC';

    let leads = db.prepare(sql).all(...params) as unknown as Lead[];

    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      leads = leads.filter((l) =>
        `${l.name} ${l.phone} ${l.email || ''} ${l.make || ''} ${l.model || ''} ${l.location || ''} ${l.assigned_to || ''}`
          .toLowerCase()
          .includes(query)
      );
    }

    return res.json({ ok: true, leads });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/leads/:id - Single Lead Dossier with Customer Insights
adminApi.get('/leads/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const lead = db.prepare(`
      SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost 
      FROM leads l 
      LEFT JOIN cars c ON c.id = l.car_id 
      WHERE l.id = ?
    `).get(id) as Lead | undefined;

    if (!lead) return res.status(404).json({ ok: false, error: 'Lead not found' });

    const insights = calculateCustomerInsights(id);
    const interactions = db.prepare('SELECT * FROM lead_interactions WHERE lead_id = ? ORDER BY id DESC').all(id);

    return res.json({
      ok: true,
      lead,
      insights,
      interactions,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/leads - Manual Walk-in / Call Lead Creation
adminApi.post('/leads', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { phone, name, email, car_id, status, note, followup_date, assigned_to, source, budget, exchange, location, requirements } = req.body;
    const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
    const cleanName = String(name || '').trim().slice(0, 60) || 'Walk-in Guest';
    const carId = Number(car_id) || null;
    const now = new Date().toISOString();
    const cleanSource = source || 'SHOWROOM_WALK_IN';
    const cleanLocation = String(location || 'Nagpur').trim();
    const cleanReq = String(requirements || '').trim();
    const trail = `${cleanSource === 'SHOWROOM_WALK_IN' ? 'Showroom Walk-in' : 'Phone Inquiry'} logged by ${assigned_to || user.name}`;

    const ins = db.prepare(`
      INSERT INTO leads (ts, phone, name, email, car_id, status, note, trail, consent, consent_ts, followup_date, assigned_to, source, budget, exchange, location, requirements)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      now,
      cleanPhone,
      cleanName,
      email || '',
      carId,
      status || 'NEW',
      note || '',
      trail,
      now,
      followup_date || '',
      assigned_to || user.name || 'Rajat (Showroom)',
      cleanSource,
      budget || '',
      exchange || '',
      cleanLocation,
      cleanReq
    );

    logTeamActivity(user.id, user.name, 'LEAD_CREATE', 'LEAD', cleanPhone, `Created lead for ${cleanName} (${cleanPhone})`);

    return res.json({
      ok: true,
      lead_id: Number(ins.lastInsertRowid),
      message: 'New lead added to sales pipeline.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/admin/leads/:id - Update Lead Status, Follow-up, Notes
adminApi.put('/leads/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, note, followup_date, assigned_to, verification_status } = req.body;
    const user = (req as any).user;

    db.prepare(`
      UPDATE leads 
      SET status = COALESCE(?, status), 
          note = COALESCE(?, note), 
          followup_date = COALESCE(?, followup_date), 
          assigned_to = COALESCE(?, assigned_to),
          verification_status = COALESCE(?, verification_status)
      WHERE id = ?
    `).run(status, note, followup_date, assigned_to, verification_status, id);

    logTeamActivity(user.id, user.name, 'LEAD_UPDATE', 'LEAD', String(id), `Updated lead #${id} to status ${status}`);

    return res.json({ ok: true, message: 'Lead updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/leads/:id/interaction - Record Follow-up Call, Discussion or Meeting
adminApi.post('/leads/:id/interaction', (req: Request, res: Response) => {
  try {
    const leadId = Number(req.params.id);
    const { type, outcome, customer_response, decision_notes, next_followup_date } = req.body;
    const user = (req as any).user;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, next_followup_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      leadId,
      now,
      type || 'CALL',
      outcome || '',
      customer_response || '',
      decision_notes || '',
      next_followup_date || '',
      user.name || 'Staff'
    );

    if (next_followup_date) {
      db.prepare('UPDATE leads SET followup_date = ? WHERE id = ?').run(next_followup_date, leadId);
    }

    logTeamActivity(user.id, user.name, 'LEAD_INTERACTION', 'LEAD', String(leadId), `Logged ${type}: ${outcome}`);

    return res.json({ ok: true, message: 'Interaction and follow-up recorded.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/enquiries - Customer Enquiries Deck
adminApi.get('/enquiries', (_req: Request, res: Response) => {
  try {
    const enquiries = db.prepare(`
      SELECT e.*, c.year, c.make, c.model, c.slug, c.direct, c.price, c.photos 
      FROM enquiries e 
      LEFT JOIN cars c ON c.id = e.car_id 
      ORDER BY e.id DESC
    `).all() as unknown as Enquiry[];

    return res.json({ ok: true, enquiries });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/enquiries/:id/respond - Respond to Enquiry
adminApi.post('/enquiries/:id/respond', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, assigned_to, response_notes } = req.body;
    const user = (req as any).user;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE enquiries 
      SET status = ?, assigned_to = ?, response_notes = ?, responded_at = ? 
      WHERE id = ?
    `).run(status || 'RESPONDED', assigned_to || user.name, response_notes || '', now, id);

    const enq = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id) as Enquiry | undefined;
    if (enq && enq.customer_phone) {
      createNotification(
        'CUSTOMER',
        enq.customer_phone,
        'Response to Your Car Enquiry',
        response_notes || `Your enquiry #${id} status is now ${status}. Contact our showroom for booking.`,
        'ENQUIRY_UPDATE',
        '/dashboard'
      );
    }

    logTeamActivity(user.id, user.name, 'ENQUIRY_RESPOND', 'ENQUIRY', String(id), `Updated enquiry #${id} to ${status}`);

    return res.json({ ok: true, message: 'Enquiry response recorded and customer alerted.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/negotiations - Live Price Negotiations
adminApi.get('/negotiations', (_req: Request, res: Response) => {
  try {
    const negotiations = db.prepare(`
      SELECT n.*, c.year, c.make, c.model, c.slug, c.photos 
      FROM negotiations n 
      LEFT JOIN cars c ON c.id = n.car_id 
      ORDER BY n.id DESC
    `).all() as unknown as Negotiation[];

    for (const neg of negotiations) {
      neg.messages = db.prepare('SELECT * FROM negotiation_messages WHERE negotiation_id = ? ORDER BY id ASC').all(neg.id) as any[];
    }

    return res.json({ ok: true, negotiations });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/negotiations/:id/respond - Deal Decision (Accept, Counter, Reject)
adminApi.post('/negotiations/:id/respond', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { action, counter_price, notes } = req.body;
    const user = (req as any).user;
    const counterPrice = Number(counter_price || 0);
    const cleanNotes = String(notes || '').trim();

    const neg = db.prepare(`
      SELECT n.*, c.make, c.model, c.year 
      FROM negotiations n 
      LEFT JOIN cars c ON c.id = n.car_id 
      WHERE n.id = ?
    `).get(id) as any;

    if (!neg) return res.status(404).json({ ok: false, error: 'Negotiation not found' });

    const now = new Date().toISOString();
    const repName = user.name || 'Rajat Sharma';

    if (action === 'accept') {
      db.prepare("UPDATE negotiations SET status = 'ACCEPTED', updated_at = ? WHERE id = ?").run(now, id);
      db.prepare(`
        INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
        VALUES (?, 'VENDOR', ?, ?, ?, 'ACCEPTED', ?)
      `).run(id, repName, neg.current_customer_offer, cleanNotes || 'Dealership accepted customer price offer.', now);

      if (neg.lead_id) {
        db.prepare("UPDATE leads SET status = 'DEAL_CLOSED' WHERE id = ?").run(neg.lead_id);
      }

      createNotification(
        'CUSTOMER',
        neg.customer_phone,
        'Offer Accepted! Deal Agreed 🎉',
        `Dealership agreed to your offer of ₹${Number(neg.current_customer_offer).toLocaleString('en-IN')} for ${neg.year} ${neg.make} ${neg.model}. Visit showroom for delivery & paperwork.`,
        'OFFER_ACCEPTED',
        '/dashboard#negotiations'
      );
      logTeamActivity(user.id, repName, 'NEGOTIATION_ACCEPT', 'NEGOTIATION', String(id), `Accepted offer of ₹${Number(neg.current_customer_offer).toLocaleString('en-IN')} on ${neg.make} ${neg.model}`);
    } else if (action === 'counter') {
      db.prepare("UPDATE negotiations SET current_vendor_offer = ?, status = 'VENDOR_COUNTERED', updated_at = ? WHERE id = ?").run(counterPrice, now, id);
      db.prepare(`
        INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
        VALUES (?, 'VENDOR', ?, ?, ?, 'COUNTERED', ?)
      `).run(id, repName, counterPrice, cleanNotes, now);

      createNotification(
        'CUSTOMER',
        neg.customer_phone,
        'Vendor Counteroffer Received 🤝',
        `${repName} countered with ₹${counterPrice.toLocaleString('en-IN')} for ${neg.year} ${neg.make} ${neg.model}: "${cleanNotes}"`,
        'COUNTER_OFFER',
        '/dashboard#negotiations'
      );
      logTeamActivity(user.id, repName, 'NEGOTIATION_COUNTER', 'NEGOTIATION', String(id), `Countered with ₹${counterPrice.toLocaleString('en-IN')} on ${neg.make} ${neg.model}`);
    } else if (action === 'reject') {
      db.prepare("UPDATE negotiations SET status = 'REJECTED', updated_at = ? WHERE id = ?").run(now, id);
      db.prepare(`
        INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
        VALUES (?, 'VENDOR', ?, ?, ?, 'REJECTED', ?)
      `).run(id, repName, neg.current_customer_offer, cleanNotes || 'Offer declined as below procurement floor.', now);

      createNotification(
        'CUSTOMER',
        neg.customer_phone,
        'Price Offer Status Update',
        `Your offer of ₹${Number(neg.current_customer_offer).toLocaleString('en-IN')} for ${neg.year} ${neg.make} ${neg.model} was declined. Explore other certified cars at our showroom.`,
        'OFFER_REJECTED',
        '/dashboard#negotiations'
      );
      logTeamActivity(user.id, repName, 'NEGOTIATION_REJECT', 'NEGOTIATION', String(id), `Rejected offer on ${neg.make} ${neg.model}`);
    }

    return res.json({ ok: true, message: 'Negotiation decision saved and customer alerted.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/inventory - Full Fleet List with Cost & Margins
adminApi.get('/inventory', (_req: Request, res: Response) => {
  try {
    const cars = db.prepare('SELECT * FROM cars ORDER BY id DESC').all() as unknown as Car[];
    return res.json({ ok: true, cars });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/inventory - Onboard New Vehicle or Update Existing
adminApi.post('/inventory', (req: Request, res: Response) => {
  try {
    const b = req.body;
    const id = Number(b.id) || 0;
    const defaultPhoto = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';
    const photos = String(b.photos || '').trim() || defaultPhoto;
    const dealerSource = String(b.dealer_source || 'CBR Own Stock').trim() || 'CBR Own Stock';
    const dealerContact = String(b.dealer_contact || '').trim();
    const dealerCost = Number(b.dealer_cost || 0);
    const user = (req as any).user;

    if (id) {
      db.prepare(`
        UPDATE cars SET
          make = ?, model = ?, year = ?, km = ?, fuel = ?, tr = ?, tr_detail = ?, own = ?, rto = ?, ins = ?,
          feat = ?, price = ?, direct = ?, photos = ?, reel = ?,
          insp_engine = ?, insp_tyres = ?, insp_chassis = ?, insp_elec = ?, keys_count = ?, service_hist = ?,
          dealer_source = ?, dealer_contact = ?, dealer_cost = ?,
          description = ?, location = ?, contact_number = ?
        WHERE id = ?
      `).run(
        b.make, b.model, Number(b.year), Number(b.km), b.fuel, b.tr, b.tr_detail || '', Number(b.own || 1),
        b.rto || 'MH-31', b.ins || '', b.feat || '', Number(b.price), Number(b.direct), photos, b.reel || '',
        b.insp_engine || '', b.insp_tyres || '', b.insp_chassis || '', b.insp_elec || '', b.keys_count || '', b.service_hist || '',
        dealerSource, dealerContact, dealerCost,
        b.description || '', b.location || 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur', b.contact_number || '+91 98230 11223',
        id
      );

      logTeamActivity(user.id, user.name, 'CAR_UPDATE', 'CAR', String(id), `Updated ${b.year} ${b.make} ${b.model}`);
      return res.json({ ok: true, message: 'Vehicle and inspection dossier updated.' });
    } else {
      const slug = `${slugify(`${b.make} ${b.model} ${b.year}`)}-${Date.now().toString(36).slice(-4)}`;
      const ins = db.prepare(`
        INSERT INTO cars (
          slug, make, model, year, km, fuel, tr, tr_detail, own, rto, ins, feat, price, direct, photos, reel,
          insp_engine, insp_tyres, insp_chassis, insp_elec, keys_count, service_hist,
          dealer_source, dealer_contact, dealer_cost,
          description, location, contact_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        slug, b.make, b.model, Number(b.year), Number(b.km), b.fuel, b.tr, b.tr_detail || '', Number(b.own || 1),
        b.rto || 'MH-31', b.ins || '', b.feat || '', Number(b.price), Number(b.direct), photos, b.reel || '',
        b.insp_engine || '', b.insp_tyres || '', b.insp_chassis || '', b.insp_elec || '', b.keys_count || '', b.service_hist || '',
        dealerSource, dealerContact, dealerCost,
        b.description || '', b.location || 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur', b.contact_number || '+91 98230 11223'
      );

      logTeamActivity(user.id, user.name, 'CAR_CREATE', 'CAR', slug, `Published new vehicle: ${b.year} ${b.make} ${b.model}`);
      return res.json({ ok: true, car_id: Number(ins.lastInsertRowid), message: 'New vehicle published to showroom fleet.' });
    }
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/inventory/:id/status - Toggle Vehicle Status
adminApi.post('/inventory/:id/status', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const user = (req as any).user;

    db.prepare('UPDATE cars SET status = ? WHERE id = ?').run(status, id);
    logTeamActivity(user.id, user.name, 'CAR_STATUS', 'CAR', String(id), `Set status to ${status}`);

    return res.json({ ok: true, message: `Vehicle status updated to ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// DELETE /api/admin/inventory/:id - Remove Vehicle
adminApi.delete('/inventory/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = (req as any).user;

    db.prepare('DELETE FROM cars WHERE id = ?').run(id);
    logTeamActivity(user.id, user.name, 'CAR_DELETE', 'CAR', String(id), `Deleted vehicle #${id}`);

    return res.json({ ok: true, message: 'Vehicle removed from fleet.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/team - Team Management & RBAC
adminApi.get('/team', (_req: Request, res: Response) => {
  try {
    const members = db.prepare('SELECT id, username, name, email, phone, role, responsibilities, status, created_at, last_login FROM team_members ORDER BY id ASC').all() as unknown as TeamMember[];
    return res.json({ ok: true, teamMembers: members });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/team - Provision New Staff Member
adminApi.post('/team', (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { username, password, name, role, email, phone, responsibilities } = req.body;
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanPass = String(password || '').trim();
    const cleanName = String(name || '').trim();

    if (!cleanUser || !cleanPass || !cleanName) {
      return res.status(400).json({ ok: false, error: 'Username, password, and full name are required.' });
    }

    const { salt, hash } = hashPassword(cleanPass);
    try {
      db.prepare(`
        INSERT INTO team_members (username, password_hash, password_salt, name, email, phone, role, responsibilities, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
      `).run(cleanUser, hash, salt, cleanName, email || '', phone || '', role || 'SALES_REP', responsibilities || '');
      logTeamActivity(user.id, user.name, 'TEAM_CREATE', 'TEAM_MEMBER', cleanUser, `Provisioned staff account for ${cleanName} (${role})`);
    } catch {
      return res.status(400).json({ ok: false, error: 'Username already exists. Choose a unique handle.' });
    }

    return res.json({ ok: true, message: 'New team member provisioned successfully.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// PUT /api/admin/team/:id - Update Role, Status, Responsibilities
adminApi.put('/team/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { role, status, responsibilities } = req.body;
    const user = (req as any).user;

    db.prepare('UPDATE team_members SET role = ?, status = ?, responsibilities = ? WHERE id = ?').run(
      role,
      status || 'ACTIVE',
      responsibilities || '',
      id
    );

    logTeamActivity(user.id, user.name, 'TEAM_UPDATE', 'TEAM_MEMBER', String(id), `Updated permissions for staff #${id}`);

    return res.json({ ok: true, message: 'Team member updated successfully.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/verification - Vehicle & Customer Verification Center
adminApi.get('/verification', (_req: Request, res: Response) => {
  try {
    const cars = db.prepare('SELECT id, slug, make, model, year, rto, verification_status, verified_by, verified_at, verification_notes, rc_verified, insurance_verified, puc_verified, inspection_verified FROM cars ORDER BY id DESC').all();
    const leads = db.prepare('SELECT id, name, phone, verification_status, ts, source FROM leads ORDER BY id DESC LIMIT 50').all();
    return res.json({ ok: true, cars, leads });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/admin/verification/car/:id - Update Vehicle Verification Status
adminApi.post('/verification/car/:id', (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { verification_status, verification_notes, rc_verified, insurance_verified, puc_verified, inspection_verified } = req.body;
    const user = (req as any).user;

    db.prepare(`
      UPDATE cars 
      SET verification_status = ?, 
          verification_notes = ?, 
          rc_verified = ?, 
          insurance_verified = ?, 
          puc_verified = ?, 
          inspection_verified = ?, 
          verified_by = ?, 
          verified_at = datetime('now') 
      WHERE id = ?
    `).run(
      verification_status || 'VERIFIED',
      verification_notes || '',
      rc_verified ? 1 : 0,
      insurance_verified ? 1 : 0,
      puc_verified ? 1 : 0,
      inspection_verified ? 1 : 0,
      user.name || 'Admin',
      id
    );

    logTeamActivity(user.id, user.name, 'CAR_VERIFY', 'CAR', String(id), `Updated verification audit for car #${id}`);

    return res.json({ ok: true, message: 'Vehicle verification updated.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/admin/activities - Immutable Audit Trail
adminApi.get('/activities', (_req: Request, res: Response) => {
  try {
    const activities = db.prepare('SELECT * FROM team_activities ORDER BY id DESC LIMIT 150').all();
    return res.json({ ok: true, activities });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET & POST /api/admin/settings - Showroom Configuration
adminApi.get('/settings', (_req: Request, res: Response) => {
  return res.json({ ok: true, settings: getSettings() });
});

adminApi.post('/settings', (req: Request, res: Response) => {
  try {
    const b = req.body;
    const up = db.prepare('INSERT OR REPLACE INTO settings (k, v) VALUES (?, ?)');
    for (const k of ['name', 'tagline', 'address', 'phone', 'whatsapp', 'insta', 'followers', 'officer', 'officer_email', 'adsense_id', 'lat', 'lng', 'hours']) {
      if (k in b) up.run(k, String(b[k] || '').trim());
    }
    const user = (req as any).user;
    logTeamActivity(user.id, user.name, 'SETTINGS_UPDATE', 'SETTINGS', '1', 'Updated showroom settings');

    return res.json({ ok: true, settings: getSettings(), message: 'Showroom settings updated.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
