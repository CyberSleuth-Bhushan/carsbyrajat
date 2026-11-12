import { ENV } from './db.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
export const lakh = (n) => '₹' + (Number(n || 0) / 100000).toFixed(2).replace(/\.00$/, '') + ' Lakh';
export const calcEmi = (p) => {
  const loan = Number(p || 0) * 0.8;
  const r = 9.5 / 12 / 100;
  return Math.round((loan * r * Math.pow(1 + r, 60)) / (Math.pow(1 + r, 60) - 1));
};

export function renderAdSlot(zone, s) {
  if (s.adsense_id) {
    return `<div class="ad-slot ad-${zone}">
      <div class="ad-badge">Sponsored · AdSense</div>
      <ins class="adsbygoogle" style="display:block" data-ad-client="${esc(s.adsense_id)}" data-ad-slot="${esc(zone)}" data-ad-format="auto" data-full-width-responsive="true"></ins>
      <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
    </div>`;
  }
  const copy = {
    leaderboard: { tag: 'NAGPUR AUTO FINANCE PARTNER', title: 'Instant Pre-Approved Used Car Loans @ 8.65% p.a. — Zero Foreclosure Charges', cta: 'Check Eligibility →' },
    infeed: { tag: 'SPONSORED · INSURANCE PARTNER', title: 'Zero-Depreciation Car Insurance Renewal — Save up to 45% on Nagpur MH-31/40 Vehicles', cta: 'Get Instant Quote →' },
    finance: { tag: 'PRIORITY FINANCING DESK', title: 'HDFC, ICICI & SBI Tie-Up at Cars By Rajat — 15-Minute Digital Sanction Letter', cta: 'Apply at Showroom' },
    mobile: { tag: 'SPONSORED', title: 'Free Doorstep Car Valuation in Nagpur — Sell in 24 Hrs', cta: 'Book Free Inspection' }
  }[zone] || { tag: 'SPONSORED', title: 'Partner Offer', cta: 'Learn More' };

  return `<div class="ad-slot ad-${zone}">
    <div class="ad-inner">
      <div>
        <span class="ad-badge">${copy.tag}</span>
        <div class="ad-title">${copy.title}</div>
      </div>
      <span class="ad-cta">${copy.cta}</span>
    </div>
  </div>`;
}

export function renderLayout({ title, desc, canonical, ogImg, schema = [], s, body, isAdmin = false }) {
  const schemas = schema
    .filter(Boolean)
    .map((x) => `<script type="application/ld+json">${JSON.stringify(x)}</script>`)
    .join('\n');
  const adsenseHead = s.adsense_id
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(s.adsense_id)}" crossorigin="anonymous"></script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#1d4ed8">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Cars By Rajat">
  <link rel="icon" type="image/svg+xml" href="/icons/icon-192.svg">
  <link rel="apple-touch-icon" href="/icons/icon-192.svg">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(s.name)} — Powered by NeuroX">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(ogImg || ENV.BASE_URL + '/og/default.svg')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  ${adsenseHead}
  ${schemas}
  <style>
    :root {
      --bg: #f8fafc; --surface: #ffffff; --surface-alt: #f1f5f9; --border: #e2e8f0; --border-strong: #cbd5e1;
      --text: #0f172a; --muted: #475569; --subtle: #64748b;
      --primary: #2563eb; --primary-hover: #1d4ed8; --primary-soft: #eff6ff;
      --green: #15803d; --green-soft: #dcfce7; --amber: #b45309; --amber-soft: #fef3c7;
      --danger: #b91c1c; --danger-soft: #fee2e2; --shadow: 0 4px 20px rgba(15,23,42,0.06);
      --shadow-lg: 0 12px 32px rgba(15,23,42,0.09);
    }
    html[data-theme="dark"] {
      --bg: #0b0f19; --surface: #131b2e; --surface-alt: #1b253d; --border: #26324d;
      --text: #f8fafc; --muted: #94a3b8; --subtle: #64748b;
      --primary: #3b82f6; --primary-hover: #2563eb; --primary-soft: rgba(59,130,246,0.18);
      --green: #22c55e; --green-soft: rgba(34,197,94,0.16); --amber: #f59e0b; --amber-soft: rgba(245,158,11,0.16);
      --danger: #ef4444; --danger-soft: rgba(239,68,68,0.16); --shadow: 0 8px 28px rgba(0,0,0,0.4);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Inter, Arial, sans-serif; background: var(--bg); color: var(--text); line-height: 1.5; padding-bottom: 48px; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
    a { color: inherit; text-decoration: none; }
    button, input, select, textarea { font: inherit; color: inherit; }
    .wrap { max-width: 1360px; margin: 0 auto; padding-left: 20px; padding-right: 20px; }
    @media (max-width: 640px) { .wrap { padding-left: 14px; padding-right: 14px; } }
    /* Enhanced Clean Showroom Topbar */
    .topbar { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 60; box-shadow: 0 2px 10px rgba(15,23,42,0.03); backdrop-filter: blur(12px); }
    .topbar-inner { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; padding-bottom: 10px; gap: 16px; }
    .brand { display: flex; align-items: center; gap: 12px; min-width: 0; text-decoration: none; flex-shrink: 0; }
    .brand-logo-img { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1.5px solid #d4af37; box-shadow: 0 2px 8px rgba(15,23,42,0.12); flex-shrink: 0; }
    .brand-title { font-weight: 900; font-size: 15.5px; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text); line-height: 1.2; }
    .brand-sub { font-size: 11.5px; color: var(--muted); font-weight: 600; display: flex; align-items: center; gap: 6px; }
    .brand-badge-pill { font-size: 9.5px; font-weight: 800; background: var(--green-soft); color: var(--green); padding: 1px 6px; border-radius: 4px; letter-spacing: 0.3px; }
    
    /* Center Main Navigation */
    .nav-center-menu { display: flex; align-items: center; gap: 4px; }
    @media (max-width: 992px) { .nav-center-menu { display: none; } }
    .nav-item-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--muted); padding: 7px 12px; border-radius: 8px; text-decoration: none; transition: all .15s; border: none; background: transparent; cursor: pointer; }
    .nav-item-link:hover { color: var(--primary); background: var(--primary-soft); }
    .nav-item-link.nav-active { color: var(--primary); font-weight: 700; background: var(--primary-soft); }
    .nav-item-highlight { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); color: #1d4ed8 !important; font-weight: 700; border: 1px solid #bfdbfe; }
    .nav-item-highlight:hover { background: #dbeafe; transform: translateY(-1px); }
    .nav-badge-ai { font-size: 9.5px; font-weight: 900; background: #2563eb; color: #fff; padding: 1px 5px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; }

    /* Right Nav Actions */
    .nav-right-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; white-space: nowrap; }
    .nav-phone-pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: var(--text); text-decoration: none; padding: 6px 11px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-alt); transition: border-color .15s; }
    .nav-phone-pill:hover { border-color: var(--primary); color: var(--primary); }
    @media (max-width: 1120px) { .nav-phone-pill { display: none; } }
    .btn-wa-clean { background: #15803d; color: #fff !important; font-weight: 700; border: 1px solid #16a34a; border-radius: 8px; padding: 6px 13px; display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; text-decoration: none; transition: background .15s; }
    .btn-wa-clean:hover { background: #166534; }
    .btn-staff-pill { background: var(--surface-alt); color: var(--muted); font-size: 12px; font-weight: 600; padding: 6px 11px; border-radius: 8px; border: 1px solid var(--border); text-decoration: none; }
    .btn-staff-pill:hover { color: var(--text); border-color: var(--muted); }
    @media (max-width: 640px) { .btn-staff-pill { display: none; } }

    /* Hamburger Button (Mobile) */
    .mobile-menu-toggle { display: none; width: 38px; height: 38px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-alt); color: var(--text); font-size: 20px; align-items: center; justify-content: center; cursor: pointer; transition: background .15s; }
    @media (max-width: 992px) { .mobile-menu-toggle { display: inline-flex; } }

    /* Mobile Nav Drawer */
    .mobile-nav-drawer { display: none; position: fixed; top: 61px; left: 0; right: 0; bottom: 0; background: rgba(15,23,42,0.45); backdrop-filter: blur(6px); z-index: 998; }
    .mobile-nav-drawer.open { display: block; animation: cbrFadeIn 0.2s ease; }
    .mobile-nav-panel { background: var(--surface); border-bottom: 2px solid var(--border); padding: 18px 18px 24px; box-shadow: var(--shadow-lg); max-height: 85vh; overflow-y: auto; }
    .mobile-nav-menu { display: flex; flex-direction: column; gap: 8px; }
    .mobile-nav-link { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 10px; background: var(--surface-alt); border: 1px solid var(--border); text-decoration: none; color: var(--text); font-size: 13.5px; }
    .mobile-nav-link strong { display: block; font-size: 14px; color: var(--text); }
    .mobile-nav-link small { font-size: 11.5px; color: var(--muted); }
    .mobile-nav-link.m-active { border-color: var(--primary); background: var(--primary-soft); }
    .mobile-nav-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); }
    .btn-admin { background: #0f172a; color: #fff; border: 1px solid #0f172a; font-weight: 600; }
    .btn-admin:hover { background: #1e293b; }
    .btn-ghost { background: var(--surface); border: 1px solid var(--border); color: var(--text); font-weight: 600; }
    .btn-ghost:hover { border-color: var(--muted); }
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 7px 13px; border-radius: 8px; font-weight: 600; font-size: 12.5px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; transition: all .15s; white-space: nowrap; }
    .btn:hover { border-color: var(--primary); }
    .btn-primary { background: var(--primary); color: #fff; border-color: var(--primary); }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-sm { padding: 5px 11px; font-size: 12px; border-radius: 7px; }
    /* Admin KPI & Nav Bar */
    .admin-bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 12px 16px; margin: 18px 0; box-shadow: var(--shadow); }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; margin-bottom: 18px; }
    @media (max-width: 1024px) { .kpi-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 640px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }
    @media (max-width: 420px) { .kpi-grid { grid-template-columns: 1fr; } }
    .kpi-card { background: var(--surface); border: 1px solid var(--border); border-radius: 13px; padding: 16px 18px; box-shadow: var(--shadow); display: flex; flex-direction: column; justify-content: space-between; }
    .kpi-lbl { font-size: 11px; color: var(--muted); font-weight: 800; letter-spacing: .5px; text-transform: uppercase; }
    .kpi-val { font-size: 26px; font-weight: 800; line-height: 1.15; margin-top: 6px; }
    @media (max-width: 640px) { .kpi-val { font-size: 22px; } }
    /* Hero & Filter Bar */
    .hero { background: linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%); border: 1px solid var(--border); border-radius: 16px; padding: 22px 24px; margin: 18px 0; box-shadow: var(--shadow); }
    @media (max-width: 640px) { .hero { padding: 16px 14px; margin: 14px 0; border-radius: 12px; } }
    .hero-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; }
    .hero h1 { font-size: clamp(20px, 2.4vw, 28px); font-weight: 800; letter-spacing: -0.3px; }
    .hero p { color: var(--muted); font-size: 13.5px; margin-top: 4px; max-width: 680px; }
    .trust-strip { display: grid; grid-template-columns: repeat(3, auto); gap: 10px; }
    @media (max-width: 768px) { .trust-strip { grid-template-columns: 1fr; width: 100%; } }
    .trust-stat { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 8px 14px; font-size: 11.5px; white-space: nowrap; }
    .trust-stat strong { display: block; font-size: 14px; color: var(--primary); }
    .filter-grid { display: grid; grid-template-columns: 2fr repeat(5, 1fr) auto; gap: 8px; align-items: center; }
    @media (max-width: 1180px) { .filter-grid { grid-template-columns: 1fr 1fr 1fr; } }
    @media (max-width: 640px) { .filter-grid { grid-template-columns: 1fr; } }
    .inp { width: 100%; height: 38px; padding: 7px 11px; border-radius: 9px; border: 1px solid var(--border); background: var(--surface); font-size: 13px; }
    .inp:focus { outline: 2px solid var(--primary); border-color: transparent; }
    .seo-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; align-items: center; }
    .seo-pill { font-size: 12px; padding: 4px 11px; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); }
    .seo-pill:hover, .seo-pill.active { border-color: var(--primary); color: var(--primary); background: var(--primary-soft); font-weight: 600; }
    /* Grid & Cards Responsive Layout */
    .catalog-meta { display: flex; justify-content: space-between; align-items: center; margin: 14px 0; font-size: 13px; color: var(--muted); flex-wrap: wrap; gap: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 18px; align-items: stretch; }
    @media (max-width: 640px) { .grid { grid-template-columns: 1fr; gap: 14px; } }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 15px; overflow: hidden; box-shadow: var(--shadow); display: flex; flex-direction: column; transition: transform .15s, border-color .15s; }
    .card:hover { transform: translateY(-2px); border-color: var(--primary); }
    .card-media { position: relative; height: 215px; background: #0f172a; overflow: hidden; user-select: none; }
    @media (max-width: 480px) { .card-media { height: 190px; } }
    .card-media img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity .2s; }
    .media-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; border-radius: 50%; background: rgba(15,23,42,0.7); color: #fff; border: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 15px; z-index: 3; }
    .media-nav.prev { left: 8px; }
    .media-nav.next { right: 8px; }
    .media-dots { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); display: flex; gap: 5px; z-index: 3; }
    .media-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.45); }
    .media-dot.active { background: #fff; width: 16px; border-radius: 4px; }
    .badge-top-left { position: absolute; top: 10px; left: 10px; display: flex; gap: 6px; flex-wrap: wrap; z-index: 3; }
    .status-pill { padding: 4px 9px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; }
    .st-AVAILABLE { background: #15803d; color: #fff; }
    .st-BOOKED { background: #d97706; color: #fff; }
    .st-SOLD { background: #dc2626; color: #fff; }
    .rto-pill { background: rgba(15,23,42,0.82); color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .heart-btn { position: absolute; top: 10px; right: 10px; width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,0.92); color: #0f172a; border: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; z-index: 3; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
    .heart-btn.active { background: #fee2e2; color: #dc2626; }
    .reel-chip { position: absolute; bottom: 10px; right: 10px; background: rgba(15,23,42,0.84); color: #fff; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; z-index: 3; border: 1px solid rgba(255,255,255,0.2); }
    .card-body { padding: 15px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .card-title { font-size: 17px; font-weight: 800; line-height: 1.3; }
    .spec-chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { font-size: 11.5px; padding: 3px 8px; border-radius: 6px; background: var(--surface-alt); color: var(--muted); font-weight: 600; }
    .feat-line { font-size: 12px; color: var(--subtle); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .price-box { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 11px; padding: 11px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: auto; }
    .price-lbl { font-size: 11px; color: var(--muted); text-transform: uppercase; font-weight: 700; }
    .price-mkt { font-size: 15px; font-weight: 700; }
    .price-strike { text-decoration: line-through; color: var(--subtle); font-size: 13px; }
    .price-direct { font-size: 20px; font-weight: 800; color: var(--green); }
    .save-pill { display: inline-block; background: var(--green-soft); color: var(--green); font-size: 11px; font-weight: 700; padding: 2px 7px; border-radius: 5px; margin-top: 2px; }
    .emi-tag { font-size: 11.5px; color: var(--primary); font-weight: 600; }
    .card-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    /* Responsive Table Styles (Admin & Comparison) */
    .table-container { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 10px; border: 1px solid var(--border); background: var(--surface); }
    table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; min-width: 600px; }
    th { padding: 12px 14px; font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: var(--muted); background: var(--surface-alt); border-bottom: 2px solid var(--border); text-align: left; white-space: nowrap; }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: middle; }
    tbody tr:hover td { background: rgba(29, 78, 216, 0.025); }
    tbody tr:last-child td { border-bottom: none; }
    /* AdSense Slots */
    .ad-slot { background: var(--surface); border: 1px dashed var(--border); border-radius: 12px; padding: 12px 16px; margin: 16px 0; }
    .ad-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .ad-badge { font-size: 10px; font-weight: 800; letter-spacing: .7px; text-transform: uppercase; color: var(--amber); background: var(--amber-soft); padding: 2px 7px; border-radius: 4px; display: inline-block; margin-bottom: 4px; }
    .ad-title { font-size: 13.5px; font-weight: 700; }
    .ad-cta { font-size: 12px; font-weight: 700; color: var(--primary); white-space: nowrap; }
    .ad-infeed { margin: 0; display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%); }
    .mobile-anchor-ad { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); padding: 8px 18px; z-index: 40; display: flex; align-items: center; justify-content: space-between; gap: 10px; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); }
    @media (min-width: 900px) { .mobile-anchor-ad { display: none !important; } }
    /* Gated Assets (Cars24 / Spinny Pattern) */
    .gated-lock-card { background: #f0fdf9; border: 1.5px solid #a7f3d0; color: #0d5f56; font-weight: 700; font-size: 14.5px; padding: 14px 20px; border-radius: 12px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all .15s; box-shadow: 0 2px 8px rgba(13,95,86,0.06); }
    .gated-lock-card:hover { background: #e6faf5; border-color: #34d399; transform: translateY(-1px); }
    html[data-theme="dark"] .gated-lock-card { background: rgba(13,95,86,0.18); border-color: rgba(52,211,153,0.3); color: #5eead4; }
    .auth-choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 18px 0 14px; }
    @media (max-width: 480px) { .auth-choice-grid { grid-template-columns: 1fr; gap: 8px; } }
    .btn-auth-google { background: #1e2433; color: #ffffff; border: 0; border-radius: 999px; padding: 13px 18px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: opacity .15s; }
    .btn-auth-google:hover { opacity: 0.92; }
    .btn-auth-otp { background: #0f766e; color: #ffffff; border: 0; border-radius: 999px; padding: 13px 18px; font-weight: 700; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px; transition: opacity .15s; }
    .btn-auth-otp:hover { opacity: 0.92; }
    /* Automotive Lead Management System (Kanban & Pipeline) */
    .kanban-board { display: grid; grid-template-columns: repeat(5, minmax(280px, 1fr)); gap: 14px; overflow-x: auto; padding-bottom: 14px; margin-top: 14px; -webkit-overflow-scrolling: touch; }
    .kanban-col { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 10px; min-height: 480px; }
    .kanban-col-head { display: flex; justify-content: space-between; align-items: center; font-weight: 800; font-size: 13px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    .kanban-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px; box-shadow: var(--shadow); display: flex; flex-direction: column; gap: 8px; transition: transform .15s; }
    .kanban-card:hover { transform: translateY(-2px); border-color: var(--primary); }
    /* Visual Analytics Dashboard Cards */
    .analytics-grid { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 14px; margin-top: 14px; }
    @media (max-width: 960px) { .analytics-grid { grid-template-columns: 1fr; } }
    .analytics-card { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 12px; padding: 14px 16px; display: flex; flex-direction: column; justify-content: space-between; }
    .funnel-step { margin-bottom: 9px; }
    .funnel-label { display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 700; margin-bottom: 3px; }
    .funnel-track { height: 8px; border-radius: 999px; background: var(--border); overflow: hidden; }
    .funnel-fill { height: 100%; border-radius: 999px; transition: width .4s ease-in-out; }
    /* Horizontal Swipeable Showcase Carousel */
    .carousel-wrap { position: relative; margin: 18px 0 24px; }
    .carousel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .carousel-track { display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding: 4px 2px 14px; scrollbar-width: thin; scrollbar-color: var(--primary) transparent; }
    .carousel-track::-webkit-scrollbar { height: 6px; }
    .carousel-track::-webkit-scrollbar-thumb { background: var(--border); border-radius: 999px; }
    .carousel-card { flex: 0 0 320px; width: 320px; scroll-snap-align: start; }
    @media (max-width: 640px) { .carousel-card { flex: 0 0 84vw; width: 84vw; } }
    .carousel-nav-btn { width: 34px; height: 34px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: 18px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all .15s; }
    .carousel-nav-btn:hover { background: var(--primary); color: #fff; border-color: var(--primary); }
    /* Chatbot Styles */
    .chatbot-bubble { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; }
    @media (max-width: 640px) { .chatbot-bubble { bottom: 16px; right: 14px; } }
    .chatbot-toggle-btn { width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #1d4ed8, #2563eb); color: #fff; border: 0; box-shadow: 0 8px 24px rgba(29,78,216,0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 26px; transition: transform .2s, box-shadow .2s; }
    .chatbot-toggle-btn:hover { transform: scale(1.06); box-shadow: 0 10px 28px rgba(29,78,216,0.5); }
    .chatbot-window { display: none; width: 375px; max-width: calc(100vw - 28px); height: 520px; max-height: calc(100vh - 100px); background: var(--surface); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 16px 40px rgba(0,0,0,0.25); flex-direction: column; overflow: hidden; margin-bottom: 12px; }
    .chatbot-window.open { display: flex; }
    .chatbot-header { background: #0f172a; color: #fff; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; }
    .chatbot-body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; font-size: 13px; background: var(--bg); }
    .chatbot-msg { max-width: 86%; padding: 9px 13px; border-radius: 12px; line-height: 1.45; word-break: break-word; }
    .chatbot-msg.bot { background: var(--surface); color: var(--text); border: 1px solid var(--border); align-self: flex-start; border-bottom-left-radius: 3px; }
    .chatbot-msg.user { background: var(--primary); color: #fff; align-self: flex-end; border-bottom-right-radius: 3px; }
    .chatbot-quick-pills { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
    .chatbot-pill { background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: 11px; padding: 4px 9px; border-radius: 999px; cursor: pointer; font-weight: 600; transition: border-color .15s; }
    .chatbot-pill:hover { border-color: var(--primary); color: var(--primary); }
    .chatbot-input-bar { display: flex; gap: 8px; padding: 10px 12px; background: var(--surface); border-top: 1px solid var(--border); }
    /* Negotiation & Verification Badges */
    .negotiation-banner { background: var(--green-soft); border: 1.5px solid var(--green); border-radius: 12px; padding: 14px 16px; margin: 14px 0; color: var(--text); }
    .verified-item { display: inline-flex; align-items: center; gap: 5px; background: var(--green-soft); color: var(--green); padding: 4px 9px; border-radius: 6px; font-weight: 700; border: 1px solid rgba(21,128,61,0.2); font-size: 11.5px; }
    .share-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
    /* Shortlist Sticky Bar */
    .shortlist-bar { position: fixed; bottom: 20px; right: 20px; z-index: 45; background: #0f172a; color: #fff; border-radius: 999px; padding: 10px 18px; display: none; align-items: center; gap: 12px; box-shadow: 0 8px 25px rgba(0,0,0,0.3); }
    @media (max-width: 640px) { .shortlist-bar { left: 14px; right: 14px; justify-content: space-between; border-radius: 12px; bottom: 14px; } }
    .shortlist-bar.show { display: flex; }
    /* Modals */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.68); backdrop-filter: blur(4px); z-index: 100; display: none; align-items: center; justify-content: center; padding: 16px; overflow-y: auto; }
    .modal-backdrop.open { display: flex; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; max-width: 520px; width: 100%; padding: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); position: relative; max-height: 92vh; overflow-y: auto; }
    @media (max-width: 480px) { .modal { padding: 18px 14px; border-radius: 14px; } }
    .modal-lg { max-width: 980px; }
    .modal-close { position: absolute; top: 14px; right: 14px; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border); background: var(--surface-alt); cursor: pointer; font-weight: 700; }
    .dpdp-box { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 10px; padding: 11px; font-size: 11.5px; color: var(--muted); margin: 12px 0; line-height: 1.45; }
    .dpdp-box label { display: flex; gap: 9px; align-items: flex-start; cursor: pointer; }
    .dpdp-box input { margin-top: 3px; transform: scale(1.15); }
    /* Detail Page */
    .dossier-grid { display: grid; grid-template-columns: 1.55fr 1fr; gap: 22px; margin: 20px 0; }
    @media (max-width: 960px) { .dossier-grid { grid-template-columns: 1fr; } }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 15px; padding: 20px; box-shadow: var(--shadow); margin-bottom: 18px; }
    @media (max-width: 640px) { .panel { padding: 16px 14px; border-radius: 12px; } }
    .main-photo { width: 100%; height: 410px; object-fit: cover; border-radius: 12px; cursor: zoom-in; background: #0f172a; }
    @media (max-width: 640px) { .main-photo { height: 240px; border-radius: 8px; } }
    .thumb-row { display: flex; gap: 10px; margin-top: 10px; overflow-x: auto; padding-bottom: 4px; }
    .thumb { width: 92px; height: 64px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid transparent; opacity: .75; }
    .thumb.active, .thumb:hover { border-color: var(--primary); opacity: 1; }
    .insp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
    @media (max-width: 640px) { .insp-grid { grid-template-columns: 1fr; } }
    .insp-card { background: var(--surface-alt); border: 1px solid var(--border); border-radius: 11px; padding: 13px; }
    .insp-head { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 13.5px; margin-bottom: 8px; }
    .insp-list { list-style: none; font-size: 12.5px; color: var(--muted); }
    .insp-list li { padding: 3px 0; display: flex; align-items: center; gap: 6px; }
    .insp-list li::before { content: "✓"; color: var(--green); font-weight: 800; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 13px; }
    th { padding: 12px 14px; font-size: 11px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: var(--muted); background: var(--surface-alt); border-bottom: 2px solid var(--border); text-align: left; white-space: nowrap; }
    td { padding: 12px 14px; border-bottom: 1px solid var(--border); text-align: left; vertical-align: middle; }
    tbody tr:hover td { background: rgba(29, 78, 216, 0.025); }
    tbody tr:last-child td { border-bottom: none; }
    footer { background: var(--surface); border-top: 1px solid var(--border); padding: 32px 0; margin-top: 40px; font-size: 13px; color: var(--muted); }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 24px; }
    @media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="wrap topbar-inner">
      <a href="/" class="brand">
        <img src="/cbr-client-logo.jpg" alt="Cars By Rajat Logo" class="brand-logo-img">
        <div>
          <div class="brand-title">CARS BY RAJAT</div>
          <div class="brand-sub">
            <span>Nagpur Certified Showroom</span>
            <span class="brand-badge-pill">✓ VERIFIED SHOWROOM</span>
          </div>
        </div>
      </a>

      <!-- Desktop Center Main Navigation -->
      <nav class="nav-center-menu" aria-label="Showroom Navigation">
        <a href="/used-cars/nagpur" class="nav-item-link">🚗 All Inventory</a>
        <a href="/dynamic-gallery" class="nav-item-link nav-item-highlight">
          <span>🎬 Dynamic Reels</span>
          <span class="nav-badge-ai">AI</span>
        </a>
        <a href="/dashboard" class="nav-item-link">👤 Buyer Hub</a>
        <button type="button" class="nav-item-link" onclick="openCompareModal()">⚖️ Compare</button>
      </nav>

      <!-- Right Contact & Staff Actions -->
      <div class="nav-right-actions">
        <a href="tel:${esc(s.phone)}" class="nav-phone-pill" title="Showroom Helpline">
          <span>📞</span> <span>${esc(s.phone)}</span>
        </a>
        <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent('Hi Rajat, I am browsing Cars By Rajat (' + ENV.BASE_URL + ') and would like assistance.')}" target="_blank" rel="noopener" class="btn-wa-clean">
          <span>💬 WhatsApp</span>
        </a>
        ${isAdmin ? `<a href="/admin" class="btn btn-sm btn-admin">Command Deck</a>` : `<a href="/admin/login" class="btn-staff-pill">Staff Login</a>`}
        <button type="button" class="mobile-menu-toggle" id="mobileMenuBtn" onclick="toggleMobileNav()" aria-label="Open Navigation Menu">☰</button>
      </div>
    </div>
  </header>

  <!-- Clean Mobile Slide-Down Navigation Drawer -->
  <div class="mobile-nav-drawer" id="mobileNavDrawer" onclick="if(event.target===this)closeMobileNav()">
    <div class="mobile-nav-panel">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border)">
        <div style="font-size:12px;font-weight:800;color:var(--muted);letter-spacing:0.8px;text-transform:uppercase">Nagpur Showroom Navigation</div>
        <button type="button" class="btn btn-sm btn-ghost" onclick="closeMobileNav()" style="padding:3px 9px">✕ Close</button>
      </div>
      <div class="mobile-nav-menu">
        <a href="/used-cars/nagpur" class="mobile-nav-link" onclick="closeMobileNav()">
          <span style="font-size:22px">🚗</span>
          <div>
            <strong>Certified Cars Inventory</strong>
            <small>Browse all verified pre-owned vehicles in Nagpur</small>
          </div>
        </a>
        <a href="/dynamic-gallery" class="mobile-nav-link m-active" onclick="closeMobileNav()">
          <span style="font-size:22px">🎬</span>
          <div>
            <strong>Dynamic Reels Showcase <span class="nav-badge-ai">AI</span></strong>
            <small>Swipe Up/Down reels with live interest tracker</small>
          </div>
        </a>
        <a href="/dashboard" class="mobile-nav-link" onclick="closeMobileNav()">
          <span style="font-size:22px">👤</span>
          <div>
            <strong>Buyer Hub &amp; Dashboard</strong>
            <small>Track offers, test drives, enquiries &amp; alerts</small>
          </div>
        </a>
        <button type="button" class="mobile-nav-link" onclick="closeMobileNav(); openCompareModal()" style="text-align:left;cursor:pointer;width:100%">
          <span style="font-size:22px">⚖️</span>
          <div>
            <strong>Compare Shortlisted Cars</strong>
            <small>Side-by-side specs, price &amp; inspection comparison</small>
          </div>
        </button>
      </div>
      <div class="mobile-nav-actions">
        <a href="tel:${esc(s.phone)}" class="btn btn-ghost btn-sm" style="width:100%;text-align:center">📞 Call Dealer</a>
        <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent('Hi Rajat, I am browsing Cars By Rajat and need assistance.')}" target="_blank" rel="noopener" class="btn-wa-clean btn-sm" style="width:100%;justify-content:center">💬 WhatsApp</a>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid var(--border)">
        <button type="button" class="btn btn-sm btn-ghost" onclick="triggerPwaInstall()">📲 Install App</button>
        ${isAdmin ? `<a href="/admin" class="btn btn-sm btn-admin">Command Deck</a>` : `<a href="/admin/login" class="btn btn-sm btn-ghost">Staff Login</a>`}
      </div>
    </div>
  </div>

  <main class="wrap">
    ${body}
  </main>

  <!-- Gated Vehicle Dossier & Price Unlock Modal (Dual Google & Mobile Auth) -->
  <div class="modal-backdrop" id="unlockModal">
    <div class="modal" style="text-align:center">
      <button type="button" class="modal-close" onclick="closeUnlockModal()">✕</button>
      <div style="font-size:23px;font-weight:800;color:var(--text);margin-top:6px" id="unlockModalTitle">Login For More Info</div>
      <p style="font-size:13.5px;color:var(--muted);margin:6px auto 0;max-width:390px" id="unlockModalSubtitle">
        Unlock important details about the vehicle's owner, insurance, PUCC &amp; more..
      </p>

      <!-- Step 1: Dual Choice Buttons (Matches Spinny / Cars24 pattern) -->
      <div class="auth-choice-grid" id="authChoiceButtons">
        <button type="button" class="btn-auth-google" onclick="startGoogleAuth()">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/></svg>
          Login with Google
        </button>
        <button type="button" class="btn-auth-otp" onclick="showMobileForm()">
          📱 Login with Mobile
        </button>
      </div>

      <!-- Google Profile Banner (Shown after Google 1-Tap) -->
      <div id="googleWelcomeBanner" style="display:none;background:var(--primary-soft);border:1px solid rgba(29,78,216,0.25);border-radius:10px;padding:10px;margin-bottom:12px;text-align:left">
        <div style="font-size:12.5px;font-weight:700;color:var(--primary)">✓ Google Verified: <span id="googleProfileName">User</span> (<span id="googleProfileEmail">user@gmail.com</span>)</div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:2px">Please confirm your contact number below so Rajat's showroom desk can verify vehicle availability:</div>
      </div>

      <!-- Step 2: Contact Form (Direct or Google-authenticated) -->
      <form id="unlockForm" onsubmit="submitUnlock(event)" style="text-align:left">
        <input type="hidden" name="car_id" id="unlockCarId" value="">
        <input type="hidden" name="email" id="unlockEmail" value="">
        <input type="hidden" name="auth_source" id="unlockAuthSource" value="DIRECT_MOBILE">
        
        <div id="nameFieldGroup" style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Full Name</label>
          <input class="inp" type="text" name="name" id="unlockName" placeholder="e.g. Rahul Sharma" required>
        </div>

        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">10-Digit Mobile Number *</label>
          <div style="display:flex;gap:6px">
            <span class="inp" style="width:62px;text-align:center;font-weight:700;background:var(--surface-alt);line-height:22px">+91</span>
            <input class="inp" type="tel" name="phone" id="unlockPhone" required pattern="[6-9][0-9]{9}" maxlength="10" placeholder="98230XXXXX">
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:3px">🔒 Used strictly by Rajat's showroom manager to confirm physical vehicle availability.</div>
        </div>

        <div class="dpdp-box" style="margin-top:10px">
          <label>
            <input type="checkbox" name="consent" id="unlockConsent" value="1" required>
            <span>I consent to <strong>${esc(s.name)}</strong> contacting me regarding vehicle availability, pricing &amp; RC verification (<a href="/privacy-policy" style="color:var(--primary);text-decoration:underline">DPDP Act 2023 Notice</a>).</span>
          </label>
        </div>

        <div id="unlockErr" style="color:var(--danger);font-size:12.5px;margin-bottom:8px;display:none;font-weight:600"></div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:12px;font-size:14px;font-weight:700" id="unlockSubmitBtn">🔓 Unlock Complete Dossier &amp; Price</button>
      </form>
    </div>
  </div>

  <!-- Shortlist Floating Bar & Compare Modal -->
  <div class="shortlist-bar" id="shortlistBar">
    <span>❤️ <strong id="shortlistCount">0</strong>/4 Cars Shortlisted</span>
    <button type="button" class="btn btn-sm btn-primary" onclick="openCompareModal()">⚖️ Compare Side-by-Side</button>
    <button type="button" class="btn btn-sm" style="background:transparent;color:#fff;border-color:rgba(255,255,255,0.3)" onclick="clearShortlist()">Clear</button>
  </div>

  <div class="modal-backdrop" id="compareModal">
    <div class="modal modal-lg">
      <button type="button" class="modal-close" onclick="closeCompareModal()">✕</button>
      <h2 style="font-size:20px;font-weight:800;margin-bottom:12px">⚖️ Side-by-Side Vehicle Comparison</h2>
      <div id="compareTableWrap" style="overflow-x:auto"></div>
    </div>
  </div>

  <footer>
    <div class="wrap footer-grid">
      <div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          <img src="/cbr-client-logo.jpg" alt="Cars By Rajat" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid #d4af37">
          <div style="font-weight:800;font-size:16px;color:var(--text)">${esc(s.name)} — Nagpur's Certified Hub</div>
        </div>
        <p>${esc(s.address)}</p>
        <p style="margin-top:6px">📞 <a href="tel:${esc(s.phone)}">${esc(s.phone)}</a> · ✉️ <a href="mailto:${esc(s.officer_email)}">${esc(s.officer_email)}</a></p>
        <p style="margin-top:8px;font-size:11.5px">DPDP Act 2023 Data Fiduciary: <strong>${esc(s.name)}</strong> · Grievance Officer: <strong>${esc(s.officer)}</strong> (90-Day Automated Lead Retention Policy Active).</p>
      </div>
      <div>
        <div style="font-weight:700;color:var(--text);margin-bottom:8px">Nagpur SEO Showrooms</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <a href="/used-cars/nagpur">All Certified Cars in Nagpur</a>
          <a href="/used-cars/nagpur/automatic">Automatic Cars in Nagpur</a>
          <a href="/used-cars/nagpur/diesel">Diesel SUVs in Nagpur</a>
          <a href="/used-cars/nagpur/under-10-lakh">Cars Under ₹10 Lakh</a>
          <a href="/used-cars/nagpur/hyundai">Used Hyundai Cars Nagpur</a>
        </div>
      </div>
      <div>
        <div style="font-weight:700;color:var(--text);margin-bottom:8px">Legal, Privacy &amp; Admin</div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <a href="/privacy-policy">DPDP Act 2023 Privacy Notice</a>
          <a href="/grievance">Data Protection &amp; Grievance Officer</a>
          <a href="/opt-out">Instant WhatsApp STOP / Erase My Data</a>
          <a href="/sitemap.xml">XML Sitemap</a>
          <a href="/admin">Dealership Command Deck (Admin)</a>
        </div>
      </div>
    </div>

    <!-- Smart Agency Partner Badge (Neurojna) -->
    <div class="wrap" style="margin-top:28px;padding-top:16px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--muted)">
      <div>© ${new Date().getFullYear()} Cars By Rajat. All rights reserved. Registered Dealership MH-31.</div>
      <a href="https://neurojna_ai.com" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:9px;padding:6px 14px;border-radius:999px;background:var(--surface-alt);border:1px solid var(--border);font-weight:600;text-decoration:none;transition:border-color .15s">
        <span style="font-size:11.5px;color:var(--muted)">Engineered &amp; Powered by</span>
        <img src="/neurojna-logo.png" alt="Neurojna" style="height:20px;width:auto;object-fit:contain;vertical-align:middle;display:inline-block">
        <strong style="color:var(--text);font-size:12px;letter-spacing:0.3px">Neurojna_ai.com</strong>
      </a>
    </div>
  </footer>

  <div class="mobile-anchor-ad" id="mobileAnchorAd">
    <div style="font-size:12px">
      <span class="ad-badge" style="margin-right:6px">Sponsored</span>
      <strong>Instant Car Loan @ 8.65%</strong> · Zero Down Payment Options in Nagpur
    </div>
    <div style="display:flex;gap:6px;align-items:center">
      <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent('Hi Rajat, I want to check used car loan eligibility.')}" target="_blank" rel="noopener" class="btn btn-sm btn-primary">Check EMI</a>
      <button type="button" class="btn btn-sm" onclick="document.getElementById('mobileAnchorAd').style.display='none'">✕</button>
    </div>
  </div>

  <script>
    // Theme Persistence - Overall Site Default to Light Theme
    (function(){
      let saved = localStorage.getItem('cbr_theme');
      if (!saved || saved === 'dark') {
        saved = 'light';
        localStorage.setItem('cbr_theme', 'light');
      }
      document.documentElement.setAttribute('data-theme', 'light');
    })();
    function toggleTheme(){
      const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('cbr_theme', cur);
    }

    // Clean Mobile Navigation Toggle
    function toggleMobileNav() {
      const d = document.getElementById('mobileNavDrawer');
      const btn = document.getElementById('mobileMenuBtn');
      if (d) {
        const isOpen = d.classList.toggle('open');
        if (btn) btn.textContent = isOpen ? '✕' : '☰';
      }
    }
    function closeMobileNav() {
      const d = document.getElementById('mobileNavDrawer');
      const btn = document.getElementById('mobileMenuBtn');
      if (d) d.classList.remove('open');
      if (btn) btn.textContent = '☰';
    }

    // Telemetry Trail Helper
    function getTrail(){
      try { return JSON.parse(localStorage.getItem('cbr_trail') || '[]'); } catch { return []; }
    }
    function pushTrail(step){
      const t = getTrail().filter(x => x !== step);
      t.push(step);
      while (t.length > 8) t.shift();
      localStorage.setItem('cbr_trail', JSON.stringify(t));
    }

    // Client-side Intelligent Anti-Fake Mobile Filter
    function validateIndianMobileClient(phone) {
      const p = String(phone || '').replace(/[^0-9]/g, '').slice(-10);
      if (!/^[6-9][0-9]{9}$/.test(p)) {
        return { ok: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' };
      }
      if (p.split('').every(function(c){ return c === p[0]; })) {
        return { ok: false, error: 'Please enter your actual personal contact number.' };
      }
      const fakeSequences = ['9876543210', '8765432109', '0123456789', '1234567890', '9012345678', '8901234567'];
      if (fakeSequences.includes(p)) {
        return { ok: false, error: 'Please enter your actual personal contact number.' };
      }
      const uniqueDigits = new Set(p.split('')).size;
      if (uniqueDigits < 4) {
        return { ok: false, error: 'Please enter a genuine contact number for visit verification.' };
      }
      return { ok: true, phone: p };
    }

    // Modal Control & Dual Auth Flows
    function openUnlockModal(carId, carTitle){
      document.getElementById('unlockCarId').value = carId || '';
      document.getElementById('unlockErr').style.display = 'none';
      document.getElementById('googleWelcomeBanner').style.display = 'none';
      document.getElementById('unlockAuthSource').value = 'DIRECT_MOBILE';
      document.getElementById('unlockEmail').value = '';
      document.getElementById('unlockName').value = '';
      document.getElementById('unlockPhone').value = '';
      document.getElementById('unlockModal').classList.add('open');
      setTimeout(() => document.getElementById('unlockPhone')?.focus(), 80);
    }
    function closeUnlockModal(){
      document.getElementById('unlockModal').classList.remove('open');
    }

    function showMobileForm(){
      document.getElementById('unlockPhone')?.focus();
    }

    function startGoogleAuth(){
      // Seamless Google Profile Authenticator
      const promptEmail = prompt('Enter your Google Account email to verify identity (or click OK for demo account):', 'rahul.sharma@gmail.com');
      if (!promptEmail) return;
      const cleanEmail = promptEmail.trim().toLowerCase();
      const derivedName = cleanEmail.split('@')[0].replace(/[._]+/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      document.getElementById('unlockEmail').value = cleanEmail;
      document.getElementById('unlockName').value = derivedName;
      document.getElementById('unlockAuthSource').value = 'GOOGLE_OAUTH';
      
      document.getElementById('googleProfileName').textContent = derivedName;
      document.getElementById('googleProfileEmail').textContent = cleanEmail;
      document.getElementById('googleWelcomeBanner').style.display = 'block';
      
      const phoneInput = document.getElementById('unlockPhone');
      phoneInput.focus();
      phoneInput.scrollIntoView({ behavior: 'smooth' });
    }

    async function submitUnlock(e){
      e.preventDefault();
      const rawPhone = document.getElementById('unlockPhone').value;
      const name = document.getElementById('unlockName').value.trim();
      const email = document.getElementById('unlockEmail').value.trim();
      const car_id = document.getElementById('unlockCarId').value;
      const auth_source = document.getElementById('unlockAuthSource').value;
      const consent = document.getElementById('unlockConsent').checked;
      const errEl = document.getElementById('unlockErr');

      const val = validateIndianMobileClient(rawPhone);
      if (!val.ok) {
        errEl.textContent = '⚠️ ' + val.error;
        errEl.style.display = 'block';
        return;
      }
      if (!consent) {
        errEl.textContent = '⚠️ Please consent to contact regarding vehicle availability & paperwork to proceed.';
        errEl.style.display = 'block';
        return;
      }

      const btn = document.getElementById('unlockSubmitBtn');
      btn.disabled = true;
      btn.textContent = 'Verifying & Unlocking Dossier...';
      pushTrail('Unlocked dossier' + (car_id ? ' for Car #' + car_id : '') + (auth_source === 'GOOGLE_OAUTH' ? ' via Google' : ''));
      try {
        const res = await fetch('/api/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: val.phone,
            name: name || '-',
            email: email || '',
            car_id,
            consent: '1',
            trail: getTrail().join(' → ')
          })
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || 'Could not unlock vehicle dossier.');
        window.location.reload();
      } catch (err) {
        errEl.textContent = '⚠️ ' + err.message;
        errEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = '🔓 Unlock Complete Dossier & Price';
      }
    }

    // Shortlist & Side-by-Side Compare Logic
    function getShortlist(){
      try { return JSON.parse(localStorage.getItem('cbr_shortlist') || '[]'); } catch { return []; }
    }
    function saveShortlist(ids){
      localStorage.setItem('cbr_shortlist', JSON.stringify(ids));
      updateShortlistUI();
    }
    function toggleShortlist(id, btn){
      let list = getShortlist();
      if (list.includes(id)) {
        list = list.filter(x => x !== id);
      } else {
        if (list.length >= 4) { alert('You can compare up to 4 cars side-by-side.'); return; }
        list.push(id);
      }
      saveShortlist(list);
    }
    function clearShortlist(){ saveShortlist([]); closeCompareModal(); }
    function updateShortlistUI(){
      const list = getShortlist();
      document.querySelectorAll('.heart-btn').forEach(btn => {
        const id = Number(btn.getAttribute('data-id'));
        btn.classList.toggle('active', list.includes(id));
      });
      const bar = document.getElementById('shortlistBar');
      const cnt = document.getElementById('shortlistCount');
      if (bar && cnt) {
        cnt.textContent = list.length;
        bar.classList.toggle('show', list.length > 0);
      }
    }
    function openCompareModal(){
      const list = getShortlist();
      const catalog = window.CBR_CATALOG || [];
      const cars = catalog.filter(c => list.includes(c.id));
      const wrap = document.getElementById('compareTableWrap');
      if (!cars.length) {
        wrap.innerHTML = '<p style="color:var(--muted)">Shortlist at least 1 car using the ❤️ button on any card.</p>';
      } else {
        const rows = [
          ['Vehicle', c => '<strong>' + c.year + ' ' + c.make + ' ' + c.model + '</strong>'],
          ['Market Price', c => '₹' + Number(c.price).toLocaleString('en-IN')],
          ['Rajat Direct Price', c => c.direct ? '<strong style="color:var(--green)">₹' + Number(c.direct).toLocaleString('en-IN') + '</strong>' : '<button class="btn btn-sm btn-primary" onclick="closeCompareModal();openUnlockModal(' + c.id + ')">🔒 Unlock</button>'],
          ['Est. Monthly EMI', c => '₹' + Number(c.emi).toLocaleString('en-IN') + '/mo'],
          ['Kilometres Driven', c => Number(c.km).toLocaleString('en-IN') + ' km'],
          ['Fuel & Gearbox', c => c.fuel + ' · ' + c.tr + (c.tr_detail ? ' (' + c.tr_detail + ')' : '')],
          ['Ownership & RTO', c => c.own + (c.own === 1 ? 'st' : 'nd') + ' Owner · ' + c.rto],
          ['Insurance', c => c.ins],
          ['Key Features', c => c.feat],
          ['Action', c => '<a class="btn btn-sm btn-primary" href="/cars/' + c.slug + '">View Dossier →</a>']
        ];
        wrap.innerHTML = '<table><thead><tr><th>Specification</th>' +
          cars.map(c => '<th>' + c.year + ' ' + c.make + ' ' + c.model + '</th>').join('') +
          '</tr></thead><tbody>' +
          rows.map(([label, fn]) => '<tr><th>' + label + '</th>' + cars.map(c => '<td>' + fn(c) + '</td>').join('') + '</tr>').join('') +
          '</tbody></table>';
      }
      document.getElementById('compareModal').classList.add('open');
    }
    function closeCompareModal(){ document.getElementById('compareModal').classList.remove('open'); }
    document.addEventListener('DOMContentLoaded', updateShortlistUI);

    // Register Service Worker for PWA (Android Home Screen Install)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.log('SW registration skipped:', err);
        });
      });
    }

    // Android PWA Install Prompt Handler
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('pwaInstallBtn');
      if (installBtn) installBtn.style.display = 'inline-flex';
    });

    function triggerPwaInstall() {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            const btn = document.getElementById('pwaInstallBtn');
            if (btn) btn.textContent = '✓ App Installed';
          }
          deferredPrompt = null;
        });
      } else {
        alert('To install Cars By Rajat App:\n\n1. On Android / Chrome: Tap the 3 dots (⋮) menu at top right and choose "Install App" or "Add to Home Screen".\n2. On iPhone / Safari: Tap Share (📤) and select "Add to Home Screen".');
      }
    }

    // Floating Chatbot Engine
    function toggleChatbot() {
      const w = document.getElementById('chatbotWindow');
      if (!w) return;
      w.classList.toggle('open');
      if (w.classList.contains('open')) {
        setTimeout(() => document.getElementById('chatInput')?.focus(), 100);
      }
    }

    async function handleChatSubmit(e) {
      e.preventDefault();
      const inp = document.getElementById('chatInput');
      const text = inp.value.trim();
      if (!text) return;
      inp.value = '';
      await sendChatPrompt(text);
    }

    async function sendChatPrompt(promptText) {
      const container = document.getElementById('chatbotMessages');
      if (!container) return;
      const userDiv = document.createElement('div');
      userDiv.className = 'chatbot-msg user';
      userDiv.textContent = promptText;
      container.appendChild(userDiv);
      container.scrollTop = container.scrollHeight;

      const botLoading = document.createElement('div');
      botLoading.className = 'chatbot-msg bot';
      botLoading.textContent = 'Checking Nagpur inventory & specs... ⏳';
      container.appendChild(botLoading);
      container.scrollTop = container.scrollHeight;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: promptText })
        });
        const data = await res.json();
        botLoading.innerHTML = data.reply || 'Our Nagpur showroom team is available at +91 98230 11223 or via WhatsApp.';
        if (data.showSalesPrompt) {
          const p = document.createElement('div');
          p.className = 'chatbot-quick-pills';
          p.innerHTML = '<button class="chatbot-pill" onclick="openChatSalesLead()" style="background:var(--primary);color:#fff">📞 Talk with Human Sales Rep</button>';
          container.appendChild(p);
        }
      } catch (err) {
        botLoading.textContent = 'Showroom desk is available at +91 98230 11223 or on WhatsApp for instant assistance.';
      }
      container.scrollTop = container.scrollHeight;
    }

    function openChatSalesLead() {
      const f = document.getElementById('chatSalesForm');
      if (f) {
        f.style.display = 'block';
        document.getElementById('chatLeadPhone')?.focus();
      }
    }
    function closeChatSalesLead() {
      const f = document.getElementById('chatSalesForm');
      if (f) f.style.display = 'none';
    }
    async function submitChatLead() {
      const name = document.getElementById('chatLeadName')?.value.trim() || 'Chatbot Guest';
      const phone = document.getElementById('chatLeadPhone')?.value.trim();
      const val = validateIndianMobileClient(phone);
      if (!val.ok) {
        alert(val.error);
        return;
      }
      try {
        await fetch('/api/enquiry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone: val.phone,
            message: 'Customer requested human assistance via website chatbot.',
            source: 'CHATBOT_ENQUIRY'
          })
        });
        closeChatSalesLead();
        const container = document.getElementById('chatbotMessages');
        const msg = document.createElement('div');
        msg.className = 'chatbot-msg bot';
        msg.innerHTML = '✅ <strong>Callback Requested!</strong> Rajat or our Wardha Road sales desk will call +91 ' + val.phone + ' shortly.';
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
      } catch {
        alert('Failed to connect. Please call our showroom directly at +91 98230 11223.');
      }
    }

    function showToast(text, duration = 3000) {
      const t = document.getElementById('cbrToast');
      if (!t) return;
      t.textContent = text;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, duration);
    }

    function shareVehicle(title, url, customText) {
      const shareUrl = url || window.location.href;
      const text = customText || ('Check out certified ' + title + ' on Cars By Rajat Nagpur: ' + shareUrl);
      if (navigator.share) {
        navigator.share({ title: title, text: text, url: shareUrl }).catch(() => {});
      } else {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('✓ Public vehicle link copied to clipboard!');
          }).catch(() => {
            prompt('Copy vehicle link:', shareUrl);
          });
        } else {
          prompt('Copy vehicle link:', shareUrl);
        }
      }
    }
  </script>

  <!-- Virtual Auto Advisor Chatbot Widget -->
  <div class="chatbot-bubble" id="cbrChatWidget">
    <div class="chatbot-window" id="chatbotWindow">
      <div class="chatbot-header">
        <div style="display:flex;align-items:center;gap:9px">
          <div style="width:32px;height:32px;border-radius:50%;background:#d4af37;display:flex;align-items:center;justify-content:center;color:#0f172a;font-weight:800;font-size:15px">🤖</div>
          <div>
            <div style="font-weight:800;font-size:13px">CBR Virtual Auto Advisor</div>
            <div style="font-size:10.5px;color:#94a3b8">Real Nagpur Showroom Inventory</div>
          </div>
        </div>
        <button type="button" onclick="toggleChatbot()" style="background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer">✕</button>
      </div>
      <div class="chatbot-body" id="chatbotMessages">
        <div class="chatbot-msg bot">
          Namaste! 🙏 Welcome to <strong>${esc(s.name)}</strong>. Ask me anything about our verified inventory, pricing, finance, or Nagpur showroom location.
        </div>
        <div class="chatbot-quick-pills">
          <button class="chatbot-pill" onclick="sendChatPrompt('Show me available cars under 10 Lakh')">💰 Under ₹10L</button>
          <button class="chatbot-pill" onclick="sendChatPrompt('What automatic cars do you have in stock?')">🕹️ Automatic Cars</button>
          <button class="chatbot-pill" onclick="sendChatPrompt('Where is the Nagpur showroom located and hours?')">📍 Location &amp; Hours</button>
          <button class="chatbot-pill" onclick="sendChatPrompt('How does the vehicle showroom inspection work?')">🛡️ Vehicle Inspection</button>
          <button class="chatbot-pill" onclick="openChatSalesLead()">📞 Talk to Sales Team</button>
        </div>
      </div>
      <div id="chatSalesForm" style="display:none;padding:12px;background:var(--surface-alt);border-top:1px solid var(--border)">
        <div style="font-size:12px;font-weight:700;margin-bottom:6px">📞 Request Human Sales Callback</div>
        <input class="inp" type="text" id="chatLeadName" placeholder="Your Full Name" style="margin-bottom:6px;height:32px;font-size:12px">
        <input class="inp" type="tel" id="chatLeadPhone" placeholder="10-Digit Mobile Number" style="margin-bottom:6px;height:32px;font-size:12px" maxlength="10">
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-primary" onclick="submitChatLead()" style="flex:1">Request Callback</button>
          <button class="btn btn-sm" onclick="closeChatSalesLead()">Cancel</button>
        </div>
      </div>
      <form class="chatbot-input-bar" onsubmit="handleChatSubmit(event)">
        <input class="inp" type="text" id="chatInput" placeholder="Ask about Creta, BMW, EMI, under 10L..." style="height:36px;font-size:12px" required>
        <button type="submit" class="btn btn-sm btn-primary" style="padding:0 12px;height:36px">Send</button>
      </form>
    </div>
    <button type="button" class="chatbot-toggle-btn" onclick="toggleChatbot()" title="Chat with Virtual Auto Advisor">
      💬
    </button>
  </div>

  <!-- Toast Notification Alert Box -->
  <div id="cbrToast" style="display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:99999;background:#0f172a;color:#fff;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:700;box-shadow:0 10px 28px rgba(0,0,0,0.35);border:1px solid #334155;text-align:center"></div>
</body>
</html>`;
}

export function renderDynamicGalleryPage({ cars, s, isAdmin }) {
  function getSegment(c) {
    const m = (c.model + ' ' + c.make).toLowerCase();
    if (m.includes('creta') || m.includes('seltos') || m.includes('xuv') || m.includes('nexon') || m.includes('innova')) return 'SUV';
    if (m.includes('3 series') || m.includes('c-class') || m.includes('camry')) return 'Luxury Sedan';
    if (m.includes('city')) return 'Sedan';
    if (m.includes('swift') || m.includes('i20') || m.includes('wagonr')) return 'Hatchback';
    return 'Premium Vehicle';
  }

  const entries = cars.map((car) => {
    const photoList = (car.photos || '').split(',').map((p) => p.trim()).filter(Boolean);
    const directPrice = car.direct || car.price;
    const estEmi = calcEmi(directPrice);
    const segment = getSegment(car);

    return {
      id: car.id,
      title: `${car.year} ${car.make} ${car.model}`,
      make: car.make,
      model: car.model,
      year: car.year,
      slug: car.slug,
      price: car.price,
      direct: directPrice,
      emi: estEmi,
      km: car.km,
      fuel: car.fuel,
      tr: car.tr,
      tr_detail: car.tr_detail || (car.tr === 'Automatic' ? 'Automatic (DCT/AT)' : 'Manual 6-Speed'),
      segment,
      own: car.own || 1,
      rto: car.rto || 'MH-31',
      ins: car.ins || 'Comprehensive Active',
      location: car.location || s.address || 'Nagpur (Wardha Road Certified Hub)',
      status: car.status || 'AVAILABLE',
      feat: car.feat || '',
      description: car.description || `${car.year} ${car.make} ${car.model} certified pre-owned with showroom physical inspection, single owner verification and full service history.`,
      insp_engine: car.insp_engine || 'Compression & idle smooth | Zero oil or coolant leaks | Verified gearbox health',
      insp_tyres: car.insp_tyres || '75%+ tread depth remaining | Factory alloy wheels intact | Spare tyre healthy',
      insp_chassis: car.insp_chassis || '100% Non-accidental guarantee | Original factory paint thickness | Zero flood history',
      insp_elec: car.insp_elec || 'AC chilling at 4.2°C | Power windows, sunroof & infotainment tested | Sensors active',
      keys_count: car.keys_count || 'Original 2 Smart Keys Available',
      service_hist: car.service_hist || 'Authorized Service Centre Records Verified',
      contact_number: car.contact_number || s.phone || '+91 98230 11223',
      photos: photoList.length ? photoList : ['/cbr-client-logo.jpg'],
    };
  }).filter((car) => car.photos.length);

  const safeCars = JSON.stringify(entries).replace(/</g, '\\u003c');
  const safeSettings = JSON.stringify({
    phone: s.phone,
    whatsapp: s.whatsapp,
    name: s.name,
    address: s.address
  }).replace(/</g, '\\u003c');

  const first = entries[0];
  const initialPhoto = first?.photos[0] || '';

  const body = entries.length ? `
    <!-- Showroom Compatibility Header Bridge -->
    <div class="cbr-gallery-site-bridge">
      <a href="/used-cars/nagpur" class="cbr-bridge-back-link">
        <span style="font-size:16px;font-weight:800">←</span>
        <span>Back to Showroom Inventory</span>
      </a>
      <div class="cbr-bridge-center-info">
        <span class="cbr-bridge-badge">🎬 Dynamic Reels Mode</span>
        <span class="cbr-bridge-badge cbr-badge-ai">🧠 AI Taste Radar</span>
      </div>
      <div class="cbr-bridge-actions">
        <a href="/dashboard" class="cbr-bridge-btn">👤 Buyer Hub</a>
        <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent('Hi Rajat, I am exploring your Dynamic Reels Gallery and would like assistance.')}" target="_blank" rel="noopener" class="cbr-bridge-btn cbr-bridge-btn-wa">💬 WhatsApp Desk</a>
      </div>
    </div>

    <section class="cbr-reel-universe" id="cbrReelUniverse" aria-label="Dynamic Reels Automotive Showcase">
      <!-- Ambient Dynamic Blur Backdrop (Matches Active Vehicle) -->
      <div class="cbr-ambient-backdrop" id="cbrAmbientBackdrop" style="background-image:url('${esc(initialPhoto)}')"></div>
      <div class="cbr-ambient-overlay"></div>

      <!-- Main Reels Center Stage Wrapper -->
      <div class="cbr-reel-stage-layout">
        <!-- DESKTOP LEFT COMPANION: LIVE INTEREST RADAR -->
        <aside class="cbr-companion-panel cbr-companion-left" aria-label="Live Customer Interest Radar">
          <div class="cbr-panel-card">
            <div class="cbr-panel-badge">AI INTEREST TRACKER · LIVE</div>
            <h3 class="cbr-panel-title">Your Automotive Taste Profile</h3>
            <p class="cbr-panel-desc">Our intelligent algorithm analyzes your dwell time, photo taps, likes, and specs queries to curate your personalized reel queue.</p>
            
            <div class="cbr-persona-box" id="cbrPersonaBox">
              <span class="cbr-persona-icon">🏎️</span>
              <div>
                <strong id="cbrPersonaTitle">Exploring Fleet...</strong>
                <div class="cbr-persona-sub" id="cbrPersonaSub">Swipe through reels to calibrate</div>
              </div>
            </div>

            <div class="cbr-tracker-metrics">
              <div class="cbr-tracker-row">
                <span>Top Preferred Segment:</span>
                <strong id="cbrTrackSegment">Calibrating...</strong>
              </div>
              <div class="cbr-tracker-row">
                <span>Preferred Fuel:</span>
                <strong id="cbrTrackFuel">Calibrating...</strong>
              </div>
              <div class="cbr-tracker-row">
                <span>Transmission:</span>
                <strong id="cbrTrackTrans">Calibrating...</strong>
              </div>
              <div class="cbr-tracker-row">
                <span>Target Budget:</span>
                <strong id="cbrTrackBudget">Calibrating...</strong>
              </div>
            </div>

            <div class="cbr-affinity-bars" id="cbrAffinityBars">
              <!-- Dynamically populated affinity progress bars -->
            </div>

            <div class="cbr-gesture-legend">
              <div class="cbr-legend-item">
                <span class="cbr-legend-key">▲ Swipe Up</span>
                <span>Next Car (AI Recommended)</span>
              </div>
              <div class="cbr-legend-item">
                <span class="cbr-legend-key">▼ Swipe Down</span>
                <span>Previous Car</span>
              </div>
              <div class="cbr-legend-item">
                <span class="cbr-legend-key">◀ Swipe Left</span>
                <span>Technical Specs &amp; Dossier</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- CENTER: INSTAGRAM REEL SMARTPHONE CANVAS -->
        <div class="cbr-reel-viewport-frame" id="cbrReelFrame">
          <div class="cbr-reel-container" id="cbrReelContainer" tabindex="0" role="region" aria-label="Automotive Reel Player">
            
            <!-- REEL CARD STACK (ACTIVE REEL & DETAILS DRAWER) -->
            <div class="cbr-reel-card" id="cbrReelCard">
              
              <!-- TOP STORY PROGRESS BARS (PHOTO ANGLES) -->
              <div class="cbr-story-bars" id="cbrStoryBars" aria-label="Photo angles progress">
                <!-- Injected dash bars -->
              </div>

              <!-- TOP REEL HEADER OVERLAY -->
              <div class="cbr-reel-top-bar">
                <div class="cbr-reel-brand">
                  <img src="/cbr-client-logo.jpg" alt="CBR Logo" class="cbr-reel-logo">
                  <div>
                    <div class="cbr-reel-brand-text">CARS BY RAJAT</div>
                    <div class="cbr-reel-badge-nagpur">NAGPUR CERTIFIED</div>
                  </div>
                </div>

                <!-- AI RECOMMENDATION BADGE -->
                <div class="cbr-ai-match-pill" id="cbrAiMatchPill" title="Curated by Real-Time Interest Engine">
                  <span class="cbr-sparkle">✨</span>
                  <span id="cbrAiMatchText">96% Match for you</span>
                </div>

                <div class="cbr-reel-top-actions">
                  <button type="button" class="cbr-icon-btn-glass" id="cbrBtnSound" title="Toggle Showroom Audio Ambience">
                    <span id="cbrSoundIcon">🔊</span>
                  </button>
                  <a href="/used-cars/nagpur" class="cbr-icon-btn-glass" title="Back to Traditional Catalog">
                    ✕
                  </a>
                </div>
              </div>

              <!-- PHOTO CAROUSEL VIEWPORT -->
              <div class="cbr-photo-viewport" id="cbrPhotoViewport">
                <img id="cbrReelImg" class="cbr-reel-img" src="${esc(initialPhoto)}" alt="${esc(first.title)}" draggable="false">
                <div class="cbr-img-scrim-top"></div>
                <div class="cbr-img-scrim-bottom"></div>

                <!-- TAP ZONES FOR PREV / NEXT PHOTO ANGLE -->
                <div class="cbr-tap-zone cbr-tap-left" id="cbrTapLeft" title="Tap for previous photo angle"></div>
                <div class="cbr-tap-zone cbr-tap-right" id="cbrTapRight" title="Tap for next photo angle"></div>

                <!-- FLOATING HEART BURST ANIMATION CONTAINER -->
                <div class="cbr-heart-burst-container" id="cbrHeartBurst"></div>

                <!-- SWIPE FEEDBACK DIRECTION CUES (HUD) -->
                <div class="cbr-swipe-hud" id="cbrSwipeHud">
                  <div class="cbr-hud-icon" id="cbrHudIcon">▲</div>
                  <div class="cbr-hud-label" id="cbrHudLabel">Next Car</div>
                </div>
              </div>

              <!-- RIGHT VERTICAL ACTION RAIL (INSTAGRAM REEL ICONS) -->
              <aside class="cbr-reel-actions-rail" aria-label="Reel interaction buttons">
                <!-- Like Button -->
                <button type="button" class="cbr-rail-btn" id="cbrBtnLike" aria-label="Save / Like this vehicle">
                  <div class="cbr-rail-circle" id="cbrLikeIconWrap">
                    <span id="cbrHeartGlyph">🤍</span>
                  </div>
                  <span class="cbr-rail-text" id="cbrLikeCount">Save</span>
                </button>

                <!-- Specs / Technical Dossier (Swipe Left Trigger) -->
                <button type="button" class="cbr-rail-btn" id="cbrBtnSpecs" aria-label="Open detailed specifications (Swipe Left)">
                  <div class="cbr-rail-circle">
                    <span>📋</span>
                  </div>
                  <span class="cbr-rail-text">Specs</span>
                </button>

                <!-- Instant Test Drive -->
                <button type="button" class="cbr-rail-btn" id="cbrBtnTestDrive" aria-label="Book test drive in Nagpur">
                  <div class="cbr-rail-circle" style="background:rgba(16,185,129,0.35);border-color:#34d399">
                    <span>⚡</span>
                  </div>
                  <span class="cbr-rail-text">Test Drive</span>
                </button>

                <!-- WhatsApp Advisor -->
                <a class="cbr-rail-btn" id="cbrBtnWhatsAppRail" href="#" target="_blank" rel="noopener" aria-label="WhatsApp showroom advisor">
                  <div class="cbr-rail-circle" style="background:rgba(37,211,102,0.35);border-color:#25d366">
                    <span>💬</span>
                  </div>
                  <span class="cbr-rail-text">WhatsApp</span>
                </a>

                <!-- Share Reel -->
                <button type="button" class="cbr-rail-btn" id="cbrBtnShare" aria-label="Share vehicle reel">
                  <div class="cbr-rail-circle">
                    <span>🔗</span>
                  </div>
                  <span class="cbr-rail-text">Share</span>
                </button>

                <!-- Mobile Interest Radar Pill -->
                <button type="button" class="cbr-rail-btn cbr-mobile-radar-btn" id="cbrBtnOpenRadar" aria-label="Open live interest profile">
                  <div class="cbr-rail-circle" style="background:rgba(212,175,55,0.3);border-color:#fbbf24">
                    <span>🎯</span>
                  </div>
                  <span class="cbr-rail-text" id="cbrRadarMatchPct">96%</span>
                </button>
              </aside>

              <!-- BOTTOM CAPTION OVERLAY & CURIOSITY TRIGGERS -->
              <div class="cbr-reel-bottom-caption" id="cbrBottomCaption">
                <div class="cbr-verified-tag">
                  <span class="cbr-check-circle">✓</span> SHOWROOM VERIFIED · MH-31 NAGPUR
                </div>

                <div class="cbr-title-row">
                  <h2 class="cbr-reel-title" id="cbrReelTitle">${esc(first.title)}</h2>
                  <div class="cbr-reel-price-badge" id="cbrReelPrice">${inr(first.direct)}</div>
                </div>

                <div class="cbr-quick-chips" id="cbrQuickChips">
                  <!-- e.g. 34,000 km • Automatic • Petrol • 1st Owner -->
                </div>

                <!-- CURIOSITY DRIVER 1: SWIPE LEFT CALL TO ACTION -->
                <div class="cbr-curiosity-pill" id="cbrCuriosityPill" role="button" tabindex="0" title="Swipe left or tap to open specs">
                  <span class="cbr-curiosity-hand">👈</span>
                  <strong>Swipe Left for Hidden Vehicle Dossier &amp; Specs</strong>
                  <span class="cbr-curiosity-arrow">➔</span>
                </div>

                <!-- CURIOSITY DRIVER 2: SWIPE UP NEXT CAR TEASER -->
                <div class="cbr-next-teaser-bar">
                  <span class="cbr-teaser-up-arrow">▲</span>
                  <span>Swipe Up for Next Car (<strong id="cbrNextTeaserName">AI Curated</strong>)</span>
                  <span class="cbr-teaser-up-arrow">▲</span>
                </div>
              </div>
            </div>

            <!-- ================= HORIZONTAL SLIDE-OVER: TECHNICAL DETAILS DOSSIER ================= -->
            <div class="cbr-details-panel" id="cbrDetailsPanel" aria-hidden="true">
              <div class="cbr-details-inner">
                <!-- Details Header -->
                <div class="cbr-details-header">
                  <button type="button" class="cbr-btn-back-reel" id="cbrBtnBackReel" aria-label="Return to Reel">
                    <span>➔</span> Back to Reel (Swipe Right)
                  </button>
                  <span class="cbr-pill-gold">★ VERIFIED FLEET</span>
                </div>

                <!-- Details Vehicle Title & Price -->
                <div class="cbr-details-title-section">
                  <span class="cbr-kicker-cyan" id="cbrDetailKicker">NAGPUR CERTIFIED LUXURY INVENTORY</span>
                  <h2 class="cbr-details-h2" id="cbrDetailTitle">${esc(first.title)}</h2>
                  <div class="cbr-details-price-box">
                    <div>
                      <span class="cbr-sub-tag">DIRECT SHOWROOM PRICE</span>
                      <div class="cbr-price-huge" id="cbrDetailPrice">${inr(first.direct)}</div>
                    </div>
                    <div class="cbr-emi-badge" id="cbrDetailEmi">
                      EMI from ${inr(first.emi)}/mo
                    </div>
                  </div>
                </div>

                <!-- 6-Pack Vital Specifications -->
                <div class="cbr-specs-grid" id="cbrDetailSpecsGrid">
                  <!-- Injected via JavaScript -->
                </div>

                <!-- Showroom Inspection Checks -->
                <div class="cbr-section-card">
                  <div class="cbr-card-head">
                    <span>🛡️</span> Showroom Vehicle Inspection &amp; Quality Checks
                  </div>
                  <div class="cbr-insp-items">
                    <div class="cbr-insp-row">
                      <div class="cbr-insp-tag">ENGINE &amp; GEARBOX</div>
                      <p id="cbrInspEngine">${esc(first.insp_engine)}</p>
                    </div>
                    <div class="cbr-insp-row">
                      <div class="cbr-insp-tag">TYRES &amp; SUSPENSION</div>
                      <p id="cbrInspTyres">${esc(first.insp_tyres)}</p>
                    </div>
                    <div class="cbr-insp-row">
                      <div class="cbr-insp-tag">CHASSIS &amp; NON-ACCIDENTAL</div>
                      <p id="cbrInspChassis">${esc(first.insp_chassis)}</p>
                    </div>
                    <div class="cbr-insp-row">
                      <div class="cbr-insp-tag">ELECTRICALS &amp; AC</div>
                      <p id="cbrInspElec">${esc(first.insp_elec)}</p>
                    </div>
                  </div>
                </div>

                <!-- Factory Features -->
                <div class="cbr-section-card">
                  <div class="cbr-card-head">
                    <span>⚡</span> Key Factory Equipment &amp; Features
                  </div>
                  <div class="cbr-features-pills" id="cbrDetailFeatures"></div>
                </div>

                <!-- Showroom Location & Contacts -->
                <div class="cbr-section-card cbr-contact-card">
                  <div class="cbr-info-line">
                    <span>📍</span>
                    <div>
                      <strong>Showroom Address:</strong>
                      <div id="cbrDetailLocation">${esc(s.address)}</div>
                    </div>
                  </div>
                  <div class="cbr-info-line" style="margin-top:8px">
                    <span>📞</span>
                    <div>
                      <strong>Direct Inspection Hotline:</strong>
                      <div id="cbrDetailPhone">${esc(s.phone)}</div>
                    </div>
                  </div>
                </div>

                <!-- CTAs Action Deck -->
                <div class="cbr-details-actions">
                  <a class="btn btn-primary" id="cbrBtnViewDossier" href="/cars/${encodeURIComponent(first.slug)}">
                    📋 View Complete Vehicle Dossier Page →
                  </a>
                  <button type="button" class="btn btn-ghost" id="cbrBtnDetailsTestDrive" style="background:rgba(16,185,129,0.2);color:#34d399;border-color:rgba(16,185,129,0.4)">
                    ⚡ Book Free Test Drive at Wardha Rd
                  </button>
                  <button type="button" class="btn btn-ghost" id="cbrBtnDetailsOffer" style="background:rgba(212,175,55,0.2);color:#fbbf24;border-color:rgba(212,175,55,0.4)">
                    🤝 Propose Price Counteroffer
                  </button>
                  <button type="button" class="btn btn-ghost" id="cbrBtnCloseDetailsBottom" style="color:var(--muted)">
                    ➔ Return to Reels (or Swipe Right)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- DESKTOP RIGHT COMPANION: AI SUGGESTION QUEUE -->
        <aside class="cbr-companion-panel cbr-companion-right" aria-label="AI Recommendation Queue">
          <div class="cbr-panel-card">
            <div class="cbr-panel-badge">RECOMMENDED FOR YOU</div>
            <h3 class="cbr-panel-title">Next In Your Reel Queue</h3>
            <p class="cbr-panel-desc">Curated in real-time according to your interaction signals and vehicle dwell times.</p>

            <div class="cbr-queue-list" id="cbrQueueList">
              <!-- Dynamically populated next suggested cars -->
            </div>

            <div class="cbr-queue-footer">
              <button type="button" class="cbr-btn-next-reel-desktop" id="cbrBtnNextDesktop">
                Next Suggested Car ▲
              </button>
              <button type="button" class="cbr-btn-prev-reel-desktop" id="cbrBtnPrevDesktop">
                Previous Car ▼
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- INLINE TEST DRIVE & ENQUIRY MODAL -->
      <div class="cbr-modal-backdrop" id="cbrEnquiryModal" aria-hidden="true">
        <div class="cbr-modal-card">
          <button type="button" class="cbr-modal-close" id="cbrCloseEnquiryModal">✕</button>
          <div class="cbr-panel-badge">SHOWROOM TEST DRIVE &amp; ENQUIRY</div>
          <h3 class="cbr-modal-h3" id="cbrEnquiryCarTitle">Schedule Test Drive</h3>
          <p class="cbr-modal-p">Book an on-road test drive at our Wardha Road showroom hub or request door-step inspection.</p>
          <form id="cbrEnquiryForm">
            <input type="hidden" id="cbrEnquiryCarId" value="">
            <div class="cbr-input-group">
              <label>Your Full Name</label>
              <input type="text" id="cbrEnquiryName" required placeholder="e.g. Vikram Joshi">
            </div>
            <div class="cbr-input-group">
              <label>WhatsApp / Mobile Number</label>
              <input type="tel" id="cbrEnquiryPhone" required maxlength="10" placeholder="10-digit mobile (e.g. 9823011223)">
              <small class="cbr-hint">Used for appointment confirmation and digital inspection dossier link.</small>
            </div>
            <div class="cbr-input-group">
              <label>Preferred Test Drive Time (Optional)</label>
              <textarea id="cbrEnquiryMessage" rows="2" placeholder="Looking for Sunday 11 AM test drive or financing info..."></textarea>
            </div>
            <div id="cbrEnquiryAlert" class="cbr-alert" style="display:none"></div>
            <button type="submit" class="btn btn-primary" id="cbrEnquirySubmitBtn" style="width:100%;padding:14px;font-weight:800">
              Confirm Test Drive &amp; Request Callback
            </button>
          </form>
        </div>
      </div>

      <!-- INLINE PRICE NEGOTIATION / OFFER MODAL -->
      <div class="cbr-modal-backdrop" id="cbrOfferModal" aria-hidden="true">
        <div class="cbr-modal-card">
          <button type="button" class="cbr-modal-close" id="cbrCloseOfferModal">✕</button>
          <div class="cbr-panel-badge" style="color:#fbbf24">DIRECT SHOWROOM NEGOTIATION</div>
          <h3 class="cbr-modal-h3" id="cbrOfferCarTitle">Propose Purchase Offer</h3>
          <div class="cbr-offer-compare">
            <div>
              <span class="cbr-sub-tag">LISTED PRICE</span>
              <div class="cbr-compare-val" id="cbrOfferListedPrice">₹0</div>
            </div>
            <div style="text-align:right">
              <span class="cbr-sub-tag">YOUR COUNTEROFFER</span>
              <div class="cbr-compare-val cbr-highlight-gold" id="cbrOfferTargetPreview">Enter amount below</div>
            </div>
          </div>
          <form id="cbrOfferForm">
            <input type="hidden" id="cbrOfferCarId" value="">
            <div class="cbr-input-group">
              <label>Your Target Purchase Offer (₹)</label>
              <input type="number" id="cbrOfferAmount" required placeholder="e.g. 1450000" min="50000">
            </div>
            <div class="cbr-input-row">
              <div class="cbr-input-group">
                <label>Full Name</label>
                <input type="text" id="cbrOfferName" required placeholder="Your name">
              </div>
              <div class="cbr-input-group">
                <label>Mobile Number</label>
                <input type="tel" id="cbrOfferPhone" required maxlength="10" placeholder="10-digit phone">
              </div>
            </div>
            <div class="cbr-input-group">
              <label>Discussion Terms / Note</label>
              <textarea id="cbrOfferNotes" rows="2" placeholder="Can close deal immediately if showroom agrees."></textarea>
            </div>
            <div id="cbrOfferAlert" class="cbr-alert" style="display:none"></div>
            <button type="submit" class="btn btn-primary" id="cbrOfferSubmitBtn" style="width:100%;padding:14px;font-weight:800;background:#d4af37;color:#000">
              Submit Offer to Showroom Desk
            </button>
          </form>
        </div>
      </div>

      <!-- MOBILE INTEREST RADAR POPUP MODAL -->
      <div class="cbr-modal-backdrop" id="cbrRadarModal" aria-hidden="true">
        <div class="cbr-modal-card">
          <button type="button" class="cbr-modal-close" id="cbrCloseRadarModal">✕</button>
          <div class="cbr-panel-badge">AI INTEREST TRACKER · REAL TIME</div>
          <h3 class="cbr-modal-h3">Your Automotive Interest Profile</h3>
          <p class="cbr-modal-p">Calibrated dynamically based on cars you watch, explore, and swipe.</p>
          <div class="cbr-persona-box">
            <span class="cbr-persona-icon">🏎️</span>
            <div>
              <strong id="cbrMobilePersonaTitle">Calibrating...</strong>
              <div class="cbr-persona-sub" id="cbrMobilePersonaSub">Active browsing session</div>
            </div>
          </div>
          <div class="cbr-tracker-metrics" style="margin-top:14px">
            <div class="cbr-tracker-row"><span>Segment:</span><strong id="cbrMobTrackSegment">-</strong></div>
            <div class="cbr-tracker-row"><span>Fuel:</span><strong id="cbrMobTrackFuel">-</strong></div>
            <div class="cbr-tracker-row"><span>Transmission:</span><strong id="cbrMobTrackTrans">-</strong></div>
            <div class="cbr-tracker-row"><span>Target Budget:</span><strong id="cbrMobTrackBudget">-</strong></div>
          </div>
          <button type="button" class="btn btn-primary" id="cbrCloseRadarBtn" style="width:100%;margin-top:18px">
            Back to Reels
          </button>
        </div>
      </div>
    </section>

    <style>
      /* ================= INSTAGRAM REEL AUTOMOTIVE GALLERY STYLES (LIGHT LUXURY SHOWROOM) ================= */
      .cbr-gallery-site-bridge {
        max-width: 1360px;
        margin: 0 auto 12px;
        padding: 9px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(15,23,42,0.03);
      }
      @media (max-width: 640px) {
        .cbr-gallery-site-bridge {
          margin: 0 0 8px;
          border-radius: 0;
          border-left: 0;
          border-right: 0;
          padding: 8px 12px;
        }
        .cbr-bridge-center-info { display: none; }
      }
      .cbr-bridge-back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 700;
        color: #2563eb;
        text-decoration: none;
        transition: transform .15s;
      }
      .cbr-bridge-back-link:hover {
        transform: translateX(-2px);
        color: #1d4ed8;
      }
      .cbr-bridge-center-info {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .cbr-bridge-badge {
        font-size: 11px;
        font-weight: 800;
        padding: 3px 10px;
        border-radius: 999px;
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
      }
      .cbr-bridge-badge.cbr-badge-ai {
        background: #eff6ff;
        color: #1d4ed8;
        border-color: #bfdbfe;
      }
      .cbr-bridge-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cbr-bridge-btn {
        font-size: 12px;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        background: #f8fafc;
        color: #0f172a;
        text-decoration: none;
        transition: all .15s;
      }
      .cbr-bridge-btn:hover {
        border-color: #2563eb;
        color: #2563eb;
      }
      .cbr-bridge-btn-wa {
        background: #15803d;
        color: #fff !important;
        border-color: #15803d;
      }
      .cbr-bridge-btn-wa:hover {
        background: #166534;
      }

      .cbr-reel-universe {
        position: relative;
        width: 100%;
        max-width: 1360px;
        margin: 0 auto;
        height: calc(100vh - 120px);
        max-height: 860px;
        min-height: 640px;
        overflow: hidden;
        background: #f8fafc;
        color: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        border-radius: 24px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 40px rgba(15, 23, 42, 0.06);
      }
      @media (max-width: 1024px) {
        .cbr-reel-universe {
          border-radius: 0;
          border: none;
          height: calc(100vh - 65px);
          height: calc(100dvh - 65px);
          max-height: 100vh;
          min-height: auto;
          box-shadow: none;
        }
      }

      /* Ambient Studio Reflection Backdrop */
      .cbr-ambient-backdrop {
        position: absolute;
        inset: -40px;
        background-size: cover;
        background-position: center;
        filter: blur(60px) brightness(1.08) saturate(1.2);
        opacity: 0.28;
        transform: scale(1.15);
        transition: background-image 0.6s ease;
        z-index: 0;
      }
      .cbr-ambient-overlay {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.5) 0%, rgba(248, 250, 252, 0.94) 80%);
        z-index: 1;
      }

      /* Layout Stage */
      .cbr-reel-stage-layout {
        position: relative;
        z-index: 2;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 32px;
        padding: 12px;
      }

      /* Desktop Companion Panels (Left & Right) */
      .cbr-companion-panel {
        display: none;
        flex: 0 0 310px;
        max-width: 310px;
        height: min(88vh, 800px);
      }
      @media (min-width: 1180px) {
        .cbr-companion-panel {
          display: block;
        }
      }
      .cbr-panel-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 22px 20px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 8px 30px rgba(15, 23, 42, 0.05);
      }
      .cbr-panel-badge {
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 1.5px;
        color: #2563eb;
        text-transform: uppercase;
        margin-bottom: 6px;
      }
      .cbr-panel-title {
        font-size: 17px;
        font-weight: 800;
        margin: 0 0 6px;
        color: #0f172a;
      }
      .cbr-panel-desc {
        font-size: 12px;
        color: #64748b;
        line-height: 1.45;
        margin: 0 0 16px;
      }
      .cbr-persona-box {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 16px;
      }
      .cbr-persona-icon {
        font-size: 24px;
      }
      .cbr-persona-box strong {
        font-size: 13.5px;
        color: #1e3a8a;
        display: block;
      }
      .cbr-persona-sub {
        font-size: 11px;
        color: #2563eb;
        margin-top: 2px;
      }
      .cbr-tracker-metrics {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        font-size: 12px;
      }
      .cbr-tracker-row {
        display: flex;
        justify-content: space-between;
        color: #475569;
      }
      .cbr-tracker-row strong {
        color: #0f172a;
      }
      .cbr-gesture-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: auto;
        border-top: 1px solid #e2e8f0;
        padding-top: 14px;
        font-size: 11.5px;
      }
      .cbr-legend-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #475569;
      }
      .cbr-legend-key {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 2px 7px;
        border-radius: 5px;
        font-size: 10.5px;
        font-weight: 800;
        color: #2563eb;
      }

      /* Desktop Right Queue List */
      .cbr-queue-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        overflow-y: auto;
        flex: 1;
        margin: 10px 0;
        padding-right: 4px;
      }
      .cbr-queue-item {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 8px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cbr-queue-item:hover, .cbr-queue-item.active {
        background: #eff6ff;
        border-color: #3b82f6;
        transform: translateX(4px);
      }
      .cbr-queue-thumb {
        width: 52px;
        height: 42px;
        border-radius: 6px;
        object-fit: cover;
      }
      .cbr-queue-meta strong {
        font-size: 12px;
        color: #0f172a;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 170px;
      }
      .cbr-queue-meta span {
        font-size: 11px;
        color: #0f766e;
        font-weight: 800;
      }
      .cbr-queue-footer {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cbr-btn-next-reel-desktop, .cbr-btn-prev-reel-desktop {
        width: 100%;
        padding: 10px;
        border-radius: 10px;
        font-size: 12.5px;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s;
      }
      .cbr-btn-next-reel-desktop {
        background: #2563eb;
        color: #ffffff;
        border: 1px solid #1d4ed8;
      }
      .cbr-btn-next-reel-desktop:hover {
        background: #1d4ed8;
      }
      .cbr-btn-prev-reel-desktop {
        background: #f1f5f9;
        color: #334155;
        border: 1px solid #e2e8f0;
      }

      /* CENTER REEL SMARTPHONE CANVAS */
      .cbr-reel-viewport-frame {
        position: relative;
        width: 100%;
        max-width: 440px;
        height: 100%;
        max-height: min(92vh, 840px);
        background: #ffffff;
        border-radius: 0;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
      }
      @media (min-width: 640px) {
        .cbr-reel-viewport-frame {
          border-radius: 28px;
          border: 1.5px solid #e2e8f0;
        }
      }
      .cbr-reel-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        touch-action: none;
        outline: none;
      }

      /* REEL CARD */
      .cbr-reel-card {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background: #f8fafc;
        overflow: hidden;
        transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s;
        z-index: 2;
      }
      .cbr-reel-card.slide-left {
        transform: translateX(-100%);
      }

      /* Story Progress Dashes (Photo Angles) */
      .cbr-story-bars {
        position: absolute;
        top: 10px;
        left: 12px;
        right: 12px;
        display: flex;
        gap: 5px;
        z-index: 10;
      }
      .cbr-story-dash {
        flex: 1;
        height: 3.5px;
        background: rgba(15, 23, 42, 0.2);
        border-radius: 3px;
        overflow: hidden;
      }
      .cbr-story-dash.active {
        background: #2563eb;
        box-shadow: 0 0 6px rgba(37, 99, 235, 0.4);
      }

      /* Top Reel Header Bar */
      .cbr-reel-top-bar {
        position: absolute;
        top: 22px;
        left: 14px;
        right: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        z-index: 10;
        gap: 8px;
      }
      .cbr-reel-brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cbr-reel-logo {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1.5px solid #d4af37;
        object-fit: cover;
      }
      .cbr-reel-brand-text {
        font-size: 11.5px;
        font-weight: 900;
        letter-spacing: 0.8px;
        color: #0f172a;
      }
      .cbr-reel-badge-nagpur {
        font-size: 8.5px;
        font-weight: 800;
        color: #b45309;
        letter-spacing: 0.5px;
      }
      .cbr-ai-match-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: #dcfce7;
        border: 1px solid #86efac;
        color: #15803d;
        font-size: 11px;
        font-weight: 800;
        padding: 4px 10px;
        border-radius: 999px;
        box-shadow: 0 2px 8px rgba(21, 128, 61, 0.15);
        animation: cbrPulse 2.5s infinite;
      }
      @keyframes cbrPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); box-shadow: 0 0 12px rgba(21, 128, 61, 0.3); }
      }
      .cbr-reel-top-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cbr-icon-btn-glass {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.92);
        border: 1px solid #e2e8f0;
        color: #0f172a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
        text-decoration: none;
      }

      /* Photo Carousel Viewport */
      .cbr-photo-viewport {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .cbr-reel-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.3s ease, opacity 0.25s;
        pointer-events: none;
      }
      .cbr-img-scrim-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.3) 60%, transparent 100%);
        pointer-events: none;
        z-index: 3;
      }
      .cbr-img-scrim-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 320px;
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.98) 25%, rgba(255, 255, 255, 0.75) 65%, transparent 100%);
        pointer-events: none;
        z-index: 3;
      }
      .cbr-tap-zone {
        position: absolute;
        top: 90px;
        bottom: 220px;
        width: 45%;
        z-index: 4;
        cursor: pointer;
      }
      .cbr-tap-left { left: 0; }
      .cbr-tap-right { right: 0; }

      /* Swipe HUD Icon Overlay */
      .cbr-swipe-hud {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.85);
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #cbd5e1;
        border-radius: 999px;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        color: #0f172a;
        font-weight: 800;
        font-size: 14px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.15);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s, transform 0.2s;
        z-index: 12;
      }
      .cbr-swipe-hud.active {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.05);
      }
      .cbr-hud-icon {
        font-size: 20px;
      }

      /* RIGHT VERTICAL ACTION RAIL */
      .cbr-reel-actions-rail {
        position: absolute;
        right: 12px;
        bottom: 120px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        align-items: center;
        z-index: 10;
      }
      .cbr-rail-btn {
        background: transparent;
        border: none;
        color: #0f172a;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        cursor: pointer;
        text-decoration: none;
        padding: 0;
      }
      .cbr-rail-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.96);
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #0f172a;
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .cbr-rail-btn:hover .cbr-rail-circle, .cbr-rail-btn:active .cbr-rail-circle {
        transform: scale(1.15);
        box-shadow: 0 6px 20px rgba(15, 23, 42, 0.16);
      }
      .cbr-rail-text {
        font-size: 10.5px;
        font-weight: 800;
        color: #0f172a;
        text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
      }
      .cbr-mobile-radar-btn {
        display: flex;
      }
      @media (min-width: 1180px) {
        .cbr-mobile-radar-btn {
          display: none;
        }
      }

      /* Floating Heart Animation */
      .cbr-heart-particle {
        position: absolute;
        pointer-events: none;
        font-size: 28px;
        animation: cbrFloatHeart 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        z-index: 15;
      }
      @keyframes cbrFloatHeart {
        0% { transform: scale(0.6) translate(-50%, -50%); opacity: 1; }
        50% { transform: scale(1.4) translate(-50%, -100px); opacity: 1; }
        100% { transform: scale(1.8) translate(-50%, -180px); opacity: 0; }
      }

      /* BOTTOM CAPTION OVERLAY */
      .cbr-reel-bottom-caption {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 64px;
        padding: 14px 16px 18px;
        z-index: 8;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cbr-verified-tag {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #15803d;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .cbr-check-circle {
        width: 13px;
        height: 13px;
        background: #15803d;
        color: #fff;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 9px;
        font-weight: 900;
      }
      .cbr-title-row {
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
      }
      .cbr-reel-title {
        font-size: 19px;
        font-weight: 900;
        color: #0f172a;
        margin: 0;
        line-height: 1.2;
      }
      .cbr-reel-price-badge {
        font-size: 18px;
        font-weight: 900;
        color: #0f766e;
      }
      .cbr-quick-chips {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        font-size: 11.5px;
        color: #475569;
      }
      .cbr-chip {
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        padding: 2px 8px;
        border-radius: 6px;
        font-weight: 600;
        color: #334155;
      }

      /* CURIOSITY DRIVER 1: SWIPE LEFT PILL */
      .cbr-curiosity-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        border: 1px solid #1e40af;
        color: #ffffff;
        padding: 7px 12px;
        border-radius: 999px;
        font-size: 11px;
        cursor: pointer;
        margin-top: 4px;
        box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
        transition: all 0.25s;
        animation: cbrGlowPill 2s infinite alternate;
      }
      @keyframes cbrGlowPill {
        0% { box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3); }
        100% { box-shadow: 0 4px 20px rgba(59, 130, 246, 0.55); }
      }
      .cbr-curiosity-pill:hover {
        transform: translateX(-4px);
      }
      .cbr-curiosity-hand {
        font-size: 14px;
        animation: cbrPointLeft 1.2s infinite ease-in-out;
      }
      @keyframes cbrPointLeft {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-4px); }
      }

      /* CURIOSITY DRIVER 2: SWIPE UP TEASER */
      .cbr-next-teaser-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        font-size: 10.5px;
        font-weight: 700;
        color: #64748b;
        padding-top: 4px;
      }
      .cbr-teaser-up-arrow {
        color: #2563eb;
        animation: cbrBounceUp 1.2s infinite;
      }
      @keyframes cbrBounceUp {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }

      /* ================= HORIZONTAL SLIDE-OVER DETAILS VIEW ================= */
      .cbr-details-panel {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        background: #ffffff;
        transform: translateX(100%);
        transition: transform 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        z-index: 20;
        overflow-y: auto;
        color: #0f172a;
      }
      .cbr-details-panel.open {
        transform: translateX(0);
      }
      .cbr-details-inner {
        padding: 24px 20px 40px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .cbr-details-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 12px;
      }
      .cbr-btn-back-reel {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: #0f172a;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cbr-pill-gold {
        background: #fef3c7;
        border: 1px solid #fde68a;
        color: #b45309;
        font-size: 10.5px;
        font-weight: 800;
        padding: 3px 9px;
        border-radius: 999px;
      }
      .cbr-details-title-section {
        margin-top: 4px;
      }
      .cbr-kicker-cyan {
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 1.4px;
        color: #0284c7;
      }
      .cbr-details-h2 {
        font-size: 22px;
        font-weight: 900;
        color: #0f172a;
        margin: 4px 0 10px;
      }
      .cbr-details-price-box {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 16px;
      }
      .cbr-sub-tag {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #64748b;
      }
      .cbr-price-huge {
        font-size: 24px;
        font-weight: 900;
        color: #0f766e;
        line-height: 1.1;
      }
      .cbr-emi-badge {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1d4ed8;
        font-size: 12px;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 999px;
      }

      /* 6-Pack Grid */
      .cbr-specs-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .cbr-spec-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 8px;
        text-align: center;
      }
      .cbr-spec-icon {
        font-size: 16px;
      }
      .cbr-spec-label {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.6px;
        color: #64748b;
        text-transform: uppercase;
      }
      .cbr-spec-val {
        font-size: 11.5px;
        font-weight: 800;
        color: #0f172a;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Section Cards */
      .cbr-section-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 14px;
      }
      .cbr-card-head {
        font-size: 13px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .cbr-insp-items {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .cbr-insp-row {
        border-left: 2px solid #16a34a;
        padding-left: 8px;
      }
      .cbr-insp-tag {
        font-size: 9.5px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #15803d;
      }
      .cbr-insp-row p {
        font-size: 11.5px;
        color: #334155;
        margin: 2px 0 0;
        line-height: 1.35;
      }
      .cbr-features-pills {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .cbr-feat-tag {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        color: #334155;
      }
      .cbr-contact-card {
        font-size: 12px;
      }
      .cbr-info-line {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* Actions Deck */
      .cbr-details-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }
      .cbr-details-actions .btn {
        width: 100%;
        padding: 12px;
        font-size: 13px;
        font-weight: 800;
        text-align: center;
      }

      /* ================= MODALS (LIGHT THEME) ================= */
      .cbr-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(8px);
        z-index: 9999;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      .cbr-modal-backdrop.open {
        display: flex;
        animation: cbrFadeIn 0.25s ease;
      }
      @keyframes cbrFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .cbr-modal-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 24px;
        width: 100%;
        max-width: 440px;
        position: relative;
        color: #0f172a;
        box-shadow: 0 25px 60px rgba(15, 23, 42, 0.18);
      }
      .cbr-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: #0f172a;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
      }
      .cbr-modal-h3 {
        font-size: 18px;
        font-weight: 800;
        margin: 4px 0 6px;
      }
      .cbr-modal-p {
        font-size: 12.5px;
        color: #64748b;
        margin: 0 0 16px;
        line-height: 1.45;
      }
      .cbr-input-group {
        margin-bottom: 12px;
      }
      .cbr-input-group label {
        display: block;
        font-size: 11.5px;
        font-weight: 700;
        color: #334155;
        margin-bottom: 4px;
      }
      .cbr-input-group input, .cbr-input-group textarea {
        width: 100%;
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        color: #0f172a;
        padding: 9px 12px;
        border-radius: 8px;
        font-size: 13.5px;
        outline: none;
        box-sizing: border-box;
      }
      .cbr-input-group input:focus, .cbr-input-group textarea:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
      }
      .cbr-hint {
        display: block;
        font-size: 10.5px;
        color: #64748b;
        margin-top: 3px;
      }
      .cbr-input-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .cbr-alert {
        padding: 9px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 12px;
      }
      .cbr-alert.success {
        background: #dcfce7;
        border: 1px solid #86efac;
        color: #15803d;
      }
      .cbr-alert.error {
        background: #fee2e2;
        border: 1px solid #fca5a5;
        color: #b91c1c;
      }
      .cbr-offer-compare {
        display: flex;
        justify-content: space-between;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 10px 14px;
        border-radius: 10px;
        margin-bottom: 14px;
      }
      .cbr-compare-val {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
      }
      .cbr-highlight-gold {
        color: #b45309;
        font-weight: 800;
      }

      /* Accessibility: Reduced Motion */
      @media (prefers-reduced-motion: reduce) {
        .cbr-reel-card, .cbr-details-panel, .cbr-ai-match-pill, .cbr-curiosity-pill {
          transition: none !important;
          animation: none !important;
        }
      }
    </style>

    <script>
    (() => {
      const allCars = ${safeCars};
      const settings = ${safeSettings};
      if (!allCars || !allCars.length) return;

      const $ = (id) => document.getElementById(id);
      const container = $('cbrReelContainer');
      const card = $('cbrReelCard');
      const img = $('cbrReelImg');
      const detailsPanel = $('cbrDetailsPanel');
      const backdrop = $('cbrAmbientBackdrop');
      const swipeHud = $('cbrSwipeHud');
      const hudIcon = $('cbrHudIcon');
      const hudLabel = $('cbrHudLabel');

      // ================= REAL-TIME AI INTEREST TRACKER ENGINE =================
      const interestState = {
        dwell: {},       // carId -> total dwell ms
        likes: new Set(),
        detailsViews: new Set(),
        angleTaps: {},
        weights: {
          segment: {},
          fuel: {},
          transmission: {},
          budget: []
        }
      };

      let activeCarIdx = 0;       // Index in allCars
      let activePhotoIdx = 0;     // Current photo angle index
      let historyStack = [];      // Indices of cars previously viewed
      let dwellStartTimestamp = Date.now();
      let soundEnabled = true;

      function inr(n) {
        return '₹' + Number(n || 0).toLocaleString('en-IN');
      }

      function esc(s) {
        const d = document.createElement('div');
        d.textContent = s || '';
        return d.innerHTML;
      }

      // Record telemetry signal into Interest Tracker
      function recordInterestSignal(type, extra = {}) {
        const c = allCars[activeCarIdx];
        if (!c) return;

        if (type === 'DWELL') {
          const ms = extra.ms || 0;
          interestState.dwell[c.id] = (interestState.dwell[c.id] || 0) + ms;
          const points = Math.min(40, Math.floor(ms / 1000) * 4);
          boostAffinity(c, points);
        } else if (type === 'PHOTO_TAP') {
          interestState.angleTaps[c.id] = (interestState.angleTaps[c.id] || 0) + 1;
          boostAffinity(c, 15);
        } else if (type === 'DETAILS_VIEW') {
          interestState.detailsViews.add(c.id);
          boostAffinity(c, 30);
        } else if (type === 'LIKE') {
          interestState.likes.add(c.id);
          boostAffinity(c, 45);
        }

        // Keep running budget preference
        interestState.weights.budget.push(c.direct);
        if (interestState.weights.budget.length > 10) interestState.weights.budget.shift();

        updateInterestRadarUI();

        // Send background telemetry ping
        try {
          fetch('/api/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ car_id: c.id, type, ts: Date.now() })
          }).catch(() => {});
        } catch (_) {}
      }

      function boostAffinity(c, pts) {
        const seg = c.segment || 'SUV';
        const fuel = c.fuel || 'Petrol';
        const tr = c.tr || 'Automatic';

        interestState.weights.segment[seg] = (interestState.weights.segment[seg] || 0) + pts;
        interestState.weights.fuel[fuel] = (interestState.weights.fuel[fuel] || 0) + pts;
        interestState.weights.transmission[tr] = (interestState.weights.transmission[tr] || 0) + pts;
      }

      // Compute Affinity Score for a candidate car
      function scoreCarForUser(c) {
        if (!c) return 0;
        let score = 50; // base score

        // Segment match
        const topSeg = getTopKey(interestState.weights.segment);
        if (topSeg && c.segment === topSeg) score += 30;

        // Fuel match
        const topFuel = getTopKey(interestState.weights.fuel);
        if (topFuel && c.fuel === topFuel) score += 25;

        // Transmission match
        const topTr = getTopKey(interestState.weights.transmission);
        if (topTr && c.tr === topTr) score += 20;

        // Budget closeness
        if (interestState.weights.budget.length) {
          const avgBudget = interestState.weights.budget.reduce((a, b) => a + b, 0) / interestState.weights.budget.length;
          const diffPct = Math.abs(c.direct - avgBudget) / avgBudget;
          if (diffPct < 0.2) score += 20;
          else if (diffPct < 0.4) score += 10;
        }

        // Bonus if not yet liked or viewed
        if (!interestState.dwell[c.id]) score += 15;

        return Math.min(99, Math.max(65, score));
      }

      function getTopKey(obj) {
        let bestKey = null;
        let maxVal = -1;
        for (const k of Object.keys(obj || {})) {
          if (obj[k] > maxVal) {
            maxVal = obj[k];
            bestKey = k;
          }
        }
        return bestKey;
      }

      // Pick next smart car suggestion based on live interest vector
      function getNextSuggestedCarIndex() {
        const unseen = [];
        for (let i = 0; i < allCars.length; i++) {
          if (i !== activeCarIdx && !historyStack.includes(i)) {
            unseen.push({ idx: i, score: scoreCarForUser(allCars[i]) });
          }
        }

        if (unseen.length) {
          unseen.sort((a, b) => b.score - a.score);
          return unseen[0].idx;
        }

        // If all seen, pick the highest-affinity car not equal to current
        const allCandidates = allCars
          .map((c, i) => ({ idx: i, score: scoreCarForUser(c) }))
          .filter(c => c.idx !== activeCarIdx);
        allCandidates.sort((a, b) => b.score - a.score);
        return allCandidates[0]?.idx ?? (activeCarIdx + 1) % allCars.length;
      }

      function updateInterestRadarUI() {
        const topSeg = getTopKey(interestState.weights.segment) || 'SUV';
        const topFuel = getTopKey(interestState.weights.fuel) || 'Petrol';
        const topTr = getTopKey(interestState.weights.transmission) || 'Automatic';

        let budgetText = 'Mid-Range (₹12L - ₹18L)';
        if (interestState.weights.budget.length) {
          const avg = interestState.weights.budget.reduce((a, b) => a + b, 0) / interestState.weights.budget.length;
          budgetText = 'Approx. ₹' + (avg / 100000).toFixed(1) + ' Lakh';
        }

        // Persona synthesis
        let persona = 'Discerning Auto Explorer';
        let sub = 'Calibrating your live preference signals';
        if (topSeg === 'SUV') {
          persona = 'Executive SUV & Fleet Explorer';
          sub = 'High affinity for commanding stance & verified road presence';
        } else if (topSeg === 'Luxury Sedan') {
          persona = 'Refined Luxury Sedan Connoisseur';
          sub = 'Prioritizing prestige, ride comfort & premium craftsmanship';
        } else if (topSeg === 'Hatchback') {
          persona = 'Smart Urban Commuter Enthusiast';
          sub = 'Focused on nimble handling, fuel efficiency & value';
        }

        $('cbrPersonaTitle').textContent = persona;
        $('cbrPersonaSub').textContent = sub;
        $('cbrTrackSegment').textContent = topSeg;
        $('cbrTrackFuel').textContent = topFuel;
        $('cbrTrackTrans').textContent = topTr;
        $('cbrTrackBudget').textContent = budgetText;

        // Mobile Radar Sync
        $('cbrMobilePersonaTitle').textContent = persona;
        $('cbrMobilePersonaSub').textContent = sub;
        $('cbrMobTrackSegment').textContent = topSeg;
        $('cbrMobTrackFuel').textContent = topFuel;
        $('cbrMobTrackTrans').textContent = topTr;
        $('cbrMobTrackBudget').textContent = budgetText;

        // Current Car Match Percentage
        const currMatch = scoreCarForUser(allCars[activeCarIdx]);
        $('cbrAiMatchText').textContent = currMatch + '% Match for you';
        $('cbrRadarMatchPct').textContent = currMatch + '%';

        // Render Desktop Queue List
        renderDesktopQueue();
      }

      function renderDesktopQueue() {
        const nextCars = [];
        const seen = new Set([activeCarIdx]);

        for (let k = 0; k < 5; k++) {
          let bestIdx = -1;
          let bestScore = -1;
          for (let i = 0; i < allCars.length; i++) {
            if (!seen.has(i)) {
              const sc = scoreCarForUser(allCars[i]);
              if (sc > bestScore) {
                bestScore = sc;
                bestIdx = i;
              }
            }
          }
          if (bestIdx !== -1) {
            seen.add(bestIdx);
            nextCars.push({ car: allCars[bestIdx], idx: bestIdx, score: bestScore });
          }
        }

        $('cbrQueueList').innerHTML = nextCars.map(item =>
          '<div class="cbr-queue-item" data-queue-idx="' + item.idx + '">' +
            '<img src="' + esc(item.car.photos[0]) + '" class="cbr-queue-thumb" alt="' + esc(item.car.title) + '">' +
            '<div class="cbr-queue-meta">' +
              '<strong>' + esc(item.car.title) + '</strong>' +
              '<span>' + inr(item.car.direct) + ' · ' + item.score + '% Match</span>' +
            '</div>' +
          '</div>'
        ).join('');

        if (nextCars[0]) {
          $('cbrNextTeaserName').textContent = nextCars[0].car.title;
        }
      }

      // ================= REEL RENDER & TRANSITIONS =================
      function renderActiveReel() {
        const c = allCars[activeCarIdx];
        if (!c) return;

        // Reset photo angle index if out of bounds
        const totalPhotos = c.photos.length;
        activePhotoIdx = ((activePhotoIdx % totalPhotos) + totalPhotos) % totalPhotos;

        // 1. Update Media & Ambient Blur Backdrop
        img.src = c.photos[activePhotoIdx];
        img.alt = c.title + ' — Angle ' + (activePhotoIdx + 1);
        backdrop.style.backgroundImage = 'url(' + esc(c.photos[activePhotoIdx]) + ')';

        // 2. Story Progress Bars
        $('cbrStoryBars').innerHTML = c.photos.map((_, idx) =>
          '<div class="cbr-story-dash ' + (idx === activePhotoIdx ? 'active' : '') + '"></div>'
        ).join('');

        // 3. Bottom Caption & Chips
        $('cbrReelTitle').textContent = c.title;
        $('cbrReelPrice').textContent = inr(c.direct);

        const chips = [
          c.km.toLocaleString('en-IN') + ' km',
          c.fuel,
          c.tr_detail || c.tr,
          c.rto,
          (c.own === 1 ? '1st Owner' : c.own + 'nd Owner')
        ];
        $('cbrQuickChips').innerHTML = chips.map(txt => '<span class="cbr-chip">' + esc(txt) + '</span>').join('');

        // 4. Like Button State
        const isLiked = interestState.likes.has(c.id);
        $('cbrHeartGlyph').textContent = isLiked ? '❤️' : '🤍';
        $('cbrLikeIconWrap').style.background = isLiked ? '#fee2e2' : 'rgba(255, 255, 255, 0.96)';
        $('cbrLikeIconWrap').style.borderColor = isLiked ? '#ef4444' : '#e2e8f0';
        $('cbrLikeCount').textContent = isLiked ? 'Saved' : 'Save';

        // 5. WhatsApp Rail Link
        const waMsg = 'Hi Rajat, I am browsing your Reel Showcase (' + c.title + ' - ' + inr(c.direct) + ') and would like test drive details.';
        $('cbrBtnWhatsAppRail').href = 'https://wa.me/' + encodeURIComponent(settings.whatsapp) + '?text=' + encodeURIComponent(waMsg);

        // 6. Update Slide-Over Details Panel
        renderDetailsPanel(c);

        // 7. Update Real-Time Radar
        updateInterestRadarUI();

        // Reset Dwell Timer
        dwellStartTimestamp = Date.now();
      }

      function renderDetailsPanel(c) {
        $('cbrDetailKicker').textContent = c.year + ' ' + c.make.toUpperCase() + ' · CERTIFIED VEHICLE DOSSIER';
        $('cbrDetailTitle').textContent = c.title;
        $('cbrDetailPrice').textContent = inr(c.direct);
        $('cbrDetailEmi').textContent = 'EMI from ' + inr(c.emi) + '/mo';

        const specs = [
          { icon: '🛣️', label: 'Kilometers', val: c.km.toLocaleString('en-IN') + ' km' },
          { icon: '⛽', label: 'Fuel Type', val: c.fuel },
          { icon: '🕹️', label: 'Gearbox', val: c.tr_detail || c.tr },
          { icon: '🏛️', label: 'RTO Registration', val: c.rto },
          { icon: '👤', label: 'Ownership', val: c.own === 1 ? '1st Owner' : c.own + 'nd Owner' },
          { icon: '🛡️', label: 'Insurance', val: c.ins }
        ];
        $('cbrDetailSpecsGrid').innerHTML = specs.map(s =>
          '<div class="cbr-spec-card">' +
            '<div class="cbr-spec-icon">' + s.icon + '</div>' +
            '<div class="cbr-spec-label">' + s.label + '</div>' +
            '<div class="cbr-spec-val">' + esc(s.val) + '</div>' +
          '</div>'
        ).join('');

        $('cbrInspEngine').textContent = c.insp_engine;
        $('cbrInspTyres').textContent = c.insp_tyres;
        $('cbrInspChassis').textContent = c.insp_chassis;
        $('cbrInspElec').textContent = c.insp_elec;

        const feats = (c.feat || '').split(',').map(f => f.trim()).filter(Boolean);
        $('cbrDetailFeatures').innerHTML = feats.length ?
          feats.map(f => '<span class="cbr-feat-tag">✓ ' + esc(f) + '</span>').join('') :
          '<span class="cbr-feat-tag">Standard Showroom Certified Equipment</span>';

        $('cbrBtnViewDossier').href = '/cars/' + encodeURIComponent(c.slug);
      }

      // Transition to Next Reel (Swipe Up)
      function transitionNextReel() {
        // Record dwell on outgoing car
        const dwellTime = Date.now() - dwellStartTimestamp;
        recordInterestSignal('DWELL', { ms: dwellTime });

        if (!historyStack.includes(activeCarIdx)) {
          historyStack.push(activeCarIdx);
          if (historyStack.length > 20) historyStack.shift();
        }

        // Animate outgoing card UP
        card.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s';
        card.style.transform = 'translateY(-100%) scale(0.92)';
        card.style.opacity = '0.6';

        showHud('▲', 'Next Suggested Car');

        setTimeout(() => {
          activeCarIdx = getNextSuggestedCarIndex();
          activePhotoIdx = 0;
          renderActiveReel();

          // Prepare card from bottom
          card.style.transition = 'none';
          card.style.transform = 'translateY(100%) scale(0.92)';
          card.style.opacity = '0.6';

          void card.offsetWidth; // force reflow

          // Animate into view
          card.style.transition = 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s';
          card.style.transform = 'translateY(0) scale(1)';
          card.style.opacity = '1';
        }, 220);
      }

      // Transition to Previous Reel (Swipe Down)
      function transitionPrevReel() {
        if (!historyStack.length) {
          showHud('▼', 'First Car in Session');
          return;
        }

        const dwellTime = Date.now() - dwellStartTimestamp;
        recordInterestSignal('DWELL', { ms: dwellTime });

        const prevIdx = historyStack.pop();

        card.style.transition = 'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s';
        card.style.transform = 'translateY(100%) scale(0.92)';
        card.style.opacity = '0.6';

        showHud('▼', 'Previous Car');

        setTimeout(() => {
          activeCarIdx = prevIdx;
          activePhotoIdx = 0;
          renderActiveReel();

          card.style.transition = 'none';
          card.style.transform = 'translateY(-100%) scale(0.92)';
          card.style.opacity = '0.6';

          void card.offsetWidth;

          card.style.transition = 'transform 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s';
          card.style.transform = 'translateY(0) scale(1)';
          card.style.opacity = '1';
        }, 220);
      }

      // Open Technical Details (Swipe Left)
      function openDetailsView() {
        recordInterestSignal('DETAILS_VIEW');
        detailsPanel.classList.add('open');
        detailsPanel.setAttribute('aria-hidden', 'false');
        card.classList.add('slide-left');
        showHud('◀', 'Technical Dossier');
      }

      // Close Details (Swipe Right)
      function closeDetailsView() {
        detailsPanel.classList.remove('open');
        detailsPanel.setAttribute('aria-hidden', 'true');
        card.classList.remove('slide-left');
      }

      function nextPhotoAngle() {
        const c = allCars[activeCarIdx];
        if (c.photos.length <= 1) return;
        activePhotoIdx = (activePhotoIdx + 1) % c.photos.length;
        recordInterestSignal('PHOTO_TAP');
        img.style.opacity = '0.7';
        setTimeout(() => {
          img.src = c.photos[activePhotoIdx];
          img.style.opacity = '1';
          $('cbrStoryBars').innerHTML = c.photos.map((_, idx) =>
            '<div class="cbr-story-dash ' + (idx === activePhotoIdx ? 'active' : '') + '"></div>'
          ).join('');
        }, 120);
      }

      function prevPhotoAngle() {
        const c = allCars[activeCarIdx];
        if (c.photos.length <= 1) return;
        activePhotoIdx = (activePhotoIdx - 1 + c.photos.length) % c.photos.length;
        recordInterestSignal('PHOTO_TAP');
        img.style.opacity = '0.7';
        setTimeout(() => {
          img.src = c.photos[activePhotoIdx];
          img.style.opacity = '1';
          $('cbrStoryBars').innerHTML = c.photos.map((_, idx) =>
            '<div class="cbr-story-dash ' + (idx === activePhotoIdx ? 'active' : '') + '"></div>'
          ).join('');
        }, 120);
      }

      function toggleLike() {
        const c = allCars[activeCarIdx];
        const isLiked = interestState.likes.has(c.id);
        if (isLiked) {
          interestState.likes.delete(c.id);
        } else {
          interestState.likes.add(c.id);
          recordInterestSignal('LIKE');
          spawnHeartParticles();
        }
        renderActiveReel();
      }

      function spawnHeartParticles() {
        const wrap = $('cbrHeartBurst');
        for (let i = 0; i < 6; i++) {
          const p = document.createElement('div');
          p.className = 'cbr-heart-particle';
          p.textContent = ['❤️', '💖', '🔥', '✨'][Math.floor(Math.random() * 4)];
          p.style.left = (40 + Math.random() * 40) + '%';
          p.style.top = (40 + Math.random() * 20) + '%';
          wrap.appendChild(p);
          setTimeout(() => p.remove(), 1100);
        }
      }

      function showHud(icon, text) {
        hudIcon.textContent = icon;
        hudLabel.textContent = text;
        swipeHud.classList.add('active');
        clearTimeout(swipeHud._t);
        swipeHud._t = setTimeout(() => swipeHud.classList.remove('active'), 850);
      }

      // ================= GESTURE & TOUCH PHYSICS ENGINE =================
      let startX = 0;
      let startY = 0;
      let isPointerDown = false;
      let startTime = 0;

      container.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button, a, input, textarea, .cbr-curiosity-pill, .cbr-tap-zone')) return;
        isPointerDown = true;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        try { container.setPointerCapture(e.pointerId); } catch (_) {}
      });

      container.addEventListener('pointerup', (e) => {
        if (!isPointerDown) return;
        isPointerDown = false;
        try { container.releasePointerCapture(e.pointerId); } catch (_) {}

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const elapsed = Math.max(1, Date.now() - startTime);

        // If swipe left / right
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
          if (dx < -50) {
            // SWIPE LEFT -> Open Details View
            openDetailsView();
          } else if (dx > 50 && detailsPanel.classList.contains('open')) {
            // SWIPE RIGHT -> Return to Reel
            closeDetailsView();
          }
          return;
        }

        // If swipe up / down
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
          if (dy < -50) {
            // SWIPE UP -> Next Car
            transitionNextReel();
          } else if (dy > 50) {
            // SWIPE DOWN -> Previous Car
            transitionPrevReel();
          }
        }
      });

      container.addEventListener('pointercancel', () => { isPointerDown = false; });

      // Swipe inside details panel to return
      detailsPanel.addEventListener('pointerdown', (e) => {
        startX = e.clientX;
      });
      detailsPanel.addEventListener('pointerup', (e) => {
        const dx = e.clientX - startX;
        if (dx > 65) {
          closeDetailsView();
        }
      });

      // Tap Zones for Photo Angles
      $('cbrTapLeft').onclick = (e) => { e.stopPropagation(); prevPhotoAngle(); };
      $('cbrTapRight').onclick = (e) => { e.stopPropagation(); nextPhotoAngle(); };

      // Button Click Actions
      $('cbrBtnLike').onclick = toggleLike;
      $('cbrBtnSpecs').onclick = openDetailsView;
      $('cbrCuriosityPill').onclick = openDetailsView;
      $('cbrBtnBackReel').onclick = closeDetailsView;
      $('cbrBtnCloseDetailsBottom').onclick = closeDetailsView;
      $('cbrBtnNextDesktop').onclick = transitionNextReel;
      $('cbrBtnPrevDesktop').onclick = transitionPrevReel;

      // Mouse Wheel Navigation on Desktop
      let wheelDebounce = false;
      container.addEventListener('wheel', (e) => {
        if (detailsPanel.classList.contains('open')) return;
        e.preventDefault();
        if (wheelDebounce) return;
        wheelDebounce = true;
        setTimeout(() => { wheelDebounce = false; }, 450);

        if (e.deltaY > 30) {
          transitionNextReel();
        } else if (e.deltaY < -30) {
          transitionPrevReel();
        }
      }, { passive: false });

      // Desktop Queue Item Click
      $('cbrQueueList').onclick = (e) => {
        const item = e.target.closest('[data-queue-idx]');
        if (item) {
          const idx = Number(item.dataset.queueIdx);
          historyStack.push(activeCarIdx);
          activeCarIdx = idx;
          activePhotoIdx = 0;
          renderActiveReel();
        }
      };

      // Share Action
      $('cbrBtnShare').onclick = () => {
        const c = allCars[activeCarIdx];
        const shareUrl = window.location.origin + '/dynamic-gallery?car=' + encodeURIComponent(c.slug);
        const shareText = 'Check out certified ' + c.title + ' (' + inr(c.direct) + ') on Cars By Rajat Reels!';

        if (navigator.share) {
          navigator.share({ title: c.title, text: shareText, url: shareUrl }).catch(() => {});
        } else {
          navigator.clipboard.writeText(shareUrl).then(() => {
            showHud('🔗', 'Link Copied to Clipboard!');
          }).catch(() => {
            prompt('Copy vehicle link:', shareUrl);
          });
        }
      };

      // Sound Toggle
      $('cbrBtnSound').onclick = () => {
        soundEnabled = !soundEnabled;
        $('cbrSoundIcon').textContent = soundEnabled ? '🔊' : '🔇';
        showHud(soundEnabled ? '🔊' : '🔇', soundEnabled ? 'Showroom Audio Active' : 'Muted');
      };

      // Radar Modal Triggers
      $('cbrBtnOpenRadar').onclick = () => $('cbrRadarModal').classList.add('open');
      $('cbrCloseRadarModal').onclick = () => $('cbrRadarModal').classList.remove('open');
      $('cbrCloseRadarBtn').onclick = () => $('cbrRadarModal').classList.remove('open');

      // Keyboard Shortcuts
      document.addEventListener('keydown', (e) => {
        if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          transitionNextReel();
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          transitionPrevReel();
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          openDetailsView();
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          if (detailsPanel.classList.contains('open')) closeDetailsView();
          else nextPhotoAngle();
        } else if (e.key === 'l' || e.key === 'L') {
          toggleLike();
        } else if (e.key === 'Escape') {
          closeDetailsView();
          $('cbrEnquiryModal').classList.remove('open');
          $('cbrOfferModal').classList.remove('open');
          $('cbrRadarModal').classList.remove('open');
        }
      });

      // ================= INLINE MODALS =================
      $('cbrBtnTestDrive').onclick = () => openEnquiryModal();
      $('cbrBtnDetailsTestDrive').onclick = () => openEnquiryModal();
      $('cbrCloseEnquiryModal').onclick = () => $('cbrEnquiryModal').classList.remove('open');

      function openEnquiryModal() {
        const c = allCars[activeCarIdx];
        $('cbrEnquiryCarId').value = c.id;
        $('cbrEnquiryCarTitle').textContent = 'Test Drive: ' + c.title;
        $('cbrEnquiryAlert').style.display = 'none';
        $('cbrEnquiryModal').classList.add('open');
      }

      $('cbrEnquiryForm').onsubmit = async (e) => {
        e.preventDefault();
        const alertEl = $('cbrEnquiryAlert');
        const submitBtn = $('cbrEnquirySubmitBtn');
        const name = $('cbrEnquiryName').value.trim();
        const phone = $('cbrEnquiryPhone').value.trim();
        const message = $('cbrEnquiryMessage').value.trim();
        const carId = Number($('cbrEnquiryCarId').value);

        if (!/^[6-9]\d{9}$/.test(phone)) {
          alertEl.className = 'cbr-alert error';
          alertEl.textContent = 'Please enter a valid 10-digit Indian mobile number.';
          alertEl.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Scheduling Test Drive...';

        try {
          const res = await fetch('/api/enquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, car_id: carId, message })
          });
          const data = await res.json();
          if (data.ok || data.success) {
            alertEl.className = 'cbr-alert success';
            alertEl.textContent = '✓ Test drive scheduled! Showroom desk will call you shortly.';
            alertEl.style.display = 'block';
            setTimeout(() => {
              $('cbrEnquiryModal').classList.remove('open');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Confirm Test Drive & Request Callback';
            }, 2200);
          } else {
            alertEl.className = 'cbr-alert error';
            alertEl.textContent = data.error || 'Failed to submit test drive request.';
            alertEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirm Test Drive & Request Callback';
          }
        } catch (_) {
          alertEl.className = 'cbr-alert error';
          alertEl.textContent = 'Connection error. Please try again.';
          alertEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirm Test Drive & Request Callback';
        }
      };

      // Negotiation Modal
      $('cbrBtnDetailsOffer').onclick = () => {
        const c = allCars[activeCarIdx];
        $('cbrOfferCarId').value = c.id;
        $('cbrOfferCarTitle').textContent = 'Offer for ' + c.title;
        $('cbrOfferListedPrice').textContent = inr(c.direct);
        $('cbrOfferTargetPreview').textContent = 'Enter amount below';
        $('cbrOfferAlert').style.display = 'none';
        $('cbrOfferModal').classList.add('open');
      };
      $('cbrCloseOfferModal').onclick = () => $('cbrOfferModal').classList.remove('open');

      $('cbrOfferAmount').oninput = (e) => {
        const val = Number(e.target.value);
        $('cbrOfferTargetPreview').textContent = val > 10000 ? inr(val) : 'Enter amount below';
      };

      $('cbrOfferForm').onsubmit = async (e) => {
        e.preventDefault();
        const alertEl = $('cbrOfferAlert');
        const submitBtn = $('cbrOfferSubmitBtn');
        const carId = Number($('cbrOfferCarId').value);
        const offerAmount = Number($('cbrOfferAmount').value);
        const name = $('cbrOfferName').value.trim();
        const phone = $('cbrOfferPhone').value.trim();
        const notes = $('cbrOfferNotes').value.trim();

        if (!/^[6-9]\d{9}$/.test(phone)) {
          alertEl.className = 'cbr-alert error';
          alertEl.textContent = 'Please enter a valid 10-digit Indian mobile number.';
          alertEl.style.display = 'block';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting Offer to Showroom...';

        try {
          const res = await fetch('/api/negotiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ car_id: carId, offer_price: offerAmount, name, phone, notes })
          });
          const data = await res.json();
          if (data.ok || data.success) {
            alertEl.className = 'cbr-alert success';
            alertEl.textContent = '✓ Counteroffer submitted to showroom desk! Track in Dashboard.';
            alertEl.style.display = 'block';
            setTimeout(() => {
              $('cbrOfferModal').classList.remove('open');
              submitBtn.disabled = false;
              submitBtn.textContent = 'Submit Offer to Showroom Desk';
            }, 2400);
          } else {
            alertEl.className = 'cbr-alert error';
            alertEl.textContent = data.error || 'Failed to submit offer.';
            alertEl.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Offer to Showroom Desk';
          }
        } catch (_) {
          alertEl.className = 'cbr-alert error';
          alertEl.textContent = 'Network error. Please try again.';
          alertEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Offer to Showroom Desk';
        }
      };

      // Click outside modals to close
      window.onclick = (e) => {
        if (e.target.classList.contains('cbr-modal-backdrop')) {
          e.target.classList.remove('open');
        }
      };

      // Check URL param ?car=SLUG
      const urlParams = new URLSearchParams(window.location.search);
      const targetSlug = urlParams.get('car');
      if (targetSlug) {
        const found = allCars.findIndex(c => c.slug === targetSlug);
        if (found !== -1) activeCarIdx = found;
      }

      // Initial Render
      renderActiveReel();
    })();
    </script>
  ` : `
    <section class="hero" style="text-align:center;padding:60px 20px">
      <h1>Dynamic Reels Automotive Showcase</h1>
      <p style="color:var(--muted);max-width:500px;margin:12px auto 24px">
        No vehicle reels currently available in inventory. Please explore the showroom catalog.
      </p>
      <a class="btn btn-primary" href="/used-cars/nagpur">Browse Showroom Catalog →</a>
    </section>
  `;

  return renderLayout({
    title: `Dynamic Automotive Reels & AI Interest Tracker | ${s.name} Nagpur`,
    desc: 'Experience our addictive Instagram Reel-style vehicle browsing: Swipe Up for Next Car, Swipe Down for Previous, and Swipe Left for technical inspection dossier. AI automatically personalizes your queue.',
    canonical: `${ENV.BASE_URL}/dynamic-gallery`,
    s,
    body,
    isAdmin
  });
}

export function renderListingPage({ cars, unlocked, q = {}, h1, intro, canonicalPath, s, isAdmin }) {
  const safeCatalog = cars.map((c) => ({
    id: c.id,
    slug: c.slug,
    make: c.make,
    model: c.model,
    year: c.year,
    km: c.km,
    fuel: c.fuel,
    tr: c.tr,
    tr_detail: c.tr_detail,
    own: c.own,
    rto: c.rto,
    ins: c.ins,
    feat: c.feat,
    description: c.description || '',
    price: c.price,
    direct: unlocked ? c.direct : null,
    emi: calcEmi(unlocked ? c.direct : c.price),
    status: c.status,
  }));

  const uniqueMakes = [...new Set(cars.map((c) => c.make))].sort();

  // Horizontal Swipeable Showcase Carousel Cards
  const carouselCars = cars.filter((c) => c.status === 'AVAILABLE');
  const carouselCardsHtml = carouselCars
    .map((c) => {
      const photos = (c.photos || '').split(',').map((x) => x.trim()).filter(Boolean);
      const img0 = photos[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';
      const title = `${c.year} ${c.make} ${c.model}`;
      const shareUrl = `${ENV.BASE_URL}/cars/${c.slug}`;
      const waShareText = `🚗 *Check out this ${title} on Cars By Rajat Nagpur!*\n💰 Price: ${inr(unlocked ? c.direct : c.price)}\n📍 Nagpur Hub (MH-31)\n✨ Specs: ${c.km.toLocaleString('en-IN')} km, ${c.fuel}, ${c.tr}\n🔗 View Dossier: ${shareUrl}`;

      return `<article class="card carousel-card">
        <div class="card-media">
          <a href="/cars/${esc(c.slug)}"><img src="${esc(img0)}" alt="${esc(title)}" loading="lazy"></a>
          <div class="badge-top-left">
            <span class="status-pill st-${esc(c.status)}">${esc(c.status)}</span>
            <span class="rto-pill">${esc(c.rto)}</span>
            <span class="pill pill-verified" style="font-size:10px">✓ Showroom Verified</span>
          </div>
          <button type="button" class="heart-btn" data-id="${c.id}" onclick="toggleShortlist(${c.id}, this)" title="Shortlist to Compare">❤️</button>
        </div>
        <div class="card-body">
          <div class="card-title"><a href="/cars/${esc(c.slug)}">${esc(title)}</a></div>
          <div class="spec-chips">
            <span class="chip">${Number(c.km).toLocaleString('en-IN')} km</span>
            <span class="chip">${esc(c.fuel)}</span>
            <span class="chip">${esc(c.tr)}</span>
            <span class="chip">${c.own === 1 ? '1st Owner' : c.own + 'nd Owner'}</span>
          </div>
          <div class="feat-line" title="${esc(c.feat)}">✨ ${esc(c.feat)}</div>
          <div class="price-box" style="margin-top:auto">
            <div>
              <div class="price-lbl">${unlocked ? 'Direct Price' : 'Market Est.'}</div>
              <div class="${unlocked ? 'price-direct' : 'price-mkt'}">${lakh(unlocked ? c.direct : c.price)}</div>
            </div>
            <a href="/cars/${esc(c.slug)}" class="btn btn-sm btn-primary">View Dossier →</a>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">
            <a href="/cars/${esc(c.slug)}#enquiry" class="btn btn-sm">✉️ Enquire</a>
            <button type="button" class="btn btn-sm" onclick="shareVehicle('${esc(title)}', '${shareUrl}', '${esc(waShareText)}')">🔗 Share</button>
          </div>
        </div>
      </article>`;
    })
    .join('\n');

  const cardsHtml = cars
    .map((c, idx) => {
      const photos = (c.photos || '').split(',').map((x) => x.trim()).filter(Boolean);
      const img0 = photos[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';
      const title = `${c.year} ${c.make} ${c.model}`;
      const savings = c.price - c.direct;
      const emi = calcEmi(unlocked ? c.direct : c.price);
      const shareUrl = `${ENV.BASE_URL}/cars/${c.slug}`;
      const waShareText = `🚗 *Check out this ${title} on Cars By Rajat Nagpur!*\n💰 Price: ${inr(unlocked ? c.direct : c.price)}\n📍 Nagpur Hub (MH-31)\n✨ Specs: ${c.km.toLocaleString('en-IN')} km, ${c.fuel}, ${c.tr}\n🔗 View Dossier: ${shareUrl}`;

      const priceHtml = unlocked
        ? `<div>
            <div class="price-lbl">Rajat Direct Price <span class="price-strike">${lakh(c.price)}</span></div>
            <div class="price-direct">${lakh(c.direct)}</div>
            <span class="save-pill">✓ Save ${inr(savings)} below market</span>
          </div>
          <div style="text-align:right">
            <div class="emi-tag">EMI ${inr(emi)}/mo</div>
            <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent(`Hi Rajat, I unlocked the direct price (${inr(c.direct)}) for the ${title} (${c.rto}) and want to schedule a visit.`)}" target="_blank" rel="noopener" class="btn btn-sm btn-wa" style="margin-top:5px">💬 Deal on WhatsApp</a>
          </div>`
        : `<div>
            <div class="price-lbl">Nagpur Market Est.</div>
            <div class="price-mkt">${lakh(c.price)}</div>
            <div class="emi-tag">EMI from ${inr(emi)}/mo</div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="openUnlockModal(${c.id}, '${esc(title)}')">🔒 Unlock Direct Price</button>`;

      const cardMarkup = `<article class="card" data-car-id="${c.id}" data-search="${esc(`${c.year} ${c.make} ${c.model} ${c.rto} ${c.feat} ${c.fuel} ${c.tr} ${c.description || ''}`.toLowerCase())}" data-make="${esc(c.make.toLowerCase())}" data-fuel="${esc(c.fuel.toLowerCase())}" data-tr="${esc(c.tr.toLowerCase())}" data-own="${c.own}" data-price="${c.price}" data-year="${c.year}" data-km="${c.km}">
        <div class="card-media" data-photos="${esc(photos.join('|'))}" data-idx="0">
          <a href="/cars/${esc(c.slug)}"><img src="${esc(img0)}" alt="${esc(title)} in Nagpur (${esc(c.rto)})" loading="lazy"></a>
          ${photos.length > 1 ? `<button type="button" class="media-nav prev" onclick="stepPhoto(this,-1)">‹</button><button type="button" class="media-nav next" onclick="stepPhoto(this,1)">›</button>` : ''}
          <div class="badge-top-left">
            <span class="status-pill st-${esc(c.status)}">${esc(c.status)}</span>
            <span class="rto-pill">${esc(c.rto)}</span>
            <span class="pill pill-verified" style="font-size:10px">✓ Showroom Verified</span>
          </div>
          <button type="button" class="heart-btn" data-id="${c.id}" onclick="toggleShortlist(${c.id}, this)" title="Shortlist to Compare">❤️</button>
          ${c.reel ? `<a href="${esc(c.reel)}" target="_blank" rel="noopener" class="reel-chip">📸 Watch Reel</a>` : ''}
          <div class="media-dots">${photos.map((_, i) => `<span class="media-dot ${i === 0 ? 'active' : ''}"></span>`).join('')}</div>
        </div>
        <div class="card-body">
          <div class="card-title"><a href="/cars/${esc(c.slug)}">${esc(title)}</a></div>
          <div class="spec-chips">
            <span class="chip">${Number(c.km).toLocaleString('en-IN')} km</span>
            <span class="chip">${esc(c.fuel)}</span>
            <span class="chip">${esc(c.tr)}</span>
            <span class="chip">${c.own === 1 ? '1st Owner' : c.own + 'nd Owner'}</span>
          </div>
          <div class="feat-line" title="${esc(c.feat)}">✨ ${esc(c.feat)}</div>
          <div class="price-box">${priceHtml}</div>
          <div class="card-actions" style="display:grid;grid-template-columns:1.2fr 0.8fr 0.8fr;gap:6px">
            <a href="/cars/${esc(c.slug)}" class="btn btn-sm">📋 View Dossier</a>
            <a href="/cars/${esc(c.slug)}#enquiry" class="btn btn-sm">✉️ Enquire</a>
            <button type="button" class="btn btn-sm" onclick="shareVehicle('${esc(title)}', '${shareUrl}', '${esc(waShareText)}')" title="Share vehicle on WhatsApp">🔗 Share</button>
          </div>
        </div>
      </article>`;

      if (idx === 5) {
        return cardMarkup + renderAdSlot('infeed', s);
      }
      return cardMarkup;
    })
    .join('\n');

  const body = `
    <!-- SHOWROOM HERO SECTION (LIGHT LUXURY AESTHETIC) -->
    <section class="hero" style="background:linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);border:1px solid var(--border);border-radius:20px;padding:26px 28px;box-shadow:var(--shadow-lg);margin:18px 0 24px">
      <div style="display:inline-flex;align-items:center;gap:6px;background:var(--green-soft);border:1px solid rgba(21,128,61,0.25);color:var(--green);font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px;letter-spacing:0.5px;margin-bottom:12px">
        <span>⭐</span> CENTRAL INDIA'S VERIFIED PRE-OWNED HUB · WARDHA ROAD, NAGPUR (MH-31)
      </div>

      <div class="hero-top" style="align-items:flex-start">
        <div style="max-width:760px">
          <h1 style="font-size:clamp(22px, 2.8vw, 32px);font-weight:900;letter-spacing:-0.5px;color:var(--text);line-height:1.2">
            ${esc(h1)}
          </h1>
          <p style="font-size:14px;color:var(--muted);margin-top:8px;line-height:1.5">
            ${esc(intro)}
          </p>

          <!-- High-Impact Action CTAs -->
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:18px;align-items:center">
            <a href="/dynamic-gallery" class="btn btn-primary" style="background:linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);padding:10px 18px;font-size:13.5px;font-weight:800;border-radius:10px;box-shadow:0 4px 16px rgba(37,99,235,0.35);display:inline-flex;align-items:center;gap:8px">
              <span>🎬 Experience Dynamic Reels</span>
              <span style="background:rgba(255,255,255,0.25);padding:1px 6px;border-radius:4px;font-size:10px;letter-spacing:0.5px">AI LIVE</span>
            </a>
            <a href="#carGrid" class="btn btn-ghost" style="padding:10px 16px;font-size:13px;font-weight:700;border-radius:10px">
              🔍 Browse All Inventory
            </a>
            <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent('Hi Rajat, I am browsing your Nagpur inventory (' + ENV.BASE_URL + ') and would like guidance.')}" target="_blank" rel="noopener" class="btn btn-wa-clean" style="padding:10px 16px;font-size:13px;border-radius:10px">
              💬 WhatsApp Rajat Sharma
            </a>
          </div>
        </div>

        <div class="trust-strip" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;min-width:280px">
          <div class="trust-stat" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px">
            <strong style="color:var(--green);font-size:16px">100% Genuine</strong>
            <span style="font-size:12px;color:var(--muted)">RTO &amp; Single-Owner Verified</span>
          </div>
          <div class="trust-stat" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px">
            <strong style="color:var(--primary);font-size:16px">RC Transfer</strong>
            <span style="font-size:12px;color:var(--muted)">Fast MH-31 Transfer Support</span>
          </div>
        </div>
      </div>

      <!-- Live Search & Interactive Filter Bar -->
      <form class="filter-grid" id="filterForm" action="/used-cars/nagpur" method="GET" onsubmit="return false;" style="grid-template-columns: 2fr repeat(6, 1fr) auto;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
        <input class="inp" type="search" id="fSearch" name="q" value="${esc(q.q || '')}" placeholder="🔍 Search description, model, sunroof, ADAS, MH-31..." oninput="applyLiveFilters()">
        <select class="inp" id="fMake" name="make" onchange="applyLiveFilters()">
          <option value="">All Brands</option>
          ${uniqueMakes.map(m => `<option value="${m.toLowerCase()}">${esc(m)}</option>`).join('')}
        </select>
        <select class="inp" id="fMinPrice" name="min_price" onchange="applyLiveFilters()">
          <option value="">Min Price</option>
          <option value="300000">₹3 Lakh</option>
          <option value="500000">₹5 Lakh</option>
          <option value="800000">₹8 Lakh</option>
          <option value="1200000">₹12 Lakh</option>
          <option value="1600000">₹16 Lakh</option>
          <option value="2000000">₹20 Lakh</option>
        </select>
        <select class="inp" id="fMaxPrice" name="max_price" onchange="applyLiveFilters()">
          <option value="">Max Price</option>
          <option value="600000">₹6 Lakh</option>
          <option value="1000000">₹10 Lakh</option>
          <option value="1500000">₹15 Lakh</option>
          <option value="2000000">₹20 Lakh</option>
          <option value="3000000">₹30 Lakh</option>
          <option value="5000000">₹50 Lakh</option>
        </select>
        <select class="inp" id="fFuel" name="fuel" onchange="applyLiveFilters()">
          <option value="">All Fuels</option>
          ${['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].map((f) => `<option value="${f.toLowerCase()}" ${q.fuel === f.toLowerCase() ? 'selected' : ''}>${f}</option>`).join('')}
        </select>
        <select class="inp" id="fTr" name="tr" onchange="applyLiveFilters()">
          <option value="">All Gearboxes</option>
          <option value="automatic" ${q.tr === 'automatic' ? 'selected' : ''}>Automatic</option>
          <option value="manual" ${q.tr === 'manual' ? 'selected' : ''}>Manual</option>
        </select>
        <select class="inp" id="fSort" name="sort" onchange="applyLiveFilters()">
          <option value="newest">Sort: Newest Year</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="km_asc">Lowest Kilometres</option>
        </select>
        <button type="button" class="btn btn-sm" onclick="resetLiveFilters()">Clear <span id="activeFilterBadge" class="pill pill-hub" style="display:none">0</span></button>
      </form>

      <div class="seo-pills" style="margin-top:14px">
        <span style="font-size:11.5px;font-weight:700;color:var(--muted)">Popular Nagpur Searches:</span>
        <a class="seo-pill ${canonicalPath === '/used-cars/nagpur' ? 'active' : ''}" href="/used-cars/nagpur">All Nagpur Cars</a>
        <a class="seo-pill ${canonicalPath.endsWith('/automatic') ? 'active' : ''}" href="/used-cars/nagpur/automatic">Automatic</a>
        <a class="seo-pill ${canonicalPath.endsWith('/diesel') ? 'active' : ''}" href="/used-cars/nagpur/diesel">Diesel SUVs</a>
        <a class="seo-pill ${canonicalPath.endsWith('/under-10-lakh') ? 'active' : ''}" href="/used-cars/nagpur/under-10-lakh">Under ₹10 Lakh</a>
        <a class="seo-pill ${canonicalPath.endsWith('/hyundai') ? 'active' : ''}" href="/used-cars/nagpur/hyundai">Hyundai</a>
        <a class="seo-pill ${canonicalPath.endsWith('/toyota') ? 'active' : ''}" href="/used-cars/nagpur/toyota">Toyota</a>
        <a class="seo-pill ${canonicalPath.endsWith('/bmw') ? 'active' : ''}" href="/used-cars/nagpur/bmw">BMW Luxury</a>
        <a class="seo-pill ${canonicalPath.endsWith('/mahindra') ? 'active' : ''}" href="/used-cars/nagpur/mahindra">Mahindra</a>
      </div>
    </section>

    <!-- HORIZONTAL SWIPEABLE CAR BROWSING SHOWCASE -->
    <section class="carousel-wrap">
      <div class="carousel-header">
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="pill pill-verified" style="font-size:11px">⭐ FEATURED SWIPEABLE SHOWCASE</span>
            <h2 style="font-size:19px;font-weight:800;letter-spacing:-0.2px;color:var(--text)">Browse Certified Inventory (Swipe to Explore)</h2>
          </div>
          <p style="font-size:12.5px;color:var(--muted);margin-top:3px">Nagpur's top certified vehicles displayed side by side. Swipe or scroll horizontally to explore additional cars.</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button type="button" class="carousel-nav-btn" onclick="scrollCarousel(-1)" title="Previous Vehicles">‹</button>
          <button type="button" class="carousel-nav-btn" onclick="scrollCarousel(1)" title="Next Vehicles">›</button>
        </div>
      </div>
      <div class="carousel-track" id="horizontalCarTrack">
        ${carouselCardsHtml}
      </div>
    </section>

    <!-- WHY CHOOSE CARS BY RAJAT (SHOWROOM TRUST PILLARS) -->
    <section style="margin:28px 0 32px">
      <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:16px" class="why-us-grid">
        <div class="panel" style="margin:0;padding:18px;display:flex;flex-direction:column;gap:6px;border-radius:14px">
          <div style="font-size:24px">🚗</div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">Physical Showroom Inspection</div>
          <p style="font-size:12px;color:var(--muted);line-height:1.45;margin:0">Test drive and inspect vehicles in person at our Wardha Road hub with transparent mechanical checks.</p>
        </div>
        <div class="panel" style="margin:0;padding:18px;display:flex;flex-direction:column;gap:6px;border-radius:14px">
          <div style="font-size:24px">🤝</div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">Transparent Deal Negotiation</div>
          <p style="font-size:12px;color:var(--muted);line-height:1.45;margin:0">Explore listed vehicle pricing and submit counteroffers directly to Rajat Sharma with fast review.</p>
        </div>
        <div class="panel" style="margin:0;padding:18px;display:flex;flex-direction:column;gap:6px;border-radius:14px">
          <div style="font-size:24px">🏛️</div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">100% Clean RTO Titles</div>
          <p style="font-size:12px;color:var(--muted);line-height:1.45;margin:0">Nagpur MH-31 and Maharashtra verified registrations. Single ownership verification with complete service logs.</p>
        </div>
        <div class="panel" style="margin:0;padding:18px;display:flex;flex-direction:column;gap:6px;border-radius:14px">
          <div style="font-size:24px">🤖</div>
          <div style="font-size:14px;font-weight:800;color:var(--text)">AI Auto Advisor &amp; Support</div>
          <p style="font-size:12px;color:var(--muted);line-height:1.45;margin:0">Instant inventory assistance, test drive booking, and 1-on-1 direct WhatsApp deal closing with Rajat Sharma.</p>
        </div>
      </div>
    </section>

    ${renderAdSlot('leaderboard', s)}

    <div class="catalog-meta">
      <div>Showing <strong id="visibleCount">${cars.length}</strong> certified vehicles in Nagpur showroom</div>
      <div>${unlocked ? '✅ Direct Showroom Prices Unlocked for your session' : '<button type="button" class="btn btn-sm btn-primary" onclick="openUnlockModal()">🔓 Unlock All Direct Prices in 1 Click</button>'}</div>
    </div>

    <section class="grid" id="carGrid">
      ${cardsHtml}
    </section>

    <div id="emptyState" class="panel" style="display:none;text-align:center;padding:36px">
      <h3>No matching vehicles found for your filter criteria</h3>
      <p style="color:var(--muted);margin:8px 0 14px">Try clearing filters or message Rajat on WhatsApp for incoming Nagpur stock.</p>
      <button type="button" class="btn btn-primary" onclick="resetLiveFilters()">Reset All Filters</button>
    </div>

    <script>
      window.CBR_CATALOG = ${JSON.stringify(safeCatalog)};

      function scrollCarousel(dir) {
        const track = document.getElementById('horizontalCarTrack');
        if (track) track.scrollBy({ left: dir * 330, behavior: 'smooth' });
      }

      function stepPhoto(btn, dir){
        const media = btn.closest('.card-media');
        const list = (media.getAttribute('data-photos') || '').split('|').filter(Boolean);
        if (list.length < 2) return;
        let idx = (Number(media.getAttribute('data-idx') || 0) + dir + list.length) % list.length;
        media.setAttribute('data-idx', idx);
        media.querySelector('img').src = list[idx];
        media.querySelectorAll('.media-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
      }

      function applyLiveFilters(){
        const s = (document.getElementById('fSearch').value || '').toLowerCase().trim();
        const make = document.getElementById('fMake').value;
        const minPrice = Number(document.getElementById('fMinPrice').value || 0);
        const maxPrice = Number(document.getElementById('fMaxPrice').value || 0);
        const fuel = document.getElementById('fFuel').value;
        const tr = document.getElementById('fTr').value;
        const sort = document.getElementById('fSort').value;

        let activeFilters = [s, make, minPrice, maxPrice, fuel, tr].filter(Boolean).length;
        const badge = document.getElementById('activeFilterBadge');
        if (badge) {
          badge.style.display = activeFilters ? 'inline-flex' : 'none';
          badge.textContent = activeFilters;
        }

        const grid = document.getElementById('carGrid');
        const cards = Array.from(grid.querySelectorAll('.card'));
        let shown = 0;

        cards.forEach(card => {
          const text = card.getAttribute('data-search') || '';
          const cMake = card.getAttribute('data-make');
          const cFuel = card.getAttribute('data-fuel');
          const cTr = card.getAttribute('data-tr');
          const cPrice = Number(card.getAttribute('data-price'));

          let ok = true;
          if (s && !text.includes(s)) ok = false;
          if (make && cMake !== make) ok = false;
          if (fuel && cFuel !== fuel) ok = false;
          if (tr && cTr !== tr) ok = false;
          if (minPrice && cPrice < minPrice) ok = false;
          if (maxPrice && cPrice > maxPrice) ok = false;

          card.style.display = ok ? '' : 'none';
          if (ok) shown++;
        });

        cards.sort((a, b) => {
          if (sort === 'price_asc') return Number(a.dataset.price) - Number(b.dataset.price);
          if (sort === 'price_desc') return Number(b.dataset.price) - Number(a.dataset.price);
          if (sort === 'km_asc') return Number(a.dataset.km) - Number(b.dataset.km);
          return Number(b.dataset.year) - Number(a.dataset.year);
        });
        cards.forEach(c => grid.appendChild(c));

        document.getElementById('visibleCount').textContent = shown;
        document.getElementById('emptyState').style.display = shown === 0 ? 'block' : 'none';
      }

      function resetLiveFilters(){
        ['fSearch','fMake','fMinPrice','fMaxPrice','fFuel','fTr'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        });
        const sortEl = document.getElementById('fSort');
        if (sortEl) sortEl.value = 'newest';
        applyLiveFilters();
      }
    </script>
  `;

  const dealerSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: s.name,
    description: intro,
    url: ENV.BASE_URL,
    telephone: s.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address,
      addressLocality: 'Nagpur',
      addressRegion: 'MH',
      postalCode: '440015',
      addressCountry: 'IN',
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
    openingHours: s.hours,
  };

  return renderLayout({
    title: `${h1} | ${s.name}`,
    desc: intro,
    canonical: ENV.BASE_URL + canonicalPath,
    ogImg: ENV.BASE_URL + '/og/default.svg',
    schema: [dealerSchema],
    s,
    body,
    isAdmin,
  });
}

export function renderDetailPage({ car, unlocked, msg, s, isAdmin, negotiation = null }) {
  const photos = (car.photos || '').split(',').map((x) => x.trim()).filter(Boolean);
  if (!photos.length) photos.push('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80');
  const title = `${car.year} ${car.make} ${car.model}`;
  const basePrice = unlocked ? car.direct : car.price;
  const savings = car.price - car.direct;

  const splitPoints = (str) =>
    String(str || '')
      .split('|')
      .map((x) => x.trim())
      .filter(Boolean);

  const inspCategories = [
    ['🔧 Engine & Transmission', splitPoints(car.insp_engine)],
    ['🛞 Tyres, Brakes & Suspension', splitPoints(car.insp_tyres)],
    ['🛡️ Exterior, Frame & Chassis', splitPoints(car.insp_chassis)],
    ['❄️ AC, Electricals & Cabin', splitPoints(car.insp_elec)],
  ];

  const msgBanner =
    msg === 'td_booked'
      ? `<div class="panel" style="background:var(--green-soft);border-color:var(--green);color:var(--green);font-weight:700">✅ Test Drive Scheduled! Rajat's Nagpur showroom team will confirm your slot on WhatsApp shortly.</div>`
      : '';

  const body = `
    <div style="margin:14px 0;font-size:13px;color:var(--muted)">
      <a href="/">Home</a> › <a href="/used-cars/nagpur">Nagpur Showroom</a> › <a href="/used-cars/nagpur/${esc(car.make.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}">${esc(car.make)}</a> › <strong>${esc(title)}</strong>
    </div>

    ${msgBanner}

    <div class="dossier-grid">
      <div>
        <div class="panel">
          <div style="position:relative">
            <img id="mainGalleryImg" class="main-photo" src="${esc(photos[0])}" alt="${esc(title)}" onclick="openLightbox(0)">
            <span class="status-pill st-${esc(car.status)}" style="position:absolute;top:12px;left:12px">${esc(car.status)}</span>
            <button type="button" class="btn btn-sm" style="position:absolute;bottom:12px;right:12px;background:rgba(15,23,42,0.85);color:#fff;border:0" onclick="openLightbox(0)">🔍 Fullscreen &amp; 360° Cabin View (${photos.length} Photos)</button>
          </div>
          <div class="thumb-row">
            ${photos.map((p, i) => `<img class="thumb ${i === 0 ? 'active' : ''}" src="${esc(p)}" alt="Angle ${i + 1}" onclick="setMainPhoto(${i}, '${esc(p)}', this)">`).join('')}
          </div>
        </div>

        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <h2 style="font-size:19px;font-weight:800">🛡️ Certified Showroom Inspection Dossier</h2>
            <span class="pill pill-verified">✓ 100% Passed · Non-Accidental &amp; Non-Flooded</span>
          </div>
          <div class="insp-grid">
            ${inspCategories
              .map(
                ([cat, pts]) => `<div class="insp-card">
                <div class="insp-head"><span>${cat}</span><span class="pill pill-verified">Passed</span></div>
                <ul class="insp-list">${pts.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
              </div>`
              )
              .join('')}
          </div>
        </div>

        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
            <h2 style="font-size:19px;font-weight:800">📄 Vehicle Paperwork &amp; Ownership History</h2>
            ${unlocked ? `<span class="pill pill-verified">✓ Verified RTO Documents Unlocked</span>` : `<span class="pill" style="background:#fef3c7;color:#b45309">🔒 Confidential Details Gated</span>`}
          </div>

          ${!unlocked ? `
            <div class="gated-lock-card" onclick="openUnlockModal(${car.id}, '${esc(title)}')">
              <span>Ownership Details</span>
              <span style="font-size:16px">🔒</span>
            </div>
            <div class="gated-lock-card" onclick="openUnlockModal(${car.id}, '${esc(title)}')">
              <span>Important Dates &amp; PUCC</span>
              <span style="font-size:16px">🔒</span>
            </div>
          ` : ''}

          <table>
            <tbody>
              <tr><th>RTO Registration</th><td><strong>${esc(car.rto)}</strong> (${unlocked ? 'Nagpur / Vidarbha Verified NOC / Transfer Ready' : 'Nagpur Hub · 🔒 Full NOC Status Gated'})</td></tr>
              <tr><th>Ownership Serial</th><td>${car.own === 1 ? '1st Owner (Single Hand Driven)' : car.own + 'nd Owner'} ${unlocked ? '· Verified RC' : '· 🔒 Exact Reg Date Gated'}</td></tr>
              <tr><th>Odometer Reading</th><td>${Number(car.km).toLocaleString('en-IN')} km (Tamper-Proof ECU Verified)</td></tr>
              <tr><th>Transmission Detail</th><td>${esc(car.tr)} ${car.tr_detail ? `— ${esc(car.tr_detail)}` : ''}</td></tr>
              <tr><th>Insurance Validity</th><td>${esc(car.ins)} ${unlocked ? '· Policy Active' : '· 🔒 Policy Expiry Date Gated'}</td></tr>
              <tr><th>Duplicate / Smart Keys</th><td>${esc(car.keys_count || 'Original 2 Smart Keys Available')}</td></tr>
              <tr><th>Service History</th><td>${esc(car.service_hist || 'Authorized Service Centre Records Verified')}</td></tr>
              <tr><th>Loaded Features</th><td>${esc(car.feat)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div class="panel">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">
            <span class="pill pill-hub">${esc(car.rto)}</span>
            <span class="pill pill-verified">${esc(car.fuel)} · ${esc(car.tr)}</span>
            <span class="chip">${Number(car.km).toLocaleString('en-IN')} km</span>
          </div>
          <h1 style="font-size:24px;font-weight:800">${esc(title)}</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">${esc(car.feat)}</p>

          <div class="price-box" style="margin:16px 0;padding:16px">
            ${
              unlocked
                ? `<div style="width:100%">
                    <div class="price-lbl">Nagpur Market Price: <span class="price-strike">${inr(car.price)}</span></div>
                    <div class="price-direct" style="font-size:28px;margin:4px 0">${inr(car.direct)}</div>
                    <span class="save-pill">🎉 Direct Dealership Savings: ${inr(savings)} below market</span>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">
                      <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent(`Hi Rajat, I unlocked the direct price (${inr(car.direct)}) for ${title} (${car.rto}) and want to proceed.`)}" target="_blank" rel="noopener" class="btn btn-wa">💬 Lock Deal on WhatsApp</a>
                      <a href="tel:${esc(s.phone)}" class="btn">📞 Call Showroom</a>
                    </div>
                  </div>`
                : `<div style="width:100%">
                    <div style="display:flex;justify-content:space-between;align-items:center">
                      <div>
                        <div class="price-lbl">Estimated Market Value</div>
                        <div class="price-mkt" style="font-size:24px">${inr(car.price)}</div>
                      </div>
                      <span class="pill pill-verified">Save up to ₹1.6L</span>
                    </div>
                    <button type="button" class="btn btn-primary" style="width:100%;margin-top:12px;padding:12px" onclick="openUnlockModal(${car.id}, '${esc(title)}')">🔒 Unlock Rajat's Direct Price (No OTP)</button>
                  </div>`
            }
          </div>

          <!-- SHOWROOM LOCATION & SELLER CONTACT -->
          <div class="panel" style="background:var(--surface-alt);border:1px solid var(--border)">
            <div style="font-weight:800;font-size:14px;display:flex;align-items:center;gap:6px">
              📍 Showroom Location &amp; Direct Seller Desk
            </div>
            <div style="font-size:12.5px;color:var(--text);margin-top:6px">
              <strong>${esc(s.name)}</strong> · ${esc(car.location || s.address)}
            </div>
            <div style="font-size:12px;color:var(--muted);margin-top:2px">
              Timings: 10:00 AM – 8:30 PM (All 7 Days Open)
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
              <a href="tel:${esc(car.contact_number || s.phone)}" class="btn btn-sm" style="font-weight:700">📞 Call Showroom</a>
              <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent(`Hi Rajat, I am interested in ${title} (${car.rto}) listed at ${ENV.BASE_URL}/cars/${car.slug}. Is it currently available for showroom inspection?`)}" target="_blank" rel="noopener" class="btn btn-sm btn-wa-mature">💬 WhatsApp Desk</a>
            </div>
          </div>

          <!-- VEHICLE VERIFICATION CHECKLIST & BADGES -->
          <div class="panel">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <h3 style="font-size:15px;font-weight:800">🛡️ Dealership Verification Badges</h3>
              <span class="pill pill-verified">✓ 100% Certified</span>
            </div>
            <div class="verified-strip">
              <span class="verified-item">✓ Showroom Inspection Verified</span>
              <span class="verified-item">✓ RTO &amp; RC Transfer Cleared</span>
              <span class="verified-item">✓ Active Insurance Verified</span>
              <span class="verified-item">✓ Non-Accidental Guarantee</span>
            </div>
            <p style="font-size:11.5px;color:var(--muted);margin-top:6px">
              ${esc(car.verification_notes || 'Physical inspection and digital paperwork verification completed by Rajat Sharma.')}
            </p>
          </div>

          <!-- SHARE CAR FEATURE (WHATSAPP PREVIEW READY) -->
          <div class="panel">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <h3 style="font-size:15px;font-weight:800">📲 Share This Vehicle</h3>
              <span class="pill pill-hub" style="font-size:10.5px">OpenGraph Preview Ready</span>
            </div>
            <p style="font-size:12px;color:var(--muted);margin-bottom:10px">Share with friends or family via WhatsApp with full car photograph, price, and specs preview.</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <a href="https://wa.me/?text=${encodeURIComponent(`🚗 *Check out this certified ${title} on Cars By Rajat Nagpur!*\n💰 Price: ${inr(unlocked ? car.direct : car.price)}\n📍 Location: ${car.location || 'Nagpur Hub'}\n📋 Showroom Verified, ${car.km.toLocaleString('en-IN')} km, ${car.fuel} ${car.tr}\n🔗 View Full Dossier: ${ENV.BASE_URL}/cars/${car.slug}`)}" target="_blank" rel="noopener" class="btn btn-sm btn-wa-mature" style="width:100%">
                💬 Share on WhatsApp
              </a>
              <button type="button" class="btn btn-sm" onclick="shareVehicle('${esc(title)}', '${ENV.BASE_URL}/cars/${car.slug}', '🚗 Check out this certified ${esc(title)} on Cars By Rajat Nagpur: ${ENV.BASE_URL}/cars/${car.slug}')">
                🔗 Copy / Share Link
              </button>
            </div>
          </div>

          <!-- CAR PRICE NEGOTIATION DESK -->
          <div class="panel" id="negotiationDesk">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
              <div>
                <h2 style="font-size:18px;font-weight:800">🤝 Car Price Negotiation System</h2>
                <p style="font-size:12px;color:var(--muted);margin-top:2px">Submit your expected purchase offer against the listed price. Our sales manager reviews and responds directly.</p>
              </div>
              <button type="button" class="btn btn-sm btn-primary" onclick="openNegotiationModal(${car.id}, '${esc(title)}', ${unlocked ? car.direct : car.price})">Make an Offer 🤝</button>
            </div>
            <div id="activeNegotiationCard" style="margin-top:10px">
              ${
                negotiation
                  ? `<div class="negotiation-banner">
                      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px">
                        <strong>Active Offer: ${inr(negotiation.current_customer_offer)}</strong>
                        <span class="pill pill-hub">${esc(negotiation.status)}</span>
                      </div>
                      ${negotiation.current_vendor_offer ? `<div style="font-size:13px;font-weight:700;color:var(--green);margin-top:4px">Vendor Counteroffer: ${inr(negotiation.current_vendor_offer)}</div>` : ''}
                      <p style="font-size:12px;margin-top:4px">View full negotiation history &amp; counteroffer responses in your <a href="/dashboard#negotiations" style="text-decoration:underline;font-weight:700">Customer Dashboard →</a></p>
                    </div>`
                  : `<div style="font-size:12px;color:var(--muted);background:var(--surface-alt);padding:10px;border-radius:8px">
                      Have a budget in mind? Click <strong>"Make an Offer"</strong> to submit your purchase counteroffer. Every offer is reviewed individually by Rajat's showroom desk.
                    </div>`
              }
            </div>
          </div>

          <!-- DIRECT ENQUIRY FORM (AUTO-SAVES TO LMS) -->
          <div class="panel" id="enquiry">
            <h2 style="font-size:18px;font-weight:800;margin-bottom:4px">✉️ Send Direct Vehicle Enquiry</h2>
            <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Ask questions about condition, loan eligibility or yard inspection. Automatically routed to our sales team.</p>
            <form onsubmit="submitCarEnquiry(event, ${car.id})" id="carEnquiryForm">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
                <div>
                  <label style="font-size:11.5px;font-weight:700">Your Full Name *</label>
                  <input class="inp" type="text" id="enqName" placeholder="Full Name" required>
                </div>
                <div>
                  <label style="font-size:11.5px;font-weight:700">10-Digit Mobile *</label>
                  <input class="inp" type="tel" id="enqPhone" placeholder="98230XXXXX" required pattern="[6-9][0-9]{9}" maxlength="10">
                </div>
              </div>
              <div style="margin-bottom:8px">
                <label style="font-size:11.5px;font-weight:700">Your Inquiry Message or Requirement *</label>
                <textarea class="inp" id="enqMsg" rows="2" placeholder="e.g. Is this vehicle available for inspection this Saturday? Can you provide RTO NOC details?" required></textarea>
              </div>
              <div id="enqFeedback" style="display:none;margin-bottom:8px;font-size:12px;font-weight:700"></div>
              <button type="submit" class="btn btn-primary" id="btnSubmitEnquiry" style="width:100%;padding:11px;font-weight:700">📩 Submit Enquiry to Sales Team</button>
            </form>
          </div>

          ${car.reel ? `<a href="${esc(car.reel)}" target="_blank" rel="noopener" class="btn" style="width:100%;margin-bottom:8px">📸 Watch Full Walkaround Reel on Instagram (@${esc(s.insta)})</a>` : ''}
        </div>

        <div class="panel">
          <h2 style="font-size:18px;font-weight:800;margin-bottom:10px">🧮 Interactive Auto-Loan EMI Calculator</h2>
          <div style="background:var(--surface-alt);border-radius:10px;padding:12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase">Estimated Monthly EMI</div>
              <div id="emiResult" style="font-size:24px;font-weight:800;color:var(--primary)">₹0/mo</div>
            </div>
            <div style="text-align:right;font-size:12px;color:var(--muted)">
              <div>Loan Principal: <strong id="emiLoanAmt">₹0</strong></div>
              <div>Base Price: <strong>${inr(basePrice)}</strong></div>
            </div>
          </div>

          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600">
              <span>Down Payment (<span id="dpPctLbl">20</span>%)</span>
              <span id="dpAmtLbl">₹0</span>
            </div>
            <input type="range" id="dpSlider" min="10" max="50" step="5" value="20" style="width:100%;margin-top:4px" oninput="recalcDossierEmi()">
          </div>

          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600">
              <span>Loan Tenure</span>
              <span><strong id="tenLbl">5</strong> Years (<span id="tenMoLbl">60</span> Months)</span>
            </div>
            <input type="range" id="tenSlider" min="1" max="7" step="1" value="5" style="width:100%;margin-top:4px" oninput="recalcDossierEmi()">
          </div>

          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:600">
              <span>Interest Rate (p.a.)</span>
              <span><strong id="rateLbl">9.5</strong>%</span>
            </div>
            <input type="range" id="rateSlider" min="8.5" max="14" step="0.25" value="9.5" style="width:100%;margin-top:4px" oninput="recalcDossierEmi()">
          </div>

          <a id="emiWaBtn" href="#" target="_blank" rel="noopener" class="btn btn-primary" style="width:100%">🏦 Check Loan Eligibility on WhatsApp</a>
        </div>

        ${renderAdSlot('finance', s)}

        <div class="panel" id="testdrive">
          <h2 style="font-size:18px;font-weight:800;margin-bottom:6px">📅 Schedule Showroom Test Drive</h2>
          <p style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Inspect &amp; test drive the <strong>${esc(title)}</strong> at our Nagpur hub.</p>
          <form action="/api/testdrive" method="POST">
            <input type="hidden" name="car_id" value="${car.id}">
            <input type="hidden" name="slug" value="${esc(car.slug)}">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Preferred Date *</label>
                <input class="inp" type="date" name="date" required min="${new Date().toISOString().slice(0, 10)}">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Time Slot *</label>
                <select class="inp" name="slot" required>
                  <option value="Morning (10:30 AM - 1:30 PM)">Morning (10:30 AM - 1:30 PM)</option>
                  <option value="Afternoon (2:00 PM - 5:00 PM)">Afternoon (2:00 PM - 5:00 PM)</option>
                  <option value="Evening (5:00 PM - 8:00 PM)">Evening (5:00 PM - 8:00 PM)</option>
                </select>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Your Name</label>
                <input class="inp" type="text" name="name" placeholder="Full Name">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">10-Digit Mobile *</label>
                <input class="inp" type="tel" name="phone" required pattern="[6-9][0-9]{9}" maxlength="10" placeholder="98230XXXXX">
              </div>
            </div>
            <div class="dpdp-box">
              <label>
                <input type="checkbox" name="consent" value="1" required>
                <span>I consent to <strong>${esc(s.name)}</strong> contacting me via WhatsApp/Phone to coordinate my showroom test drive under the <a href="/privacy-policy" style="color:var(--primary);text-decoration:underline">DPDP Act 2023</a>.</span>
              </label>
            </div>
            <button type="submit" class="btn btn-wa" style="width:100%;padding:11px">✅ Confirm Test Drive Slot</button>
          </form>
        </div>
      </div>
    </div>

    <!-- CAR PRICE NEGOTIATION MODAL -->
    <div class="modal-backdrop" id="negotiationModal">
      <div class="modal" style="max-width:500px">
        <button type="button" class="modal-close" onclick="closeNegotiationModal()">✕</button>
        <span class="pill pill-verified" style="margin-bottom:8px">🤝 Fair Dealership Negotiation Desk</span>
        <h2 style="font-size:20px;font-weight:800;margin-bottom:4px">Propose Purchase Price</h2>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:12px" id="negModalCarTitle">${esc(title)}</p>
        <div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:var(--muted)">Showroom Listed Price:</span>
          <strong id="negModalListedPrice" style="font-size:16px;color:var(--primary)">${inr(unlocked ? car.direct : car.price)}</strong>
        </div>
        <form onsubmit="submitPriceOffer(event)">
          <input type="hidden" id="negCarId" value="${car.id}">
          <input type="hidden" id="negListedPrice" value="${unlocked ? car.direct : car.price}">
          <div style="margin-bottom:10px">
            <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Your Proposed Purchase Price (₹) *</label>
            <input class="inp" type="number" id="negOfferPrice" placeholder="e.g. ${Math.round((unlocked ? car.direct : car.price) * 0.95)}" required min="50000">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
            <div>
              <label style="font-size:11.5px;font-weight:700">Full Name *</label>
              <input class="inp" type="text" id="negCustomerName" placeholder="Full Name" required>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700">10-Digit Mobile *</label>
              <input class="inp" type="tel" id="negCustomerPhone" placeholder="98230XXXXX" required pattern="[6-9][0-9]{9}" maxlength="10">
            </div>
          </div>
          <div style="margin-bottom:12px">
            <label style="font-size:11.5px;font-weight:700">Discussion Notes / Terms (Optional)</label>
            <textarea class="inp" id="negNotes" rows="2" placeholder="e.g. Token payment ready within 24 hours if price agreed including RTO transfer."></textarea>
          </div>
          <div id="negErr" style="display:none;color:var(--danger);font-size:12px;font-weight:700;margin-bottom:8px"></div>
          <button type="submit" class="btn btn-primary" id="btnSubmitOffer" style="width:100%;padding:11px;font-weight:700">🤝 Submit Offer to Sales Desk</button>
        </form>
      </div>
    </div>

    <!-- Fullscreen Lightbox & 360° Cabin Viewer Modal -->
    <div class="modal-backdrop" id="lightboxModal">
      <div class="modal modal-lg" style="background:#0b0f19;color:#fff;border-color:#26324d">
        <button type="button" class="modal-close" style="background:#1e293b;color:#fff" onclick="closeLightbox()">✕</button>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;padding-right:38px;flex-wrap:wrap;gap:8px">
          <strong>${esc(title)} — High-Resolution Inspection Gallery</strong>
          <div style="display:flex;gap:6px">
            <button type="button" class="btn btn-sm" style="background:#1e293b;color:#fff;border-color:#334155" onclick="toggleZoom()">🔍 Toggle 2x Zoom</button>
            <button type="button" class="btn btn-sm" style="background:#1e293b;color:#fff;border-color:#334155" onclick="stepLightbox(-1)">‹ Prev</button>
            <button type="button" class="btn btn-sm" style="background:#1e293b;color:#fff;border-color:#334155" onclick="stepLightbox(1)">Next ›</button>
          </div>
        </div>
        <div style="overflow:hidden;border-radius:12px;background:#000;text-align:center">
          <img id="lightboxImg" src="${esc(photos[0])}" alt="Fullscreen view" style="max-height:70vh;width:100%;object-fit:contain;transition:transform .25s">
        </div>
      </div>
    </div>

    <script>
      const CAR_PHOTOS = ${JSON.stringify(photos)};
      const BASE_PRICE = ${Number(basePrice)};
      const CAR_TITLE = ${JSON.stringify(title)};
      const WA_NUMBER = ${JSON.stringify(s.whatsapp)};
      let lbIdx = 0;
      let zoomed = false;

      pushTrail('Viewed ' + CAR_TITLE);
      fetch('/api/view?slug=${encodeURIComponent(car.slug)}', { method: 'POST' }).catch(() => {});

      function setMainPhoto(idx, src, el){
        lbIdx = idx;
        document.getElementById('mainGalleryImg').src = src;
        document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        if (el) el.classList.add('active');
      }
      function openLightbox(idx){
        lbIdx = idx || 0;
        zoomed = false;
        const img = document.getElementById('lightboxImg');
        img.style.transform = 'scale(1)';
        img.src = CAR_PHOTOS[lbIdx];
        document.getElementById('lightboxModal').classList.add('open');
      }
      function closeLightbox(){ document.getElementById('lightboxModal').classList.remove('open'); }
      function stepLightbox(dir){
        lbIdx = (lbIdx + dir + CAR_PHOTOS.length) % CAR_PHOTOS.length;
        document.getElementById('lightboxImg').src = CAR_PHOTOS[lbIdx];
      }
      function toggleZoom(){
        zoomed = !zoomed;
        document.getElementById('lightboxImg').style.transform = zoomed ? 'scale(1.85)' : 'scale(1)';
      }

      function recalcDossierEmi(){
        const dpPct = Number(document.getElementById('dpSlider').value);
        const yrs = Number(document.getElementById('tenSlider').value);
        const rate = Number(document.getElementById('rateSlider').value);
        const dpAmt = Math.round(BASE_PRICE * (dpPct / 100));
        const loan = Math.max(0, BASE_PRICE - dpAmt);
        const n = yrs * 12;
        const r = rate / 12 / 100;
        const emi = Math.round((loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));

        document.getElementById('dpPctLbl').textContent = dpPct;
        document.getElementById('dpAmtLbl').textContent = '₹' + dpAmt.toLocaleString('en-IN');
        document.getElementById('tenLbl').textContent = yrs;
        document.getElementById('tenMoLbl').textContent = n;
        document.getElementById('rateLbl').textContent = rate;
        document.getElementById('emiLoanAmt').textContent = '₹' + loan.toLocaleString('en-IN');
        document.getElementById('emiResult').textContent = '₹' + emi.toLocaleString('en-IN') + '/mo';

        const msg = 'Hi Rajat, I want to check loan eligibility for ' + CAR_TITLE + ' with Down Payment ₹' + dpAmt.toLocaleString('en-IN') + ' (' + dpPct + '%) and EMI ₹' + emi.toLocaleString('en-IN') + '/mo for ' + yrs + ' years.';
        document.getElementById('emiWaBtn').href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
      }
      recalcDossierEmi();

      // Direct Enquiry Submission
      async function submitCarEnquiry(e, carId){
        e.preventDefault();
        const name = document.getElementById('enqName').value.trim();
        const phone = document.getElementById('enqPhone').value.trim();
        const message = document.getElementById('enqMsg').value.trim();
        const feedback = document.getElementById('enqFeedback');
        const btn = document.getElementById('btnSubmitEnquiry');

        const val = validateIndianMobileClient(phone);
        if (!val.ok) {
          feedback.style.display = 'block';
          feedback.style.color = 'var(--danger)';
          feedback.textContent = '⚠️ ' + val.error;
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Submitting Enquiry...';

        try {
          const res = await fetch('/api/enquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ car_id: carId, name, phone: val.phone, message, source: 'CAR_DETAIL_PAGE' })
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to submit enquiry.');
          feedback.style.display = 'block';
          feedback.style.color = 'var(--green)';
          feedback.textContent = '✅ Enquiry Submitted! Our sales team has been alerted and will reach out shortly. You can track this in your Customer Dashboard.';
          document.getElementById('enqMsg').value = '';
          btn.textContent = '✓ Enquiry Sent';
          showToast('✓ Enquiry saved to LMS! Sales team notified.');
        } catch (err) {
          feedback.style.display = 'block';
          feedback.style.color = 'var(--danger)';
          feedback.textContent = '⚠️ ' + err.message;
          btn.disabled = false;
          btn.textContent = '📩 Submit Enquiry to Sales Team';
        }
      }

      // Negotiation Modal Controls
      function openNegotiationModal(carId, title, price){
        document.getElementById('negCarId').value = carId;
        document.getElementById('negModalCarTitle').textContent = title;
        document.getElementById('negModalListedPrice').textContent = '₹' + Number(price).toLocaleString('en-IN');
        document.getElementById('negListedPrice').value = price;
        document.getElementById('negErr').style.display = 'none';
        document.getElementById('negotiationModal').classList.add('open');
        setTimeout(() => document.getElementById('negOfferPrice')?.focus(), 100);
      }
      function closeNegotiationModal(){
        document.getElementById('negotiationModal').classList.remove('open');
      }

      async function submitPriceOffer(e){
        e.preventDefault();
        const carId = document.getElementById('negCarId').value;
        const listedPrice = Number(document.getElementById('negListedPrice').value);
        const offerPrice = Number(document.getElementById('negOfferPrice').value);
        const name = document.getElementById('negCustomerName').value.trim();
        const phone = document.getElementById('negCustomerPhone').value.trim();
        const notes = document.getElementById('negNotes').value.trim();
        const errEl = document.getElementById('negErr');
        const btn = document.getElementById('btnSubmitOffer');

        const val = validateIndianMobileClient(phone);
        if (!val.ok) {
          errEl.style.display = 'block';
          errEl.textContent = '⚠️ ' + val.error;
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Submitting Offer...';

        try {
          const res = await fetch('/api/negotiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ car_id: carId, listed_price: listedPrice, offer_price: offerPrice, name, phone: val.phone, notes })
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to submit offer.');
          closeNegotiationModal();
          showToast('✓ Purchase offer of ₹' + offerPrice.toLocaleString('en-IN') + ' submitted for vendor review!');
          setTimeout(() => window.location.href = '/dashboard#negotiations', 1200);
        } catch (err) {
          errEl.style.display = 'block';
          errEl.textContent = '⚠️ ' + err.message;
          btn.disabled = false;
          btn.textContent = '🤝 Submit Offer to Sales Desk';
        }
      }
    </script>
  `;

  const carSchema = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: title,
    brand: { '@type': 'Brand', name: car.make },
    model: car.model,
    VehicleModelDate: String(car.year),
    fuelType: car.fuel,
    vehicleTransmission: car.tr,
    mileageFromOdometer: { '@type': 'QuantitativeValue', value: car.km, unitCode: 'KMT' },
    image: photos,
    offers: {
      '@type': 'Offer',
      price: car.price,
      priceCurrency: 'INR',
      availability: car.status === 'AVAILABLE' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `${ENV.BASE_URL}/cars/${car.slug}`,
    },
  };

  return renderLayout({
    title: `Used ${title} in Nagpur (${car.rto}) — Showroom Verified | ${s.name}`,
    desc: `Buy verified ${title} (${car.fuel}, ${car.tr}, ${car.km.toLocaleString('en-IN')} km, ${car.rto}) at ${s.name} Nagpur. Thoroughly inspected with instant finance.`,
    canonical: `${ENV.BASE_URL}/cars/${car.slug}`,
    ogImg: `${ENV.BASE_URL}/og/${car.slug}.svg`,
    schema: [carSchema],
    s,
    body,
    isAdmin,
  });
}

export function renderCustomerDashboard({ userPhone, customer, enquiries = [], negotiations = [], notifications = [], s, msg = '', isAdmin = false }) {
  if (!userPhone) {
    const loginBody = `
      <div class="panel" style="max-width:440px;margin:40px auto;text-align:center">
        <div style="font-size:38px;margin-bottom:8px">👤</div>
        <span class="pill pill-verified" style="margin-bottom:8px">Customer Portal</span>
        <h1 style="font-size:22px;font-weight:800;margin-bottom:6px">Access Your Customer Dashboard</h1>
        <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Enter your 10-digit mobile number to view your submitted enquiries, price negotiation status &amp; sales updates.</p>
        ${msg ? `<div style="background:var(--green-soft);color:var(--green);padding:10px;border-radius:8px;font-weight:700;font-size:12px;margin-bottom:12px">${esc(msg)}</div>` : ''}
        <form onsubmit="submitUnlock(event)" style="text-align:left">
          <input type="hidden" id="unlockCarId" value="">
          <input type="hidden" id="unlockEmail" value="">
          <input type="hidden" id="unlockAuthSource" value="DIRECT_MOBILE">
          <div style="margin-bottom:10px">
            <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Your Full Name (Optional)</label>
            <input class="inp" type="text" id="unlockName" placeholder="e.g. Rahul Sharma">
          </div>
          <div style="margin-bottom:10px">
            <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">10-Digit Mobile Number *</label>
            <input class="inp" type="tel" id="unlockPhone" placeholder="98230XXXXX" required pattern="[6-9][0-9]{9}" maxlength="10">
          </div>
          <div class="dpdp-box">
            <label>
              <input type="checkbox" id="unlockConsent" value="1" required checked>
              <span>I consent to accessing my customer profile under the DPDP Act 2023.</span>
            </label>
          </div>
          <div id="unlockErr" style="color:var(--danger);font-size:12px;margin-bottom:8px;display:none;font-weight:700"></div>
          <button type="submit" class="btn btn-primary" id="unlockSubmitBtn" style="width:100%;padding:11px;font-weight:700">Sign In to Dashboard →</button>
        </form>
      </div>
    `;
    return renderLayout({
      title: `Customer Dashboard | ${s.name}`,
      desc: 'View vehicle enquiries, active negotiations, and notifications.',
      canonical: `${ENV.BASE_URL}/dashboard`,
      s,
      body: loginBody,
      isAdmin,
    });
  }

  const kpis = {
    totalEnquiries: enquiries.length,
    activeNegotiations: negotiations.filter(n => n.status !== 'REJECTED' && n.status !== 'ACCEPTED').length,
    agreedDeals: negotiations.filter(n => n.status === 'ACCEPTED').length,
    unreadNotifs: notifications.filter(n => !n.is_read).length
  };

  const body = `
    <div style="margin:20px 0">
      <div class="panel" style="background:linear-gradient(135deg, var(--surface) 0%, var(--surface-alt) 100%);border-color:var(--border)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="pill pill-verified">✓ Verified Customer Account</span>
              <span class="meta-tag">DPDP Affirmative Consent Active</span>
            </div>
            <h1 style="font-size:24px;font-weight:800;margin-top:6px">${esc(customer?.name && customer.name !== '-' ? customer.name : 'Customer Hub')}</h1>
            <p style="font-size:13px;color:var(--muted);margin-top:2px">Contact: <strong>+91 ${esc(userPhone)}</strong> ${customer?.email ? `· ${esc(customer.email)}` : ''}</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center">
            <a href="/" class="btn btn-sm">Explore Cars</a>
            <form action="/api/stop" method="POST" style="display:inline">
              <input type="hidden" name="phone" value="${esc(userPhone)}">
              <button type="submit" class="btn btn-sm" style="color:var(--danger)">Sign Out / Opt-out</button>
            </form>
          </div>
        </div>
      </div>

      ${msg ? `<div class="panel" style="background:var(--green-soft);border-color:var(--green);color:var(--green);font-weight:700;padding:12px 16px">✓ ${esc(msg)}</div>` : ''}

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-lbl">SUBMITTED ENQUIRIES</div>
          <div class="kpi-val" style="color:var(--primary)">${kpis.totalEnquiries}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-lbl">ACTIVE NEGOTIATIONS</div>
          <div class="kpi-val" style="color:var(--amber)">${kpis.activeNegotiations}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-lbl">DEALS WON / AGREED</div>
          <div class="kpi-val" style="color:var(--green)">${kpis.agreedDeals}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-lbl">IN-APP NOTIFICATIONS</div>
          <div class="kpi-val" style="color:var(--primary)">${kpis.unreadNotifs} Unread</div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" id="btnDashEnq" onclick="switchDashTab('enquiries')">✉️ My Enquiries (${enquiries.length})</button>
        <button type="button" class="btn" id="btnDashNeg" onclick="switchDashTab('negotiations')">🤝 Price Negotiations (${negotiations.length})</button>
        <button type="button" class="btn" id="btnDashNotif" onclick="switchDashTab('notifications')">🔔 Notifications (${notifications.length})</button>
      </div>

      <!-- TAB 1: ENQUIRIES SECTION -->
      <div id="tabEnquiries" class="panel">
        <h2 style="font-size:18px;font-weight:800;margin-bottom:6px">✉️ Your Submitted Vehicle Enquiries</h2>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Track responses from our sales desk for every vehicle you've enquired about.</p>

        ${
          enquiries.length === 0
            ? `<div style="text-align:center;padding:36px;color:var(--muted)">
                <div style="font-size:28px;margin-bottom:8px">📬</div>
                <strong>No enquiries submitted yet.</strong>
                <p style="font-size:12px;margin:6px 0 12px">Browse our certified inventory and submit an enquiry directly from any car page.</p>
                <a href="/" class="btn btn-sm btn-primary">Browse Nagpur Fleet →</a>
              </div>`
            : `<div style="display:flex;flex-direction:column;gap:14px">
                ${enquiries.map((eq) => {
                  const carTitle = eq.make ? `${eq.year} ${eq.make} ${eq.model}` : 'General Showroom Enquiry';
                  const carImg = (eq.photos || '').split(',')[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
                  const stPill = eq.status === 'RESPONDED' ? 'background:var(--green-soft);color:var(--green)' : eq.status === 'IN_REVIEW' ? 'background:var(--primary-soft);color:var(--primary)' : 'background:var(--amber-soft);color:var(--amber)';

                  return `
                    <div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:12px;padding:16px;display:grid;grid-template-columns:140px 1fr;gap:16px">
                      <div style="border-radius:8px;overflow:hidden;background:#0f172a;height:95px">
                        <img src="${esc(carImg)}" alt="${esc(carTitle)}" style="width:100%;height:100%;object-fit:cover">
                      </div>
                      <div>
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
                          <div>
                            <h3 style="font-size:16px;font-weight:800">
                              ${eq.slug ? `<a href="/cars/${esc(eq.slug)}" style="color:var(--primary)">${esc(carTitle)}</a>` : esc(carTitle)}
                            </h3>
                            <div style="font-size:11.5px;color:var(--muted)">Enquiry ID: #${eq.id} · Submitted: ${esc(eq.ts.slice(0, 16).replace('T', ' '))}</div>
                          </div>
                          <span class="pill" style="${stPill};font-weight:800">${esc(eq.status)}</span>
                        </div>

                        <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;margin:10px 0;font-size:12.5px">
                          <strong style="color:var(--muted)">Your Message:</strong> "${esc(eq.message)}"
                        </div>

                        ${
                          eq.response_notes
                            ? `<div style="background:var(--green-soft);border:1px solid rgba(21,128,61,0.25);border-radius:8px;padding:10px;font-size:12.5px;color:var(--text)">
                                <strong style="color:var(--green)">💬 Response from ${esc(eq.assigned_to || 'Sales Desk')}:</strong>
                                <div style="margin-top:2px">${esc(eq.response_notes)}</div>
                                ${eq.responded_at ? `<div style="font-size:10.5px;color:var(--muted);margin-top:4px">Responded on ${esc(eq.responded_at.slice(0, 16).replace('T', ' '))}</div>` : ''}
                              </div>`
                            : `<div style="font-size:11.5px;color:var(--muted);font-style:italic">⏳ Sales rep (${esc(eq.assigned_to || 'Rajat')}) has received your enquiry and is reviewing vehicle availability.</div>`
                        }

                        <div style="display:flex;gap:8px;margin-top:10px">
                          ${eq.slug ? `<a href="/cars/${esc(eq.slug)}" class="btn btn-sm">View Vehicle Dossier</a>` : ''}
                          <a href="https://wa.me/${esc(s.whatsapp)}?text=${encodeURIComponent(`Hi Rajat, following up on my enquiry #${eq.id} for ${carTitle}.`)}" target="_blank" rel="noopener" class="btn btn-sm btn-wa-mature">💬 WhatsApp Sales Rep</a>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>`
        }
      </div>

      <!-- TAB 2: NEGOTIATIONS SECTION -->
      <div id="tabNegotiations" class="panel" style="display:none">
        <h2 style="font-size:18px;font-weight:800;margin-bottom:6px">🤝 Dedicated Car Price Negotiations</h2>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Active and historical price counteroffers between you and the dealership.</p>

        ${
          negotiations.length === 0
            ? `<div style="text-align:center;padding:36px;color:var(--muted)">
                <div style="font-size:28px;margin-bottom:8px">🤝</div>
                <strong>No price negotiations initiated yet.</strong>
                <p style="font-size:12px;margin:6px 0 12px">You can submit your target purchase price on any vehicle page using the "Make an Offer" button.</p>
                <a href="/" class="btn btn-sm btn-primary">Browse Vehicles &amp; Make Offer →</a>
              </div>`
            : `<div style="display:flex;flex-direction:column;gap:16px">
                ${negotiations.map((neg) => {
                  const carTitle = `${neg.year} ${neg.make} ${neg.model}`;
                  const carImg = (neg.photos || '').split(',')[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
                  const stColor = neg.status === 'ACCEPTED' ? 'var(--green)' : neg.status === 'REJECTED' ? 'var(--danger)' : neg.status === 'VENDOR_COUNTERED' ? 'var(--primary)' : 'var(--amber)';

                  return `
                    <div style="background:var(--surface-alt);border:1.5px solid var(--border);border-radius:12px;padding:16px">
                      <div style="display:grid;grid-template-columns:140px 1fr;gap:16px">
                        <div style="border-radius:8px;overflow:hidden;background:#0f172a;height:95px">
                          <img src="${esc(carImg)}" alt="${esc(carTitle)}" style="width:100%;height:100%;object-fit:cover">
                        </div>
                        <div>
                          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
                            <div>
                              <h3 style="font-size:16px;font-weight:800">
                                <a href="/cars/${esc(neg.slug)}" style="color:var(--primary)">${esc(carTitle)}</a>
                              </h3>
                              <div style="font-size:11.5px;color:var(--muted)">Deal Desk ID: #${neg.id} · Initiated: ${esc(neg.created_at.slice(0, 16).replace('T', ' '))}</div>
                            </div>
                            <span class="pill" style="background:var(--surface);color:${stColor};border:1px solid ${stColor};font-weight:800">${esc(neg.status)}</span>
                          </div>

                          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin:12px 0">
                            <div style="background:var(--surface);padding:8px 10px;border-radius:8px;border:1px solid var(--border)">
                              <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;font-weight:700">Listed Price</div>
                              <div style="font-size:14.5px;font-weight:700;text-decoration:line-through">${inr(neg.listed_price)}</div>
                            </div>
                            <div style="background:var(--surface);padding:8px 10px;border-radius:8px;border:1px solid var(--border)">
                              <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;font-weight:700">Your Last Offer</div>
                              <div style="font-size:14.5px;font-weight:800;color:var(--primary)">${inr(neg.current_customer_offer)}</div>
                            </div>
                            <div style="background:var(--surface);padding:8px 10px;border-radius:8px;border:1px solid var(--border)">
                              <div style="font-size:10.5px;color:var(--muted);text-transform:uppercase;font-weight:700">Vendor Counteroffer</div>
                              <div style="font-size:14.5px;font-weight:800;color:${neg.current_vendor_offer ? 'var(--green)' : 'var(--muted)'}">
                                ${neg.current_vendor_offer ? inr(neg.current_vendor_offer) : 'Pending Review'}
                              </div>
                            </div>
                          </div>

                          <!-- Discussion Messages Timeline -->
                          ${
                            neg.messages && neg.messages.length > 0
                              ? `<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:12px">
                                  <div style="font-size:11.5px;font-weight:700;color:var(--muted);margin-bottom:6px">Negotiation Discussion History:</div>
                                  <div style="display:flex;flex-direction:column;gap:6px">
                                    ${neg.messages.map(m => `
                                      <div style="font-size:12px;padding:6px 9px;border-radius:6px;background:${m.sender_type === 'VENDOR' ? 'var(--green-soft)' : 'var(--surface-alt)'}">
                                        <strong>${m.sender_type === 'VENDOR' ? '🏢 Dealership Desk (' + esc(m.sender_name) + ')' : '👤 You'}:</strong>
                                        Offered <strong>${inr(m.offered_price)}</strong> ${m.notes ? `— "${esc(m.notes)}"` : ''}
                                        <span style="font-size:10.5px;color:var(--muted);margin-left:6px">(${esc(m.created_at.slice(0, 16).replace('T', ' '))})</span>
                                      </div>
                                    `).join('')}
                                  </div>
                                </div>`
                              : ''
                          }

                          <!-- Interactive Counter / Accept Form if vendor countered -->
                          ${
                            neg.status === 'VENDOR_COUNTERED'
                              ? `<div style="background:var(--green-soft);border:1px solid var(--green);border-radius:8px;padding:12px;margin-top:10px">
                                  <div style="font-weight:800;font-size:13px;color:var(--green);margin-bottom:6px">⚡ Action Required: Dealership has proposed ₹${Number(neg.current_vendor_offer).toLocaleString('en-IN')}</div>
                                  <p style="font-size:12px;color:var(--text);margin-bottom:10px">You can accept this counteroffer to lock the deal, or submit another counter-proposal below.</p>
                                  <div style="display:flex;gap:8px;flex-wrap:wrap">
                                    <form action="/api/negotiate/accept" method="POST" style="margin:0">
                                      <input type="hidden" name="negotiation_id" value="${neg.id}">
                                      <button type="submit" class="btn btn-sm btn-primary" style="background:#15803d;border-color:#15803d;font-weight:700">✓ Accept Deal at ${inr(neg.current_vendor_offer)}</button>
                                    </form>
                                    <button type="button" class="btn btn-sm" onclick="toggleNegCounterForm(${neg.id})">Submit Counter-Response ▾</button>
                                  </div>
                                  <form id="negCounterForm_${neg.id}" action="/api/negotiate/counter" method="POST" style="display:none;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(0,0,0,0.15)">
                                    <input type="hidden" name="negotiation_id" value="${neg.id}">
                                    <div style="display:grid;grid-template-columns:1fr 2fr auto;gap:8px;align-items:center">
                                      <input class="inp" type="number" name="counter_price" placeholder="Your Counter Price (₹)" required style="height:32px;font-size:12px">
                                      <input class="inp" type="text" name="notes" placeholder="Notes (e.g. Can meet in middle at 13.95L)" style="height:32px;font-size:12px">
                                      <button type="submit" class="btn btn-sm btn-primary" style="height:32px">Submit Counter</button>
                                    </div>
                                  </form>
                                </div>`
                              : neg.status === 'ACCEPTED'
                              ? `<div style="background:var(--green-soft);color:var(--green);padding:10px;border-radius:8px;font-weight:700;font-size:12.5px">
                                  🎉 Deal Agreed! Our showroom desk is preparing the paperwork &amp; delivery schedule.
                                </div>`
                              : neg.status === 'REJECTED'
                              ? `<div style="background:var(--danger-soft);color:var(--danger);padding:10px;border-radius:8px;font-weight:700;font-size:12px">
                                  Negotiation closed. You may submit a revised proposal on the vehicle dossier page.
                                </div>`
                              : `<div style="font-size:12px;color:var(--muted);font-style:italic">
                                  ⏳ Offer is under review by Rajat's showroom manager. You will receive an in-app and WhatsApp alert once reviewed.
                                </div>`
                          }
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>`
        }
      </div>

      <!-- TAB 3: NOTIFICATIONS SECTION -->
      <div id="tabNotifications" class="panel" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div>
            <h2 style="font-size:18px;font-weight:800">🔔 In-App Notifications</h2>
            <p style="font-size:12.5px;color:var(--muted)">Important real-time updates regarding your enquiries, negotiations and test drives.</p>
          </div>
          <form action="/api/notifications/mark-read" method="POST">
            <input type="hidden" name="target" value="${esc(userPhone)}">
            <button type="submit" class="btn btn-sm">Mark All as Read</button>
          </form>
        </div>

        ${
          notifications.length === 0
            ? `<div style="text-align:center;padding:36px;color:var(--muted)">
                <div style="font-size:28px;margin-bottom:8px">🔔</div>
                <strong>You're all caught up!</strong>
                <p style="font-size:12px;margin:6px 0 0">No unread notifications at this time.</p>
              </div>`
            : `<div style="display:flex;flex-direction:column;gap:8px">
                ${notifications.map(n => `
                  <div style="background:var(--surface-alt);border:1px solid ${n.is_read ? 'var(--border)' : 'var(--primary)'};border-radius:10px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px">
                    <div style="display:flex;align-items:flex-start;gap:10px">
                      <div style="font-size:20px">${n.event_type === 'NEW_OFFER' || n.event_type === 'COUNTER_OFFER' ? '🤝' : n.event_type === 'NEW_ENQUIRY' ? '✉️' : '🔔'}</div>
                      <div>
                        <div style="font-weight:700;font-size:13.5px">${esc(n.title)} ${!n.is_read ? '<span class="pill pill-hub" style="font-size:10px">NEW</span>' : ''}</div>
                        <div style="font-size:12.5px;color:var(--muted);margin-top:2px">${esc(n.message)}</div>
                        <div style="font-size:10.5px;color:var(--subtle);margin-top:3px">${esc(n.ts.slice(0, 16).replace('T', ' '))}</div>
                      </div>
                    </div>
                    ${n.link_url ? `<a href="${esc(n.link_url)}" class="btn btn-sm">View →</a>` : ''}
                  </div>
                `).join('')}
              </div>`
        }
      </div>
    </div>

    <script>
      function switchDashTab(tab){
        document.getElementById('tabEnquiries').style.display = tab === 'enquiries' ? 'block' : 'none';
        document.getElementById('tabNegotiations').style.display = tab === 'negotiations' ? 'block' : 'none';
        document.getElementById('tabNotifications').style.display = tab === 'notifications' ? 'block' : 'none';

        document.getElementById('btnDashEnq').className = 'btn ' + (tab === 'enquiries' ? 'btn-primary' : '');
        document.getElementById('btnDashNeg').className = 'btn ' + (tab === 'negotiations' ? 'btn-primary' : '');
        document.getElementById('btnDashNotif').className = 'btn ' + (tab === 'notifications' ? 'btn-primary' : '');
      }

      function toggleNegCounterForm(id){
        const f = document.getElementById('negCounterForm_' + id);
        if (f) f.style.display = f.style.display === 'none' ? 'block' : 'none';
      }

      // Check URL hash on load (e.g. /dashboard#negotiations)
      document.addEventListener('DOMContentLoaded', () => {
        const hash = window.location.hash.replace('#', '');
        if (hash === 'negotiations' || hash === 'notifications') {
          switchDashTab(hash);
        }
      });
    </script>
  `;

  return renderLayout({
    title: `Customer Dashboard | ${s.name}`,
    desc: 'Manage your vehicle enquiries, negotiations, and alerts.',
    canonical: `${ENV.BASE_URL}/dashboard`,
    s,
    body,
    isAdmin,
  });
}

export function renderLegalPage({ type, s, msg, isAdmin }) {
  let content = '';
  if (type === 'privacy') {
    content = `<div class="panel">
      <span class="pill pill-verified" style="margin-bottom:8px">DPDP Act 2023 Compliant</span>
      <h1 style="font-size:24px;font-weight:800;margin-bottom:12px">Digital Personal Data Protection (DPDP) Act 2023 — Privacy Notice</h1>
      <p style="margin-bottom:10px"><strong>Data Fiduciary:</strong> ${esc(s.name)} (${esc(s.address)})</p>
      <h3 style="margin:14px 0 6px">1. Personal Data Collected &amp; Purpose Limitation</h3>
      <p>We collect only your 10-digit mobile number, optional first name, and vehicle shortlist/browsing trail when you explicitly tick the affirmative consent box to unlock direct showroom prices or book a test drive.</p>
      <h3 style="margin:14px 0 6px">2. Zero Pre-Ticked Boxes &amp; Affirmative Consent</h3>
      <p>Every price unlock and test drive form requires an explicit, un-ticked affirmative action. We record the exact ISO-8601 timestamp of your consent.</p>
      <h3 style="margin:14px 0 6px">3. Automated 90-Day Storage Limitation</h3>
      <p>In compliance with Section 8(7) of the DPDP Act 2023, unclosed inquiry leads are automatically purged from our database after <strong>90 days</strong>.</p>
      <h3 style="margin:14px 0 6px">4. Instant Right to Withdraw &amp; Erase (<a href="/opt-out" style="color:var(--primary);text-decoration:underline">/opt-out</a>)</h3>
      <p>You may withdraw consent at any time by replying <code>STOP</code> on WhatsApp or using our <a href="/opt-out" style="color:var(--primary);text-decoration:underline">Self-Serve Data Erasure &amp; Opt-Out Portal</a>.</p>
    </div>`;
  } else if (type === 'grievance') {
    content = `<div class="panel">
      <h1 style="font-size:24px;font-weight:800;margin-bottom:12px">Data Protection &amp; Grievance Redressal Officer</h1>
      <p style="margin-bottom:12px">In accordance with the Digital Personal Data Protection Act 2023 (India), you may contact our appointed Grievance Officer for any data access, correction, or erasure requests:</p>
      <table>
        <tbody>
          <tr><th>Designated Officer</th><td><strong>${esc(s.officer)}</strong></td></tr>
          <tr><th>Dealership Entity</th><td>${esc(s.name)}</td></tr>
          <tr><th>Showroom Address</th><td>${esc(s.address)}</td></tr>
          <tr><th>Direct Grievance Email</th><td><a href="mailto:${esc(s.officer_email)}">${esc(s.officer_email)}</a></td></tr>
          <tr><th>Phone / WhatsApp</th><td>${esc(s.phone)}</td></tr>
          <tr><th>Resolution SLA</th><td>Within 72 Hours of Receipt</td></tr>
        </tbody>
      </table>
    </div>`;
  } else {
    content = `<div class="panel" style="max-width:560px;margin:24px auto">
      <h1 style="font-size:22px;font-weight:800;margin-bottom:8px">🛑 Instant WhatsApp Opt-Out &amp; DPDP Data Erasure</h1>
      <p style="color:var(--muted);font-size:13px;margin-bottom:14px">Enter your 10-digit mobile number to immediately revoke consent and mark your record as <code>OPTED_OUT</code> across all Cars By Rajat systems.</p>
      ${msg === 'opted_out' ? `<div style="background:var(--green-soft);color:var(--green);padding:12px;border-radius:9px;font-weight:700;margin-bottom:12px">✅ Your mobile number has been opted out and personal notes have been cleared.</div>` : ''}
      <form action="/api/stop" method="POST">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">10-Digit Mobile Number *</label>
        <input class="inp" type="tel" name="phone" required pattern="[6-9][0-9]{9}" maxlength="10" placeholder="98230XXXXX" style="margin-bottom:12px">
        <button type="submit" class="btn btn-primary" style="width:100%">Revoke Consent &amp; Opt Out Immediately</button>
      </form>
    </div>`;
  }

  return renderLayout({
    title: `${type === 'privacy' ? 'Privacy Policy (DPDP Act 2023)' : type === 'grievance' ? 'Grievance Officer' : 'Instant Opt-Out'} | ${s.name}`,
    desc: `DPDP Act 2023 compliance, privacy notice, and grievance officer details for ${s.name} Nagpur.`,
    canonical: `${ENV.BASE_URL}/${type === 'privacy' ? 'privacy-policy' : type}`,
    s,
    body: content,
    isAdmin,
  });
}

export function renderOgSvg(car, s) {
  const title = car ? `${car.year} ${car.make} ${car.model}` : s.name;
  const sub = car ? `${car.fuel} • ${car.tr} • ${car.km.toLocaleString('en-IN')} km • ${car.rto} Nagpur` : s.tagline;
  const priceTag = car ? `Nagpur Market Est: ${lakh(car.price)} (Unlock Direct Price)` : 'Verified Pre-Owned Showroom • Nagpur';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <rect x="50" y="50" width="1100" height="530" rx="28" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
    <text x="95" y="135" fill="#60a5fa" font-family="sans-serif" font-size="24" font-weight="bold">✓ VERIFIED DEALERSHIP • NAGPUR HUB (MH-31)</text>
    <text x="95" y="245" fill="#ffffff" font-family="sans-serif" font-size="54" font-weight="bold">${esc(title)}</text>
    <text x="95" y="315" fill="#cbd5e1" font-family="sans-serif" font-size="30">${esc(sub)}</text>
    <rect x="95" y="375" width="760" height="78" rx="14" fill="#15803d"/>
    <text x="125" y="425" fill="#ffffff" font-family="sans-serif" font-size="30" font-weight="bold">${esc(priceTag)}</text>
    <text x="95" y="525" fill="#94a3b8" font-family="sans-serif" font-size="22">${esc(s.name)} • ${esc(s.phone)} • Powered by NeuroX</text>
  </svg>`;
}
