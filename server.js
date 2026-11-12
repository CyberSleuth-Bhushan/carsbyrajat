import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENV,
  db,
  getSettings,
  slugify,
  createUnlockCookie,
  verifyUnlockCookie,
  createAdminCookie,
  verifyAdminCookie,
  checkAdminLogin,
  isValidIndianMobile,
  logTeamActivity,
  createNotification,
  calculateCustomerInsights,
  hashPassword,
} from './db.js';
import {
  esc,
  inr,
  renderListingPage,
  renderDetailPage,
  renderCustomerDashboard,
  renderDynamicGalleryPage,
  renderLegalPage,
  renderOgSvg,
} from './ui.js';
import { renderAdminLogin, renderAdminDashboard } from './admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-Memory Asset Cache for instant static asset delivery
const STATIC_CACHE = new Map();
function serveCachedFile(res, filePath, contentType, maxAge = 604800) {
  if (STATIC_CACHE.has(filePath)) {
    const data = STATIC_CACHE.get(filePath);
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': `public, max-age=${maxAge}` });
    return res.end(data);
  }
  if (existsSync(filePath)) {
    const data = readFileSync(filePath);
    STATIC_CACHE.set(filePath, data);
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': `public, max-age=${maxAge}` });
    return res.end(data);
  }
  res.writeHead(404);
  return res.end();
}

const parseCookies = (req) =>
  Object.fromEntries(
    (req.headers.cookie || '')
      .split(';')
      .filter(Boolean)
      .map((c) => {
        const idx = c.indexOf('=');
        return idx > -1 ? [c.slice(0, idx).trim(), decodeURIComponent(c.slice(idx + 1).trim())] : [c.trim(), ''];
      })
  );

const readBody = (req) =>
  new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 8e6) req.destroy(); // allow up to 8MB for local base64 photo uploads
    });
    req.on('end', () => {
      const ct = req.headers['content-type'] || '';
      if (ct.includes('application/json')) {
        try {
          resolve(JSON.parse(data || '{}'));
        } catch {
          resolve({});
        }
      } else {
        resolve(Object.fromEntries(new URLSearchParams(data)));
      }
    });
  });

const sendHtml = (res, status, html, extraHeaders = {}) => {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', ...extraHeaders });
  res.end(html);
};

const sendJson = (res, status, obj, extraHeaders = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders });
  res.end(JSON.stringify(obj));
};

const redirect = (res, location, cookie) => {
  res.writeHead(303, { Location: location, ...(cookie ? { 'Set-Cookie': cookie } : {}) });
  res.end();
};

const SEO_SEGMENTS = {
  petrol: { col: 'fuel', val: 'Petrol', h1: 'Certified Used Petrol Cars in Nagpur', intro: 'Pre-owned verified Petrol cars & hatchbacks at Cars By Rajat Nagpur (MH-31/40).' },
  diesel: { col: 'fuel', val: 'Diesel', h1: 'Certified Used Diesel Cars & SUVs in Nagpur', intro: 'High-torque, single-owner certified Diesel SUVs and sedans ready for immediate delivery in Nagpur.' },
  electric: { col: 'fuel', val: 'Electric', h1: 'Certified Pre-Owned Electric (EV) Cars in Nagpur', intro: 'Battery-health certified Electric vehicles in Nagpur with warranty and charging kit.' },
  cng: { col: 'fuel', val: 'CNG', h1: 'Used Factory-Fitted CNG Cars in Nagpur', intro: 'High-mileage certified CNG cars in Nagpur with RTO & hydro-test verification.' },
  hybrid: { col: 'fuel', val: 'Hybrid', h1: 'Certified Luxury Hybrid Cars in Nagpur', intro: 'Ultra-refined self-charging Hybrid luxury sedans in Nagpur.' },
  automatic: { col: 'tr', val: 'Automatic', h1: 'Used Automatic Cars in Nagpur (DCT, CVT & Torque Converter)', intro: 'Effortless city driving — explore Nagpur’s largest certified Automatic fleet at Cars By Rajat.' },
  manual: { col: 'tr', val: 'Manual', h1: 'Certified Used Manual Transmission Cars in Nagpur', intro: 'Pure enthusiast & value-packed Manual cars with verified clutch and gearbox health.' },
  'under-5-lakh': { max: 500000, h1: 'Certified Used Cars Under ₹5 Lakh in Nagpur', intro: 'Reliable verified budget cars under ₹5 Lakh in Nagpur with easy EMI.' },
  'under-10-lakh': { max: 1000000, h1: 'Best Used Cars Under ₹10 Lakh in Nagpur', intro: 'Top-variant hatchbacks, compact SUVs, and sedans under ₹10 Lakh at Cars By Rajat Nagpur.' },
  'under-20-lakh': { max: 2000000, h1: 'Certified Used SUVs & Sedans Under ₹20 Lakh in Nagpur', intro: 'Feature-loaded Creta, Seltos, Innova Crysta & City models under ₹20 Lakh in Nagpur.' },
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, ENV.BASE_URL);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    const q = Object.fromEntries(url.searchParams);
    const cookies = parseCookies(req);
    const unlockedPhone = verifyUnlockCookie(cookies.cbr_unlock);
    const unlocked = Boolean(unlockedPhone);
    const isAdmin = verifyAdminCookie(cookies.cbr_admin);
    const s = getSettings();

    // 1. robots.txt
    if (p === '/robots.txt') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${ENV.BASE_URL}/sitemap.xml\n`);
    }

    // PWA Manifest & Service Worker
    if (p === '/manifest.json') {
      return serveCachedFile(res, join(__dirname, 'public', 'manifest.json'), 'application/manifest+json; charset=utf-8', 86400);
    }

    if (p === '/sw.js') {
      return serveCachedFile(res, join(__dirname, 'public', 'sw.js'), 'application/javascript; charset=utf-8', 0);
    }

    if (p.startsWith('/icons/') && p.endsWith('.svg')) {
      const iconName = p.slice(7);
      return serveCachedFile(res, join(__dirname, 'public', 'icons', iconName), 'image/svg+xml; charset=utf-8');
    }

    // Static Brand Assets (Client Logo & Neurojna Badge)
    if (p === '/cbr-client-logo.jpg') {
      return serveCachedFile(res, join(__dirname, 'public', 'cbr-client-logo.jpg'), 'image/jpeg');
    }

    if (p === '/neurojna-logo.png') {
      return serveCachedFile(res, join(__dirname, 'public', 'neurojna-logo.png'), 'image/png');
    }

    // 2. sitemap.xml
    if (p === '/sitemap.xml') {
      const cars = db.prepare("SELECT slug FROM cars WHERE status != 'SOLD'").all();
      const makes = db.prepare('SELECT DISTINCT LOWER(make) AS m FROM cars').all().map((r) => slugify(r.m));
      const urls = [
        '/',
        '/used-cars/nagpur',
        '/privacy-policy',
        '/grievance',
        '/opt-out',
        ...Object.keys(SEO_SEGMENTS).map((k) => `/used-cars/nagpur/${k}`),
        ...makes.map((m) => `/used-cars/nagpur/${m}`),
        ...cars.map((c) => `/cars/${c.slug}`),
      ];
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      return res.end(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls.map((u) => `  <url><loc>${ENV.BASE_URL}${u}</loc><changefreq>daily</changefreq></url>`).join('\n') +
          `\n</urlset>`
      );
    }

    // 3. Dynamic 1200x630 OpenGraph Social Card SVG
    if (p.startsWith('/og/') && p.endsWith('.svg')) {
      const slug = p.slice(4, -4);
      const car = db.prepare('SELECT * FROM cars WHERE slug = ?').get(slug);
      res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' });
      return res.end(renderOgSvg(car, s));
    }

    // 4. Legal & DPDP Pages
    if (p === '/privacy-policy') return sendHtml(res, 200, renderLegalPage({ type: 'privacy', s, isAdmin }));
    if (p === '/grievance') return sendHtml(res, 200, renderLegalPage({ type: 'grievance', s, isAdmin }));
    if (p === '/opt-out') return sendHtml(res, 200, renderLegalPage({ type: 'opt-out', s, msg: q.msg, isAdmin }));

    // 5. API: Telemetry View Ping
    if (p === '/api/view' && req.method === 'POST') {
      return sendJson(res, 200, { ok: true });
    }

    // 6. API: Price & Vehicle Dossier Unlock (Dual Google & Mobile Auth + Heuristic Anti-Fake Filter)
    if (p === '/api/unlock' && req.method === 'POST') {
      const b = await readBody(req);
      const val = isValidIndianMobile(b.phone);
      if (!val.ok || String(b.consent) !== '1') {
        return sendJson(res, 400, { ok: false, error: val.error || 'Valid contact number and DPDP consent required.' });
      }

      const phone = val.phone;
      const name = String(b.name || '').trim().slice(0, 60) || '-';
      const email = String(b.email || '').trim().toLowerCase().slice(0, 90);
      const carId = Number(b.car_id) || null;
      const trailFromClient = String(b.trail || '').slice(0, 500);

      const car = carId ? db.prepare('SELECT * FROM cars WHERE id = ?').get(carId) : null;
      const actionNote = car ? `Unlocked dossier & price for ${car.year} ${car.make} ${car.model}` : 'Unlocked Showroom Catalog';
      const now = new Date().toISOString();

      const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(phone);
      if (existing) {
        const mergedTrail = [existing.trail, trailFromClient, actionNote].filter(Boolean).join(' → ').slice(-650);
        const newStatus = existing.status === 'OPTED_OUT' ? 'NEW' : existing.status;
        db.prepare("UPDATE leads SET ts = ?, name = ?, email = COALESCE(NULLIF(?, ''), email), car_id = COALESCE(?, car_id), status = ?, trail = ?, consent = 1, consent_ts = ? WHERE id = ?").run(
          now,
          name !== '-' ? name : existing.name,
          email,
          carId,
          newStatus,
          mergedTrail,
          now,
          existing.id
        );
      } else {
        const fullTrail = [trailFromClient, actionNote].filter(Boolean).join(' → ');
        db.prepare('INSERT INTO leads (ts, phone, name, email, car_id, status, note, trail, consent, consent_ts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)').run(
          now,
          phone,
          name,
          email,
          carId,
          'NEW',
          '',
          fullTrail,
          now
        );
      }

      const token = createUnlockCookie(phone);
      const cookieHeader = `cbr_unlock=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
      return sendJson(res, 200, { ok: true, phone, name, email }, { 'Set-Cookie': cookieHeader });
    }

    // 7. API: Book Showroom Test Drive (DPDP Consent Required)
    if (p === '/api/testdrive' && req.method === 'POST') {
      const b = await readBody(req);
      const phone = String(b.phone || '').replace(/\D/g, '').slice(-10);
      const name = String(b.name || '').trim().slice(0, 60) || '-';
      const carId = Number(b.car_id) || null;
      if (!/^[6-9]\d{9}$/.test(phone) || String(b.consent) !== '1') {
        return redirect(res, `/cars/${b.slug || ''}?err=consent#testdrive`);
      }
      const car = carId ? db.prepare('SELECT * FROM cars WHERE id = ?').get(carId) : null;
      const tdStep = `Booked Test Drive (${b.date || ''} ${b.slot || ''})${car ? ` for ${car.year} ${car.make} ${car.model}` : ''}`;
      const now = new Date().toISOString();

      const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(phone);
      if (existing) {
        const mergedTrail = [existing.trail, tdStep].filter(Boolean).join(' → ').slice(-650);
        db.prepare("UPDATE leads SET ts = ?, name = ?, car_id = COALESCE(?, car_id), status = 'TEST_DRIVE_SCHEDULED', note = ?, trail = ?, consent = 1, consent_ts = ? WHERE id = ?").run(
          now,
          name !== '-' ? name : existing.name,
          carId,
          `Test drive: ${b.date} (${b.slot})`,
          mergedTrail,
          now,
          existing.id
        );
      } else {
        db.prepare("INSERT INTO leads (ts, phone, name, car_id, status, note, trail, consent, consent_ts) VALUES (?, ?, ?, ?, 'TEST_DRIVE_SCHEDULED', ?, ?, 1, ?)").run(
          now,
          phone,
          name,
          carId,
          `Test drive: ${b.date} (${b.slot})`,
          tdStep,
          now
        );
      }
      const token = createUnlockCookie(phone);
      return redirect(res, `/cars/${b.slug || ''}?msg=td_booked`, `cbr_unlock=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    }

    // 8. API: DPDP Act Instant STOP / Opt-Out (Self-Serve Form OR Authenticated Webhook)
    if (p === '/api/stop' && req.method === 'POST') {
      const b = await readBody(req);
      const phone = String(b.phone || '').replace(/\D/g, '').slice(-10);
      if (/^[6-9]\d{9}$/.test(phone)) {
        db.prepare("UPDATE leads SET status = 'OPTED_OUT', name = '[REDACTED]', note = 'DPDP Opt-Out Exercised', trail = '' WHERE phone = ?").run(phone);
      }
      if ((req.headers['content-type'] || '').includes('application/json')) {
        return sendJson(res, 200, { ok: true, status: 'OPTED_OUT' });
      }
      return redirect(res, '/opt-out?msg=opted_out', 'cbr_unlock=; Path=/; Max-Age=0');
    }

    // 8a. Customer / User Dashboard Route (/dashboard)
    if (p === '/dashboard') {
      if (!unlockedPhone) {
        return sendHtml(res, 200, renderCustomerDashboard({ userPhone: null, s, msg: q.msg || '', isAdmin: Boolean(isAdmin) }));
      }
      const customer = db.prepare('SELECT * FROM leads WHERE phone = ?').get(unlockedPhone);
      const customerEnquiries = db.prepare(`
        SELECT e.*, c.year, c.make, c.model, c.photos, c.slug, c.direct, c.price 
        FROM enquiries e 
        LEFT JOIN cars c ON c.id = e.car_id 
        WHERE e.customer_phone = ? 
        ORDER BY e.id DESC
      `).all(unlockedPhone);

      const customerNegotiations = db.prepare(`
        SELECT n.*, c.year, c.make, c.model, c.photos, c.slug 
        FROM negotiations n 
        LEFT JOIN cars c ON c.id = n.car_id 
        WHERE n.customer_phone = ? 
        ORDER BY n.id DESC
      `).all(unlockedPhone);

      for (const neg of customerNegotiations) {
        neg.messages = db.prepare('SELECT * FROM negotiation_messages WHERE negotiation_id = ? ORDER BY id ASC').all(neg.id);
      }

      const customerNotifications = db.prepare(`
        SELECT * FROM notifications 
        WHERE (recipient_type = 'CUSTOMER' AND recipient_target = ?) 
        ORDER BY id DESC LIMIT 30
      `).all(unlockedPhone);

      return sendHtml(res, 200, renderCustomerDashboard({
        userPhone: unlockedPhone,
        customer,
        enquiries: customerEnquiries,
        negotiations: customerNegotiations,
        notifications: customerNotifications,
        s,
        msg: q.msg || '',
        isAdmin: Boolean(isAdmin),
      }));
    }

    // 8b. Virtual Auto Advisor Chatbot API (Powered by Real Nagpur Inventory & Business Info)
    if (p === '/api/chat' && req.method === 'POST') {
      const b = await readBody(req);
      const rawMsg = String(b.message || '').trim().toLowerCase();
      const allCars = db.prepare("SELECT * FROM cars WHERE status != 'SOLD' ORDER BY year DESC").all();
      let reply = '';
      let showSalesPrompt = false;

      const wantsHuman = /human|talk|call|speak|agent|rep|executive|contact|person|manager|phone|sales desk|rajat/.test(rawMsg);
      if (wantsHuman) {
        reply = `Namaste! You can reach our Wardha Road showroom team directly at <strong><a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></strong> or on <a href="https://wa.me/${esc(s.whatsapp)}" target="_blank" style="color:var(--primary);font-weight:700">WhatsApp (+91 ${esc(s.whatsapp)})</a>. Or click the button below to request an instant callback from Rajat!`;
        return sendJson(res, 200, { ok: true, reply, showSalesPrompt: true });
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
      const wantsInspection = /inspection|140|point|certified|quality|accidental|flood|warranty|guarantee/.test(rawMsg);

      if (wantsLocation || wantsTiming) {
        reply = `📍 <strong>${esc(s.name)} Showroom &amp; Fleet Hub:</strong><br>${esc(s.address)}<br><br>🕒 <strong>Hours:</strong> 10:00 AM – 8:30 PM (Open all 7 days, including Sundays). Test drives and physical yard inspections are welcomed without prior booking!`;
      } else if (wantsFinance) {
        reply = `🏦 <strong>Financing &amp; EMI Assistance:</strong><br>We offer priority pre-approved used car loans starting at <strong>8.65% p.a.</strong> through our in-house tie-ups with HDFC, ICICI, and SBI. 15-minute digital sanction with zero foreclosure charges. You can calculate custom EMIs on any vehicle dossier page!`;
        showSalesPrompt = true;
      } else if (wantsInspection) {
        reply = `🛡️ <strong>Showroom Physical Inspection &amp; Vehicle Diagnostics:</strong><br>Every car at Cars By Rajat is physically inspected at our showroom covering engine compression, gearbox, clutch, chassis frame integrity, electricals, and RTO paperwork verification. Complete service history records and physical yard inspections are available for every vehicle.`;
      } else {
        let matched = allCars;
        if (wantsUnder5) matched = matched.filter(c => c.price <= 550000);
        else if (wantsUnder10) matched = matched.filter(c => c.price <= 1050000);
        else if (wantsUnder20) matched = matched.filter(c => c.price <= 2050000);

        if (wantsAutomatic) matched = matched.filter(c => c.tr.toLowerCase() === 'automatic');
        if (wantsManual) matched = matched.filter(c => c.tr.toLowerCase() === 'manual');
        if (wantsDiesel) matched = matched.filter(c => c.fuel.toLowerCase() === 'diesel');
        if (wantsPetrol) matched = matched.filter(c => c.fuel.toLowerCase() === 'petrol');
        if (wantsEv) matched = matched.filter(c => c.fuel.toLowerCase() === 'electric');
        if (wantsCng) matched = matched.filter(c => c.fuel.toLowerCase() === 'cng');

        const words = rawMsg.split(/\s+/);
        const modelMatch = allCars.filter(c => words.some(w => w.length > 2 && (c.make.toLowerCase().includes(w) || c.model.toLowerCase().includes(w))));
        if (modelMatch.length > 0) matched = modelMatch;

        if (matched.length > 0) {
          const sample = matched.slice(0, 3);
          reply = `Here are <strong>${matched.length} certified vehicle${matched.length > 1 ? 's' : ''}</strong> currently available at our Nagpur showroom:<br><br>` +
            sample.map(c => `• <strong><a href="/cars/${c.slug}" style="color:var(--primary);text-decoration:underline">${c.year} ${c.make} ${c.model}</a></strong> — ₹${(c.price / 100000).toFixed(2)} Lakh · ${c.km.toLocaleString('en-IN')} km · ${c.fuel} · ${c.tr} (${c.rto})`).join('<br>') +
            `<br><br>Would you like to schedule a test drive or speak with Rajat?`;
          showSalesPrompt = true;
        } else {
          reply = `We currently have <strong>${allCars.length} handpicked certified luxury &amp; fleet cars</strong> in Nagpur (MH-31/40), ranging from fuel-efficient hatchbacks to luxury German sedans (Creta, Seltos, BMW 320d, XUV700, City ZX, Innova Crysta, etc.). What budget or body type are you looking for?`;
          showSalesPrompt = true;
        }
      }

      return sendJson(res, 200, { ok: true, reply, showSalesPrompt });
    }

    // 8c. Public API: Direct Car Enquiry (Auto-saves to LMS & Notifies Sales Desk)
    if (p === '/api/enquiry' && req.method === 'POST') {
      const b = await readBody(req);
      const val = isValidIndianMobile(b.phone);
      if (!val.ok) {
        return sendJson(res, 400, { ok: false, error: val.error });
      }
      const phone = val.phone;
      const name = String(b.name || '').trim().slice(0, 60) || 'Interested Buyer';
      const email = String(b.email || '').trim().toLowerCase().slice(0, 90);
      const carId = Number(b.car_id) || null;
      const message = String(b.message || '').trim().slice(0, 1000);
      const source = b.source || 'CAR_DETAIL_PAGE';
      const now = new Date().toISOString();

      const car = carId ? db.prepare('SELECT * FROM cars WHERE id = ?').get(carId) : null;
      const carTitle = car ? `${car.year} ${car.make} ${car.model}` : 'Showroom Inventory';

      let leadId = null;
      const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(phone);
      if (existing) {
        leadId = existing.id;
        const newTrail = [existing.trail, `Enquired about ${carTitle}`].filter(Boolean).join(' → ').slice(-650);
        db.prepare("UPDATE leads SET ts = ?, name = COALESCE(NULLIF(?, '-'), name), email = COALESCE(NULLIF(?, ''), email), car_id = COALESCE(?, car_id), trail = ? WHERE id = ?").run(
          now, name, email, carId, newTrail, existing.id
        );
      } else {
        const insLead = db.prepare(`
          INSERT INTO leads (ts, phone, name, email, car_id, status, note, trail, consent, consent_ts, source)
          VALUES (?, ?, ?, ?, ?, 'NEW', ?, ?, 1, ?, ?)
        `).run(now, phone, name, email, carId, message, `Enquired about ${carTitle}`, now, source);
        leadId = insLead.lastInsertRowid;
      }

      const insEnq = db.prepare(`
        INSERT INTO enquiries (ts, lead_id, car_id, customer_name, customer_phone, customer_email, message, status, assigned_to)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', 'Rajat (Showroom)')
      `).run(now, leadId, carId, name, phone, email, message);
      const enquiryId = insEnq.lastInsertRowid;

      db.prepare(`
        INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, created_by)
        VALUES (?, ?, 'ENQUIRY', ?, ?, '', 'Online Showroom Portal')
      `).run(leadId, now, `Submitted enquiry for ${carTitle}`, message);

      createNotification(
        'ADMIN_TEAM',
        'ALL',
        `New Car Enquiry (#${enquiryId})`,
        `${name} (+91 ${phone}) submitted an enquiry for ${carTitle}: "${message.slice(0, 80)}"`,
        'NEW_ENQUIRY',
        '/admin/enquiries'
      );

      logTeamActivity(1, 'Website Visitor', 'ENQUIRY_SUBMIT', 'ENQUIRY', String(enquiryId), `${name} enquired about ${carTitle}`);

      const token = createUnlockCookie(phone);
      return sendJson(
        res,
        200,
        { ok: true, success: true, id: enquiryId, enquiry_id: enquiryId, message: 'Enquiry submitted successfully' },
        { 'Set-Cookie': `cbr_unlock=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800` }
      );
    }

    // 8d. Public API: Submit Car Price Offer / Negotiation
    if (p === '/api/negotiate' && req.method === 'POST') {
      const b = await readBody(req);
      const val = isValidIndianMobile(b.phone || b.customer_phone);
      if (!val.ok) {
        return sendJson(res, 400, { ok: false, error: val.error });
      }
      const carId = Number(b.car_id);
      const listedPrice = Number(b.listed_price);
      const offerPrice = Number(b.offer_price || b.offer_amount);
      const name = String(b.name || b.customer_name || '').trim().slice(0, 60) || 'Buyer';
      const notes = String(b.notes || b.message || '').trim().slice(0, 500);
      const phone = val.phone;

      if (!carId || !offerPrice || offerPrice <= 10000) {
        return sendJson(res, 400, { ok: false, error: 'Please enter a realistic target purchase offer.' });
      }

      const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(carId);
      if (!car) return sendJson(res, 404, { ok: false, error: 'Vehicle not found.' });

      const now = new Date().toISOString();

      let leadId = null;
      const existing = db.prepare('SELECT * FROM leads WHERE phone = ?').get(phone);
      if (existing) {
        leadId = existing.id;
        db.prepare("UPDATE leads SET ts = ?, status = 'NEGOTIATION', name = COALESCE(NULLIF(?, '-'), name) WHERE id = ?").run(now, name, existing.id);
      } else {
        const insL = db.prepare(`
          INSERT INTO leads (ts, phone, name, car_id, status, note, trail, consent, consent_ts, source)
          VALUES (?, ?, ?, ?, 'NEGOTIATION', ?, ?, 1, ?, 'PRICE_NEGOTIATION')
        `).run(now, phone, name, carId, `Price offer: ${inr(offerPrice)}`, `Submitted price offer for ${car.year} ${car.make} ${car.model}`, now);
        leadId = insL.lastInsertRowid;
      }

      let negId = null;
      const existingNeg = db.prepare("SELECT * FROM negotiations WHERE car_id = ? AND customer_phone = ? AND status != 'REJECTED'").get(carId, phone);
      if (existingNeg) {
        negId = existingNeg.id;
        db.prepare(`
          UPDATE negotiations SET current_customer_offer = ?, status = 'CUSTOMER_COUNTERED', updated_at = ? WHERE id = ?
        `).run(offerPrice, now, negId);
      } else {
        const insNeg = db.prepare(`
          INSERT INTO negotiations (car_id, customer_phone, customer_name, lead_id, listed_price, current_customer_offer, status, assigned_to, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 'Rajat (Showroom)', ?, ?)
        `).run(carId, phone, name, leadId, listedPrice || car.direct || car.price, offerPrice, now, now);
        negId = insNeg.lastInsertRowid;
      }

      db.prepare(`
        INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
        VALUES (?, 'CUSTOMER', ?, ?, ?, 'SUBMITTED', ?)
      `).run(negId, name, offerPrice, notes, now);

      db.prepare(`
        INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, created_by)
        VALUES (?, ?, 'OFFER', ?, ?, '', 'Price Negotiation Desk')
      `).run(leadId, now, `Offered ${inr(offerPrice)} on ${car.year} ${car.make} ${car.model}`, notes || 'Offer submitted online');

      createNotification(
        'ADMIN_TEAM',
        'ALL',
        `New Price Offer: ${inr(offerPrice)}`,
        `${name} proposed ${inr(offerPrice)} on ${car.year} ${car.make} ${car.model} (Listed: ${inr(car.direct || car.price)})`,
        'NEW_OFFER',
        '/admin/negotiations'
      );

      logTeamActivity(1, 'Customer', 'NEGOTIATION_OFFER', 'NEGOTIATION', String(negId), `${name} offered ${inr(offerPrice)} on ${car.make} ${car.model}`);

      const token = createUnlockCookie(phone);
      return sendJson(
        res,
        200,
        { ok: true, success: true, id: negId, negotiation_id: negId, message: 'Offer submitted to showroom desk.' },
        { 'Set-Cookie': `cbr_unlock=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800` }
      );
    }

    // 8e. Customer Accepts Vendor Counteroffer
    if (p === '/api/negotiate/accept' && req.method === 'POST') {
      const b = await readBody(req);
      const negId = Number(b.negotiation_id);
      const neg = db.prepare('SELECT n.*, c.make, c.model, c.year FROM negotiations n LEFT JOIN cars c ON c.id = n.car_id WHERE n.id = ?').get(negId);
      if (!neg) return redirect(res, '/dashboard?err=Negotiation+not+found');

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
        `Deal Won! (${esc(neg.customer_name)})`,
        `${neg.customer_name} accepted the counteroffer of ${inr(neg.current_vendor_offer)} for ${neg.year} ${neg.make} ${neg.model}!`,
        'DEAL_AGREED',
        '/admin/negotiations'
      );

      logTeamActivity(1, neg.customer_name, 'DEAL_ACCEPTED', 'NEGOTIATION', String(negId), `Deal closed at ${inr(neg.current_vendor_offer)} for ${neg.make} ${neg.model}`);

      return redirect(res, '/dashboard?msg=Deal+Agreed!+Our+showroom+desk+has+been+alerted+and+will+contact+you+for+paperwork#negotiations');
    }

    // 8f. Customer Submits Counter-Response
    if (p === '/api/negotiate/counter' && req.method === 'POST') {
      const b = await readBody(req);
      const negId = Number(b.negotiation_id);
      const counterPrice = Number(b.counter_price);
      const notes = String(b.notes || '').trim();
      const neg = db.prepare('SELECT n.*, c.make, c.model, c.year FROM negotiations n LEFT JOIN cars c ON c.id = n.car_id WHERE n.id = ?').get(negId);
      if (!neg || !counterPrice) return redirect(res, '/dashboard?err=Invalid+counteroffer');

      const now = new Date().toISOString();
      db.prepare(`
        UPDATE negotiations SET current_customer_offer = ?, status = 'CUSTOMER_COUNTERED', updated_at = ? WHERE id = ?
      `).run(counterPrice, now, negId);

      db.prepare(`
        INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
        VALUES (?, 'CUSTOMER', ?, ?, ?, 'COUNTERED', ?)
      `).run(negId, neg.customer_name, counterPrice, notes, now);

      createNotification(
        'ADMIN_TEAM',
        'ALL',
        `Buyer Counteroffer: ${inr(counterPrice)}`,
        `${neg.customer_name} submitted counteroffer of ${inr(counterPrice)} for ${neg.year} ${neg.make} ${neg.model}`,
        'COUNTER_OFFER',
        '/admin/negotiations'
      );

      return redirect(res, '/dashboard?msg=Counteroffer+submitted+for+vendor+review#negotiations');
    }

    // 8g. Mark Notifications as Read
    if (p === '/api/notifications/mark-read' && req.method === 'POST') {
      const b = await readBody(req);
      const target = b.target || unlockedPhone || '';
      if (target) {
        db.prepare('UPDATE notifications SET is_read = 1 WHERE recipient_target = ?').run(target);
      }
      return redirect(res, '/dashboard?msg=Notifications+marked+as+read#notifications');
    }

    // 9. Admin Routes
    if (p === '/admin/login') {
      if (req.method === 'POST') {
        const b = await readBody(req);
        const ip = req.socket.remoteAddress || 'local';
        const auth = checkAdminLogin(ip, b.username, b.password);
        if (!auth.ok) {
          return sendHtml(res, 401, renderAdminLogin({ err: auth.error, s }));
        }
        return redirect(res, '/admin', `cbr_admin=${createAdminCookie(b.username)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
      }
      return sendHtml(res, 200, renderAdminLogin({ err: '', s }));
    }

    if (p === '/admin/logout' && req.method === 'POST') {
      return redirect(res, '/', 'cbr_admin=; Path=/; Max-Age=0');
    }

    if (p.startsWith('/admin')) {
      if (!isAdmin) return redirect(res, '/admin/login');

      if (p === '/admin/leads.csv') {
        const rows = db
          .prepare('SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost FROM leads l LEFT JOIN cars c ON c.id = l.car_id ORDER BY l.id DESC')
          .all();
        const csv = [
          'ID,Timestamp,Source,Buyer Name,Mobile,Email,Vehicle,Direct Price,Partner Dealer,Dealer Contact,Dealer Cost,Est Margin,Status,Follow-up Date,Assigned To,Budget,Exchange Car,Sales Note,Browsing Journey',
          ...rows.map((r) =>
            [
              r.id,
              r.ts,
              r.source || 'DIGITAL_SHOWROOM',
              r.name,
              r.phone,
              r.email || '',
              r.make ? `${r.year} ${r.make} ${r.model}` : 'Catalog Unlock',
              r.direct || '',
              r.dealer_source || 'CBR Own Stock',
              r.dealer_contact || '',
              r.dealer_cost || 0,
              r.direct && r.dealer_cost ? (r.direct - r.dealer_cost) : '',
              r.status,
              r.followup_date || '',
              r.assigned_to || 'Rajat (Showroom)',
              r.budget || '',
              r.exchange || '',
              r.note,
              r.trail,
            ]
              .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
              .join(',')
          ),
        ].join('\n');
        res.writeHead(200, {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="carsbyrajat-leads.csv"',
        });
        return res.end(csv);
      }

      if (p === '/admin/leads.xls') {
        const rows = db
          .prepare('SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost FROM leads l LEFT JOIN cars c ON c.id = l.car_id ORDER BY l.id DESC')
          .all();
        const tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1">
          <tr style="background:#1d4ed8;color:#fff;font-weight:bold">
            <th>ID</th><th>Timestamp</th><th>Source</th><th>Name</th><th>Phone (+91)</th><th>Email</th><th>Vehicle</th><th>Direct Price</th><th>Partner Dealer</th><th>Dealer Phone</th><th>Dealer Cost</th><th>Est Margin</th><th>Status</th><th>Next Follow-up</th><th>Assigned Rep</th><th>Budget</th><th>Exchange Car</th><th>Notes</th><th>Browsing Trail</th>
          </tr>
          ${rows
            .map(
              (r) =>
                `<tr>
                  <td>${r.id}</td><td>${esc(r.ts)}</td><td>${esc(r.source || 'DIGITAL_SHOWROOM')}</td><td>${esc(r.name)}</td><td>${esc(r.phone)}</td><td>${esc(r.email || '')}</td><td>${esc(
                  r.make ? `${r.year} ${r.make} ${r.model}` : 'Catalog Unlock'
                )}</td><td>${r.direct || ''}</td><td>${esc(r.dealer_source || 'CBR Own Stock')}</td><td>${esc(r.dealer_contact || '')}</td><td>${r.dealer_cost || 0}</td><td>${r.direct && r.dealer_cost ? (r.direct - r.dealer_cost) : ''}</td><td>${esc(r.status)}</td><td>${esc(r.followup_date || '')}</td><td>${esc(r.assigned_to || 'Rajat (Showroom)')}</td><td>${esc(r.budget || '')}</td><td>${esc(r.exchange || '')}</td><td>${esc(r.note)}</td><td>${esc(r.trail)}</td>
                </tr>`
            )
            .join('')}
        </table></body></html>`;
        res.writeHead(200, {
          'Content-Type': 'application/vnd.ms-excel; charset=utf-8',
          'Content-Disposition': 'attachment; filename="carsbyrajat-leads.xls"',
        });
        return res.end(tableHtml);
      }

      if (p === '/admin/lead/create' && req.method === 'POST') {
        const b = await readBody(req);
        const phone = String(b.phone || '').replace(/\D/g, '').slice(-10);
        const name = String(b.name || '').trim().slice(0, 60) || 'Walk-in Guest';
        const carId = Number(b.car_id) || null;
        const now = new Date().toISOString();
        const source = b.source || 'SHOWROOM_WALK_IN';
        const location = String(b.location || 'Nagpur').trim();
        const requirements = String(b.requirements || '').trim();
        const trail = `${source === 'SHOWROOM_WALK_IN' ? 'Showroom Walk-in' : 'Phone Inquiry'} logged by ${b.assigned_to || 'Rajat'}`;

        db.prepare(`
          INSERT INTO leads (ts, phone, name, email, car_id, status, note, trail, consent, consent_ts, followup_date, assigned_to, source, budget, exchange, location, requirements)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          now, phone, name, b.email || '', carId, b.status || 'NEW', b.note || '', trail, now, b.followup_date || '', b.assigned_to || 'Rajat (Showroom)', source, b.budget || '', b.exchange || '', location, requirements
        );
        logTeamActivity(isAdmin.id || 1, isAdmin.name || 'Admin', 'LEAD_CREATE', 'LEAD', phone, `Added manual lead for ${name} (${phone})`);
        return redirect(res, '/admin?msg=New+lead+added+to+pipeline');
      }

      if (p === '/admin/lead/interaction/create' && req.method === 'POST') {
        const b = await readBody(req);
        const leadId = Number(b.lead_id);
        const type = b.type || 'CALL';
        const outcome = String(b.outcome || '').trim();
        const customerResponse = String(b.customer_response || '').trim();
        const decisionNotes = String(b.decision_notes || '').trim();
        const nextFollowup = String(b.next_followup_date || '').trim();
        const createdBy = b.created_by || isAdmin.name || 'Staff';
        const now = new Date().toISOString();

        db.prepare(`
          INSERT INTO lead_interactions (lead_id, ts, type, outcome, customer_response, decision_notes, next_followup_date, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(leadId, now, type, outcome, customerResponse, decisionNotes, nextFollowup, createdBy);

        if (nextFollowup) {
          db.prepare('UPDATE leads SET followup_date = ? WHERE id = ?').run(nextFollowup, leadId);
        }

        logTeamActivity(isAdmin.id || 1, createdBy, 'LEAD_INTERACTION', 'LEAD', String(leadId), `Logged ${type}: ${outcome}`);
        return redirect(res, `/admin/lead/view?id=${leadId}&msg=Interaction+and+follow-up+schedule+recorded`);
      }

      if (p === '/admin/lead/verify' && req.method === 'POST') {
        const b = await readBody(req);
        const leadId = Number(b.id);
        const vStatus = b.verification_status || 'VERIFIED';
        db.prepare('UPDATE leads SET verification_status = ? WHERE id = ?').run(vStatus, leadId);
        logTeamActivity(isAdmin.id || 1, isAdmin.name || 'Admin', 'LEAD_VERIFY', 'LEAD', String(leadId), `Set customer verification status to ${vStatus}`);
        return redirect(res, `/admin/lead/view?id=${leadId}&msg=Customer+verification+status+updated`);
      }

      if (p === '/admin/enquiry/respond' && req.method === 'POST') {
        const b = await readBody(req);
        const id = Number(b.id);
        const status = b.status || 'RESPONDED';
        const assignedTo = b.assigned_to || 'Rajat (Showroom)';
        const responseNotes = String(b.response_notes || '').trim();
        const now = new Date().toISOString();

        db.prepare(`
          UPDATE enquiries SET status = ?, assigned_to = ?, response_notes = ?, responded_at = ? WHERE id = ?
        `).run(status, assignedTo, responseNotes, now, id);

        const enq = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(id);
        if (enq && enq.customer_phone) {
          createNotification(
            'CUSTOMER',
            enq.customer_phone,
            'Response to Your Car Enquiry',
            responseNotes || `Your enquiry #${id} status is now ${status}. Contact our desk for visit booking.`,
            'ENQUIRY_UPDATE',
            '/dashboard'
          );
        }

        logTeamActivity(isAdmin.id || 1, isAdmin.name || 'Staff', 'ENQUIRY_RESPOND', 'ENQUIRY', String(id), `Updated enquiry #${id} to ${status}: ${responseNotes}`);
        return redirect(res, '/admin/enquiries?msg=Enquiry+response+saved+and+customer+notified');
      }

      if (p === '/admin/negotiation/respond' && req.method === 'POST') {
        const b = await readBody(req);
        const id = Number(b.id);
        const action = b.action; // 'accept', 'counter', 'reject'
        const counterPrice = Number(b.counter_price || 0);
        const notes = String(b.notes || '').trim();
        const neg = db.prepare('SELECT n.*, c.make, c.model, c.year FROM negotiations n LEFT JOIN cars c ON c.id = n.car_id WHERE n.id = ?').get(id);
        if (!neg) return redirect(res, '/admin/negotiations?err=Negotiation+not+found');

        const now = new Date().toISOString();
        const repName = isAdmin.name || 'Rajat Sharma';

        if (action === 'accept') {
          db.prepare("UPDATE negotiations SET status = 'ACCEPTED', updated_at = ? WHERE id = ?").run(now, id);
          db.prepare(`
            INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
            VALUES (?, 'VENDOR', ?, ?, ?, 'ACCEPTED', ?)
          `).run(id, repName, neg.current_customer_offer, notes || 'Dealership accepted customer price offer.', now);

          if (neg.lead_id) {
            db.prepare("UPDATE leads SET status = 'DEAL_CLOSED' WHERE id = ?").run(neg.lead_id);
          }

          createNotification(
            'CUSTOMER',
            neg.customer_phone,
            'Offer Accepted! Deal Agreed 🎉',
            `Dealership agreed to your offer of ${inr(neg.current_customer_offer)} for ${neg.year} ${neg.make} ${neg.model}. Visit showroom for delivery & paperwork.`,
            'OFFER_ACCEPTED',
            '/dashboard#negotiations'
          );
          logTeamActivity(isAdmin.id || 1, repName, 'NEGOTIATION_ACCEPT', 'NEGOTIATION', String(id), `Accepted offer of ${inr(neg.current_customer_offer)} on ${neg.make} ${neg.model}`);
        } else if (action === 'counter') {
          db.prepare("UPDATE negotiations SET current_vendor_offer = ?, status = 'VENDOR_COUNTERED', updated_at = ? WHERE id = ?").run(counterPrice, now, id);
          db.prepare(`
            INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
            VALUES (?, 'VENDOR', ?, ?, ?, 'COUNTERED', ?)
          `).run(id, repName, counterPrice, notes, now);

          createNotification(
            'CUSTOMER',
            neg.customer_phone,
            'Vendor Counteroffer Received 🤝',
            `${repName} countered with ${inr(counterPrice)} for ${neg.year} ${neg.make} ${neg.model}: "${notes}"`,
            'COUNTER_OFFER',
            '/dashboard#negotiations'
          );
          logTeamActivity(isAdmin.id || 1, repName, 'NEGOTIATION_COUNTER', 'NEGOTIATION', String(id), `Countered with ${inr(counterPrice)} on ${neg.make} ${neg.model}`);
        } else if (action === 'reject') {
          db.prepare("UPDATE negotiations SET status = 'REJECTED', updated_at = ? WHERE id = ?").run(now, id);
          db.prepare(`
            INSERT INTO negotiation_messages (negotiation_id, sender_type, sender_name, offered_price, notes, status, created_at)
            VALUES (?, 'VENDOR', ?, ?, ?, 'REJECTED', ?)
          `).run(id, repName, neg.current_customer_offer, notes || 'Offer declined as below dealership procurement floor.', now);

          createNotification(
            'CUSTOMER',
            neg.customer_phone,
            'Price Offer Status Update',
            `Your offer of ${inr(neg.current_customer_offer)} for ${neg.year} ${neg.make} ${neg.model} was declined. Explore other certified cars at our showroom.`,
            'OFFER_REJECTED',
            '/dashboard#negotiations'
          );
          logTeamActivity(isAdmin.id || 1, repName, 'NEGOTIATION_REJECT', 'NEGOTIATION', String(id), `Rejected offer on ${neg.make} ${neg.model}`);
        }

        return redirect(res, '/admin/negotiations?msg=Negotiation+decision+recorded+and+customer+alerted');
      }

      if (p === '/admin/team/create' && req.method === 'POST') {
        const b = await readBody(req);
        const username = String(b.username || '').trim().toLowerCase();
        const password = String(b.password || '').trim();
        const name = String(b.name || '').trim();
        const role = b.role || 'SALES_REP';
        const email = String(b.email || '').trim();
        const phone = String(b.phone || '').trim();
        const resp = String(b.responsibilities || '').trim();

        if (!username || !password || !name) {
          return redirect(res, '/admin/team?err=Username+password+and+name+required');
        }

        const { salt, hash } = hashPassword(password);
        try {
          db.prepare(`
            INSERT INTO team_members (username, password_hash, password_salt, name, email, phone, role, responsibilities, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
          `).run(username, hash, salt, name, email, phone, role, resp);
          logTeamActivity(isAdmin.id || 1, isAdmin.name || 'Admin', 'TEAM_CREATE', 'TEAM_MEMBER', username, `Provisioned new staff account for ${name} (${role})`);
        } catch (err) {
          return redirect(res, '/admin/team?err=Username+already+exists');
        }
        return redirect(res, '/admin/team?msg=New+team+member+provisioned+successfully');
      }

      if (p === '/admin/team/update' && req.method === 'POST') {
        const b = await readBody(req);
        const id = Number(b.id);
        const role = b.role;
        const status = b.status || 'ACTIVE';
        const resp = String(b.responsibilities || '').trim();

        db.prepare('UPDATE team_members SET role = ?, status = ?, responsibilities = ? WHERE id = ?').run(role, status, resp, id);
        logTeamActivity(isAdmin.id || 1, isAdmin.name || 'Admin', 'TEAM_UPDATE', 'TEAM_MEMBER', String(id), `Updated member #${id} to ${role} (${status})`);
        return redirect(res, '/admin/team?msg=Team+member+permissions+updated');
      }

      if (p === '/admin/car/verify' && req.method === 'POST') {
        const b = await readBody(req);
        const id = Number(b.id);
        const status = b.status;
        const notes = String(b.verification_notes || '').trim();
        const verifiedBy = isAdmin.name || 'Rajat Sharma (Admin)';

        if (status) {
          db.prepare("UPDATE cars SET verification_status = ?, verified_by = ?, verified_at = datetime('now') WHERE id = ?").run(status, verifiedBy, id);
        }
        if (notes) {
          db.prepare('UPDATE cars SET verification_notes = ? WHERE id = ?').run(notes, id);
        }
        logTeamActivity(isAdmin.id || 1, verifiedBy, 'CAR_VERIFY', 'CAR', String(id), `Updated vehicle #${id} verification`);
        return redirect(res, '/admin/verification?msg=Vehicle+verification+updated');
      }

      if (p === '/admin/lead' && req.method === 'POST') {
        const b = await readBody(req);
        db.prepare('UPDATE leads SET status = ?, note = ?, followup_date = ?, assigned_to = ? WHERE id = ?').run(
          b.status,
          b.note || '',
          b.followup_date || '',
          b.assigned_to || 'Rajat (Showroom)',
          Number(b.id)
        );
        return redirect(res, '/admin?msg=Lead+pipeline+and+follow-up+updated');
      }

      if (p === '/admin/car/status' && req.method === 'POST') {
        const b = await readBody(req);
        db.prepare('UPDATE cars SET status = ? WHERE id = ?').run(b.status, Number(b.id));
        return redirect(res, '/admin/inventory?msg=Vehicle+status+updated');
      }

      if (p === '/admin/car/delete' && req.method === 'POST') {
        const b = await readBody(req);
        db.prepare('DELETE FROM cars WHERE id = ?').run(Number(b.id));
        return redirect(res, '/admin/inventory?msg=Vehicle+removed+from+fleet');
      }

      if (p === '/admin/car/save' && req.method === 'POST') {
        const b = await readBody(req);
        const id = Number(b.id) || 0;
        const defaultPhoto = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';
        const photos = String(b.photos || '').trim() || defaultPhoto;
        const dealer_source = String(b.dealer_source || 'CBR Own Stock').trim() || 'CBR Own Stock';
        const dealer_contact = String(b.dealer_contact || '').trim();
        const dealer_cost = Number(b.dealer_cost || 0);

        if (id) {
          db.prepare(`
            UPDATE cars SET
              make = ?, model = ?, year = ?, km = ?, fuel = ?, tr = ?, tr_detail = ?, own = ?, rto = ?, ins = ?,
              feat = ?, price = ?, direct = ?, photos = ?, reel = ?,
              insp_engine = ?, insp_tyres = ?, insp_chassis = ?, insp_elec = ?, keys_count = ?, service_hist = ?,
              dealer_source = ?, dealer_contact = ?, dealer_cost = ?
            WHERE id = ?
          `).run(
            b.make, b.model, Number(b.year), Number(b.km), b.fuel, b.tr, b.tr_detail || '', Number(b.own || 1),
            b.rto || 'MH-31', b.ins || '', b.feat || '', Number(b.price), Number(b.direct), photos, b.reel || '',
            b.insp_engine || '', b.insp_tyres || '', b.insp_chassis || '', b.insp_elec || '', b.keys_count || '', b.service_hist || '',
            dealer_source, dealer_contact, dealer_cost,
            id
          );
          return redirect(res, '/admin/inventory?msg=Vehicle+and+inspection+dossier+updated');
        } else {
          const slug = `${slugify(`${b.make} ${b.model} ${b.year}`)}-${Date.now().toString(36).slice(-4)}`;
          db.prepare(`
            INSERT INTO cars (
              slug, make, model, year, km, fuel, tr, tr_detail, own, rto, ins, feat, price, direct, photos, reel,
              insp_engine, insp_tyres, insp_chassis, insp_elec, keys_count, service_hist,
              dealer_source, dealer_contact, dealer_cost
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            slug, b.make, b.model, Number(b.year), Number(b.km), b.fuel, b.tr, b.tr_detail || '', Number(b.own || 1),
            b.rto || 'MH-31', b.ins || '', b.feat || '', Number(b.price), Number(b.direct), photos, b.reel || '',
            b.insp_engine || '', b.insp_tyres || '', b.insp_chassis || '', b.insp_elec || '', b.keys_count || '', b.service_hist || '',
            dealer_source, dealer_contact, dealer_cost
          );
          return redirect(res, '/admin/inventory?msg=New+vehicle+published+to+showroom');
        }
      }

      if (p === '/admin/settings' && req.method === 'POST') {
        const b = await readBody(req);
        const up = db.prepare('INSERT OR REPLACE INTO settings (k, v) VALUES (?, ?)');
        for (const k of ['name', 'tagline', 'address', 'phone', 'whatsapp', 'insta', 'followers', 'officer', 'officer_email', 'adsense_id']) {
          if (k in b) up.run(k, String(b[k] || '').trim());
        }
        return redirect(res, '/admin/settings?msg=Showroom+settings+saved');
      }

      let tab = q.tab || 'leads';
      if (p === '/admin/inventory') tab = 'inventory';
      else if (p === '/admin/settings') tab = 'settings';
      else if (p === '/admin/enquiries') tab = 'enquiries';
      else if (p === '/admin/negotiations') tab = 'negotiations';
      else if (p === '/admin/team') tab = 'team';
      else if (p === '/admin/verification') tab = 'verification';
      else if (p === '/admin/activities') tab = 'activities';
      else if (p === '/admin/lead/view') tab = 'lead-detail';

      let leadDetail = null;
      let leadAnalysis = null;
      let leadInteractions = [];

      if (tab === 'lead-detail' && q.id) {
        leadDetail = db.prepare('SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost FROM leads l LEFT JOIN cars c ON c.id = l.car_id WHERE l.id = ?').get(Number(q.id));
        if (leadDetail) {
          leadAnalysis = calculateCustomerInsights(leadDetail.id);
          leadInteractions = db.prepare('SELECT * FROM lead_interactions WHERE lead_id = ? ORDER BY id DESC').all(leadDetail.id);
        }
      }

      const leads = db.prepare('SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost FROM leads l LEFT JOIN cars c ON c.id = l.car_id ORDER BY l.id DESC').all();
      const cars = db.prepare('SELECT * FROM cars ORDER BY id DESC').all();
      const editCar = q.edit ? db.prepare('SELECT * FROM cars WHERE id = ?').get(Number(q.edit)) : null;
      const teamMembers = db.prepare('SELECT * FROM team_members ORDER BY id ASC').all();
      const enquiries = db.prepare('SELECT e.*, c.year, c.make, c.model, c.slug, c.direct, c.price FROM enquiries e LEFT JOIN cars c ON c.id = e.car_id ORDER BY e.id DESC').all();
      const negotiations = db.prepare('SELECT n.*, c.year, c.make, c.model, c.slug, c.photos FROM negotiations n LEFT JOIN cars c ON c.id = n.car_id ORDER BY n.id DESC').all();
      for (const n of negotiations) {
        n.messages = db.prepare('SELECT * FROM negotiation_messages WHERE negotiation_id = ? ORDER BY id ASC').all(n.id);
      }
      const activities = db.prepare('SELECT * FROM team_activities ORDER BY id DESC LIMIT 100').all();

      return sendHtml(res, 200, renderAdminDashboard({
        tab,
        leads,
        cars,
        editCar,
        leadDetail,
        leadAnalysis,
        leadInteractions,
        enquiries,
        negotiations,
        teamMembers,
        activities,
        currentUser: isAdmin,
        s,
        msg: q.msg || ''
      }));
    }

    // 10. Individual Vehicle Dossier Route (/cars/[slug]) & 3D Dynamic Gallery
    if (p === '/dynamic-gallery' || p === '/gallery') {
      const galleryCars = db.prepare("SELECT * FROM cars WHERE status != 'SOLD' ORDER BY year DESC, id DESC").all();
      return sendHtml(res, 200, renderDynamicGalleryPage({ cars: galleryCars, s, isAdmin }));
    }

    if (p.startsWith('/cars/')) {
      const slug = p.slice(6);
      const car = db.prepare('SELECT * FROM cars WHERE slug = ?').get(slug);
      if (!car) return sendHtml(res, 404, `<div style="padding:40px;font-family:sans-serif"><h1>Vehicle Not Found</h1><p><a href="/">Return to Cars By Rajat Showroom</a></p></div>`);
      const negotiation = unlockedPhone ? db.prepare('SELECT * FROM negotiations WHERE car_id = ? AND customer_phone = ? ORDER BY id DESC').get(car.id, unlockedPhone) : null;
      return sendHtml(res, 200, renderDetailPage({ car, unlocked, msg: q.msg, s, isAdmin: Boolean(isAdmin), negotiation }));
    }

    // 11. Storefront & Programmatic SEO Routes (/, /used-cars/nagpur, /used-cars/nagpur/[seg])
    if (p === '/' || p === '/used-cars/nagpur' || p.startsWith('/used-cars/nagpur/')) {
      const seg = p.startsWith('/used-cars/nagpur/') ? p.slice('/used-cars/nagpur/'.length) : '';
      let cars = db.prepare("SELECT * FROM cars WHERE status != 'SOLD' ORDER BY year DESC, id DESC").all();
      let h1 = `Handpicked Certified Cars · Central India`;
      let intro = `Curated pre-owned luxury & verified fleet in Nagpur with verified RTO documentation and inspection support.`;

      if (seg) {
        const preset = SEO_SEGMENTS[seg];
        if (preset) {
          h1 = preset.h1;
          intro = preset.intro;
          if (preset.col) cars = cars.filter((c) => c[preset.col].toLowerCase() === preset.val.toLowerCase());
          if (preset.max) cars = cars.filter((c) => c.price <= preset.max);
        } else {
          const byMake = cars.filter((c) => slugify(c.make) === seg);
          if (byMake.length) {
            const makeName = byMake[0].make;
            cars = byMake;
            h1 = `Certified Used ${makeName} Cars in Nagpur`;
            intro = `Explore ${byMake.length} pre-owned ${makeName} vehicles at ${s.name} Nagpur with verified ownership and inspection support.`;
          }
        }
      }

      return sendHtml(res, 200, renderListingPage({ cars, unlocked, q, h1, intro, canonicalPath: p === '/' ? '/' : p, s, isAdmin }));
    }

    return sendHtml(res, 404, `<div style="padding:40px;font-family:sans-serif"><h1>404 — Page Not Found</h1><p><a href="/">Back to ${esc(s.name)}</a></p></div>`);
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

server.listen(ENV.PORT, () => {
  console.log(`✅ Cars By Rajat (Powered by NeuroX) Unified Platform running at ${ENV.BASE_URL}`);
  console.log(`🔐 Admin Command Deck: ${ENV.BASE_URL}/admin/login (Default: ${ENV.ADMIN_USER} / ${ENV.ADMIN_PASS})`);
});
