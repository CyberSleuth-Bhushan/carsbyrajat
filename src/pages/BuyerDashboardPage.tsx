import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import {
  User,
  Handshake,
  Mail,
  Bell,
  Heart,
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowRight,
  Send,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import type { Lead, Enquiry, Negotiation, Notification } from '../types';

export const BuyerDashboardPage: React.FC = () => {
  const { unlockedPhone, setUnlockedPhone } = useAuth();
  const { shortlist } = useCompare();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<Lead | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'negotiations' | 'enquiries' | 'notifications' | 'saved'>('negotiations');

  // Customer Login Form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Counteroffer form in modal or inline
  const [counterNegId, setCounterNegId] = useState<number | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await api.getCustomerDashboard();
      if (res.authenticated) {
        setCustomer(res.customer);
        setEnquiries(res.enquiries);
        setNegotiations(res.negotiations);
        setNotifications(res.notifications);
        if (res.userPhone) setUnlockedPhone(res.userPhone);
      }
    } catch (err) {
      console.error('Failed to load buyer hub:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [unlockedPhone]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const cleanPhone = loginPhone.replace(/\D/g, '').slice(-10);
      const res = await api.unlockPrice({
        phone: cleanPhone,
        trail: 'Buyer Hub Login',
        consent: 1,
      });
      setUnlockedPhone(res.phone);
      await fetchDashboardData();
    } catch (err: any) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleAcceptNegotiation = async (negId: number) => {
    if (!confirm('Are you sure you want to accept this deal offer?')) return;
    setActionLoading(true);
    try {
      await api.acceptNegotiation(negId);
      alert('Deal Agreed! Our showroom desk has been alerted and will contact you for paperwork.');
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to accept deal.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCounterNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterNegId || !counterPrice) return;
    setActionLoading(true);
    try {
      await api.counterNegotiation({
        negotiation_id: counterNegId,
        counter_price: Number(counterPrice),
        notes: counterNotes,
      });
      alert('Counteroffer submitted to showroom desk.');
      setCounterNegId(null);
      setCounterPrice('');
      setCounterNotes('');
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit counteroffer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch {}
  };

  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  if (loading) {
    return <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--muted)' }}>Loading Buyer Hub...</div>;
  }

  // If customer is not authenticated / unlocked yet
  if (!unlockedPhone) {
    return (
      <div className="container" style={{ padding: '60px 20px', maxWidth: '480px' }}>
        <div className="panel" style={{ textAlign: 'center' }}>
          <div className="icon-box" style={{ width: '56px', height: '56px', margin: '0 auto 16px', borderRadius: '16px' }}>
            <User size={28} />
          </div>
          <span className="pill pill-soft-blue" style={{ fontSize: '11px', marginBottom: '8px' }}>
            <Sparkles size={12} color="var(--primary)" /> CUSTOMER SELF-SERVICE PORTAL
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '900', marginTop: '6px', marginBottom: '8px', color: 'var(--text-heading)' }}>
            Sign In to Buyer Hub
          </h2>
          <p style={{ color: 'var(--text-body)', fontSize: '13.5px', marginBottom: '24px', lineHeight: '1.6' }}>
            Access your active vehicle enquiries, negotiation counteroffers, test drive appointments, and deal updates.
          </p>

          {loginError && (
            <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--text-heading)' }}>
                Your Registered Mobile Number
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '11px 14px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', fontWeight: '700', fontSize: '13.5px', color: 'var(--text-heading)' }}>
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="98230 11223"
                  className="inp"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  autoFocus
                  style={{ borderRadius: '12px' }}
                />
              </div>
            </div>

            <button type="submit" disabled={loginLoading} className="btn btn-primary" style={{ width: '100%', padding: '13px' }}>
              {loginLoading ? 'Verifying...' : 'Access My Buyer Hub'}
            </button>
          </form>

          <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '20px' }}>
            Protected under DPDP Act 2023. No password needed — instant session via verified phone.
          </p>
        </div>
      </div>
    );
  }

  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  return (
    <div style={{ padding: '40px 0 70px', background: 'var(--bg)' }}>
      <div className="container">
        {/* Buyer Header Card */}
        <div className="panel" style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '20px', boxShadow: 'var(--shadow-primary)' }}>
                {customer?.name && customer.name !== '-' ? customer.name[0].toUpperCase() : 'B'}
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-heading)' }}>
                  {customer?.name && customer.name !== '-' ? customer.name : 'Verified Buyer Hub'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                  <span>📱 +91 {unlockedPhone}</span>
                  <span className="pill pill-verified" style={{ fontSize: '10.5px' }}>✓ Verified Buyer</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <a href="/" className="btn btn-sm btn-primary">
              🚗 Browse Cars
            </a>
            <a href="https://wa.me/919823011223" target="_blank" rel="noopener" className="btn btn-sm btn-wa">
              <MessageSquare size={14} /> WhatsApp Desk
            </a>
          </div>
        </div>

        {/* Tab Navigation with Soft Pill Active States */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('negotiations')}
            className={`btn btn-sm ${activeTab === 'negotiations' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Handshake size={16} /> Price Negotiations ({negotiations.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('enquiries')}
            className={`btn btn-sm ${activeTab === 'enquiries' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Mail size={16} /> Vehicle Enquiries ({enquiries.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`btn btn-sm ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontWeight: '700' }}
          >
            <Bell size={16} /> Notifications
            {unreadNotifs > 0 && (
              <span style={{ background: '#EF4444', color: '#FFFFFF', fontSize: '10px', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>
                {unreadNotifs}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Live Negotiations */}
        {activeTab === 'negotiations' && (
          <div>
            {negotiations.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '56px 20px' }}>
                <div className="icon-box" style={{ margin: '0 auto 16px', width: '52px', height: '52px' }}>
                  <Handshake size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>No Active Negotiations</h3>
                <p style={{ color: 'var(--text-body)', fontSize: '13.5px', marginBottom: '18px', maxWidth: '440px', margin: '0 auto 18px' }}>
                  You haven't submitted any target price counteroffers yet. Explore our fleet and click "Propose Your Target Price".
                </p>
                <a href="/" className="btn btn-primary">Browse Vehicles to Negotiate</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {negotiations.map((neg) => (
                  <div key={neg.id} className="panel" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600' }}>Negotiation #{neg.id}</div>
                        <h3 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-heading)' }}>
                          <a href={`/cars/${neg.slug}`}>{neg.year} {neg.make} {neg.model}</a>
                        </h3>
                      </div>
                      <span className={`status-pill st-${neg.status}`}>
                        {neg.status}
                      </span>
                    </div>

                    {/* Price Overview Strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', background: 'var(--surface-alt)', padding: '16px', borderRadius: '12px', marginBottom: '18px', border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>Listed Direct Price</div>
                        <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px' }}>{inr(neg.listed_price)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>Your Offer</div>
                        <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--primary)', marginTop: '2px' }}>{inr(neg.current_customer_offer)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>Showroom Counteroffer</div>
                        <div style={{ fontSize: '17px', fontWeight: '800', color: neg.current_vendor_offer ? 'var(--success)' : 'var(--muted)', marginTop: '2px' }}>
                          {neg.current_vendor_offer ? inr(neg.current_vendor_offer) : 'Awaiting Review'}
                        </div>
                      </div>
                    </div>

                    {/* Message Thread History */}
                    <div style={{ marginBottom: '18px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px', color: 'var(--muted)' }}>
                        Negotiation Discussion Thread
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(neg.messages || []).map((msg) => (
                          <div
                            key={msg.id}
                            style={{
                              padding: '12px 16px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              background: msg.sender_type === 'VENDOR' ? 'var(--primary-soft)' : '#FFFFFF',
                              border: '1px solid var(--border)',
                              alignSelf: msg.sender_type === 'VENDOR' ? 'flex-start' : 'flex-end',
                              maxWidth: '90%',
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11.5px', fontWeight: '700', marginBottom: '4px' }}>
                              <span style={{ color: msg.sender_type === 'VENDOR' ? 'var(--primary)' : 'var(--text-heading)' }}>
                                {msg.sender_type === 'VENDOR' ? '🏢 Rajat Sharma (Principal)' : '👤 You'}
                              </span>
                              <span style={{ color: 'var(--muted)' }}>{inr(msg.offered_price)}</span>
                            </div>
                            <div style={{ color: 'var(--text-heading)', lineHeight: '1.45' }}>
                              {msg.notes || 'Price offer updated'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions if VENDOR_COUNTERED */}
                    {neg.status === 'VENDOR_COUNTERED' && (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                        <button
                          type="button"
                          onClick={() => handleAcceptNegotiation(neg.id)}
                          disabled={actionLoading}
                          className="btn btn-primary"
                        >
                          ✓ Accept Counteroffer ({inr(neg.current_vendor_offer || 0)})
                        </button>
                        <button
                          type="button"
                          onClick={() => setCounterNegId(neg.id)}
                          className="btn btn-secondary"
                        >
                          Submit Counter-Response
                        </button>
                      </div>
                    )}

                    {neg.status === 'ACCEPTED' && (
                      <div style={{ background: 'var(--success-soft)', color: 'var(--success)', padding: '14px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }}>
                        🎉 Deal Won! The showroom desk has confirmed this rate. Please visit Wardha Road hub for delivery and paperwork.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Vehicle Enquiries */}
        {activeTab === 'enquiries' && (
          <div>
            {enquiries.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '56px 20px' }}>
                <div className="icon-box" style={{ margin: '0 auto 16px', width: '52px', height: '52px' }}>
                  <Mail size={28} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>No Enquiries Submitted</h3>
                <p style={{ color: 'var(--text-body)', fontSize: '13.5px', marginBottom: '18px' }}>
                  Submit an enquiry on any car page to get inspection dossiers and schedule visits.
                </p>
                <a href="/" className="btn btn-primary">Explore Inventory</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {enquiries.map((enq) => (
                  <div key={enq.id} className="panel">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Enquiry #{enq.id} • {enq.ts}</span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px' }}>
                          {enq.make ? `${enq.year} ${enq.make} ${enq.model}` : 'General Showroom Inquiry'}
                        </h3>
                      </div>
                      <span className={`status-pill st-${enq.status}`}>{enq.status}</span>
                    </div>

                    <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: '10px', fontSize: '13px', marginBottom: '12px', border: '1px solid var(--border)' }}>
                      <strong>Your Message:</strong> {enq.message}
                    </div>

                    {enq.response_notes ? (
                      <div style={{ background: 'var(--primary-soft)', border: '1px solid #D6E4FF', padding: '14px', borderRadius: '10px', fontSize: '13px' }}>
                        <strong style={{ color: 'var(--primary)' }}>Showroom Response ({enq.assigned_to}):</strong>
                        <div style={{ marginTop: '4px', color: 'var(--text-heading)' }}>{enq.response_notes}</div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                        ⏳ Assigned to <strong>{enq.assigned_to || 'Rajat (Showroom)'}</strong>. Awaiting response.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button type="button" onClick={handleMarkNotificationsRead} className="btn btn-sm btn-secondary">
                Mark All as Read
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="panel" style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--muted)' }}>
                No notifications yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="panel"
                    style={{
                      padding: '16px 20px',
                      background: n.is_read ? 'var(--surface)' : 'var(--primary-soft)',
                      borderLeft: n.is_read ? '1px solid var(--border)' : '4px solid var(--primary)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '14.5px', color: 'var(--text-heading)' }}>{n.title}</strong>
                      <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{n.ts}</span>
                    </div>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.5' }}>{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Counter-Response Modal */}
      {counterNegId && (
        <div className="modal-backdrop" onClick={() => setCounterNegId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '19px', fontWeight: '900', marginBottom: '6px', color: 'var(--text-heading)' }}>
              Submit Counter-Response
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '18px' }}>
              Enter your counter price proposal for vendor review.
            </p>

            <form onSubmit={handleCounterNegotiation}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--text-heading)' }}>
                  Target Offer (₹) *
                </label>
                <input
                  type="number"
                  required
                  className="inp"
                  placeholder="e.g. 1390000"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--text-heading)' }}>
                  Notes for Rajat
                </label>
                <input
                  type="text"
                  className="inp"
                  placeholder="e.g. Can close with immediate RTGS payment"
                  value={counterNotes}
                  onChange={(e) => setCounterNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button type="submit" disabled={actionLoading} className="btn btn-primary">
                  {actionLoading ? 'Submitting...' : 'Submit Counter'}
                </button>
                <button type="button" onClick={() => setCounterNegId(null)} className="btn btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
