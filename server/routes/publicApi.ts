import { Router, Request, Response } from 'express';
import {
  db,
  getSettings,
  isValidIndianMobile,
  createUnlockCookie,
  verifyUnlockCookie,
  verifyAdminCookie,
  createNotification,
  logTeamActivity,
} from '../db.js';
import type { Car, Enquiry, Negotiation } from '../types.js';

export const publicApi = Router();

// GET /api/settings - Public Showroom Settings
publicApi.get('/settings', (_req: Request, res: Response) => {
  return res.json({ ok: true, settings: getSettings() });
});

// GET /api/cars - Full or Filtered Vehicle Inventory
publicApi.get('/cars', (req: Request, res: Response) => {
  try {
    const { fuel, tr, minPrice, maxPrice, q, sort } = req.query;
    let sql = "SELECT * FROM cars WHERE status != 'SOLD'";
    const params: (string | number)[] = [];

    if (fuel && typeof fuel === 'string' && fuel !== 'all') {
      sql += " AND LOWER(fuel) = LOWER(?)";
      params.push(fuel);
    }
    if (tr && typeof tr === 'string' && tr !== 'all') {
      sql += " AND LOWER(tr) = LOWER(?)";
      params.push(tr);
    }
    if (minPrice && !isNaN(Number(minPrice))) {
      sql += " AND price >= ?";
      params.push(Number(minPrice));
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      sql += " AND price <= ?";
      params.push(Number(maxPrice));
    }

    if (sort === 'price_asc') {
      sql += " ORDER BY price ASC";
    } else if (sort === 'price_desc') {
      sql += " ORDER BY price DESC";
    } else if (sort === 'km_asc') {
      sql += " ORDER BY km ASC";
    } else {
      sql += " ORDER BY year DESC, id DESC";
    }

    let cars = db.prepare(sql).all(...params) as unknown as Car[];

    if (q && typeof q === 'string') {
      const query = q.toLowerCase().trim();
      cars = cars.filter((c) =>
        `${c.year} ${c.make} ${c.model} ${c.feat || ''} ${c.rto} ${c.fuel} ${c.tr}`.toLowerCase().includes(query)
      );
    }

    const cookiePhone = verifyUnlockCookie(req.cookies.cbr_unlock);
    const unlocked = Boolean(cookiePhone);

    return res.json({
      ok: true,
      cars,
      unlocked,
      userPhone: cookiePhone,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/cars/:slug - Single Vehicle Dossier
publicApi.get('/cars/:slug', (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const car = db.prepare('SELECT * FROM cars WHERE slug = ?').get(slug) as unknown as Car | undefined;
    if (!car) {
      return res.status(404).json({ ok: false, error: 'Vehicle not found' });
    }

    const cookiePhone = verifyUnlockCookie(req.cookies.cbr_unlock);
    const unlocked = Boolean(cookiePhone);

    let customerNegotiation: Negotiation | null = null;
    if (cookiePhone) {
      customerNegotiation = (db.prepare(
        'SELECT * FROM negotiations WHERE car_id = ? AND customer_phone = ? ORDER BY id DESC'
      ).get(car.id, cookiePhone) as unknown as Negotiation) || null;
      if (customerNegotiation) {
        customerNegotiation.messages = db.prepare(
          'SELECT * FROM negotiation_messages WHERE negotiation_id = ? ORDER BY id ASC'
        ).all(customerNegotiation.id) as any[];
      }
    }

    return res.json({
      ok: true,
      car,
      unlocked,
      userPhone: cookiePhone,
      negotiation: customerNegotiation,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/unlock - Unlock Direct Pricing & Vehicle Dossier
publicApi.post('/unlock', (req: Request, res: Response) => {
  try {
    const { phone, name, email, car_id, trail } = req.body;
    const val = isValidIndianMobile(phone);
    if (!val.ok || String(req.body.consent) !== '1') {
      return res.status(400).json({
        ok: false,
        error: val.error || 'Valid 10-digit Indian mobile number and DPDP consent are required.',
      });
    }

    const cleanPhone = val.phone!;
    const cleanName = String(name || '').trim().slice(0, 60) || '-';
    const cleanEmail = String(email || '').trim().toLowerCase().slice(0, 90);
    const carId = Number(car_id) || null;
    const trailFromClient = String(trail || '').slice(0, 500);

    const car = carId ? (db.prepare('SELECT * FROM cars WHERE id = ?').get(carId) as unknown as Car) : null;
    const actionNote = car ? `Unlocked dossier & price for ${car.year} ${car.make} ${car.model}` : 'Unlocked Showroom Catalog';
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(cleanPhone) as any;
    if (existing) {
      const mergedTrail = [existing.trail, trailFromClient, actionNote].filter(Boolean).join(' → ').slice(-650);
      const newStatus = existing.status === 'OPTED_OUT' ? 'NEW' : existing.status;
      db.prepare(`
        UPDATE leads 
        SET ts = ?, name = COALESCE(NULLIF(?, '-'), name), email = COALESCE(NULLIF(?, ''), email),
            car_id = COALESCE(?, car_id), status = ?, trail = ?, consent = 1, consent_ts = ? 
        WHERE id = ?
      `).run(now, cleanName, cleanEmail, carId, newStatus, mergedTrail, now, existing.id);
    } else {
      const fullTrail = [trailFromClient, actionNote].filter(Boolean).join(' → ');
      db.prepare(`
        INSERT INTO leads (ts, phone, name, email, car_id, status, note, trail, consent, consent_ts) 
        VALUES (?, ?, ?, ?, ?, 'NEW', '', ?, 1, ?)
      `).run(now, cleanPhone, cleanName, cleanEmail, carId, fullTrail, now);
    }

    const token = createUnlockCookie(cleanPhone);
    res.cookie('cbr_unlock', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      phone: cleanPhone,
      name: cleanName,
      email: cleanEmail,
      message: 'Direct showroom price unlocked successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/testdrive - Book Showroom Test Drive
publicApi.post('/testdrive', (req: Request, res: Response) => {
  try {
    const { phone, name, car_id, date, slot, consent } = req.body;
    const val = isValidIndianMobile(phone);
    if (!val.ok || String(consent) !== '1') {
      return res.status(400).json({ ok: false, error: val.error || 'Valid mobile number and DPDP consent required.' });
    }

    const cleanPhone = val.phone!;
    const cleanName = String(name || '').trim().slice(0, 60) || '-';
    const carId = Number(car_id) || null;
    const car = carId ? (db.prepare('SELECT * FROM cars WHERE id = ?').get(carId) as unknown as Car) : null;
    const tdStep = `Booked Test Drive (${date || 'Upcoming'} ${slot || ''})${car ? ` for ${car.year} ${car.make} ${car.model}` : ''}`;
    const now = new Date().toISOString();

    const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(cleanPhone) as any;
    if (existing) {
      const mergedTrail = [existing.trail, tdStep].filter(Boolean).join(' → ').slice(-650);
      db.prepare(`
        UPDATE leads 
        SET ts = ?, name = COALESCE(NULLIF(?, '-'), name), car_id = COALESCE(?, car_id), 
            status = 'TEST_DRIVE_SCHEDULED', note = ?, trail = ?, consent = 1, consent_ts = ? 
        WHERE id = ?
      `).run(now, cleanName, carId, `Test drive: ${date} (${slot})`, mergedTrail, now, existing.id);
    } else {
      db.prepare(`
        INSERT INTO leads (ts, phone, name, car_id, status, note, trail, consent, consent_ts) 
        VALUES (?, ?, ?, ?, 'TEST_DRIVE_SCHEDULED', ?, ?, 1, ?)
      `).run(now, cleanPhone, cleanName, carId, `Test drive: ${date} (${slot})`, tdStep, now);
    }

    createNotification(
      'ADMIN_TEAM',
      'ALL',
      'Test Drive Booked',
      `${cleanName} (+91 ${cleanPhone}) scheduled test drive for ${car ? `${car.year} ${car.make} ${car.model}` : 'Vehicle'} on ${date} (${slot}).`,
      'TEST_DRIVE',
      '/admin'
    );

    const token = createUnlockCookie(cleanPhone);
    res.cookie('cbr_unlock', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      message: 'Test drive booked successfully! Showroom team will prepare the vehicle.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/enquiry - Public Vehicle Enquiry
publicApi.post('/enquiry', (req: Request, res: Response) => {
  try {
    const { phone, name, email, car_id, message, source } = req.body;
    const val = isValidIndianMobile(phone);
    if (!val.ok) {
      return res.status(400).json({ ok: false, error: val.error });
    }

    const cleanPhone = val.phone!;
    const cleanName = String(name || '').trim().slice(0, 60) || 'Interested Buyer';
    const cleanEmail = String(email || '').trim().toLowerCase().slice(0, 90);
    const carId = Number(car_id) || null;
    const cleanMessage = String(message || '').trim().slice(0, 1000);
    const cleanSource = source || 'CAR_DETAIL_PAGE';
    const now = new Date().toISOString();

    const car = carId ? (db.prepare('SELECT * FROM cars WHERE id = ?').get(carId) as unknown as Car) : null;
    const carTitle = car ? `${car.year} ${car.make} ${car.model}` : 'Showroom Inventory';

    let leadId: number | null = null;
    const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(cleanPhone) as any;
    if (existing) {
      leadId = existing.id;
      const newTrail = [existing.trail, `Enquired about ${carTitle}`].filter(Boolean).join(' → ').slice(-650);
      db.prepare(`
        UPDATE leads 
        SET ts = ?, name = COALESCE(NULLIF(?, '-'), name), email = COALESCE(NULLIF(?, ''), email), 
            car_id = COALESCE(?, car_id), trail = ? 
        WHERE id = ?
      `).run(now, cleanName, cleanEmail, carId, newTrail, existing.id);
    } else {
      const insLead = db.prepare(`
        INSERT INTO leads (ts, phone, name, email, car_id, status, note, trail, consent, consent_ts, source)
        VALUES (?, ?, ?, ?, ?, 'NEW', ?, ?, 1, ?, ?)
      `).run(now, cleanPhone, cleanName, cleanEmail, carId, cleanMessage, `Enquired about ${carTitle}`, now, cleanSource);
      leadId = Number(insLead.lastInsertRowid);
    }

    const insEnq = db.prepare(`
      INSERT INTO enquiries (ts, lead_id, car_id, customer_name, customer_phone, customer_email, message, status, assigned_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 'Rajat (Showroom)')
    `).run(now, leadId, carId, cleanName, cleanPhone, cleanEmail, cleanMessage);
    const enquiryId = Number(insEnq.lastInsertRowid);

    db.prepare(`
      INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, created_by)
      VALUES (?, ?, 'ENQUIRY', ?, ?, '', 'Online Showroom Portal')
    `).run(leadId, now, `Submitted enquiry for ${carTitle}`, cleanMessage);

    createNotification(
      'ADMIN_TEAM',
      'ALL',
      `New Car Enquiry (#${enquiryId})`,
      `${cleanName} (+91 ${cleanPhone}) enquired about ${carTitle}: "${cleanMessage.slice(0, 80)}"`,
      'NEW_ENQUIRY',
      '/admin/enquiries'
    );

    logTeamActivity(1, 'Website Visitor', 'ENQUIRY_SUBMIT', 'ENQUIRY', enquiryId, `${cleanName} enquired about ${carTitle}`);

    const token = createUnlockCookie(cleanPhone);
    res.cookie('cbr_unlock', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      enquiry_id: enquiryId,
      message: 'Your enquiry has been received. Our sales team will get in touch shortly.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/negotiate - Submit Price Counteroffer
publicApi.post('/negotiate', (req: Request, res: Response) => {
  try {
    const { phone, customer_phone, car_id, listed_price, offer_price, offer_amount, name, customer_name, notes, message } = req.body;
    const rawPhone = phone || customer_phone;
    const val = isValidIndianMobile(rawPhone);
    if (!val.ok) {
      return res.status(400).json({ ok: false, error: val.error });
    }

    const carId = Number(car_id);
    const listedPrice = Number(listed_price);
    const offerPrice = Number(offer_price || offer_amount);
    const cleanName = String(name || customer_name || '').trim().slice(0, 60) || 'Buyer';
    const cleanNotes = String(notes || message || '').trim().slice(0, 500);
    const cleanPhone = val.phone!;

    if (!carId || !offerPrice || offerPrice <= 10000) {
      return res.status(400).json({ ok: false, error: 'Please enter a realistic target purchase offer.' });
    }

    const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(carId) as Car | undefined;
    if (!car) return res.status(404).json({ ok: false, error: 'Vehicle not found.' });

    const now = new Date().toISOString();

    let leadId: number | null = null;
    const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(cleanPhone) as any;
    if (existing) {
      leadId = existing.id;
      db.prepare(`
        UPDATE leads 
        SET ts = ?, status = 'NEGOTIATION', name = COALESCE(NULLIF(?, '-'), name) 
        WHERE id = ?
      `).run(now, cleanName, existing.id);
    } else {
      const insL = db.prepare(`
        INSERT INTO leads (ts, phone, name, car_id, status, note, trail, consent, consent_ts, source)
        VALUES (?, ?, ?, ?, 'NEGOTIATION', ?, ?, 1, ?, 'PRICE_NEGOTIATION')
      `).run(
        now,
        cleanPhone,
        cleanName,
        carId,
        `Price offer: ₹${offerPrice.toLocaleString('en-IN')}`,
        `Submitted price offer for ${car.year} ${car.make} ${car.model}`,
        now
      );
      leadId = Number(insL.lastInsertRowid);
    }

    let negId: number | null = null;
    const existingNeg = db.prepare(
      "SELECT * FROM negotiations WHERE car_id = ? AND customer_phone = ? AND status != 'REJECTED'"
    ).get(carId, cleanPhone) as any;

    if (existingNeg) {
      negId = existingNeg.id;
      db.prepare(`
        UPDATE negotiations 
        SET current_customer_offer = ?, status = 'CUSTOMER_COUNTERED', updated_at = ? 
        WHERE id = ?
      `).run(offerPrice, now, negId);
    } else {
      const insNeg = db.prepare(`
        INSERT INTO negotiations (car_id, customer_phone, customer_name, lead_id, listed_price, current_customer_offer, status, assigned_to, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'Rajat (Showroom)', ?, ?)
      `).run(carId, cleanPhone, cleanName, leadId, listedPrice || car.direct || car.price, offerPrice, now, now);
      negId = Number(insNeg.lastInsertRowid);
    }

    db.prepare(`
      INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
      VALUES (?, 'CUSTOMER', ?, ?, ?, 'SUBMITTED', ?)
    `).run(negId, cleanName, offerPrice, cleanNotes, now);

    db.prepare(`
      INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, created_by)
      VALUES (?, ?, 'OFFER', ?, ?, '', 'Price Negotiation Desk')
    `).run(leadId, now, `Offered ₹${offerPrice.toLocaleString('en-IN')} on ${car.year} ${car.make} ${car.model}`, cleanNotes || 'Offer submitted online');

    createNotification(
      'ADMIN_TEAM',
      'ALL',
      `New Price Offer: ₹${offerPrice.toLocaleString('en-IN')}`,
      `${cleanName} proposed ₹${offerPrice.toLocaleString('en-IN')} on ${car.year} ${car.make} ${car.model} (Listed: ₹${(car.direct || car.price).toLocaleString('en-IN')})`,
      'NEW_OFFER',
      '/admin/negotiations'
    );

    logTeamActivity(1, 'Customer', 'NEGOTIATION_OFFER', 'NEGOTIATION', String(negId), `${cleanName} offered ₹${offerPrice.toLocaleString('en-IN')} on ${car.make} ${car.model}`);

    const token = createUnlockCookie(cleanPhone);
    res.cookie('cbr_unlock', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      negotiation_id: negId,
      message: 'Offer submitted to showroom desk for review.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/negotiate/accept - Customer Accepts Vendor Counteroffer
publicApi.post('/negotiate/accept', (req: Request, res: Response) => {
  try {
    const { negotiation_id } = req.body;
    const negId = Number(negotiation_id);
    const neg = db.prepare(`
      SELECT n.*, c.make, c.model, c.year 
      FROM negotiations n 
      LEFT JOIN cars c ON c.id = n.car_id 
      WHERE n.id = ?
    `).get(negId) as any;

    if (!neg) return res.status(404).json({ ok: false, error: 'Negotiation not found' });

    const now = new Date().toISOString();
    db.prepare("UPDATE negotiations SET status = 'ACCEPTED', updated_at = ? WHERE id = ?").run(now, negId);
    db.prepare(`
      INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
      VALUES (?, 'CUSTOMER', ?, ?, 'Customer agreed and accepted vendor price deal.', 'ACCEPTED', ?)
    `).run(negId, neg.customer_name, neg.current_vendor_offer || neg.current_customer_offer, now);

    if (neg.lead_id) {
      db.prepare("UPDATE leads SET status = 'DEAL_CLOSED' WHERE id = ?").run(neg.lead_id);
      db.prepare(`
        INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, created_by)
        VALUES (?, ?, 'OFFER', 'Deal Won / Offer Accepted', 'Customer accepted deal terms', 'Offer locked. Paperwork to be initiated.', 'Customer')
      `).run(neg.lead_id, now);
    }

    createNotification(
      'ADMIN_TEAM',
      'ALL',
      `Deal Won! (${neg.customer_name})`,
      `${neg.customer_name} accepted the counteroffer of ₹${Number(neg.current_vendor_offer).toLocaleString('en-IN')} for ${neg.year} ${neg.make} ${neg.model}!`,
      'DEAL_AGREED',
      '/admin/negotiations'
    );

    logTeamActivity(1, neg.customer_name, 'DEAL_ACCEPTED', 'NEGOTIATION', String(negId), `Deal closed at ₹${Number(neg.current_vendor_offer).toLocaleString('en-IN')} for ${neg.make} ${neg.model}`);

    return res.json({
      ok: true,
      message: 'Deal Agreed! Our showroom desk has been alerted and will contact you for paperwork.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/negotiate/counter - Customer Submits Counter-Response
publicApi.post('/negotiate/counter', (req: Request, res: Response) => {
  try {
    const { negotiation_id, counter_price, notes } = req.body;
    const negId = Number(negotiation_id);
    const counterPrice = Number(counter_price);
    const cleanNotes = String(notes || '').trim();

    const neg = db.prepare(`
      SELECT n.*, c.make, c.model, c.year 
      FROM negotiations n 
      LEFT JOIN cars c ON c.id = n.car_id 
      WHERE n.id = ?
    `).get(negId) as any;

    if (!neg || !counterPrice) {
      return res.status(400).json({ ok: false, error: 'Invalid counteroffer amount.' });
    }

    const now = new Date().toISOString();
    db.prepare(`
      UPDATE negotiations 
      SET current_customer_offer = ?, status = 'CUSTOMER_COUNTERED', updated_at = ? 
      WHERE id = ?
    `).run(counterPrice, now, negId);

    db.prepare(`
      INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
      VALUES (?, 'CUSTOMER', ?, ?, ?, 'COUNTERED', ?)
    `).run(negId, neg.customer_name, counterPrice, cleanNotes, now);

    createNotification(
      'ADMIN_TEAM',
      'ALL',
      `Buyer Counteroffer: ₹${counterPrice.toLocaleString('en-IN')}`,
      `${neg.customer_name} submitted counteroffer of ₹${counterPrice.toLocaleString('en-IN')} for ${neg.year} ${neg.make} ${neg.model}`,
      'COUNTER_OFFER',
      '/admin/negotiations'
    );

    return res.json({
      ok: true,
      message: 'Counteroffer submitted for showroom vendor review.',
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/customer/dashboard - Fetch Buyer Hub Data
publicApi.get('/customer/dashboard', (req: Request, res: Response) => {
  try {
    const userPhone = verifyUnlockCookie(req.cookies.cbr_unlock);
    if (!userPhone) {
      return res.json({
        ok: true,
        authenticated: false,
        customer: null,
        enquiries: [],
        negotiations: [],
        notifications: [],
      });
    }

    const customer = db.prepare('SELECT * FROM leads WHERE phone = ?').get(userPhone);
    const enquiries = db.prepare(`
      SELECT e.*, c.year, c.make, c.model, c.photos, c.slug, c.direct, c.price 
      FROM enquiries e 
      LEFT JOIN cars c ON c.id = e.car_id 
      WHERE e.customer_phone = ? 
      ORDER BY e.id DESC
    `).all(userPhone);

    const negotiations = db.prepare(`
      SELECT n.*, c.year, c.make, c.model, c.photos, c.slug 
      FROM negotiations n 
      LEFT JOIN cars c ON c.id = n.car_id 
      WHERE n.customer_phone = ? 
      ORDER BY n.id DESC
    `).all(userPhone) as any[];

    for (const neg of negotiations) {
      neg.messages = db.prepare('SELECT * FROM negotiation_messages WHERE negotiation_id = ? ORDER BY id ASC').all(neg.id);
    }

    const notifications = db.prepare(`
      SELECT * FROM notifications 
      WHERE (recipient_type = 'CUSTOMER' AND recipient_target = ?) 
      ORDER BY id DESC LIMIT 30
    `).all(userPhone);

    return res.json({
      ok: true,
      authenticated: true,
      userPhone,
      customer,
      enquiries,
      negotiations,
      notifications,
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/notifications/mark-read - Mark Customer Notifications as Read
publicApi.post('/notifications/mark-read', (req: Request, res: Response) => {
  try {
    const userPhone = verifyUnlockCookie(req.cookies.cbr_unlock);
    const target = req.body.target || userPhone || '';
    if (target) {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE recipient_target = ?').run(target);
    }
    return res.json({ ok: true, message: 'Notifications marked as read' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/stop - DPDP Instant Opt-out STOP
publicApi.post('/stop', (req: Request, res: Response) => {
  try {
    const rawPhone = String(req.body.phone || '').replace(/\D/g, '').slice(-10);
    if (/^[6-9]\d{9}$/.test(rawPhone)) {
      db.prepare(`
        UPDATE leads 
        SET status = 'OPTED_OUT', name = '[REDACTED]', note = 'DPDP Opt-Out Exercised', trail = '' 
        WHERE phone = ?
      `).run(rawPhone);
    }
    res.clearCookie('cbr_unlock', { path: '/' });
    return res.json({ ok: true, status: 'OPTED_OUT', message: 'Your personal phone number has been unsubscribed and redacted.' });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/chat - Virtual Auto Advisor AI Chatbot
publicApi.post('/chat', (req: Request, res: Response) => {
  try {
    const rawMsg = String(req.body.message || '').trim().toLowerCase();
    const allCars = db.prepare("SELECT * FROM cars WHERE status != 'SOLD' ORDER BY year DESC").all() as unknown as Car[];
    const s = getSettings();
    let reply = '';
    let showSalesPrompt = false;

    const wantsHuman = /human|talk|call|speak|agent|rep|executive|contact|person|manager|phone|sales desk|rajat/.test(rawMsg);
    if (wantsHuman) {
      reply = `Namaste! You can reach our Wardha Road showroom team directly at <strong><a href="tel:${s.phone}" class="text-primary font-bold">${s.phone}</a></strong> or on <a href="https://wa.me/${s.whatsapp}" target="_blank" class="text-primary font-bold">WhatsApp (+91 ${s.whatsapp})</a>. You can also submit an enquiry on any car page for an instant callback from Rajat!`;
      return res.json({ ok: true, reply, showSalesPrompt: true });
    }

    const wantsUnder5 = /under 5|under 5l|5 lakh|< 5|below 5/.test(rawMsg);
    const wantsUnder10 = /under 10|under 10l|10 lakh|< 10|below 10/.test(rawMsg);
    const wantsUnder20 = /under 20|under 20l|20 lakh|< 20|below 20/.test(rawMsg);
    const wantsAutomatic = /automatic|auto|dct|cvt|amt|dsg|steptronic/.test(rawMsg);
    const wantsManual = /manual|stick|gear/.test(rawMsg) && !wantsAutomatic;
    const wantsDiesel = /diesel/.test(rawMsg);
    const wantsPetrol = /petrol/.test(rawMsg);
    const wantsEv = /electric|ev|battery/.test(rawMsg);
    const wantsCng = /cng/.test(rawMsg);
    const wantsLocation = /where|location|address|hub|directions|wardha|map|reach/.test(rawMsg);
    const wantsTiming = /timing|hours|open|close|sunday|time/.test(rawMsg);
    const wantsFinance = /finance|loan|emi|rate|interest|down payment|bank|hdfc|sbi/.test(rawMsg);
    const wantsInspection = /inspection|point|certified|quality|accidental|flood|warranty|guarantee/.test(rawMsg);

    if (wantsLocation || wantsTiming) {
      reply = `📍 <strong>${s.name} Showroom &amp; Fleet Hub:</strong><br>${s.address}<br><br>🕒 <strong>Hours:</strong> 10:00 AM – 8:30 PM (Open all 7 days, including Sundays). Test drives and physical yard inspections are welcomed without prior booking!`;
    } else if (wantsFinance) {
      reply = `🏦 <strong>Financing &amp; EMI Assistance:</strong><br>We offer priority pre-approved used car loans starting at <strong>8.65% p.a.</strong> through our in-house tie-ups with HDFC, ICICI, and SBI. 15-minute digital sanction with zero foreclosure charges. You can calculate custom EMIs on any vehicle dossier page!`;
      showSalesPrompt = true;
    } else if (wantsInspection) {
      reply = `🛡️ <strong>Showroom Physical Inspection &amp; Vehicle Diagnostics:</strong><br>Every car at Cars By Rajat is physically inspected at our showroom covering engine compression, gearbox, clutch, chassis frame integrity, electricals, and RTO paperwork verification. Complete service history records and physical yard inspections are available for every vehicle.`;
    } else {
      let matched = allCars;
      if (wantsUnder5) matched = matched.filter((c) => c.price <= 550000);
      else if (wantsUnder10) matched = matched.filter((c) => c.price <= 1050000);
      else if (wantsUnder20) matched = matched.filter((c) => c.price <= 2050000);

      if (wantsAutomatic) matched = matched.filter((c) => c.tr.toLowerCase() === 'automatic');
      if (wantsManual) matched = matched.filter((c) => c.tr.toLowerCase() === 'manual');
      if (wantsDiesel) matched = matched.filter((c) => c.fuel.toLowerCase() === 'diesel');
      if (wantsPetrol) matched = matched.filter((c) => c.fuel.toLowerCase() === 'petrol');
      if (wantsEv) matched = matched.filter((c) => c.fuel.toLowerCase() === 'electric');
      if (wantsCng) matched = matched.filter((c) => c.fuel.toLowerCase() === 'cng');

      const words = rawMsg.split(/\s+/);
      const modelMatch = allCars.filter((c) =>
        words.some((w) => w.length > 2 && (c.make.toLowerCase().includes(w) || c.model.toLowerCase().includes(w)))
      );
      if (modelMatch.length > 0) matched = modelMatch;

      if (matched.length > 0) {
        const sample = matched.slice(0, 3);
        reply =
          `Here are <strong>${matched.length} verified vehicle${matched.length > 1 ? 's' : ''}</strong> currently available at our Nagpur showroom:<br><br>` +
          sample
            .map(
              (c) =>
                `• <strong><a href="/cars/${c.slug}" class="text-primary underline">${c.year} ${c.make} ${c.model}</a></strong> — ₹${(c.price / 100000).toFixed(2)} Lakh · ${c.km.toLocaleString('en-IN')} km · ${c.fuel} · ${c.tr} (${c.rto})`
            )
            .join('<br>') +
          `<br><br>Would you like to schedule a test drive or speak with Rajat?`;
        showSalesPrompt = true;
      } else {
        reply = `We currently have <strong>${allCars.length} handpicked certified luxury &amp; fleet cars</strong> in Nagpur (MH-31/40), ranging from fuel-efficient hatchbacks to luxury German sedans (Creta, Seltos, BMW 320d, XUV700, City ZX, Innova Crysta, etc.). What budget or body type are you looking for?`;
        showSalesPrompt = true;
      }
    }

    return res.json({ ok: true, reply, showSalesPrompt });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});
