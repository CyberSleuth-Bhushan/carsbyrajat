import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Car,
  Mail,
  Handshake,
  Shield,
  FileCheck,
  Activity,
  Settings,
  Plus,
  Download,
  Search,
  MessageSquare,
  Phone,
  Eye,
  Check,
  X,
  Edit,
  Trash2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import type { Lead, Car as CarType, Enquiry, Negotiation, TeamMember, TeamActivity, ShowroomSettings, CustomerInsights } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { adminUser, logoutAdmin } = useAuth();
  const [tab, setTab] = useState<'leads' | 'lead-detail' | 'enquiries' | 'negotiations' | 'inventory' | 'team' | 'verification' | 'activities' | 'settings'>('leads');

  // Data States
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cars, setCars] = useState<CarType[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);

  // Lead Detail View State
  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [leadDetail, setLeadDetail] = useState<Lead | null>(null);
  const [leadInsights, setLeadInsights] = useState<CustomerInsights | null>(null);
  const [leadInteractions, setLeadInteractions] = useState<any[]>([]);

  // Filter States
  const [leadStatusFilter, setLeadStatusFilter] = useState('ALL');
  const [leadSearch, setLeadSearch] = useState('');

  // Modals & Form States
  const [addLeadModalOpen, setAddLeadModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editCarData, setEditCarData] = useState<Partial<CarType> | null>(null);

  // New Lead Form
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');
  const [newLeadEmail, setNewLeadEmail] = useState('');
  const [newLeadCarId, setNewLeadCarId] = useState('');
  const [newLeadSource, setNewLeadSource] = useState('SHOWROOM_WALK_IN');
  const [newLeadBudget, setNewLeadBudget] = useState('');
  const [newLeadNotes, setNewLeadNotes] = useState('');
  const [newLeadFollowup, setNewLeadFollowup] = useState('');

  // Interaction Form
  const [interType, setInterType] = useState('CALL');
  const [interOutcome, setInterOutcome] = useState('');
  const [interResponse, setInterResponse] = useState('');
  const [interNotes, setInterNotes] = useState('');
  const [interNextDate, setInterNextDate] = useState('');

  // Negotiation Action State
  const [negActionId, setNegActionId] = useState<number | null>(null);
  const [negCounterPrice, setNegCounterPrice] = useState('');
  const [negNotes, setNegNotes] = useState('');

  // New Staff Member Form
  const [newStaffUser, setNewStaffUser] = useState('');
  const [newStaffPass, setNewStaffPass] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'ADMIN' | 'SALES_MANAGER' | 'SALES_REP' | 'INVENTORY_MANAGER'>('SALES_REP');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffResp, setNewStaffResp] = useState('');

  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;

  const fetchAllData = async () => {
    try {
      const [statsRes, leadsRes, carsRes, enqRes, negRes, teamRes, actRes, setRes] = await Promise.all([
        api.getDashboardStats(),
        api.getLeads(),
        api.getAdminInventory(),
        api.getAdminEnquiries(),
        api.getAdminNegotiations(),
        api.getTeamMembers(),
        api.getAuditActivities(),
        api.getAdminSettings(),
      ]);

      setStats(statsRes.stats);
      setLeads(leadsRes.leads);
      setCars(carsRes.cars);
      setEnquiries(enqRes.enquiries);
      setNegotiations(negRes.negotiations);
      setTeamMembers(teamRes.teamMembers);
      setActivities(actRes.activities);
      setSettings(setRes.settings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const openLeadDetail = async (id: number) => {
    setSelectedLeadId(id);
    setTab('lead-detail');
    try {
      const res = await api.getLeadById(id);
      setLeadDetail(res.lead);
      setLeadInsights(res.insights);
      setLeadInteractions(res.interactions);
    } catch (err) {
      alert('Failed to load lead dossier');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLead({
        name: newLeadName,
        phone: newLeadPhone,
        email: newLeadEmail,
        car_id: newLeadCarId ? Number(newLeadCarId) : null,
        source: newLeadSource,
        budget: newLeadBudget,
        note: newLeadNotes,
        followup_date: newLeadFollowup,
      });
      alert('New lead added to pipeline.');
      setAddLeadModalOpen(false);
      setNewLeadName('');
      setNewLeadPhone('');
      setNewLeadEmail('');
      setNewLeadBudget('');
      setNewLeadNotes('');
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to create lead.');
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    try {
      await api.addLeadInteraction(selectedLeadId, {
        type: interType,
        outcome: interOutcome,
        customer_response: interResponse,
        decision_notes: interNotes,
        next_followup_date: interNextDate,
      });
      alert('Interaction and follow-up recorded.');
      setInterOutcome('');
      setInterResponse('');
      setInterNotes('');
      setInterNextDate('');
      openLeadDetail(selectedLeadId);
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to record interaction.');
    }
  };

  const handleRespondEnquiry = async (enquiryId: number, status: string, notes: string) => {
    try {
      await api.respondToEnquiry(enquiryId, { status, response_notes: notes });
      alert('Enquiry response saved.');
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update enquiry.');
    }
  };

  const handleRespondNegotiation = async (negId: number, action: 'accept' | 'counter' | 'reject') => {
    try {
      await api.respondToNegotiation(negId, {
        action,
        counter_price: Number(negCounterPrice) || undefined,
        notes: negNotes,
      });
      alert(`Negotiation ${action}ed.`);
      setNegActionId(null);
      setNegCounterPrice('');
      setNegNotes('');
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to record negotiation action.');
    }
  };

  const handleSaveCar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCarData) return;
    try {
      await api.saveCar(editCarData);
      alert('Vehicle and inspection dossier saved.');
      setEditCarData(null);
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save vehicle.');
    }
  };

  const handleToggleCarStatus = async (carId: number, currentStatus: 'AVAILABLE' | 'BOOKED' | 'SOLD') => {
    const nextStatus: Record<string, 'AVAILABLE' | 'BOOKED' | 'SOLD'> = {
      AVAILABLE: 'BOOKED',
      BOOKED: 'SOLD',
      SOLD: 'AVAILABLE',
    };
    const targetStatus = nextStatus[currentStatus];
    try {
      await api.updateCarStatus(carId, targetStatus);
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to update vehicle status.');
    }
  };

  const handleDeleteCar = async (carId: number) => {
    if (!confirm('Are you sure you want to permanently delete this vehicle?')) return;
    try {
      await api.deleteCar(carId);
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete vehicle.');
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTeamMember({
        username: newStaffUser,
        password: newStaffPass,
        name: newStaffName,
        role: newStaffRole,
        email: newStaffEmail,
        phone: newStaffPhone,
        responsibilities: newStaffResp,
      });
      alert('New staff account provisioned.');
      setAddMemberModalOpen(false);
      setNewStaffUser('');
      setNewStaffPass('');
      setNewStaffName('');
      fetchAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to provision staff member.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.saveAdminSettings(settings);
      alert('Showroom settings updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--muted)' }}>Loading Dealership Command Deck...</div>;
  }

  return (
    <div style={{ padding: '28px 0 70px', background: 'var(--bg)', minHeight: 'calc(100vh - 74px)' }}>
      <div className="container">
        {/* Command Deck Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pill pill-soft-blue" style={{ fontSize: '11px' }}>
                <Sparkles size={12} color="var(--primary)" /> ENTERPRISE DEALERSHIP COMMAND DECK
              </span>
              <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                Staff: <strong style={{ color: 'var(--text-heading)' }}>{adminUser?.name || 'Rajat Sharma'}</strong> ({adminUser?.role || 'ADMIN'})
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--text-heading)', letterSpacing: '-0.025em' }}>
              Nagpur Fleet &amp; Customer Relationship Management
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="/" target="_blank" rel="noopener" className="btn btn-sm btn-secondary">
              <Eye size={14} color="var(--primary)" /> Open Storefront
            </a>
            <button type="button" onClick={() => logoutAdmin()} className="btn btn-sm btn-danger">
              Log Out
            </button>
          </div>
        </div>

        {/* KPI Summary Cards: Soft Light Theme with 48px x 48px Icon Containers */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="icon-box">
                <Users size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL LEADS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-heading)', marginTop: '2px' }}>{stats.totalLeads}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: '600' }}>{stats.newLeads} Fresh in Pipeline</div>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="icon-box">
                <Calendar size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TEST DRIVES</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-heading)', marginTop: '2px' }}>{stats.activeTestDrives}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>Wardha Road Hub</div>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="icon-box">
                <Handshake size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>NEGOTIATIONS</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-heading)', marginTop: '2px' }}>{stats.activeNegotiations}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--primary)', fontWeight: '600' }}>Live Purchase Offers</div>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-soft)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>DEALS CLOSED</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-heading)', marginTop: '2px' }}>{stats.closedDeals}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--success)', fontWeight: '600' }}>High Win Ratio</div>
              </div>
            </div>

            <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div className="icon-box">
                <Car size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>VERIFIED FLEET</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-heading)', marginTop: '2px' }}>{stats.totalFleet}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>In Showroom Fleet</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Switcher with Pill-shaped Active States */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setTab('leads')}
            className={`btn btn-sm ${tab === 'leads' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Users size={14} /> Leads CRM ({leads.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('enquiries')}
            className={`btn btn-sm ${tab === 'enquiries' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Mail size={14} /> Enquiries ({enquiries.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('negotiations')}
            className={`btn btn-sm ${tab === 'negotiations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Handshake size={14} /> Negotiations ({negotiations.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('inventory')}
            className={`btn btn-sm ${tab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Car size={14} /> Fleet CMS ({cars.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('team')}
            className={`btn btn-sm ${tab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Shield size={14} /> Team &amp; RBAC ({teamMembers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('verification')}
            className={`btn btn-sm ${tab === 'verification' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <FileCheck size={14} /> Verifications
          </button>
          <button
            type="button"
            onClick={() => setTab('activities')}
            className={`btn btn-sm ${tab === 'activities' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Activity size={14} /> Audit Trail
          </button>
          <button
            type="button"
            onClick={() => setTab('settings')}
            className={`btn btn-sm ${tab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Settings size={14} /> Settings
          </button>
        </div>

        {/* Tab 1: Leads CRM */}
        {tab === 'leads' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search buyer name, phone, vehicle..."
                  className="inp"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  style={{ width: '260px' }}
                />
                <select
                  className="inp"
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  style={{ width: '180px' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="TEST_DRIVE_SCHEDULED">TEST_DRIVE</option>
                  <option value="NEGOTIATION">NEGOTIATION</option>
                  <option value="DEAL_CLOSED">DEAL_CLOSED</option>
                  <option value="OPTED_OUT">OPTED_OUT</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setAddLeadModalOpen(true)} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Add Walk-in Lead
                </button>
                <a href="/admin/leads.csv" download className="btn btn-sm">
                  <Download size={14} /> Export CSV
                </a>
                <a href="/admin/leads.xls" download className="btn btn-sm">
                  <Download size={14} /> Export Excel
                </a>
              </div>
            </div>

            {/* Leads Table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Buyer Name &amp; Contact</th>
                    <th>Vehicle of Interest</th>
                    <th>Status</th>
                    <th>Engagement</th>
                    <th>Assigned Rep</th>
                    <th>Follow-up Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads
                    .filter((l) => (leadStatusFilter === 'ALL' ? true : l.status === leadStatusFilter))
                    .filter((l) =>
                      leadSearch
                        ? `${l.name} ${l.phone} ${l.make || ''} ${l.model || ''}`.toLowerCase().includes(leadSearch.toLowerCase())
                        : true
                    )
                    .map((lead) => (
                      <tr key={lead.id}>
                        <td><strong>#{lead.id}</strong></td>
                        <td>
                          <div style={{ fontWeight: '700' }}>{lead.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>+91 {lead.phone}</div>
                        </td>
                        <td>
                          {lead.make ? (
                            <div>
                              <strong>{lead.year} {lead.make} {lead.model}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{lead.direct ? inr(lead.direct) : ''}</div>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--muted)' }}>Catalog Unlock</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill st-${lead.status}`}>{lead.status}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: (lead.engagement_score || 50) >= 75 ? 'var(--success)' : 'var(--primary)' }}>
                            {lead.engagement_score || 65}/100
                          </span>
                        </td>
                        <td>{lead.assigned_to || 'Rajat (Showroom)'}</td>
                        <td>
                          {lead.followup_date ? (
                            <span style={{ fontSize: '12px', fontWeight: '600' }}>{lead.followup_date}</span>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Not scheduled</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => openLeadDetail(lead.id)}
                              className="btn btn-sm btn-primary"
                              title="Open Customer Dossier & Timeline"
                            >
                              <Eye size={13} /> Dossier
                            </button>
                            <a
                              href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}, this is Rajat from Cars By Rajat Nagpur following up regarding your enquiry.`)}`}
                              target="_blank"
                              rel="noopener"
                              className="btn btn-sm btn-wa"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare size={13} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Individual Lead Dossier & Customer Analysis */}
        {tab === 'lead-detail' && leadDetail && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <button type="button" onClick={() => setTab('leads')} className="btn btn-sm">
                ← Back to All Leads
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)', gap: '24px' }}>
              {/* Left Column: Analysis & Insights */}
              <div>
                <div className="panel" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <span className="pill pill-gold" style={{ fontSize: '11px' }}>
                        Customer Intelligence Profile
                      </span>
                      <h2 style={{ fontSize: '22px', fontWeight: '900', marginTop: '4px' }}>
                        {leadDetail.name} (+91 {leadDetail.phone})
                      </h2>
                    </div>
                    <span className={`status-pill st-${leadDetail.status}`}>
                      {leadDetail.status}
                    </span>
                  </div>

                  {leadInsights && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', background: 'var(--surface-alt)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>CONVERSION PROBABILITY</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: leadInsights.probabilityColor, marginTop: '2px' }}>
                          {leadInsights.conversionProbability}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>ENGAGEMENT SCORE</div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>
                          {leadInsights.engagementScore} / 100
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>BUDGET ESTIMATION</div>
                        <div style={{ fontSize: '14px', fontWeight: '800', marginTop: '4px' }}>
                          {leadInsights.budgetRange}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
                    <div><strong>Email:</strong> {leadDetail.email || 'Not provided'}</div>
                    <div><strong>City Location:</strong> {leadDetail.location || 'Nagpur'}</div>
                    <div><strong>Enquiry Source:</strong> {leadDetail.source || 'Showroom'}</div>
                    <div><strong>Assigned Rep:</strong> {leadDetail.assigned_to || 'Rajat (Showroom)'}</div>
                    <div><strong>Next Follow-up Date:</strong> {leadDetail.followup_date || 'None'}</div>
                    <div><strong>Verification Status:</strong> {leadDetail.verification_status || 'VERIFIED'}</div>
                  </div>

                  {leadDetail.trail && (
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '12.5px' }}>
                      <strong>Browsing Journey:</strong> {leadDetail.trail}
                    </div>
                  )}
                </div>

                {/* Chronological Timeline */}
                <div className="panel">
                  <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '14px' }}>
                    📜 Chronological Communication History ({leadInteractions.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {leadInteractions.length === 0 ? (
                      <div style={{ color: 'var(--muted)', fontSize: '13px' }}>No interactions recorded yet.</div>
                    ) : (
                      leadInteractions.map((item) => (
                        <div key={item.id} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>
                            <span><strong>{item.type}</strong> by {item.created_by}</span>
                            <span>{item.ts}</span>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '13.5px', marginBottom: '4px' }}>{item.outcome}</div>
                          {item.customer_response && (
                            <div style={{ fontSize: '12.5px', color: 'var(--text)' }}>
                              <strong>Response:</strong> {item.customer_response}
                            </div>
                          )}
                          {item.decision_notes && (
                            <div style={{ fontSize: '12px', color: 'var(--primary)', marginTop: '4px' }}>
                              <strong>Decision:</strong> {item.decision_notes}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Follow-up Scheduler Form */}
              <div>
                <div className="panel">
                  <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '12px' }}>
                    ✍️ Record Interaction &amp; Follow-up
                  </h3>

                  <form onSubmit={handleAddInteraction}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Interaction Type</label>
                      <select className="inp" value={interType} onChange={(e) => setInterType(e.target.value)}>
                        <option value="CALL">Phone Call</option>
                        <option value="MEETING">Showroom Meeting / Visit</option>
                        <option value="OFFER">Price Offer Discussion</option>
                        <option value="TEST_DRIVE">Showroom Test Drive</option>
                        <option value="NOTE">Internal Team Note</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Discussion Outcome *</label>
                      <input
                        type="text"
                        required
                        className="inp"
                        placeholder="e.g. Discussed Creta price and HDFC loan eligibility"
                        value={interOutcome}
                        onChange={(e) => setInterOutcome(e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Customer Response</label>
                      <input
                        type="text"
                        className="inp"
                        placeholder="e.g. Customer happy with condition, bringing spouse Saturday"
                        value={interResponse}
                        onChange={(e) => setInterResponse(e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Decision Notes</label>
                      <input
                        type="text"
                        className="inp"
                        placeholder="e.g. Offered complimentary RC transfer"
                        value={interNotes}
                        onChange={(e) => setInterNotes(e.target.value)}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Next Follow-up Date</label>
                      <input
                        type="date"
                        className="inp"
                        value={interNextDate}
                        onChange={(e) => setInterNextDate(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Save Follow-up Entry
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Enquiries Deck */}
        {tab === 'enquiries' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Response Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq) => (
                  <tr key={enq.id}>
                    <td>#{enq.id}</td>
                    <td>
                      <strong>{enq.customer_name}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>+91 {enq.customer_phone}</div>
                    </td>
                    <td>{enq.make ? `${enq.year} ${enq.make} ${enq.model}` : 'General Inquiry'}</td>
                    <td style={{ maxWidth: '280px' }}>{enq.message}</td>
                    <td>
                      <span className={`status-pill st-${enq.status}`}>{enq.status}</span>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '12.5px' }}>
                      {enq.response_notes || <span style={{ color: 'var(--muted)' }}>No response yet</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const notes = prompt('Enter response notes for customer:', enq.response_notes || 'Confirmed appointment at Wardha Road hub.');
                            if (notes) handleRespondEnquiry(enq.id, 'RESPONDED', notes);
                          }}
                          className="btn btn-sm btn-primary"
                        >
                          Respond
                        </button>
                        <a
                          href={`https://wa.me/91${enq.customer_phone}?text=${encodeURIComponent(`Hi ${enq.customer_name}, replying to your enquiry about the ${enq.make || 'car'}.`)}`}
                          target="_blank"
                          rel="noopener"
                          className="btn btn-sm btn-wa"
                        >
                          WhatsApp
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Negotiations Desk */}
        {tab === 'negotiations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {negotiations.map((neg) => (
              <div key={neg.id} className="panel" style={{ borderLeft: '4px solid var(--gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>
                      {neg.customer_name} (+91 {neg.customer_phone}) — {neg.year} {neg.make} {neg.model}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Negotiation #{neg.id} • {neg.created_at}</div>
                  </div>
                  <span className={`status-pill st-${neg.status}`}>{neg.status}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', background: 'var(--surface-alt)', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                  <div><strong>Listed Direct Price:</strong> {inr(neg.listed_price)}</div>
                  <div><strong style={{ color: 'var(--primary)' }}>Buyer Target Offer:</strong> {inr(neg.current_customer_offer)}</div>
                  <div><strong style={{ color: 'var(--gold-text)' }}>Vendor Counter:</strong> {neg.current_vendor_offer ? inr(neg.current_vendor_offer) : 'None'}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleRespondNegotiation(neg.id, 'accept')}
                    className="btn btn-primary btn-sm"
                  >
                    ✓ Accept Offer ({inr(neg.current_customer_offer)})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const counter = prompt('Enter Showroom Counteroffer Amount (₹):', String(neg.listed_price - 15000));
                      if (counter) {
                        const note = prompt('Counteroffer Notes for customer:', 'Including complimentary RC transfer');
                        setNegCounterPrice(counter);
                        setNegNotes(note || '');
                        handleRespondNegotiation(neg.id, 'counter');
                      }
                    }}
                    className="btn btn-sm"
                  >
                    🤝 Counteroffer
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondNegotiation(neg.id, 'reject')}
                    className="btn btn-danger btn-sm"
                  >
                    ✕ Reject Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Fleet CMS */}
        {tab === 'inventory' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setEditCarData({
                  make: '',
                  model: '',
                  year: 2022,
                  km: 25000,
                  fuel: 'Petrol',
                  tr: 'Automatic',
                  own: 1,
                  rto: 'MH-31',
                  price: 1200000,
                  direct: 1140000,
                  dealer_cost: 1050000,
                  dealer_source: 'CBR Own Stock',
                  status: 'AVAILABLE',
                  insp_engine: 'Compression & idle smooth | Clutch bite verified',
                  insp_tyres: '75%+ tread depth remaining | Factory alloys',
                  insp_chassis: '100% Non-accidental guarantee | Original factory paint',
                  insp_elec: 'AC chilling at 4.2°C | Power windows & infotainment active',
                })}
                className="btn btn-primary btn-sm"
              >
                <Plus size={14} /> Add New Vehicle
              </button>
            </div>

            {/* Inventory Table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Vehicle Details</th>
                    <th>Specs</th>
                    <th>Market Price</th>
                    <th>Direct Price</th>
                    <th>Dealer Cost</th>
                    <th>Est Margin</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => {
                    const photos = (car.photos || '').split(',').map((p) => p.trim()).filter(Boolean);
                    const margin = (car.direct || car.price) - (car.dealer_cost || 0);
                    return (
                      <tr key={car.id}>
                        <td>
                          <img
                            src={photos[0] || '/cbr-client-logo.jpg'}
                            alt={car.model}
                            style={{ width: '60px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                        </td>
                        <td>
                          <strong>{car.year} {car.make} {car.model}</strong>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{car.rto} • {car.dealer_source || 'CBR Stock'}</div>
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          {car.km.toLocaleString('en-IN')} km • {car.fuel} • {car.tr}
                        </td>
                        <td>{lakh(car.price)}</td>
                        <td><strong style={{ color: 'var(--success)' }}>{lakh(car.direct)}</strong></td>
                        <td>{car.dealer_cost ? lakh(car.dealer_cost) : '-'}</td>
                        <td>
                          {car.dealer_cost && margin > 0 ? (
                            <span style={{ color: 'var(--success)', fontWeight: '700' }}>+{inr(margin)}</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleCarStatus(car.id, car.status)}
                            className={`status-pill st-${car.status}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title="Click to toggle status"
                          >
                            {car.status}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setEditCarData(car)}
                              className="btn btn-sm"
                              title="Edit Vehicle & Inspection Dossier"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCar(car.id)}
                              className="btn btn-sm btn-danger"
                              title="Delete Vehicle"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Team Management & RBAC */}
        {tab === 'team' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button type="button" onClick={() => setAddMemberModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={14} /> Provision New Staff Member
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Assigned Responsibilities</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((m) => (
                    <tr key={m.id}>
                      <td><strong>{m.name}</strong></td>
                      <td><code>{m.username}</code></td>
                      <td>
                        <span className="pill pill-hub" style={{ fontSize: '11px' }}>{m.role}</span>
                      </td>
                      <td style={{ maxWidth: '280px', fontSize: '12.5px' }}>{m.responsibilities || 'Showroom operations'}</td>
                      <td style={{ fontSize: '12px' }}>
                        <div>{m.email}</div>
                        <div>+91 {m.phone}</div>
                      </td>
                      <td>
                        <span className={`status-pill st-${m.status === 'ACTIVE' ? 'AVAILABLE' : 'SOLD'}`}>
                          {m.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{m.last_login || 'Never'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 7: Verifications Center */}
        {tab === 'verification' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Showroom Inspection</th>
                  <th>RC Paperwork</th>
                  <th>Insurance Active</th>
                  <th>PUCC Valid</th>
                  <th>Verification Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cars.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.year} {c.make} {c.model}</strong></td>
                    <td>
                      <span className="pill pill-verified" style={{ fontSize: '10px' }}>
                        ✓ {c.inspection_verified ? 'Passed' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className="pill pill-verified" style={{ fontSize: '10px' }}>
                        ✓ {c.rc_verified ? 'MH-31 Cleared' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span className="pill pill-verified" style={{ fontSize: '10px' }}>
                        ✓ {c.insurance_verified ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td>
                      <span className="pill pill-verified" style={{ fontSize: '10px' }}>
                        ✓ {c.puc_verified ? 'Certified' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', maxWidth: '240px' }}>
                      {c.verification_notes || 'Showroom vehicle inspection verified by Rajat Sharma.'}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          const notes = prompt('Update verification notes:', c.verification_notes || '');
                          if (notes !== null) {
                            api.updateCarVerification(c.id, {
                              verification_status: 'VERIFIED',
                              verification_notes: notes,
                              inspection_verified: true,
                              rc_verified: true,
                              insurance_verified: true,
                              puc_verified: true,
                            }).then(() => fetchAllData());
                          }
                        }}
                        className="btn btn-sm"
                      >
                        Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 8: Audit Logs */}
        {tab === 'activities' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Staff Member</th>
                  <th>Action</th>
                  <th>Target Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{a.ts}</td>
                    <td><strong>{a.member_name}</strong></td>
                    <td><code>{a.action}</code></td>
                    <td>{a.target_type}</td>
                    <td style={{ fontSize: '12.5px' }}>{a.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 9: Showroom Settings */}
        {tab === 'settings' && settings && (
          <div className="panel" style={{ maxWidth: '640px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Showroom Brand &amp; Digital Settings</h2>
            <form onSubmit={handleSaveSettings}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700' }}>Showroom Name</label>
                <input className="inp" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700' }}>Showroom Tagline</label>
                <input className="inp" value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700' }}>Showroom Physical Address</label>
                <input className="inp" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Helpline Phone</label>
                  <input className="inp" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>WhatsApp Number (with country code)</label>
                  <input className="inp" value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Instagram Username</label>
                  <input className="inp" value={settings.insta} onChange={(e) => setSettings({ ...settings, insta: e.target.value })} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700' }}>Operating Hours</label>
                  <input className="inp" value={settings.hours} onChange={(e) => setSettings({ ...settings, hours: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700' }}>Data Protection &amp; Grievance Officer</label>
                <input className="inp" value={settings.officer} onChange={(e) => setSettings({ ...settings, officer: e.target.value })} />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {addLeadModalOpen && (
        <div className="modal-backdrop" onClick={() => setAddLeadModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>➕ Onboard Walk-in Buyer Lead</h3>
            <form onSubmit={handleCreateLead}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input type="text" required placeholder="Buyer Name *" className="inp" value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} />
                <input type="tel" required placeholder="Mobile Number *" className="inp" value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input type="email" placeholder="Email Address" className="inp" value={newLeadEmail} onChange={(e) => setNewLeadEmail(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <select className="inp" value={newLeadCarId} onChange={(e) => setNewLeadCarId(e.target.value)}>
                  <option value="">Vehicle of Interest...</option>
                  {cars.map((c) => (
                    <option key={c.id} value={c.id}>{c.year} {c.make} {c.model}</option>
                  ))}
                </select>
                <input type="text" placeholder="Budget (e.g. 10 - 15 Lakh)" className="inp" value={newLeadBudget} onChange={(e) => setNewLeadBudget(e.target.value)} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input type="text" placeholder="Sales Discussion Notes" className="inp" value={newLeadNotes} onChange={(e) => setNewLeadNotes(e.target.value)} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: '700' }}>Follow-up Date</label>
                <input type="date" className="inp" value={newLeadFollowup} onChange={(e) => setNewLeadFollowup(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Save to Pipeline</button>
                <button type="button" onClick={() => setAddLeadModalOpen(false)} className="btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Create Car Modal */}
      {editCarData && (
        <div className="modal-backdrop" onClick={() => setEditCarData(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>
              {editCarData.id ? `✏️ Edit Vehicle: ${editCarData.make} ${editCarData.model}` : '➕ Onboard New Vehicle Fleet'}
            </h3>
            <form onSubmit={handleSaveCar}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input type="text" required placeholder="Make (e.g. Hyundai)" className="inp" value={editCarData.make || ''} onChange={(e) => setEditCarData({ ...editCarData, make: e.target.value })} />
                <input type="text" required placeholder="Model (e.g. Creta SX Turbo)" className="inp" value={editCarData.model || ''} onChange={(e) => setEditCarData({ ...editCarData, model: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input type="number" required placeholder="Year" className="inp" value={editCarData.year || 2022} onChange={(e) => setEditCarData({ ...editCarData, year: Number(e.target.value) })} />
                <input type="number" required placeholder="Km Driven" className="inp" value={editCarData.km || 25000} onChange={(e) => setEditCarData({ ...editCarData, km: Number(e.target.value) })} />
                <select className="inp" value={editCarData.fuel || 'Petrol'} onChange={(e) => setEditCarData({ ...editCarData, fuel: e.target.value })}>
                  <option>Petrol</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>CNG</option>
                  <option>Hybrid</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <select className="inp" value={editCarData.tr || 'Automatic'} onChange={(e) => setEditCarData({ ...editCarData, tr: e.target.value })}>
                  <option>Automatic</option>
                  <option>Manual</option>
                </select>
                <input type="text" placeholder="RTO (e.g. MH-31)" className="inp" value={editCarData.rto || 'MH-31'} onChange={(e) => setEditCarData({ ...editCarData, rto: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input type="number" required placeholder="Market Price (₹)" className="inp" value={editCarData.price || 0} onChange={(e) => setEditCarData({ ...editCarData, price: Number(e.target.value) })} />
                <input type="number" required placeholder="Direct Price (₹)" className="inp" value={editCarData.direct || 0} onChange={(e) => setEditCarData({ ...editCarData, direct: Number(e.target.value) })} />
                <input type="number" placeholder="Dealer Cost (₹)" className="inp" value={editCarData.dealer_cost || 0} onChange={(e) => setEditCarData({ ...editCarData, dealer_cost: Number(e.target.value) })} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700' }}>Photo URLs (Comma-separated)</label>
                <input type="text" className="inp" value={editCarData.photos || ''} onChange={(e) => setEditCarData({ ...editCarData, photos: e.target.value })} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700' }}>Engine Checkpoints</label>
                <input className="inp" value={editCarData.insp_engine || ''} onChange={(e) => setEditCarData({ ...editCarData, insp_engine: e.target.value })} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700' }}>Tyres Checkpoints</label>
                <input className="inp" value={editCarData.insp_tyres || ''} onChange={(e) => setEditCarData({ ...editCarData, insp_tyres: e.target.value })} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700' }}>Chassis / Frame Checkpoints</label>
                <input className="inp" value={editCarData.insp_chassis || ''} onChange={(e) => setEditCarData({ ...editCarData, insp_chassis: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Save Vehicle</button>
                <button type="button" onClick={() => setEditCarData(null)} className="btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {addMemberModalOpen && (
        <div className="modal-backdrop" onClick={() => setAddMemberModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px' }}>➕ Provision Staff Member</h3>
            <form onSubmit={handleCreateStaff}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input type="text" required placeholder="Username *" className="inp" value={newStaffUser} onChange={(e) => setNewStaffUser(e.target.value)} />
                <input type="password" required placeholder="Password *" className="inp" value={newStaffPass} onChange={(e) => setNewStaffPass(e.target.value)} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <input type="text" required placeholder="Full Name *" className="inp" value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <select className="inp" value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value as any)}>
                  <option value="SALES_REP">Sales Representative</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="INVENTORY_MANAGER">Inventory Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                <input type="tel" placeholder="Phone (+91)" className="inp" value={newStaffPhone} onChange={(e) => setNewStaffPhone(e.target.value)} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <input type="text" placeholder="Assigned Responsibilities" className="inp" value={newStaffResp} onChange={(e) => setNewStaffResp(e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Create Account</button>
                <button type="button" onClick={() => setAddMemberModalOpen(false)} className="btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

