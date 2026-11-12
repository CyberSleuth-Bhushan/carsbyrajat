import { Router, Request, Response } from 'express';
import { db, getSettings, slugify, verifyAdminCookie } from '../db.js';
import { ENV, SEO_SEGMENTS } from '../config.js';
import type { Car, Lead } from '../types.js';

export const seoRoutes = Router();

const esc = (s: any) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;

// Dynamic 1200x630 OpenGraph Card SVG
seoRoutes.get('/og/:slug.svg', (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const s = getSettings();
    const car = db.prepare('SELECT * FROM cars WHERE slug = ?').get(String(slug)) as unknown as Car | undefined;

    const title = car ? `${car.year} ${car.make} ${car.model}` : s.name;
    const sub = car ? `${car.fuel} • ${car.tr} • ${car.km.toLocaleString('en-IN')} km • ${car.rto} Nagpur` : s.tagline;
    const priceTag = car ? `Nagpur Market Est: ${lakh(car.price)} (Unlock Direct Price)` : 'Verified Pre-Owned Showroom • Nagpur';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1e293b"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#d97706"/>
        <stop offset="100%" stop-color="#fbbf24"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect x="40" y="40" width="1120" height="550" rx="24" fill="#1e293b" stroke="#334155" stroke-width="2"/>
    
    <text x="85" y="125" fill="#f59e0b" font-family="'Outfit', sans-serif" font-size="22" font-weight="bold" letter-spacing="2">✓ VERIFIED SHOWROOM • NAGPUR HUB (MH-31)</text>
    <text x="85" y="225" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="52" font-weight="800">${esc(title)}</text>
    <text x="85" y="295" fill="#94a3b8" font-family="'Inter', sans-serif" font-size="26">${esc(sub)}</text>
    
    <rect x="85" y="360" width="680" height="74" rx="14" fill="#15803d"/>
    <text x="115" y="408" fill="#ffffff" font-family="'Outfit', sans-serif" font-size="30" font-weight="bold">${esc(priceTag)}</text>
    
    <text x="85" y="525" fill="#64748b" font-family="'Inter', sans-serif" font-size="19">Cars By Rajat • Plot 42, Wardha Road Hub, Nagpur • Contact: ${esc(s.phone)}</text>
  </svg>`;

    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.end(svg);
  } catch (err: any) {
    return res.status(500).send('Error generating OG image');
  }
});

// Dynamic sitemap.xml
seoRoutes.get('/sitemap.xml', (_req: Request, res: Response) => {
  try {
    const cars = db.prepare("SELECT slug FROM cars WHERE status != 'SOLD'").all() as { slug: string }[];
    const makes = (db.prepare('SELECT DISTINCT LOWER(make) AS m FROM cars').all() as { m: string }[]).map((r) =>
      slugify(r.m)
    );
    const urls = [
      '/',
      '/dynamic-gallery',
      '/dashboard',
      '/used-cars/nagpur',
      '/privacy-policy',
      '/grievance',
      '/opt-out',
      ...Object.keys(SEO_SEGMENTS).map((k) => `/used-cars/nagpur/${k}`),
      ...makes.map((m) => `/used-cars/nagpur/${m}`),
      ...cars.map((c) => `/cars/${c.slug}`),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map((u) => `  <url><loc>${ENV.BASE_URL}${u}</loc><changefreq>daily</changefreq></url>`).join('\n') +
      `\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.send(xml);
  } catch (err: any) {
    return res.status(500).send('Error generating sitemap');
  }
});

// robots.txt
seoRoutes.get('/robots.txt', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${ENV.BASE_URL}/sitemap.xml\n`);
});

// Export Leads to CSV
seoRoutes.get('/admin/leads.csv', (req: Request, res: Response) => {
  const staff = verifyAdminCookie(req.cookies.cbr_admin);
  if (!staff) return res.status(401).send('Unauthorized');

  const rows = db
    .prepare(
      'SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost FROM leads l LEFT JOIN cars c ON c.id = l.car_id ORDER BY l.id DESC'
    )
    .all() as any[];

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
        r.direct && r.dealer_cost ? r.direct - r.dealer_cost : '',
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

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="carsbyrajat-leads.csv"');
  return res.send(csv);
});

// Export Leads to Excel HTML
seoRoutes.get('/admin/leads.xls', (req: Request, res: Response) => {
  const staff = verifyAdminCookie(req.cookies.cbr_admin);
  if (!staff) return res.status(401).send('Unauthorized');

  const rows = db
    .prepare(
      'SELECT l.*, c.year, c.make, c.model, c.direct, c.dealer_source, c.dealer_contact, c.dealer_cost FROM leads l LEFT JOIN cars c ON c.id = l.car_id ORDER BY l.id DESC'
    )
    .all() as any[];

  const tableHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1">
    <tr style="background:#0f172a;color:#fff;font-weight:bold">
      <th>ID</th><th>Timestamp</th><th>Source</th><th>Name</th><th>Phone (+91)</th><th>Email</th><th>Vehicle</th><th>Direct Price</th><th>Partner Dealer</th><th>Dealer Phone</th><th>Dealer Cost</th><th>Est Margin</th><th>Status</th><th>Next Follow-up</th><th>Assigned Rep</th><th>Budget</th><th>Exchange Car</th><th>Notes</th><th>Browsing Trail</th>
    </tr>
    ${rows
      .map(
        (r) =>
          `<tr>
            <td>${r.id}</td><td>${esc(r.ts)}</td><td>${esc(r.source || 'DIGITAL_SHOWROOM')}</td><td>${esc(r.name)}</td><td>${esc(r.phone)}</td><td>${esc(r.email || '')}</td><td>${esc(
            r.make ? `${r.year} ${r.make} ${r.model}` : 'Catalog Unlock'
          )}</td><td>${r.direct || ''}</td><td>${esc(r.dealer_source || 'CBR Own Stock')}</td><td>${esc(r.dealer_contact || '')}</td><td>${r.dealer_cost || 0}</td><td>${r.direct && r.dealer_cost ? r.direct - r.dealer_cost : ''}</td><td>${esc(r.status)}</td><td>${esc(r.followup_date || '')}</td><td>${esc(r.assigned_to || 'Rajat (Showroom)')}</td><td>${esc(r.budget || '')}</td><td>${esc(r.exchange || '')}</td><td>${esc(r.note)}</td><td>${esc(r.trail)}</td>
          </tr>`
      )
      .join('')}
  </table></body></html>`;

  res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="carsbyrajat-leads.xls"');
  return res.send(tableHtml);
});
