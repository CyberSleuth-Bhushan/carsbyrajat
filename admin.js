import { esc, inr, renderLayout } from './ui.js';

export function renderAdminLogin({ err, s }) {
  const body = `
    <div class="panel" style="max-width:440px;margin:48px auto;text-align:center">
      <div style="display:flex;justify-content:center;margin-bottom:14px">
        <img src="/cbr-client-logo.jpg" alt="Cars By Rajat" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid #d4af37;box-shadow:0 4px 14px rgba(0,0,0,0.3)">
      </div>
      <span class="pill pill-hub" style="margin-bottom:8px">🔐 Dealership Command Deck</span>
      <h1 style="font-size:22px;font-weight:800;margin-bottom:6px">${esc(s.name)} — Admin Login</h1>
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px">Sign in to manage Nagpur inventory, showroom inspection reports, buyer leads, and WhatsApp handshakes.</p>
      ${err ? `<div style="background:var(--danger-soft);color:var(--danger);padding:10px;border-radius:8px;font-size:12.5px;font-weight:700;margin-bottom:12px;text-align:left">⚠️ ${esc(err)}</div>` : ''}
      <form action="/admin/login" method="POST" style="text-align:left">
        <div style="margin-bottom:10px">
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Admin Username</label>
          <input class="inp" type="text" name="username" value="admin" required>
        </div>
        <div style="margin-bottom:14px">
          <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Password</label>
          <input class="inp" type="password" name="password" value="admin123" required>
        </div>
        <button type="submit" class="btn btn-primary" style="width:100%;padding:11px">Sign In to Command Deck →</button>
      </form>
      <div style="margin-top:12px;font-size:11.5px;color:var(--muted);text-align:center">
        Default credentials: <code>admin</code> / <code>admin123</code> (configurable in <code>.env</code>)
      </div>
    </div>
  `;
  return renderLayout({
    title: `Admin Login | ${s.name}`,
    desc: 'Dealership CRM and Inventory Admin Login',
    canonical: '/admin/login',
    s,
    body,
    isAdmin: false,
  });
}

export function renderAdminDashboard({
  tab = 'leads',
  leads = [],
  cars = [],
  editCar = null,
  leadDetail = null,
  leadInteractions = [],
  leadAnalysis = null,
  enquiries = [],
  negotiations = [],
  teamMembers = [],
  activities = [],
  currentUser = null,
  s = {},
  msg = ''
}) {
  const kpi = {
    totalLeads: leads.length,
    newLeads: leads.filter((l) => l.status === 'NEW').length,
    testDrives: leads.filter((l) => l.status === 'TEST_DRIVE_SCHEDULED').length,
    closedDeals: leads.filter((l) => l.status === 'DEAL_CLOSED').length,
    availCars: cars.filter((c) => c.status === 'AVAILABLE').length,
    pendingEnquiries: enquiries.filter((e) => e.status === 'PENDING').length,
    activeNegotiations: negotiations.filter((n) => n.status !== 'REJECTED' && n.status !== 'ACCEPTED').length,
    totalTeam: teamMembers.length,
  };

  const navTabs = `
    <div class="admin-bar">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:8px;padding-right:8px;border-right:1px solid var(--border)">
          <img src="/cbr-client-logo.jpg" alt="Cars By Rajat" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1.5px solid #d4af37">
          <div>
            <strong style="font-size:13.5px;letter-spacing:0.3px;display:block">Command Deck</strong>
            ${currentUser ? `<span style="font-size:11px;color:var(--muted)">👤 ${esc(currentUser.name || currentUser.username)} (${esc(currentUser.role || 'ADMIN')})</span>` : ''}
          </div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <a href="/admin" class="btn ${tab === 'leads' || tab === 'lead-detail' ? 'btn-primary' : ''}">Leads CRM (${leads.length})</a>
          <a href="/admin/enquiries" class="btn ${tab === 'enquiries' ? 'btn-primary' : ''}">Enquiries (${enquiries.length}${kpi.pendingEnquiries ? ' · <span style="color:var(--amber)">' + kpi.pendingEnquiries + ' new</span>' : ''})</a>
          <a href="/admin/negotiations" class="btn ${tab === 'negotiations' ? 'btn-primary' : ''}">Negotiations (${negotiations.length})</a>
          <a href="/admin/team" class="btn ${tab === 'team' ? 'btn-primary' : ''}">Team &amp; Roles (${teamMembers.length})</a>
          <a href="/admin/inventory" class="btn ${tab === 'inventory' ? 'btn-primary' : ''}">Fleet &amp; Inspection CMS (${cars.length})</a>
          <a href="/admin/verification" class="btn ${tab === 'verification' ? 'btn-primary' : ''}">Verifications</a>
          <a href="/admin/activities" class="btn ${tab === 'activities' ? 'btn-primary' : ''}">Audit Logs</a>
          <a href="/admin/settings" class="btn ${tab === 'settings' ? 'btn-primary' : ''}">Settings</a>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <a href="/dashboard" class="btn btn-sm btn-ghost" target="_blank" title="Preview Customer Dashboard">Customer View</a>
        <a href="/" class="btn btn-sm" target="_blank">Storefront</a>
        <form action="/admin/logout" method="POST" style="display:inline"><button type="submit" class="btn btn-sm" style="color:var(--danger)">Sign Out</button></form>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-lbl">TOTAL INQUIRIES</div><div class="kpi-val" style="color:var(--primary)">${kpi.totalLeads}</div></div>
      <div class="kpi-card"><div class="kpi-lbl">NEW LEADS</div><div class="kpi-val" style="color:var(--amber)">${kpi.newLeads}</div></div>
      <div class="kpi-card"><div class="kpi-lbl">TEST DRIVES</div><div class="kpi-val" style="color:var(--primary)">${kpi.testDrives}</div></div>
      <div class="kpi-card"><div class="kpi-lbl">DEALS CLOSED</div><div class="kpi-val" style="color:var(--green)">${kpi.closedDeals}</div></div>
      <div class="kpi-card"><div class="kpi-lbl">ACTIVE NEGOTIATIONS</div><div class="kpi-val" style="color:#8b5cf6">${kpi.activeNegotiations}</div></div>
    </div>
    ${msg ? `<div class="panel" style="background:var(--green-soft);border-color:var(--green);color:var(--green);font-weight:700;padding:12px 16px">✓ ${esc(msg)}</div>` : ''}
  `;

  let tabContent = '';

  if (tab === 'leads') {
    const statuses = ['NEW', 'CONTACTED', 'TEST_DRIVE_SCHEDULED', 'NEGOTIATION', 'DEAL_CLOSED', 'LOST', 'OPTED_OUT'];
    const uniqueCars = [...new Map(leads.filter(l => l.car_id && l.make).map(l => [l.car_id, `${l.year} ${l.make} ${l.model}`])).entries()];
    
    const todayStr = new Date().toISOString().slice(0, 10);
    const dueTodayLeads = leads.filter(l => l.followup_date && l.followup_date <= todayStr && l.status !== 'DEAL_CLOSED' && l.status !== 'OPTED_OUT');

    const kanbanStages = [
      { key: 'NEW', label: 'New Inquiries', color: 'var(--amber)' },
      { key: 'CONTACTED', label: 'Contacted / Qualified', color: 'var(--primary)' },
      { key: 'TEST_DRIVE_SCHEDULED', label: 'Test Drive Scheduled', color: 'var(--primary)' },
      { key: 'NEGOTIATION', label: 'Negotiation / Finance', color: '#8b5cf6' },
      { key: 'DEAL_CLOSED', label: 'Deal Closed / Delivered', color: 'var(--green)' }
    ];

    const totalInvValue = cars.filter(c => c.status === 'AVAILABLE').reduce((sum, c) => sum + (c.direct || c.price || 0), 0);
    const activePipelineValue = leads.filter(l => !['DEAL_CLOSED', 'OPTED_OUT', 'LOST'].includes(l.status)).reduce((sum, l) => sum + (l.direct || 1200000), 0);

    const formatInrVal = (n) => {
      if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr';
      return '₹' + (n / 100000).toFixed(2) + ' Lakh';
    };

    const totalL = Math.max(1, leads.length);
    const contactedCount = leads.filter(l => ['CONTACTED', 'TEST_DRIVE_SCHEDULED', 'NEGOTIATION', 'DEAL_CLOSED'].includes(l.status)).length;
    const testDriveCount = leads.filter(l => ['TEST_DRIVE_SCHEDULED', 'NEGOTIATION', 'DEAL_CLOSED'].includes(l.status)).length;
    const negotiationCount = leads.filter(l => ['NEGOTIATION', 'DEAL_CLOSED'].includes(l.status)).length;
    const closedCount = leads.filter(l => l.status === 'DEAL_CLOSED').length;
    const winRate = ((closedCount / totalL) * 100).toFixed(1);

    const funnel = [
      { label: '1. Inquiries Unlocked', count: leads.length, pct: 100, color: 'var(--primary)' },
      { label: '2. Contacted & Qualified', count: contactedCount, pct: Math.round((contactedCount / totalL) * 100), color: '#0ea5e9' },
      { label: '3. Test Drives Booked', count: testDriveCount, pct: Math.round((testDriveCount / totalL) * 100), color: '#8b5cf6' },
      { label: '4. In Negotiation / Loan Desk', count: negotiationCount, pct: Math.round((negotiationCount / totalL) * 100), color: 'var(--amber)' },
      { label: '5. Deals Won / Cars Delivered', count: closedCount, pct: Math.round((closedCount / totalL) * 100), color: 'var(--green)' }
    ];

    const webCount = leads.filter(l => !l.source || l.source === 'DIGITAL_SHOWROOM').length;
    const walkinCount = leads.filter(l => l.source === 'SHOWROOM_WALK_IN').length;
    const phoneCount = leads.filter(l => l.source === 'INCOMING_PHONE_CALL').length;
    const webPct = Math.round((webCount / totalL) * 100);
    const walkinPct = Math.round((walkinCount / totalL) * 100);
    const phonePct = Math.max(0, 100 - webPct - walkinPct);

    const carInquiries = {};
    leads.forEach(l => {
      const key = l.make ? `${l.year} ${l.make} ${l.model}` : 'Showroom Catalog';
      carInquiries[key] = (carInquiries[key] || 0) + 1;
    });
    const topCars = Object.entries(carInquiries).sort((a, b) => b[1] - a[1]).slice(0, 4);
    const maxTopCarCount = Math.max(1, topCars[0] ? topCars[0][1] : 1);

    tabContent = `
      <!-- VISUAL ANALYTICS & CONVERSION FUNNEL DASHBOARD -->
      <div class="panel" style="margin-bottom:18px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:10px">
          <div>
            <h2 style="font-size:17px;font-weight:800;letter-spacing:-0.2px">
              Pipeline &amp; Conversion Analytics
            </h2>
            <p style="font-size:12px;color:var(--muted)">Sales conversion funnels, acquisition sources &amp; model demand breakdown.</p>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <div style="font-size:12px;background:var(--surface-alt);padding:6px 12px;border-radius:6px;border:1px solid var(--border)">
              <span style="color:var(--muted)">Available Fleet Stock:</span> <strong>${formatInrVal(totalInvValue)}</strong>
            </div>
            <div style="font-size:12px;background:var(--surface-alt);padding:6px 12px;border-radius:6px;border:1px solid var(--border)">
              <span style="color:var(--muted)">Active Pipeline:</span> <strong style="color:var(--primary)">${formatInrVal(activePipelineValue)}</strong>
            </div>
            <div style="font-size:12px;background:var(--surface-alt);padding:6px 12px;border-radius:6px;border:1px solid var(--border)">
              <span style="color:var(--muted)">Closing Ratio:</span> <strong style="color:var(--green)">${winRate}%</strong>
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <!-- Graphic 1: Sales Conversion Funnel -->
          <div class="analytics-card">
            <div>
              <div style="font-size:12.5px;font-weight:800;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
                <span>Sales Conversion Funnel</span>
                <span class="meta-tag" style="font-size:10px">Stage Drop-off</span>
              </div>
              ${funnel.map(step => `
                <div class="funnel-step">
                  <div class="funnel-label">
                    <span>${step.label}</span>
                    <span style="color:${step.color}">${step.count} leads (${step.pct}%)</span>
                  </div>
                  <div class="funnel-track">
                    <div class="funnel-fill" style="width:${step.pct}%;background:${step.color}"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Graphic 2: Lead Acquisition Channels -->
          <div class="analytics-card">
            <div>
              <div style="font-size:12.5px;font-weight:800;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
                <span>Acquisition Channels</span>
                <span class="meta-tag" style="font-size:10px">Source Distribution</span>
              </div>
              <div style="font-size:11.5px;color:var(--muted);margin-bottom:8px">Origin of registered buyer inquiries:</div>
              
              <!-- Multi-Segment Progress Bar -->
              <div style="height:10px;border-radius:999px;background:var(--border);overflow:hidden;display:flex;margin:12px 0 16px">
                <div style="width:${webPct}%;background:#2563eb" title="Web Showroom: ${webPct}%"></div>
                <div style="width:${walkinPct}%;background:#0f766e" title="Showroom Walk-in: ${walkinPct}%"></div>
                <div style="width:${phonePct}%;background:#b45309" title="Phone Calls: ${phonePct}%"></div>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;font-size:12px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:#2563eb;display:inline-block"></span> Digital Showroom</span>
                  <strong>${webCount} (${webPct}%)</strong>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:#0f766e;display:inline-block"></span> Showroom Walk-ins</span>
                  <strong>${walkinCount} (${walkinPct}%)</strong>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="display:flex;align-items:center;gap:6px"><span style="width:8px;height:8px;border-radius:50%;background:#b45309;display:inline-block"></span> Direct Phone Calls</span>
                  <strong>${phoneCount} (${phonePct}%)</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Graphic 3: Top In-Demand Inventory -->
          <div class="analytics-card">
            <div>
              <div style="font-size:12.5px;font-weight:800;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
                <span>Model Demand Ranking</span>
                <span class="meta-tag" style="font-size:10px">Nagpur Market</span>
              </div>
              <div style="font-size:11.5px;color:var(--muted);margin-bottom:8px">Most frequently inquired models:</div>
              
              <div style="display:flex;flex-direction:column;gap:9px">
                ${topCars.map(([name, count]) => {
                  const pct = Math.round((count / maxTopCarCount) * 100);
                  return `
                    <div>
                      <div style="display:flex;justify-content:space-between;font-size:11.5px;font-weight:700;margin-bottom:2px">
                        <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px">${esc(name)}</span>
                        <span style="color:var(--primary)">${count} inquiries</span>
                      </div>
                      <div class="funnel-track">
                        <div class="funnel-fill" style="width:${pct}%;background:linear-gradient(90deg, #1e3a8a, #3b82f6)"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Lead Management System (LMS)</h2>
            <p style="font-size:12px;color:var(--muted)">Manage digital unlocks, showroom walk-ins, phone calls &amp; track sales pipelines to closing.</p>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <button type="button" class="btn btn-sm" id="btnTableView" onclick="switchLeadView('table')" style="background:var(--primary);color:#fff;border-color:var(--primary);font-weight:600">Table View</button>
            <button type="button" class="btn btn-sm" id="btnKanbanView" onclick="switchLeadView('kanban')" style="font-weight:600">Kanban Board</button>
            <button type="button" class="btn btn-sm btn-wa-mature" onclick="openAddLeadModal()" style="font-weight:600">Add Walk-in Lead</button>
            <a href="/admin/leads.csv" class="btn btn-sm">CSV</a>
            <a href="/admin/leads.xls" class="btn btn-sm">Excel</a>
          </div>
        </div>

        ${dueTodayLeads.length > 0 ? `
          <div style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:10px 14px;border-radius:8px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <strong>Follow-up Alert:</strong> You have <strong>${dueTodayLeads.length} callbacks scheduled for today</strong> (${dueTodayLeads.map(l => esc(l.name)).join(', ')})
            </div>
            <button type="button" class="btn btn-sm" style="background:#b45309;color:#fff;border:0;font-weight:700" onclick="filterDueToday()">View Callbacks</button>
          </div>
        ` : ''}

        <!-- TABLE VIEW CONTAINER -->
        <div id="leadTableViewContainer">
          <!-- Quick Status Filter Pills -->
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;align-items:center">
            <span style="font-size:11.5px;font-weight:700;color:var(--muted)">Filter Stage:</span>
            <button type="button" class="btn btn-sm lead-status-pill active" onclick="setLeadStatusFilter('')">All (${leads.length})</button>
            <button type="button" class="btn btn-sm lead-status-pill" onclick="setLeadStatusFilter('NEW')">New (${kpi.newLeads})</button>
            <button type="button" class="btn btn-sm lead-status-pill" onclick="setLeadStatusFilter('TEST_DRIVE_SCHEDULED')">Test Drives (${kpi.testDrives})</button>
            <button type="button" class="btn btn-sm lead-status-pill" onclick="setLeadStatusFilter('CONTACTED')">Contacted</button>
            <button type="button" class="btn btn-sm lead-status-pill" onclick="setLeadStatusFilter('NEGOTIATION')">Negotiation</button>
            <button type="button" class="btn btn-sm lead-status-pill" onclick="setLeadStatusFilter('DEAL_CLOSED')">Won (${kpi.closedDeals})</button>
            <button type="button" class="btn btn-sm lead-status-pill" onclick="setLeadStatusFilter('OPTED_OUT')">Opted Out</button>
          </div>

          <!-- Comprehensive Lead Filter Bar -->
          <div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:16px;display:grid;grid-template-columns:2.5fr 1.3fr 1.5fr 1.2fr auto;gap:10px;align-items:center">
            <div>
              <input class="inp" type="search" id="leadSearch" placeholder="🔍 Search buyer name, +91 phone, email, or car..." oninput="applyLeadFilters()">
            </div>
            <div>
              <select class="inp" id="leadStatusFilter" onchange="applyLeadFilters()">
                <option value="">All Pipeline Statuses</option>
                ${statuses.map(st => `<option value="${st}">${st}</option>`).join('')}
              </select>
            </div>
            <div>
              <select class="inp" id="leadCarFilter" onchange="applyLeadFilters()">
                <option value="">All Vehicle Inquiries</option>
                ${uniqueCars.map(([id, name]) => `<option value="${id}">${esc(name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <select class="inp" id="leadDateFilter" onchange="applyLeadFilters()">
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <div>
              <button type="button" class="btn btn-sm" onclick="resetLeadFilters()">Clear Filters</button>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:var(--muted);margin-bottom:10px">
            <div>Showing <strong id="leadVisibleCount" style="color:var(--text)">${leads.length}</strong> of ${leads.length} leads</div>
            <div id="leadFilterIndicator" style="display:none;color:var(--primary);font-weight:700">⚡ Filters Active</div>
          </div>

          <div style="overflow-x:auto">
            <table id="leadsTable">
              <thead>
                <tr>
                  <th style="width:135px">Timestamp &amp; Source</th>
                  <th style="width:190px">Buyer &amp; Contact</th>
                  <th style="width:230px">Primary Vehicle &amp; Exchange</th>
                  <th style="width:170px">Next Follow-up &amp; Rep</th>
                  <th style="width:250px">Pipeline Stage &amp; Notes</th>
                  <th style="width:150px;text-align:center">Marketing Call Action</th>
                </tr>
              </thead>
              <tbody>
                ${leads
                  .map((l) => {
                    const carName = l.make ? `${l.year} ${l.make} ${l.model}` : 'Showroom Catalog';
                    const waText = `Hi ${l.name && l.name !== '-' ? l.name : 'there'}, this is Rajat from ${s.name} Nagpur regarding your inquiry for ${carName}${l.direct ? ' (Direct Price ' + inr(l.direct) + ')' : ''}. When would you like to visit our showroom?`;
                    const searchData = `${l.name} ${l.phone} ${l.email || ''} ${carName} ${l.note || ''} ${l.source || ''}`.toLowerCase();
                    const sourceTag = l.source === 'SHOWROOM_WALK_IN' ? '📍 Walk-in' : l.source === 'INCOMING_PHONE_CALL' ? '📞 Phone' : '🌐 Web Unlock';
                    return `<tr class="lead-row" data-search="${esc(searchData)}" data-status="${esc(l.status)}" data-car="${l.car_id || ''}" data-ts="${esc(l.ts)}" data-followup="${esc(l.followup_date || '')}">
                      <td style="font-size:11.5px;white-space:nowrap">
                        <div style="font-weight:700">${esc(l.ts.slice(0, 16).replace('T', ' '))}</div>
                        <span class="pill pill-hub" style="margin-top:4px">${sourceTag}</span>
                      </td>
                      <td>
                        <div style="display:flex;align-items:center;gap:6px">
                          <span style="font-weight:800;font-size:14px;letter-spacing:-0.2px">${esc(l.name || '-')}</span>
                          <span class="pill pill-verified" style="font-size:9.5px;padding:2px 5px">${esc(l.verification_status || 'VERIFIED')}</span>
                        </div>
                        <div style="font-weight:700;color:var(--primary);font-size:13px;margin-top:2px">+91 ${esc(l.phone)}</div>
                        ${l.email ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">✉️ ${esc(l.email)}</div>` : ''}
                        ${l.location ? `<div style="font-size:11px;color:var(--muted);margin-top:2px">📍 ${esc(l.location)}</div>` : ''}
                      </td>
                      <td>
                        <div style="font-weight:700;font-size:13.5px">${esc(carName)}</div>
                        ${l.direct ? `<div style="font-size:11.5px;color:var(--green);font-weight:700;margin-top:1px">Direct: ${inr(l.direct)}</div>` : ''}
                        ${l.exchange ? `<div style="font-size:11px;color:var(--amber);margin-top:2px">🔄 Exch: ${esc(l.exchange)}</div>` : ''}
                        ${l.budget ? `<div style="font-size:11px;color:var(--primary);margin-top:2px">💰 Budget: ${esc(l.budget)}</div>` : ''}
                        ${l.requirements ? `<div style="font-size:10.5px;color:var(--muted);margin-top:2px;font-style:italic">Req: ${esc(l.requirements)}</div>` : ''}
                        ${l.dealer_source && l.dealer_source !== 'CBR Own Stock' ? `
                          <div style="font-size:11px;margin-top:3px;padding:3px 7px;border-radius:5px;background:var(--surface-alt);border:1px solid var(--border);color:var(--text);display:inline-block">
                            🤝 Partner Sourced: <strong>${esc(l.dealer_source)}</strong> ${l.dealer_contact ? `<span style="color:var(--muted)">(${esc(l.dealer_contact)})</span>` : ''}
                          </div>
                        ` : ''}
                      </td>
                      <td style="min-width:160px">
                        <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.4px">Next Follow-up</div>
                        <div style="font-size:12.5px;margin-top:2px;color:${l.followup_date && l.followup_date <= todayStr ? 'var(--danger);font-weight:800' : 'var(--text);font-weight:600'}">
                          ${l.followup_date ? esc(l.followup_date) : '<span style="color:var(--subtle);font-weight:400">Not Scheduled</span>'}
                        </div>
                        <div style="font-size:11px;color:var(--subtle);margin-top:2px">👤 Rep: <strong>${esc(l.assigned_to || 'Rajat')}</strong></div>
                      </td>
                      <td>
                        <form action="/admin/lead" method="POST" style="display:flex;flex-direction:column;gap:5px;min-width:220px">
                          <input type="hidden" name="id" value="${l.id}">
                          <input type="hidden" name="assigned_to" value="${esc(l.assigned_to || 'Rajat (Showroom)')}">
                          <select class="inp" name="status" style="padding:4px 8px;font-size:12px;font-weight:700;height:30px">
                            ${statuses.map((st) => `<option value="${st}" ${l.status === st ? 'selected' : ''}>${st}</option>`).join('')}
                          </select>
                          <div style="display:flex;gap:4px">
                            <input class="inp" type="date" name="followup_date" value="${esc(l.followup_date || '')}" style="padding:3px 6px;font-size:11px;height:28px" title="Set Next Follow-up Date">
                            <input class="inp" type="text" name="note" value="${esc(l.note || '')}" placeholder="Add sales note..." style="padding:3px 6px;font-size:11px;height:28px">
                            <button type="submit" class="btn btn-sm btn-primary" style="padding:2px 8px;font-size:11px;height:28px">Save</button>
                          </div>
                        </form>
                      </td>
                      <td style="white-space:nowrap;text-align:center">
                        ${
                          l.status === 'OPTED_OUT'
                            ? `<span class="pill" style="background:var(--danger-soft);color:var(--danger)">🛑 Opted Out</span>`
                            : `<div style="display:flex;flex-direction:column;gap:5px;align-items:center;min-width:130px">
                                <a href="/admin/lead/view?id=${l.id}" class="btn btn-sm btn-primary" style="padding:5px 8px;font-size:11.5px;width:100%;font-weight:700">👤 View Profile</a>
                                <a href="tel:+91${esc(l.phone)}" class="btn btn-sm" style="background:#15803d;color:#fff;border-color:#15803d;font-weight:700;padding:5px 10px;width:100%;font-size:11px">📞 Call</a>
                                <a href="https://wa.me/91${esc(l.phone)}?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener" class="btn btn-sm" style="padding:4px 8px;font-size:11px;width:100%">💬 WhatsApp</a>
                              </div>`
                        }
                      </td>
                    </tr>`;
                  })
                  .join('')}
              </tbody>
            </table>
            <div id="noLeadsMatch" style="display:none;text-align:center;padding:32px;color:var(--muted)">
              <div style="font-size:18px;font-weight:800;color:var(--text);margin-bottom:4px">No leads match your filter criteria</div>
              <p style="font-size:13px;margin-bottom:12px">Try broadening your search query or status filter.</p>
              <button type="button" class="btn btn-sm btn-primary" onclick="resetLeadFilters()">Reset All Filters</button>
            </div>
          </div>
        </div>

        <!-- KANBAN BOARD CONTAINER -->
        <div id="leadKanbanViewContainer" style="display:none">
          <div class="kanban-board">
            ${kanbanStages.map(stage => {
              const stageLeads = leads.filter(l => l.status === stage.key);
              return `
                <div class="kanban-col">
                  <div class="kanban-col-head" style="color:${stage.color}">
                    <span>${stage.label}</span>
                    <span class="pill" style="background:var(--surface);font-size:11px">${stageLeads.length}</span>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:10px;flex:1">
                    ${stageLeads.length === 0 ? `<div style="font-size:12px;color:var(--subtle);text-align:center;padding:24px 0">No leads in this stage</div>` : ''}
                    ${stageLeads.map(l => {
                      const carName = l.make ? `${l.year} ${l.make} ${l.model}` : 'Showroom Catalog';
                      const sourceTag = l.source === 'SHOWROOM_WALK_IN' ? '📍 Walk-in' : l.source === 'INCOMING_PHONE_CALL' ? '📞 Phone' : '🌐 Web';
                      return `
                        <div class="kanban-card">
                          <div style="display:flex;justify-content:space-between;align-items:flex-start">
                            <div>
                              <strong style="font-size:13.5px">${esc(l.name || '-')}</strong>
                              <div style="font-size:12px;font-weight:700;color:var(--primary)">+91 ${esc(l.phone)}</div>
                            </div>
                            <span class="pill pill-hub" style="font-size:10px">${sourceTag}</span>
                          </div>

                          <div style="font-size:12px;font-weight:600;color:var(--text)">
                            🚗 ${esc(carName)}
                            ${l.direct ? `<span style="color:var(--green);font-size:11px">(${inr(l.direct)})</span>` : ''}
                          </div>

                          ${l.dealer_source && l.dealer_source !== 'CBR Own Stock' ? `
                            <div style="font-size:11px;color:var(--primary);font-weight:600;margin-top:2px">
                              🤝 ${esc(l.dealer_source)}
                            </div>
                          ` : ''}

                          ${l.followup_date ? `
                            <div style="font-size:11px;padding:3px 7px;border-radius:5px;background:${l.followup_date <= todayStr ? 'var(--danger-soft);color:var(--danger)' : 'var(--surface-alt);color:var(--muted)'};font-weight:700">
                              📅 Next: ${esc(l.followup_date)}
                            </div>
                          ` : ''}

                          ${l.note ? `<div style="font-size:11px;color:var(--muted);font-style:italic">"${esc(l.note)}"</div>` : ''}

                          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">
                            <a href="/admin/lead/view?id=${l.id}" class="btn btn-sm btn-primary" style="padding:4px 6px;font-size:11px;font-weight:700">👤 Profile</a>
                            <a href="tel:+91${esc(l.phone)}" class="btn btn-sm" style="background:#15803d;color:#fff;border-color:#15803d;padding:4px 6px;font-size:11px;font-weight:700">📞 Call</a>
                          </div>
                          <div style="margin-top:4px">
                            <form action="/admin/lead" method="POST" style="margin:0">
                              <input type="hidden" name="id" value="${l.id}">
                              <input type="hidden" name="note" value="${esc(l.note || '')}">
                              <input type="hidden" name="followup_date" value="${esc(l.followup_date || '')}">
                              <input type="hidden" name="assigned_to" value="${esc(l.assigned_to || '')}">
                              <select class="inp" name="status" onchange="this.form.submit()" style="padding:4px 6px;font-size:11px;font-weight:700;height:28px">
                                <option value="" disabled selected>Move Stage ▾</option>
                                ${statuses.map(st => `<option value="${st}">${st}</option>`).join('')}
                              </select>
                            </form>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- ADD SHOWROOM WALK-IN LEAD MODAL -->
      <div class="modal-backdrop" id="addLeadModal" style="display:none">
        <div class="modal" style="max-width:580px">
          <button type="button" class="modal-close" onclick="closeAddLeadModal()">✕</button>
          <span class="pill pill-verified" style="margin-bottom:8px">Showroom &amp; Phone Inquiry</span>
          <h2 style="font-size:20px;font-weight:800;margin-bottom:6px">➕ Add Walk-in / Phone Lead</h2>
          <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Log customers who visited the yard or called the dealership directly with requirements.</p>
          
          <form action="/admin/lead/create" method="POST" style="display:grid;gap:10px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Buyer Full Name *</label>
                <input class="inp" type="text" name="name" placeholder="e.g. Anand Kulkarni" required>
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">10-Digit Mobile Number *</label>
                <input class="inp" type="tel" name="phone" placeholder="98230XXXXX" required pattern="[6-9][0-9]{9}" maxlength="10">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Email Address (Optional)</label>
                <input class="inp" type="email" name="email" placeholder="anand@gmail.com">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Customer Location / Area</label>
                <input class="inp" type="text" name="location" value="Nagpur" placeholder="e.g. Ramdaspeth, Nagpur">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Vehicle of Interest</label>
                <select class="inp" name="car_id">
                  <option value="">General Showroom Inquiry</option>
                  ${cars.map(c => `<option value="${c.id}">${c.year} ${esc(c.make)} ${esc(c.model)} (${inr(c.direct)})</option>`).join('')}
                </select>
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Lead Source</label>
                <select class="inp" name="source">
                  <option value="SHOWROOM_WALK_IN">📍 Showroom Walk-in (Wardha Road)</option>
                  <option value="INCOMING_PHONE_CALL">📞 Incoming Phone Call</option>
                  <option value="CUSTOMER_REFERRAL">🤝 Customer Referral</option>
                  <option value="WHATSAPP_INQUIRY">💬 WhatsApp Direct</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Assigned Sales Rep</label>
                <select class="inp" name="assigned_to">
                  ${teamMembers.length > 0
                    ? teamMembers.map(m => `<option value="${esc(m.name)}">${esc(m.name)} (${esc(m.role)})</option>`).join('')
                    : `<option value="Rajat (Showroom)">Rajat (Showroom)</option>`}
                </select>
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Initial Pipeline Stage</label>
                <select class="inp" name="status">
                  <option value="NEW">🔥 New Inquiry</option>
                  <option value="CONTACTED">📞 Contacted / Pitch Done</option>
                  <option value="TEST_DRIVE_SCHEDULED">📅 Test Drive Scheduled</option>
                  <option value="NEGOTIATION">🤝 Negotiation / Loan Check</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Buyer Budget (Optional)</label>
                <input class="inp" type="text" name="budget" placeholder="e.g. ₹12 - 16 Lakh">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Exchange Car (Optional)</label>
                <input class="inp" type="text" name="exchange" placeholder="e.g. 2017 Swift Dzire VDi">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Specific Requirements</label>
                <input class="inp" type="text" name="requirements" placeholder="e.g. Automatic, Sunroof, under 40k km">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Next Follow-up Date</label>
                <input class="inp" type="date" name="followup_date" value="${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}">
              </div>
            </div>

            <div>
              <label style="font-size:11.5px;font-weight:700">Sales Follow-up Notes</label>
              <textarea class="inp" name="note" rows="2" placeholder="e.g. Came with family, inspected Creta & Seltos, needs bank loan pre-approval..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:11px;font-weight:700">➕ Save Lead &amp; Add to Active Pipeline</button>
          </form>
        </div>
      </div>
                  <option value="CONTACTED">📞 Contacted / Pitch Done</option>
                  <option value="TEST_DRIVE_SCHEDULED">📅 Test Drive Scheduled</option>
                  <option value="NEGOTIATION">🤝 Negotiation / Loan Check</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Buyer Budget (Optional)</label>
                <input class="inp" type="text" name="budget" placeholder="e.g. ₹12 - 16 Lakh">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Exchange Car (Optional)</label>
                <input class="inp" type="text" name="exchange" placeholder="e.g. 2017 Swift Dzire VDi">
              </div>
            </div>

            <div>
              <label style="font-size:11.5px;font-weight:700">Sales Follow-up Notes</label>
              <textarea class="inp" name="note" rows="2" placeholder="e.g. Came with family, inspected Creta & Seltos, needs bank loan pre-approval..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:11px;font-weight:700">➕ Save Lead &amp; Add to Active Pipeline</button>
          </form>
        </div>
      </div>

      <script>
        function switchLeadView(mode){
          const isTable = mode === 'table';
          document.getElementById('leadTableViewContainer').style.display = isTable ? 'block' : 'none';
          document.getElementById('leadKanbanViewContainer').style.display = isTable ? 'none' : 'block';
          
          const btnTable = document.getElementById('btnTableView');
          const btnKanban = document.getElementById('btnKanbanView');
          if (btnTable && btnKanban) {
            btnTable.style.background = isTable ? 'var(--primary)' : 'var(--surface)';
            btnTable.style.color = isTable ? '#fff' : 'var(--text)';
            btnTable.style.borderColor = isTable ? 'var(--primary)' : 'var(--border)';
            
            btnKanban.style.background = !isTable ? 'var(--primary)' : 'var(--surface)';
            btnKanban.style.color = !isTable ? '#fff' : 'var(--text)';
            btnKanban.style.borderColor = !isTable ? 'var(--primary)' : 'var(--border)';
          }
        }

        function openAddLeadModal(){
          document.getElementById('addLeadModal').style.display = 'flex';
        }
        function closeAddLeadModal(){
          document.getElementById('addLeadModal').style.display = 'none';
        }

        function filterDueToday(){
          const today = new Date().toISOString().slice(0, 10);
          switchLeadView('table');
          const rows = document.querySelectorAll('#leadsTable tbody tr.lead-row');
          let shown = 0;
          rows.forEach(r => {
            const fDate = r.getAttribute('data-followup') || '';
            const status = r.getAttribute('data-status') || '';
            const isDue = fDate && fDate <= today && status !== 'DEAL_CLOSED' && status !== 'OPTED_OUT';
            r.style.display = isDue ? '' : 'none';
            if (isDue) shown++;
          });
          document.getElementById('leadVisibleCount').textContent = shown;
          document.getElementById('leadFilterIndicator').style.display = 'block';
          document.getElementById('leadFilterIndicator').textContent = '⚡ Due Today Filter Active';
        }

        function setLeadStatusFilter(st){
          document.getElementById('leadStatusFilter').value = st;
          document.querySelectorAll('.lead-status-pill').forEach(btn => {
            const isMatch = (st === '' && btn.textContent.startsWith('All')) ||
                            (st !== '' && btn.getAttribute('onclick').includes("'" + st + "'"));
            btn.classList.toggle('btn-primary', isMatch);
          });
          applyLeadFilters();
        }

        function applyLeadFilters(){
          const s = (document.getElementById('leadSearch').value || '').toLowerCase().trim();
          const status = document.getElementById('leadStatusFilter').value;
          const car = document.getElementById('leadCarFilter').value;
          const dateFilter = document.getElementById('leadDateFilter').value;

          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;
          const rows = document.querySelectorAll('#leadsTable tbody tr.lead-row');
          let shown = 0;

          rows.forEach(r => {
            const text = r.getAttribute('data-search') || '';
            const rStatus = r.getAttribute('data-status') || '';
            const rCar = r.getAttribute('data-car') || '';
            const rTs = new Date(r.getAttribute('data-ts')).getTime();

            let ok = true;
            if (s && !text.includes(s)) ok = false;
            if (status && rStatus !== status) ok = false;
            if (car && rCar !== car) ok = false;
            if (dateFilter === 'today' && (now - rTs > oneDay)) ok = false;
            if (dateFilter === '7d' && (now - rTs > 7 * oneDay)) ok = false;
            if (dateFilter === '30d' && (now - rTs > 30 * oneDay)) ok = false;

            r.style.display = ok ? '' : 'none';
            if (ok) shown++;
          });

          document.getElementById('leadVisibleCount').textContent = shown;
          document.getElementById('noLeadsMatch').style.display = shown === 0 ? 'block' : 'none';
          const hasActiveFilters = Boolean(s || status || car || dateFilter);
          document.getElementById('leadFilterIndicator').style.display = hasActiveFilters ? 'block' : 'none';
        }

        function resetLeadFilters(){
          document.getElementById('leadSearch').value = '';
          document.getElementById('leadStatusFilter').value = '';
          document.getElementById('leadCarFilter').value = '';
          document.getElementById('leadDateFilter').value = '';
          document.querySelectorAll('.lead-status-pill').forEach(btn => {
            btn.classList.toggle('btn-primary', btn.textContent.startsWith('All'));
          });
          applyLeadFilters();
        }
      </script>
    `;
  } else if (tab === 'inventory') {
    const c = editCar || {};
    tabContent = `
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <h2 style="font-size:19px;font-weight:800">${editCar ? `✏️ Edit Vehicle: ${esc(c.year + ' ' + c.make + ' ' + c.model)}` : '➕ Onboard New Certified Vehicle (with Showroom Inspection Checklist)'}</h2>
          ${editCar ? `<a href="/admin/inventory" class="btn btn-sm">Cancel Edit / New Car</a>` : ''}
        </div>
        <form action="/admin/car/save" method="POST">
          <input type="hidden" name="id" value="${c.id || ''}">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-bottom:10px">
            <div><label style="font-size:11.5px;font-weight:700">Make *</label><input class="inp" name="make" value="${esc(c.make || '')}" placeholder="e.g. Hyundai" required></div>
            <div><label style="font-size:11.5px;font-weight:700">Model &amp; Variant *</label><input class="inp" name="model" value="${esc(c.model || '')}" placeholder="e.g. Creta SX (O) Turbo" required></div>
            <div><label style="font-size:11.5px;font-weight:700">Manufacturing Year *</label><input class="inp" type="number" name="year" value="${c.year || 2022}" required></div>
            <div><label style="font-size:11.5px;font-weight:700">Kilometres Driven *</label><input class="inp" type="number" name="km" value="${c.km || 25000}" required></div>
            <div>
              <label style="font-size:11.5px;font-weight:700">Fuel Type *</label>
              <select class="inp" name="fuel">
                ${['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].map((f) => `<option value="${f}" ${c.fuel === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700">Transmission *</label>
              <select class="inp" name="tr">
                ${['Automatic', 'Manual'].map((t) => `<option value="${t}" ${c.tr === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div><label style="font-size:11.5px;font-weight:700">Gearbox Subtype</label><input class="inp" name="tr_detail" value="${esc(c.tr_detail || '')}" placeholder="e.g. 7-Speed DCT / CVT"></div>
            <div><label style="font-size:11.5px;font-weight:700">Owner Serial (1/2/3)</label><input class="inp" type="number" name="own" value="${c.own || 1}"></div>
            <div><label style="font-size:11.5px;font-weight:700">RTO Code</label><input class="inp" name="rto" value="${esc(c.rto || 'MH-31')}"></div>
            <div><label style="font-size:11.5px;font-weight:700">Insurance Details</label><input class="inp" name="ins" value="${esc(c.ins || 'Zero Dep valid 2027')}"></div>
            <div><label style="font-size:11.5px;font-weight:700">Nagpur Market Price (₹) *</label><input class="inp" type="number" name="price" value="${c.price || 1250000}" required></div>
            <div><label style="font-size:11.5px;font-weight:700">Rajat Direct Price (₹) *</label><input class="inp" type="number" id="inpDirectPrice" name="direct" value="${c.direct || 1175000}" required oninput="calcDealerMargin()"></div>
          </div>

          <!-- INTERNAL PARTNER DEALER CLUSTERING & SOURCING (CONFIDENTIAL) -->
          <div style="background:var(--surface-alt);border:1.5px dashed var(--primary);border-radius:10px;padding:14px;margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:8px">
              <div>
                <strong style="font-size:13px;color:var(--text);display:flex;align-items:center;gap:6px">
                  🤝 Partner Dealer Sourcing &amp; Clustering (Confidential — Admin Only)
                </strong>
                <p style="font-size:11.5px;color:var(--muted);margin:2px 0 0">
                  Track which Nagpur partner dealer holds this car (co-broking / park-and-sell). Strictly hidden from customers.
                </p>
              </div>
              <span class="pill pill-hub" style="font-size:10.5px">🔒 Gated from Public Eyes</span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-top:8px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Partner Dealer / Yard Name</label>
                <input class="inp" name="dealer_source" value="${esc(c.dealer_source || 'CBR Own Stock')}" placeholder="e.g. CBR Own Stock, Rishabh Motors, VIP Cars...">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Dealer Contact Person &amp; Phone</label>
                <input class="inp" name="dealer_contact" value="${esc(c.dealer_contact || '')}" placeholder="e.g. +91 98222 XXXXX (Manoj Bhai)">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Dealer Net Procurement Cost (₹)</label>
                <input class="inp" type="number" id="inpDealerCost" name="dealer_cost" value="${c.dealer_cost || 0}" placeholder="e.g. 1050000" oninput="calcDealerMargin()">
              </div>
            </div>

            <div id="dealerMarginPreview" style="margin-top:10px;font-size:12px;padding:8px 12px;border-radius:6px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px">
              <div><strong>Dealership Gross Margin:</strong> <span id="marginVal" style="font-weight:700">Direct Inventory</span></div>
              <span id="marginBadge" class="pill" style="font-size:11px">Own Capital Stock</span>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
            <div><label style="font-size:11.5px;font-weight:700">Key Features (Comma separated)</label><input class="inp" name="feat" value="${esc(c.feat || 'Panoramic Sunroof, Ventilated Seats, 360 Camera, CarPlay')}"></div>
            <div><label style="font-size:11.5px;font-weight:700">Instagram Walkaround Reel URL</label><input class="inp" name="reel" value="${esc(c.reel || 'https://www.instagram.com/carsbyrajat/')}"></div>
          </div>

          <div style="margin-bottom:10px">
            <label style="font-size:11.5px;font-weight:700">Vehicle Photos (Upload from computer/phone OR paste comma-separated Image URLs)</label>
            <div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap">
              <input class="inp" type="text" name="photos" id="photosInput" value="${esc(c.photos || '')}" placeholder="https://... , https://..." style="flex:1">
              <label class="btn btn-sm" style="cursor:pointer">
                📷 Upload Local Photos
                <input type="file" accept="image/*" multiple style="display:none" onchange="handleLocalPhotos(this)">
              </label>
            </div>
          </div>

          <details style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:12px;margin-bottom:12px" ${editCar ? 'open' : ''}>
            <summary style="font-weight:700;font-size:13px;cursor:pointer">🛡️ Customize Showroom Inspection Report &amp; Paperwork (Use | to separate checkpoints)</summary>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px">
              <div><label style="font-size:11.5px;font-weight:700">Engine &amp; Transmission Checkpoints</label><input class="inp" name="insp_engine" value="${esc(c.insp_engine || 'Compression & idle smooth | Clutch bite & gear shifts verified | Zero oil or coolant leaks')}"></div>
              <div><label style="font-size:11.5px;font-weight:700">Tyres, Brakes &amp; Suspension</label><input class="inp" name="insp_tyres" value="${esc(c.insp_tyres || '75%+ tread depth remaining | Factory alloy wheels intact | Spare tyre unused & healthy')}"></div>
              <div><label style="font-size:11.5px;font-weight:700">Exterior, Frame &amp; Chassis</label><input class="inp" name="insp_chassis" value="${esc(c.insp_chassis || '100% Non-accidental guarantee | Original factory paint thickness verified | Zero rust or flood history')}"></div>
              <div><label style="font-size:11.5px;font-weight:700">AC, Electricals &amp; Cabin</label><input class="inp" name="insp_elec" value="${esc(c.insp_elec || 'AC chilling at 4.2°C | Power windows, sunroof & infotainment tested | All airbag & ABS sensors active')}"></div>
              <div><label style="font-size:11.5px;font-weight:700">Keys Availability</label><input class="inp" name="keys_count" value="${esc(c.keys_count || 'Original 2 Smart Keys Available')}"></div>
              <div><label style="font-size:11.5px;font-weight:700">Service History</label><input class="inp" name="service_hist" value="${esc(c.service_hist || 'Authorized Service Centre Records Verified')}"></div>
            </div>
          </details>

          <button type="submit" class="btn btn-primary">${editCar ? '💾 Save Vehicle Changes' : '➕ Publish Vehicle to Nagpur Showroom'}</button>
        </form>
      </div>

      <div class="panel">
        <h2 style="font-size:19px;font-weight:800;margin-bottom:12px">Active Showroom Fleet (${cars.length} Vehicles)</h2>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th style="width:260px">Vehicle &amp; Slug</th>
                <th style="width:190px">Specs &amp; RTO</th>
                <th style="width:170px">Market vs Direct</th>
                <th style="width:200px">Partner Sourcing &amp; Margin</th>
                <th style="width:140px">Live Status</th>
                <th style="width:120px;text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${cars
                .map(
                  (car) => {
                    const isClustered = car.dealer_source && car.dealer_source !== 'CBR Own Stock';
                    const margin = (car.direct || 0) - (car.dealer_cost || 0);
                    return `<tr>
                  <td>
                    <div style="font-weight:800;font-size:14px"><a href="/cars/${esc(car.slug)}" style="color:var(--primary)">${car.year} ${esc(car.make)} ${esc(car.model)}</a></div>
                    <div style="font-size:11.5px;color:var(--muted)">/${esc(car.slug)}</div>
                  </td>
                  <td style="font-size:12.5px">${Number(car.km).toLocaleString('en-IN')} km · ${esc(car.fuel)} · ${esc(car.tr)} · <strong>${esc(car.rto)}</strong></td>
                  <td>
                    <div style="font-size:12px;color:var(--muted)">Mkt: ${inr(car.price)}</div>
                    <div style="font-weight:800;color:var(--green);font-size:14px">Direct: ${inr(car.direct)}</div>
                  </td>
                  <td>
                    ${isClustered ? `
                      <div style="font-weight:700;font-size:12px;color:var(--text)">
                        🤝 ${esc(car.dealer_source)}
                      </div>
                      ${car.dealer_contact ? `<div style="font-size:11px;color:var(--muted);margin-top:1px">📞 ${esc(car.dealer_contact)}</div>` : ''}
                      ${car.dealer_cost > 0 ? `
                        <div style="font-size:11px;color:var(--green);font-weight:700;margin-top:2px">
                          Cost: ${inr(car.dealer_cost)} · Spread: ${inr(margin)}
                        </div>
                      ` : ''}
                    ` : `
                      <span class="pill pill-hub" style="font-size:10.5px">🏢 CBR Own Stock</span>
                    `}
                  </td>
                  <td>
                    <form action="/admin/car/status" method="POST" style="display:flex;gap:6px;align-items:center">
                      <input type="hidden" name="id" value="${car.id}">
                      <select class="inp" name="status" onchange="this.form.submit()" style="padding:4px 8px;font-size:12px;font-weight:700;height:32px;width:auto">
                        ${['AVAILABLE', 'BOOKED', 'SOLD'].map((st) => `<option value="${st}" ${car.status === st ? 'selected' : ''}>${st}</option>`).join('')}
                      </select>
                    </form>
                  </td>
                  <td style="white-space:nowrap;text-align:right">
                    <div style="display:flex;gap:6px;justify-content:flex-end">
                      <a href="/admin/inventory?edit=${car.id}" class="btn btn-sm">✏️ Edit</a>
                      <form action="/admin/car/delete" method="POST" onsubmit="return confirm('Delete this vehicle from inventory?');" style="display:inline">
                        <input type="hidden" name="id" value="${car.id}">
                        <button type="submit" class="btn btn-sm" style="color:var(--danger)">🗑️</button>
                      </form>
                    </div>
                  </td>
                </tr>`;
                  }
                )
                .join('')}
            </tbody>
          </table>
        </div>
      </div>

      <script>
        function calcDealerMargin(){
          const direct = Number(document.getElementById('inpDirectPrice')?.value || 0);
          const cost = Number(document.getElementById('inpDealerCost')?.value || 0);
          const marginVal = document.getElementById('marginVal');
          const marginBadge = document.getElementById('marginBadge');
          if (!marginVal || !marginBadge) return;
          if (!cost || cost <= 0) {
            marginVal.textContent = 'Direct Stock (₹' + direct.toLocaleString('en-IN') + ')';
            marginVal.style.color = 'var(--text)';
            marginBadge.textContent = 'Own Capital Stock';
            marginBadge.style.background = 'var(--surface-alt)';
            marginBadge.style.color = 'var(--text)';
            return;
          }
          const diff = direct - cost;
          marginVal.textContent = '₹' + diff.toLocaleString('en-IN') + ' (' + ((diff / cost) * 100).toFixed(1) + '% ROI)';
          if (diff >= 0) {
            marginVal.style.color = 'var(--green)';
            marginBadge.textContent = 'Profitable Co-broker Spread';
            marginBadge.style.background = 'var(--green-soft)';
            marginBadge.style.color = 'var(--green)';
          } else {
            marginVal.style.color = 'var(--danger)';
            marginBadge.textContent = 'Negative Margin Alert';
            marginBadge.style.background = 'var(--danger-soft)';
            marginBadge.style.color = 'var(--danger)';
          }
        }
        document.addEventListener('DOMContentLoaded', calcDealerMargin);

        function handleLocalPhotos(input){
          const files = Array.from(input.files || []);
          if (!files.length) return;
          files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxW = 900;
                const scale = Math.min(1, maxW / img.width);
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);
                canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
                const inp = document.getElementById('photosInput');
                inp.value = inp.value ? (inp.value + ',' + dataUrl) : dataUrl;
              };
              img.src = e.target.result;
            };
            reader.readAsDataURL(file);
          });
        }
      </script>
    `;
  } else if (tab === 'lead-detail' && leadDetail) {
    const l = leadDetail;
    const a = leadAnalysis || {};
    const carName = l.make ? `${l.year} ${l.make} ${l.model}` : (l.car_id ? `Vehicle #${l.car_id}` : 'General Catalog');
    const todayStr = new Date().toISOString().slice(0, 10);
    const statuses = ['NEW', 'CONTACTED', 'TEST_DRIVE_SCHEDULED', 'NEGOTIATION', 'DEAL_CLOSED', 'LOST', 'OPTED_OUT'];
    const waText = `Hi ${l.name && l.name !== '-' ? l.name : 'there'}, this is ${currentUser ? currentUser.name : 'Rajat'} from ${s.name} Nagpur following up on your inquiry.`;

    tabContent = `
      <div style="margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <a href="/admin" class="btn btn-sm">← Back to Leads Pipeline</a>
          <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Lead Profile: ${esc(l.name || 'Customer')}</h2>
          <span class="pill pill-verified">${esc(l.verification_status || 'VERIFIED')}</span>
        </div>
        <div style="display:flex;gap:6px">
          <a href="tel:+91${esc(l.phone)}" class="btn btn-sm" style="background:#15803d;color:#fff;border-color:#15803d;font-weight:700">📞 Call (+91 ${esc(l.phone)})</a>
          <a href="https://wa.me/91${esc(l.phone)}?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener" class="btn btn-sm btn-wa-mature">💬 WhatsApp</a>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-bottom:18px">
        <!-- Lead Information Panel -->
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:10px">
            <div>
              <div style="font-size:20px;font-weight:800">${esc(l.name || '-')}</div>
              <div style="font-size:13px;color:var(--primary);font-weight:700;margin-top:2px">+91 ${esc(l.phone)} ${l.email ? `· ✉️ ${esc(l.email)}` : ''}</div>
              <div style="font-size:12px;color:var(--muted);margin-top:2px">📍 Location: <strong>${esc(l.location || 'Nagpur')}</strong> · Source: <span class="pill pill-hub" style="font-size:10px">${esc(l.source || 'DIGITAL_SHOWROOM')}</span></div>
            </div>
            <form action="/admin/lead/verify" method="POST" style="margin:0">
              <input type="hidden" name="id" value="${l.id}">
              <select class="inp" name="verification_status" onchange="this.form.submit()" style="font-size:11px;font-weight:700;height:30px;width:auto">
                <option value="VERIFIED" ${l.verification_status === 'VERIFIED' ? 'selected' : ''}>✓ Verified Lead</option>
                <option value="PENDING_REVIEW" ${l.verification_status === 'PENDING_REVIEW' ? 'selected' : ''}>⏳ Pending Review</option>
                <option value="FLAGGED" ${l.verification_status === 'FLAGGED' ? 'selected' : ''}>⚠️ Flagged / Unverified</option>
              </select>
            </form>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
            <div style="background:var(--surface-alt);padding:10px;border-radius:8px;border:1px solid var(--border)">
              <div style="font-size:10.5px;color:var(--muted);font-weight:700;text-transform:uppercase">Vehicle of Interest</div>
              <div style="font-size:13.5px;font-weight:700;margin-top:2px">${esc(carName)}</div>
              ${l.direct ? `<div style="font-size:12px;color:var(--green);font-weight:700">Direct: ${inr(l.direct)}</div>` : ''}
            </div>
            <div style="background:var(--surface-alt);padding:10px;border-radius:8px;border:1px solid var(--border)">
              <div style="font-size:10.5px;color:var(--muted);font-weight:700;text-transform:uppercase">Budget &amp; Exchange</div>
              <div style="font-size:13px;font-weight:700;margin-top:2px">Budget: ${esc(l.budget || 'Flexible')}</div>
              <div style="font-size:12px;color:var(--muted)">Exchange: ${esc(l.exchange || 'None')}</div>
            </div>
          </div>

          ${l.requirements ? `
            <div style="background:var(--surface-alt);padding:10px;border-radius:8px;border:1px solid var(--border);margin-bottom:12px;font-size:12.5px">
              <strong>Buyer Requirements:</strong> ${esc(l.requirements)}
            </div>
          ` : ''}

          <!-- Assignment & Status Form -->
          <form action="/admin/lead" method="POST" style="background:var(--surface-alt);padding:12px;border-radius:10px;border:1px solid var(--border);display:grid;grid-template-columns:1.2fr 1.2fr 1fr auto;gap:8px;align-items:flex-end">
            <input type="hidden" name="id" value="${l.id}">
            <div>
              <label style="font-size:11px;font-weight:700">Assigned Team Member</label>
              <select class="inp" name="assigned_to" style="font-size:11.5px;height:32px">
                ${teamMembers.map(m => `<option value="${esc(m.name)}" ${l.assigned_to === m.name ? 'selected' : ''}>${esc(m.name)} (${esc(m.role)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;font-weight:700">Pipeline Status</label>
              <select class="inp" name="status" style="font-size:11.5px;font-weight:700;height:32px">
                ${statuses.map(st => `<option value="${st}" ${l.status === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:11px;font-weight:700">Next Follow-up</label>
              <input class="inp" type="date" name="followup_date" value="${esc(l.followup_date || '')}" style="font-size:11px;height:32px">
            </div>
            <button type="submit" class="btn btn-sm btn-primary" style="height:32px;font-weight:700">Update</button>
          </form>
        </div>

        <!-- Customer Analysis Section -->
        <div class="panel">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:1px solid var(--border);padding-bottom:8px">
            <h3 style="font-size:15px;font-weight:800">📊 Customer Analysis &amp; Insights</h3>
            <span class="pill" style="background:${a.probabilityColor || 'var(--green)'};color:#fff;font-weight:800;font-size:11px">Probability: ${esc(a.conversionProbability || 'HIGH')}</span>
          </div>

          <div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:3px">
              <span>Customer Engagement Score</span>
              <span><strong>${a.engagementScore || 65}</strong> / 100</span>
            </div>
            <div class="funnel-track" style="height:9px">
              <div class="funnel-fill" style="width:${a.engagementScore || 65}%;background:linear-gradient(90deg, #2563eb, #10b981)"></div>
            </div>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;font-size:12px">
            <div style="background:var(--surface-alt);padding:8px 10px;border-radius:6px;border:1px solid var(--border);display:flex;justify-content:space-between">
              <span style="color:var(--muted)">Estimated Budget Range:</span>
              <strong>${esc(a.budgetRange || 'Flexible')}</strong>
            </div>
            <div style="background:var(--surface-alt);padding:8px 10px;border-radius:6px;border:1px solid var(--border)">
              <div style="color:var(--muted);margin-bottom:3px">Preferred Vehicles &amp; Interest:</div>
              <div style="font-weight:700;color:var(--primary)">
                ${a.preferredVehicles && a.preferredVehicles.length > 0 ? a.preferredVehicles.map(v => esc(v)).join(' · ') : esc(carName)}
              </div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;text-align:center">
              <div style="background:var(--surface-alt);padding:6px;border-radius:6px;border:1px solid var(--border)">
                <div style="font-size:10px;color:var(--muted)">ENQUIRIES</div>
                <strong style="font-size:14px;color:var(--primary)">${a.totalEnquiries || 0}</strong>
              </div>
              <div style="background:var(--surface-alt);padding:6px;border-radius:6px;border:1px solid var(--border)">
                <div style="font-size:10px;color:var(--muted)">OFFERS</div>
                <strong style="font-size:14px;color:var(--amber)">${a.totalNegotiations || 0}</strong>
              </div>
              <div style="background:var(--surface-alt);padding:6px;border-radius:6px;border:1px solid var(--border)">
                <div style="font-size:10px;color:var(--muted)">LOGS</div>
                <strong style="font-size:14px;color:var(--green)">${a.totalInteractions || 0}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Record Follow-up / Interaction Form -->
      <div class="panel" style="margin-bottom:18px">
        <h3 style="font-size:16px;font-weight:800;margin-bottom:6px">📞 Record Customer Call, Discussion or Meeting Outcome</h3>
        <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Log discussion details, customer reactions, vendor decisions, and update next follow-up schedule.</p>
        
        <form action="/admin/lead/interaction/create" method="POST" style="display:grid;gap:10px">
          <input type="hidden" name="lead_id" value="${l.id}">
          <input type="hidden" name="created_by" value="${currentUser ? esc(currentUser.name) : 'Rajat Sharma'}">
          
          <div style="display:grid;grid-template-columns:1.2fr 2fr 1.5fr;gap:10px">
            <div>
              <label style="font-size:11.5px;font-weight:700">Interaction Type *</label>
              <select class="inp" name="type" required>
                <option value="CALL">📞 Phone Call</option>
                <option value="MEETING">🤝 Showroom Meeting / Yard Visit</option>
                <option value="TEST_DRIVE">🚗 Test Drive Conducted</option>
                <option value="WHATSAPP">💬 WhatsApp Chat Discussion</option>
                <option value="OFFER">💰 Price Negotiation Discussion</option>
                <option value="NOTE">📝 Internal Staff Note</option>
              </select>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700">Discussion Outcome / Topic *</label>
              <input class="inp" type="text" name="outcome" placeholder="e.g. Conducted test drive on Wardha Road; evaluated 2017 Swift exchange" required>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700">Next Follow-up Date</label>
              <input class="inp" type="date" name="next_followup_date" value="${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div>
              <label style="font-size:11.5px;font-weight:700">Customer Response &amp; Sentiment</label>
              <textarea class="inp" name="customer_response" rows="2" placeholder="e.g. Customer loved vehicle handling; spouse requested HDFC loan quotation"></textarea>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700">Vendor Decision &amp; Action Notes</label>
              <textarea class="inp" name="decision_notes" rows="2" placeholder="e.g. Agreed to ₹20,000 cash discount if token paid before Friday; 1-yr warranty offered"></textarea>
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end">
            <button type="submit" class="btn btn-primary" style="padding:10px 18px;font-weight:700">➕ Log Interaction &amp; Update Follow-up Schedule</button>
          </div>
        </form>
      </div>

      <!-- Chronological Interaction & Communication History Timeline -->
      <div class="panel">
        <h3 style="font-size:16px;font-weight:800;margin-bottom:6px">📜 Chronological Communication &amp; Interaction History</h3>
        <p style="font-size:12px;color:var(--muted);margin-bottom:14px">Complete audit trail of calls, showroom visits, negotiations, enquiry submissions and browsing telemetry.</p>
        
        ${leadInteractions.length === 0 ? `
          <div style="padding:20px;text-align:center;color:var(--muted);font-size:13px;background:var(--surface-alt);border-radius:8px">
            No interactions recorded yet. Use the form above to log the first discussion or call.
          </div>
        ` : `
          <div style="display:flex;flex-direction:column;gap:10px">
            ${leadInteractions.map(it => {
              const typeIcon = it.type === 'CALL' ? '📞' : it.type === 'MEETING' ? '🤝' : it.type === 'TEST_DRIVE' ? '🚗' : it.type === 'OFFER' ? '💰' : '📝';
              return `
                <div style="background:var(--surface-alt);border:1px solid var(--border);border-left:4px solid var(--primary);border-radius:8px;padding:12px 14px">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
                    <div style="display:flex;align-items:center;gap:8px">
                      <span style="font-size:16px">${typeIcon}</span>
                      <strong>${esc(it.outcome)}</strong>
                      <span class="pill pill-hub" style="font-size:10px">${esc(it.type)}</span>
                    </div>
                    <div style="font-size:11px;color:var(--muted)">
                      ${esc(it.ts ? it.ts.slice(0, 16).replace('T', ' ') : '')} · 👤 <strong>${esc(it.created_by || 'Staff')}</strong>
                    </div>
                  </div>

                  ${it.customer_response ? `
                    <div style="margin-top:6px;font-size:12.5px;color:var(--text)">
                      <strong style="color:var(--muted)">Customer Response:</strong> "${esc(it.customer_response)}"
                    </div>
                  ` : ''}

                  ${it.decision_notes ? `
                    <div style="margin-top:4px;font-size:12.5px;color:var(--green)">
                      <strong>Vendor Decision:</strong> ${esc(it.decision_notes)}
                    </div>
                  ` : ''}

                  ${it.next_followup_date ? `
                    <div style="margin-top:6px;font-size:11px;color:var(--subtle)">
                      📅 Next Scheduled Follow-up: <strong>${esc(it.next_followup_date)}</strong>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}

        ${l.trail ? `
          <div style="margin-top:16px;background:var(--surface-alt);border:1px dashed var(--border);border-radius:8px;padding:10px 14px">
            <div style="font-size:11.5px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Digital Browsing Telemetry Trail</div>
            <div style="font-size:12px;color:var(--text)">${esc(l.trail)}</div>
          </div>
        ` : ''}
      </div>
    `;
  } else if (tab === 'enquiries') {
    tabContent = `
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Customer Enquiries Management</h2>
            <p style="font-size:12px;color:var(--muted)">Manage enquiries from vehicle detail pages and the virtual chatbot assistant.</p>
          </div>
          <div style="display:flex;gap:6px">
            <span class="pill pill-hub">${enquiries.length} Total Enquiries</span>
            ${kpi.pendingEnquiries ? `<span class="pill" style="background:var(--amber-soft);color:var(--amber);font-weight:800">${kpi.pendingEnquiries} Pending</span>` : ''}
          </div>
        </div>

        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th style="width:130px">Timestamp</th>
                <th style="width:180px">Customer Contact</th>
                <th style="width:200px">Vehicle</th>
                <th style="width:240px">Customer Message</th>
                <th style="width:140px">Status &amp; Rep</th>
                <th style="width:240px">Sales Response Notes</th>
                <th style="width:120px;text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${enquiries.length === 0 ? `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--muted)">No customer enquiries recorded yet.</td></tr>` : ''}
              ${enquiries.map(eq => {
                const carTitle = eq.make ? `${eq.year} ${eq.make} ${eq.model}` : 'General Showroom';
                const waText = `Hi ${esc(eq.customer_name)}, this is ${currentUser ? currentUser.name : 'Rajat'} from ${s.name} regarding your enquiry for ${carTitle}.`;
                return `
                  <tr>
                    <td style="font-size:11.5px;white-space:nowrap">
                      <div style="font-weight:700">${esc(eq.ts ? eq.ts.slice(0, 16).replace('T', ' ') : '')}</div>
                      <span class="pill pill-hub" style="font-size:10px">ID #${eq.id}</span>
                    </td>
                    <td>
                      <div style="font-weight:800;font-size:13.5px">${esc(eq.customer_name)}</div>
                      <div style="font-weight:700;color:var(--primary);font-size:12.5px">+91 ${esc(eq.customer_phone)}</div>
                      ${eq.customer_email ? `<div style="font-size:11px;color:var(--muted)">${esc(eq.customer_email)}</div>` : ''}
                    </td>
                    <td>
                      <div style="font-weight:700;font-size:13px">${eq.slug ? `<a href="/cars/${esc(eq.slug)}" target="_blank" style="color:var(--primary)">${esc(carTitle)}</a>` : esc(carTitle)}</div>
                      ${eq.direct ? `<div style="font-size:11.5px;color:var(--green);font-weight:700">Direct: ${inr(eq.direct)}</div>` : ''}
                    </td>
                    <td style="font-size:12.5px;max-width:240px">
                      <div style="background:var(--surface-alt);padding:8px 10px;border-radius:6px;border:1px solid var(--border)">
                        "${esc(eq.message)}"
                      </div>
                    </td>
                    <td>
                      <span class="pill" style="font-size:11px;font-weight:800;${eq.status === 'RESPONDED' ? 'background:var(--green-soft);color:var(--green)' : eq.status === 'IN_REVIEW' ? 'background:var(--primary-soft);color:var(--primary)' : 'background:var(--amber-soft);color:var(--amber)'}">${esc(eq.status)}</span>
                      <div style="font-size:11px;color:var(--muted);margin-top:4px">Rep: <strong>${esc(eq.assigned_to || 'Rajat')}</strong></div>
                    </td>
                    <td>
                      <form action="/admin/enquiry/respond" method="POST" style="display:flex;flex-direction:column;gap:4px">
                        <input type="hidden" name="id" value="${eq.id}">
                        <div style="display:flex;gap:4px">
                          <select class="inp" name="status" style="height:28px;font-size:11px;font-weight:700;padding:2px 6px">
                            <option value="PENDING" ${eq.status === 'PENDING' ? 'selected' : ''}>PENDING</option>
                            <option value="IN_REVIEW" ${eq.status === 'IN_REVIEW' ? 'selected' : ''}>IN_REVIEW</option>
                            <option value="RESPONDED" ${eq.status === 'RESPONDED' ? 'selected' : ''}>RESPONDED</option>
                            <option value="CLOSED" ${eq.status === 'CLOSED' ? 'selected' : ''}>CLOSED</option>
                          </select>
                          <select class="inp" name="assigned_to" style="height:28px;font-size:11px;padding:2px 4px">
                            ${teamMembers.map(m => `<option value="${esc(m.name)}" ${eq.assigned_to === m.name ? 'selected' : ''}>${esc(m.name)}</option>`).join('')}
                          </select>
                        </div>
                        <div style="display:flex;gap:4px">
                          <input class="inp" type="text" name="response_notes" value="${esc(eq.response_notes || '')}" placeholder="Response notes visible to customer..." style="height:28px;font-size:11px;padding:3px 6px">
                          <button type="submit" class="btn btn-sm btn-primary" style="height:28px;padding:2px 8px;font-size:11px">Save</button>
                        </div>
                      </form>
                    </td>
                    <td style="white-space:nowrap;text-align:right">
                      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
                        <a href="tel:+91${esc(eq.customer_phone)}" class="btn btn-sm" style="background:#15803d;color:#fff;border-color:#15803d;padding:3px 8px;font-size:11px">📞 Call</a>
                        <a href="https://wa.me/91${esc(eq.customer_phone)}?text=${encodeURIComponent(waText)}" target="_blank" rel="noopener" class="btn btn-sm" style="padding:3px 8px;font-size:11px">💬 WhatsApp</a>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (tab === 'negotiations') {
    tabContent = `
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Car Price Negotiation Desk</h2>
            <p style="font-size:12px;color:var(--muted)">Review buyer purchase counteroffers against listed vehicle prices, make counteroffers, or accept deals.</p>
          </div>
          <div style="display:flex;gap:6px">
            <span class="pill pill-hub">${negotiations.length} Negotiations</span>
            <span class="pill pill-verified">${negotiations.filter(n => n.status === 'ACCEPTED').length} Won Deals</span>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:16px">
          ${negotiations.length === 0 ? `<div style="text-align:center;padding:36px;color:var(--muted)">No price negotiations recorded yet.</div>` : ''}
          ${negotiations.map(neg => {
            const carTitle = `${neg.year} ${neg.make} ${neg.model}`;
            const discount = neg.listed_price - neg.current_customer_offer;
            const carImg = (neg.photos || '').split(',')[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80';
            const stColor = neg.status === 'ACCEPTED' ? 'var(--green)' : neg.status === 'REJECTED' ? 'var(--danger)' : neg.status === 'VENDOR_COUNTERED' ? 'var(--primary)' : 'var(--amber)';

            return `
              <div style="background:var(--surface-alt);border:1.5px solid var(--border);border-radius:12px;padding:16px">
                <div style="display:grid;grid-template-columns:130px 1fr;gap:16px">
                  <div style="border-radius:8px;overflow:hidden;background:#0f172a;height:95px">
                    <img src="${esc(carImg)}" alt="${esc(carTitle)}" style="width:100%;height:100%;object-fit:cover">
                  </div>
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px">
                      <div>
                        <h3 style="font-size:16px;font-weight:800"><a href="/cars/${esc(neg.slug)}" target="_blank" style="color:var(--primary)">${esc(carTitle)}</a></h3>
                        <div style="font-size:12px;color:var(--muted)">Buyer: <strong>${esc(neg.customer_name)}</strong> (+91 ${esc(neg.customer_phone)}) · ID #${neg.id}</div>
                      </div>
                      <span class="pill" style="background:var(--surface);color:${stColor};border:1px solid ${stColor};font-weight:800">${esc(neg.status)}</span>
                    </div>

                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;margin:10px 0">
                      <div style="background:var(--surface);padding:8px 10px;border-radius:8px;border:1px solid var(--border)">
                        <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">Listed Price</div>
                        <div style="font-size:14px;font-weight:700">${inr(neg.listed_price)}</div>
                      </div>
                      <div style="background:var(--surface);padding:8px 10px;border-radius:8px;border:1px solid var(--border)">
                        <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">Buyer Offer</div>
                        <div style="font-size:14px;font-weight:800;color:var(--primary)">${inr(neg.current_customer_offer)} <span style="font-size:11px;color:var(--muted)">(-${inr(discount)})</span></div>
                      </div>
                      <div style="background:var(--surface);padding:8px 10px;border-radius:8px;border:1px solid var(--border)">
                        <div style="font-size:10px;color:var(--muted);font-weight:700;text-transform:uppercase">Vendor Offer</div>
                        <div style="font-size:14px;font-weight:800;color:${neg.current_vendor_offer ? 'var(--green)' : 'var(--muted)'}">${neg.current_vendor_offer ? inr(neg.current_vendor_offer) : 'None'}</div>
                      </div>
                    </div>

                    <!-- Negotiation History Thread -->
                    ${neg.messages && neg.messages.length > 0 ? `
                      <div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:10px">
                        <div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:4px">Negotiation Discussion Thread:</div>
                        <div style="display:flex;flex-direction:column;gap:5px">
                          ${neg.messages.map(m => `
                            <div style="font-size:11.5px;padding:5px 8px;border-radius:5px;background:${m.sender_type === 'VENDOR' ? 'var(--green-soft)' : 'var(--surface-alt)'}">
                              <strong>${m.sender_type === 'VENDOR' ? '🏢 Dealership Desk (' + esc(m.sender_name) + ')' : '👤 Buyer (' + esc(m.sender_name) + ')'}:</strong>
                              Offered <strong>${inr(m.offered_price)}</strong> ${m.notes ? `— "${esc(m.notes)}"` : ''}
                              <span style="font-size:10px;color:var(--muted);margin-left:4px">(${esc(m.created_at ? m.created_at.slice(0, 16).replace('T', ' ') : '')})</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}

                    <!-- Vendor Action Form -->
                    ${neg.status !== 'ACCEPTED' && neg.status !== 'REJECTED' ? `
                      <form action="/admin/negotiation/respond" method="POST" style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:8px">
                        <input type="hidden" name="id" value="${neg.id}">
                        <div style="display:grid;grid-template-columns:1fr 2fr;gap:8px">
                          <div>
                            <label style="font-size:11px;font-weight:700">Vendor Counter Price (₹)</label>
                            <input class="inp" type="number" name="counter_price" placeholder="e.g. ${Math.round((neg.listed_price + neg.current_customer_offer) / 2)}" style="height:32px;font-size:12px">
                          </div>
                          <div>
                            <label style="font-size:11px;font-weight:700">Counteroffer Discussion Notes</label>
                            <input class="inp" type="text" name="notes" placeholder="e.g. Counter at ₹14.10L with complimentary RTO & 1-Year Comprehensive Warranty" style="height:32px;font-size:12px">
                          </div>
                        </div>
                        <div style="display:flex;gap:6px;justify-content:flex-end">
                          <button type="submit" name="action" value="accept" class="btn btn-sm btn-primary" style="background:#15803d;border-color:#15803d;font-weight:700">✓ Accept Buyer's ₹${Number(neg.current_customer_offer).toLocaleString('en-IN')}</button>
                          <button type="submit" name="action" value="counter" class="btn btn-sm btn-primary" style="font-weight:700">🤝 Submit Counteroffer</button>
                          <button type="submit" name="action" value="reject" class="btn btn-sm" style="color:var(--danger)" onclick="return confirm('Reject this purchase offer?')">✕ Reject</button>
                          <a href="tel:+91${esc(neg.customer_phone)}" class="btn btn-sm">📞 Call</a>
                          <a href="https://wa.me/91${esc(neg.customer_phone)}" target="_blank" rel="noopener" class="btn btn-sm btn-wa-mature">💬 WhatsApp</a>
                        </div>
                      </form>
                    ` : `
                      <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
                        <span style="font-size:12px;font-weight:700;color:${stColor}">Final Status: ${esc(neg.status)}</span>
                        <a href="tel:+91${esc(neg.customer_phone)}" class="btn btn-sm">📞 Call Buyer</a>
                      </div>
                    `}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  } else if (tab === 'team') {
    tabContent = `
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Admin &amp; Team Management (RBAC)</h2>
            <p style="font-size:12px;color:var(--muted)">Manage dealership staff accounts, assign roles and operational responsibilities.</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('addMemberModal').style.display='flex'">➕ Add Team Member</button>
        </div>

        <div style="overflow-x:auto;margin-bottom:20px">
          <table>
            <thead>
              <tr>
                <th style="width:170px">Member Name &amp; User</th>
                <th style="width:130px">Role (RBAC)</th>
                <th style="width:250px">Assigned Responsibilities</th>
                <th style="width:180px">Contact Info</th>
                <th style="width:110px">Status</th>
                <th style="width:140px">Last Sign-in</th>
                <th style="width:100px;text-align:right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${teamMembers.map(m => {
                const roleColor = m.role === 'ADMIN' ? '#dc2626' : m.role === 'SALES_MANAGER' ? '#8b5cf6' : m.role === 'INVENTORY_MANAGER' ? '#0f766e' : 'var(--primary)';
                return `
                  <tr>
                    <td>
                      <div style="font-weight:800;font-size:13.5px">${esc(m.name)}</div>
                      <div style="font-size:11px;color:var(--muted)">@${esc(m.username)}</div>
                    </td>
                    <td>
                      <span class="pill" style="background:var(--surface-alt);color:${roleColor};border:1px solid ${roleColor};font-weight:800;font-size:10.5px">${esc(m.role)}</span>
                    </td>
                    <td style="font-size:12px">${esc(m.responsibilities || 'Showroom operations')}</td>
                    <td style="font-size:12px">
                      <div>📞 +91 ${esc(m.phone || '—')}</div>
                      ${m.email ? `<div style="font-size:11px;color:var(--muted)">✉️ ${esc(m.email)}</div>` : ''}
                    </td>
                    <td>
                      <span class="pill ${m.status === 'ACTIVE' ? 'pill-verified' : ''}" style="${m.status !== 'ACTIVE' ? 'background:var(--danger-soft);color:var(--danger)' : ''};font-size:10.5px">${esc(m.status)}</span>
                    </td>
                    <td style="font-size:11.5px;color:var(--muted)">
                      ${m.last_login ? esc(m.last_login.slice(0, 16).replace('T', ' ')) : 'Never'}
                    </td>
                    <td style="white-space:nowrap;text-align:right">
                      <button type="button" class="btn btn-sm" onclick="openEditMember(${m.id}, '${esc(m.name)}', '${esc(m.role)}', '${esc(m.responsibilities)}', '${esc(m.status)}')">Edit</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Role Permissions Matrix Reference Card -->
        <div style="background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:14px">
          <h3 style="font-size:14px;font-weight:800;margin-bottom:8px">🛡️ Role-Based Access Control (RBAC) Permissions Matrix</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;font-size:12px">
            <div style="background:var(--surface);padding:10px;border-radius:8px;border:1px solid var(--border)">
              <strong style="color:#dc2626">👑 ADMIN</strong>
              <p style="color:var(--muted);margin-top:4px">Full system control. Team provisioning, inventory CMS, final negotiation approval, data retention, dealership settings.</p>
            </div>
            <div style="background:var(--surface);padding:10px;border-radius:8px;border:1px solid var(--border)">
              <strong style="color:#8b5cf6">📋 SALES MANAGER</strong>
              <p style="color:var(--muted);margin-top:4px">Lead distribution, team oversight, customer enquiry responses, counteroffer proposal, performance evaluation.</p>
            </div>
            <div style="background:var(--surface);padding:10px;border-radius:8px;border:1px solid var(--border)">
              <strong style="color:var(--primary)">💼 SALES REP</strong>
              <p style="color:var(--muted);margin-top:4px">Manage assigned buyer leads, record follow-up calls &amp; discussions, conduct showroom test drives, pitch vehicles.</p>
            </div>
            <div style="background:var(--surface);padding:10px;border-radius:8px;border:1px solid var(--border)">
              <strong style="color:#0f766e">🔧 INVENTORY MANAGER</strong>
              <p style="color:var(--muted);margin-top:4px">Fleet onboarding, showroom inspection checklist, RTO clearance &amp; insurance verification, partner stock tracking.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ADD TEAM MEMBER MODAL -->
      <div class="modal-backdrop" id="addMemberModal" style="display:none">
        <div class="modal" style="max-width:500px">
          <button type="button" class="modal-close" onclick="document.getElementById('addMemberModal').style.display='none'">✕</button>
          <span class="pill pill-verified" style="margin-bottom:8px">Staff Account Provisioning</span>
          <h2 style="font-size:19px;font-weight:800;margin-bottom:6px">➕ Add New Team Member</h2>
          <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Create access credentials with designated permissions.</p>

          <form action="/admin/team/create" method="POST" style="display:grid;gap:10px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Username *</label>
                <input class="inp" type="text" name="username" placeholder="e.g. rahul_sales" required>
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Initial Password *</label>
                <input class="inp" type="password" name="password" placeholder="Pass123" required>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Full Name *</label>
                <input class="inp" type="text" name="name" placeholder="Rahul Sharma" required>
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Role *</label>
                <select class="inp" name="role" required>
                  <option value="SALES_REP">Sales Representative</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="INVENTORY_MANAGER">Inventory Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
              <div>
                <label style="font-size:11.5px;font-weight:700">Mobile Number</label>
                <input class="inp" type="tel" name="phone" placeholder="98230XXXXX">
              </div>
              <div>
                <label style="font-size:11.5px;font-weight:700">Email Address</label>
                <input class="inp" type="email" name="email" placeholder="rahul@carsbyrajat.in">
              </div>
            </div>

            <div>
              <label style="font-size:11.5px;font-weight:700">Assigned Responsibilities</label>
              <textarea class="inp" name="responsibilities" rows="2" placeholder="e.g. Creta & Luxury fleet lead management, Wardha Road test drive coordination"></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="padding:10px;font-weight:700">➕ Create Staff Account</button>
          </form>
        </div>
      </div>

      <!-- EDIT TEAM MEMBER MODAL -->
      <div class="modal-backdrop" id="editMemberModal" style="display:none">
        <div class="modal" style="max-width:480px">
          <button type="button" class="modal-close" onclick="document.getElementById('editMemberModal').style.display='none'">✕</button>
          <h2 style="font-size:19px;font-weight:800;margin-bottom:4px">✏️ Update Team Member</h2>
          <p style="font-size:12px;color:var(--muted);margin-bottom:12px" id="editMemberNameLbl"></p>

          <form action="/admin/team/update" method="POST" style="display:grid;gap:10px">
            <input type="hidden" id="editMemberId" name="id" value="">
            <div>
              <label style="font-size:11.5px;font-weight:700">Role</label>
              <select class="inp" id="editMemberRole" name="role">
                <option value="SALES_REP">Sales Representative</option>
                <option value="SALES_MANAGER">Sales Manager</option>
                <option value="INVENTORY_MANAGER">Inventory Manager</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700">Account Status</label>
              <select class="inp" id="editMemberStatus" name="status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE (Deactivated)</option>
              </select>
            </div>
            <div>
              <label style="font-size:11.5px;font-weight:700">Assigned Responsibilities</label>
              <textarea class="inp" id="editMemberResp" name="responsibilities" rows="2"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="padding:10px;font-weight:700">Save Changes</button>
          </form>
        </div>
      </div>

      <script>
        function openEditMember(id, name, role, resp, status){
          document.getElementById('editMemberId').value = id;
          document.getElementById('editMemberNameLbl').textContent = name;
          document.getElementById('editMemberRole').value = role;
          document.getElementById('editMemberStatus').value = status;
          document.getElementById('editMemberResp').value = resp;
          document.getElementById('editMemberModal').style.display = 'flex';
        }
      </script>
    `;
  } else if (tab === 'verification') {
    tabContent = `
      <div class="panel">
        <h2 style="font-size:18px;font-weight:800;margin-bottom:4px">🛡️ Customer &amp; Vehicle Verification System</h2>
        <p style="font-size:12px;color:var(--muted);margin-bottom:14px">Administrator-controlled verification statuses, RTO document clearances, and buyer verification audits.</p>

        <!-- Vehicle Verification Section -->
        <h3 style="font-size:15px;font-weight:800;margin-bottom:8px">1. Fleet Verification Checklist (${cars.length} Vehicles)</h3>
        <div style="overflow-x:auto;margin-bottom:24px">
          <table>
            <thead>
              <tr>
                <th style="width:200px">Vehicle</th>
                <th style="width:110px">Inspection Cert</th>
                <th style="width:110px">RC Verified</th>
                <th style="width:110px">Insurance</th>
                <th style="width:100px">PUCC</th>
                <th style="width:130px">Status</th>
                <th style="width:260px">Verification Notes</th>
                <th style="width:100px;text-align:right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${cars.map(c => `
                <tr>
                  <td>
                    <div style="font-weight:700;font-size:13px"><a href="/cars/${esc(c.slug)}" target="_blank" style="color:var(--primary)">${c.year} ${esc(c.make)} ${esc(c.model)}</a></div>
                    <span class="pill pill-hub" style="font-size:10px">${esc(c.rto)}</span>
                  </td>
                  <td>${c.inspection_verified ? '✅ Passed' : '❌ Pending'}</td>
                  <td>${c.rc_verified ? '✅ Verified' : '❌ Pending'}</td>
                  <td>${c.insurance_verified ? '✅ Active' : '❌ Expired'}</td>
                  <td>${c.puc_verified ? '✅ Cleared' : '❌ Pending'}</td>
                  <td>
                    <span class="pill pill-verified" style="font-size:11px">${esc(c.verification_status || 'VERIFIED')}</span>
                  </td>
                  <td>
                    <form action="/admin/car/verify" method="POST" style="display:flex;gap:4px">
                      <input type="hidden" name="id" value="${c.id}">
                      <input class="inp" type="text" name="verification_notes" value="${esc(c.verification_notes || '')}" placeholder="Inspection notes..." style="height:28px;font-size:11px">
                      <button type="submit" class="btn btn-sm btn-primary" style="height:28px;padding:2px 8px;font-size:11px">Save</button>
                    </form>
                  </td>
                  <td style="white-space:nowrap;text-align:right">
                    <form action="/admin/car/verify" method="POST" style="display:inline">
                      <input type="hidden" name="id" value="${c.id}">
                      <input type="hidden" name="status" value="${c.verification_status === 'VERIFIED' ? 'PENDING_DOCS' : 'VERIFIED'}">
                      <button type="submit" class="btn btn-sm" style="font-size:11px">${c.verification_status === 'VERIFIED' ? 'Mark Pending' : '✓ Approve'}</button>
                    </form>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Customer Verification Section -->
        <h3 style="font-size:15px;font-weight:800;margin-bottom:8px">2. Customer Phone &amp; Consent Verification</h3>
        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th style="width:160px">Customer Name</th>
                <th style="width:140px">Mobile Number</th>
                <th style="width:140px">Heuristic Check</th>
                <th style="width:180px">DPDP Affirmative Consent</th>
                <th style="width:130px">Status</th>
                <th style="width:120px;text-align:right">Action</th>
              </tr>
            </thead>
            <tbody>
              ${leads.map(l => `
                <tr>
                  <td style="font-weight:700">${esc(l.name || '-')}</td>
                  <td style="font-weight:700;color:var(--primary)">+91 ${esc(l.phone)}</td>
                  <td><span class="pill pill-verified" style="font-size:10px">✓ Genuine Mobile</span></td>
                  <td style="font-size:11px;color:var(--muted)">
                    ✓ Affirmative (${esc(l.consent_ts ? l.consent_ts.slice(0, 16).replace('T', ' ') : 'Logged')})
                  </td>
                  <td>
                    <span class="pill pill-verified" style="font-size:11px">${esc(l.verification_status || 'VERIFIED')}</span>
                  </td>
                  <td style="text-align:right">
                    <form action="/admin/lead/verify" method="POST" style="display:inline">
                      <input type="hidden" name="id" value="${l.id}">
                      <input type="hidden" name="verification_status" value="${l.verification_status === 'VERIFIED' ? 'FLAGGED' : 'VERIFIED'}">
                      <button type="submit" class="btn btn-sm" style="font-size:11px">${l.verification_status === 'VERIFIED' ? 'Flag' : '✓ Verify'}</button>
                    </form>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (tab === 'activities') {
    tabContent = `
      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <h2 style="font-size:18px;font-weight:800;letter-spacing:-0.2px">Team Activity Audit Logs</h2>
            <p style="font-size:12px;color:var(--muted)">Chronological security log of team member logins, lead updates, enquiry responses, and inventory modifications.</p>
          </div>
          <span class="pill pill-hub">${activities.length} Events Logged</span>
        </div>

        <div style="overflow-x:auto">
          <table>
            <thead>
              <tr>
                <th style="width:140px">Timestamp</th>
                <th style="width:160px">Team Member</th>
                <th style="width:140px">Action Performed</th>
                <th style="width:130px">Target</th>
                <th>Activity Details</th>
              </tr>
            </thead>
            <tbody>
              ${activities.length === 0 ? `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--muted)">No activity logged yet.</td></tr>` : ''}
              ${activities.map(act => `
                <tr>
                  <td style="font-size:11.5px;color:var(--muted)">${esc(act.ts ? act.ts.slice(0, 16).replace('T', ' ') : '')}</td>
                  <td style="font-weight:700;font-size:13px">👤 ${esc(act.member_name)}</td>
                  <td><span class="pill pill-hub" style="font-size:10.5px">${esc(act.action)}</span></td>
                  <td style="font-size:12px">${esc(act.target_type)} #${esc(act.target_id)}</td>
                  <td style="font-size:12.5px">${esc(act.details)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  } else if (tab === 'settings') {
    tabContent = `
      <div class="panel" style="max-width:740px">
        <h2 style="font-size:19px;font-weight:800;margin-bottom:6px">⚙️ Dealership Branding, Contact &amp; AdSense Configuration</h2>
        <p style="font-size:12.5px;color:var(--muted);margin-bottom:14px">Changes update the live storefront, WhatsApp CTAs, JSON-LD AutoDealer schema, and DPDP legal pages immediately.</p>
        <form action="/admin/settings" method="POST" style="display:grid;gap:10px">
          <div><label style="font-size:12px;font-weight:700">Dealership Brand Name</label><input class="inp" name="name" value="${esc(s.name)}"></div>
          <div><label style="font-size:12px;font-weight:700">Hero Tagline</label><input class="inp" name="tagline" value="${esc(s.tagline)}"></div>
          <div><label style="font-size:12px;font-weight:700">Nagpur Showroom Address</label><input class="inp" name="address" value="${esc(s.address)}"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div><label style="font-size:12px;font-weight:700">Display Phone Number</label><input class="inp" name="phone" value="${esc(s.phone)}"></div>
            <div><label style="font-size:12px;font-weight:700">WhatsApp Number (with 91 prefix, digits only)</label><input class="inp" name="whatsapp" value="${esc(s.whatsapp)}"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div><label style="font-size:12px;font-weight:700">Instagram Handle (without @)</label><input class="inp" name="insta" value="${esc(s.insta)}"></div>
            <div><label style="font-size:12px;font-weight:700">Instagram Follower Count Badge</label><input class="inp" name="followers" value="${esc(s.followers)}"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div><label style="font-size:12px;font-weight:700">DPDP Grievance Officer Name</label><input class="inp" name="officer" value="${esc(s.officer)}"></div>
            <div><label style="font-size:12px;font-weight:700">Grievance Officer Email</label><input class="inp" name="officer_email" value="${esc(s.officer_email)}"></div>
          </div>
          <div><label style="font-size:12px;font-weight:700">Google AdSense Publisher ID (e.g. ca-pub-XXXXXXXXXXXXXXXX, leave blank for Sponsored Preview Banners)</label><input class="inp" name="adsense_id" value="${esc(s.adsense_id || '')}" placeholder="ca-pub-..."></div>
          <button type="submit" class="btn btn-primary" style="margin-top:6px">💾 Save Showroom Settings</button>
        </form>
      </div>
    `;
  }

  return renderLayout({
    title: `Command Deck (${tab.toUpperCase()}) | ${s.name}`,
    desc: 'Cars By Rajat Admin CRM and Inventory Management',
    canonical: '/admin',
    s,
    body: navTabs + tabContent,
    isAdmin: true,
  });
}
