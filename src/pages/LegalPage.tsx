import React, { useState } from 'react';
import { api } from '../api/client';
import { ShieldCheck, Mail, Phone, MapPin, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import type { ShowroomSettings } from '../types';

interface LegalPageProps {
  type: 'privacy' | 'grievance' | 'opt-out';
  settings?: ShowroomSettings | null;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, settings }) => {
  const [optOutPhone, setOptOutPhone] = useState('');
  const [optOutLoading, setOptOutLoading] = useState(false);
  const [optOutSuccess, setOptOutSuccess] = useState(false);
  const [optOutError, setOptOutError] = useState('');

  const name = settings?.name || 'Cars By Rajat';
  const officer = settings?.officer || 'Rajat Sharma (Data Protection & Grievance Officer)';
  const officerEmail = settings?.officer_email || 'grievance@carsbyrajat.in';
  const phone = settings?.phone || '+91 98230 11223';
  const address = settings?.address || 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur, Maharashtra 440015';

  const handleOptOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setOptOutError('');
    setOptOutLoading(true);
    try {
      const cleanPhone = optOutPhone.replace(/\D/g, '').slice(-10);
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        throw new Error('Please enter a valid 10-digit Indian mobile number.');
      }
      await api.optOut(cleanPhone);
      setOptOutSuccess(true);
    } catch (err: any) {
      setOptOutError(err.message || 'Failed to process opt-out request.');
    } finally {
      setOptOutLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px 0 80px', background: 'var(--bg)', minHeight: 'calc(100vh - 74px)' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {type === 'privacy' && (
          <div className="panel">
            <span className="pill pill-soft-blue" style={{ fontSize: '11px', marginBottom: '14px' }}>
              <Sparkles size={12} color="var(--primary)" /> DIGITAL PERSONAL DATA PROTECTION ACT (DPDP 2023)
            </span>
            <h1 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '18px', color: 'var(--text-heading)' }}>
              Privacy Policy &amp; Data Protection
            </h1>

            <div style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p>
                At <strong>{name}</strong>, we respect and safeguard the personal data of our customers, website visitors, and prospective buyers in strict accordance with the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '10px', color: 'var(--text-heading)' }}>1. Collection of Notice &amp; Explicit Consent</h3>
              <p>
                We only collect your mobile number, name, and email when you explicitly consent to unlock direct showroom pricing, book a test drive, or submit an offer. We do not engage in automated scraping, third-party broker sharing, or telemarketing spam.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '10px', color: 'var(--text-heading)' }}>2. Data Retention &amp; Automatic Purging</h3>
              <p>
                Under our strict DPDP retention lifecycle, customer telemetry and inquiry leads are automatically purged after <strong>90 days</strong> from our databases, unless an active purchase negotiation or closed deal record is maintained for statutory RTO transfer compliance.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '10px', color: 'var(--text-heading)' }}>3. Cryptographic Storage &amp; Cookie Sessions</h3>
              <p>
                All passwords and session tokens are protected using salted <code>scrypt</code> key derivation and HMAC-SHA256 signatures with <code>SameSite=Lax</code> and <code>HttpOnly</code> cookies to safeguard against cross-site scripting and unauthorized session hijacking.
              </p>

              <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '10px', color: 'var(--text-heading)' }}>4. Right to Withdraw Consent &amp; Erasure</h3>
              <p>
                You possess the statutory right to withdraw your consent at any time. You can visit our <a href="/opt-out" style={{ color: 'var(--primary)', fontWeight: '700' }}>Instant DPDP Opt-Out Page</a> to delete and redact your phone number from all marketing databases instantly.
              </p>
            </div>
          </div>
        )}

        {type === 'grievance' && (
          <div className="panel">
            <span className="pill pill-soft-blue" style={{ fontSize: '11px', marginBottom: '14px' }}>
              <Sparkles size={12} color="var(--primary)" /> STATUTORY GRIEVANCE REDRESSAL
            </span>
            <h1 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '18px', color: 'var(--text-heading)' }}>
              Data Protection &amp; Grievance Officer
            </h1>

            <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-body)', marginBottom: '24px' }}>
              In accordance with Section 10 of the Digital Personal Data Protection Act 2023, the details of our designated Data Protection Officer and Grievance Redressal Officer are provided below:
            </p>

            <div style={{ background: 'var(--surface-alt)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border)', marginBottom: '24px' }}>
              <div style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '8px' }}>{officer}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="icon-box-sm">
                    <Mail size={16} color="var(--primary)" />
                  </div>
                  <a href={`mailto:${officerEmail}`} style={{ color: 'var(--primary)', fontWeight: '600' }}>{officerEmail}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="icon-box-sm">
                    <Phone size={16} color="var(--primary)" />
                  </div>
                  <a href={`tel:${phone}`} style={{ color: 'var(--text-heading)', fontWeight: '600' }}>{phone}</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div className="icon-box-sm">
                    <MapPin size={16} color="var(--primary)" />
                  </div>
                  <span style={{ color: 'var(--text-body)', lineHeight: '1.5' }}>{address}</span>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--muted)', lineHeight: '1.6' }}>
              Grievances regarding data handling, consent withdrawal, or incorrect records will be acknowledged within 24 hours and redressed within 7 business days.
            </p>
          </div>
        )}

        {type === 'opt-out' && (
          <div className="panel" style={{ maxWidth: '520px', margin: '0 auto' }}>
            <span className="pill pill-soft-blue" style={{ fontSize: '11px', marginBottom: '14px' }}>
              <Sparkles size={12} color="var(--primary)" /> DPDP ACT SECTION 6(4)
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '12px', color: 'var(--text-heading)' }}>
              Instant Stop &amp; DPDP Opt-Out
            </h1>
            <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '24px' }}>
              Enter your 10-digit mobile number below to immediately cease all automated WhatsApp updates, test-drive follow-ups, and price alerts.
            </p>

            {optOutSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 10px' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'var(--success-soft)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>
                  Opt-Out Successful
                </h3>
                <p style={{ color: 'var(--text-body)', fontSize: '13.5px', lineHeight: '1.6' }}>
                  Your phone number (+91 {optOutPhone.slice(-10)}) has been unregistered and removed from automated showroom communications.
                </p>
                <a href="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Return to Showroom</a>
              </div>
            ) : (
              <form onSubmit={handleOptOut}>
                {optOutError && (
                  <div style={{ background: 'var(--danger-soft)', color: 'var(--danger)', padding: '12px', borderRadius: '12px', fontSize: '13px', marginBottom: '16px', fontWeight: '600' }}>
                    {optOutError}
                  </div>
                )}

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', display: 'block', marginBottom: '6px', color: 'var(--text-heading)' }}>
                    Mobile Number to Unregister
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
                      value={optOutPhone}
                      onChange={(e) => setOptOutPhone(e.target.value)}
                      maxLength={10}
                      autoFocus
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </div>

                <button type="submit" disabled={optOutLoading} className="btn btn-danger" style={{ width: '100%', padding: '13px' }}>
                  {optOutLoading ? 'Processing Request...' : 'Revoke Consent & Stop All Communications'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
