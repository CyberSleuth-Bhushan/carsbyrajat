import React from 'react';
import { ShieldCheck, MapPin, Phone, Clock, Mail, Lock, Sparkles } from 'lucide-react';
import type { ShowroomSettings } from '../types';

interface FooterProps {
  settings?: ShowroomSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const name = settings?.name || 'Cars By Rajat';
  const phone = settings?.phone || '+91 98230 11223';
  const address = settings?.address || 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur, Maharashtra 440015';
  const hours = settings?.hours || 'Mo-Su 10:00-20:30';

  return (
    <footer style={{
      background: 'var(--surface)',
      color: 'var(--text-body)',
      paddingTop: '56px',
      paddingBottom: '32px',
      marginTop: 'auto',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -4px 20px rgba(15, 23, 42, 0.02)'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '36px', marginBottom: '44px' }}>
          {/* Col 1: Brand & Showroom Hub */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid #D6E4FF',
                boxShadow: '0 2px 8px rgba(29, 92, 229, 0.12)'
              }}>
                <img src="/cbr-client-logo.jpg" alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '19px', fontWeight: '900', color: 'var(--text-heading)', letterSpacing: '-0.025em' }}>
                CARS BY <span style={{ color: 'var(--primary)' }}>RAJAT</span>
              </span>
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: '1.65', color: 'var(--text-body)', marginBottom: '18px' }}>
              Central India's leading showroom for verified pre-owned luxury sedans, compact SUVs, and reliable city hatchbacks. Every vehicle is physically inspected at our Nagpur hub with verified RTO documentation.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--success-soft)',
              color: 'var(--success)',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              <ShieldCheck size={16} /> 100% Genuine RTO &amp; Single-Owner Verified
            </div>
          </div>

          {/* Col 2: Showroom Hub Details */}
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontSize: '15px', fontWeight: '800', marginBottom: '18px' }}>
              Showroom &amp; Fleet Yard
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <div className="icon-box-sm">
                  <MapPin size={16} color="var(--primary)" />
                </div>
                <span style={{ lineHeight: '1.5', marginTop: '2px' }}>{address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-box-sm">
                  <Clock size={16} color="var(--primary)" />
                </div>
                <span>{hours} (Open All 7 Days)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="icon-box-sm">
                  <Phone size={16} color="var(--primary)" />
                </div>
                <a href={`tel:${phone}`} style={{ color: 'var(--text-heading)', fontWeight: '700' }}>{phone}</a>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontSize: '15px', fontWeight: '800', marginBottom: '18px' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '11px', fontSize: '13.5px' }}>
              <li>
                <a href="/" style={{ color: 'var(--text-body)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  🚗 Certified Inventory
                </a>
              </li>
              <li>
                <a href="/dynamic-gallery" style={{ color: 'var(--primary)', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  🎬 3D Dynamic Reels (AI)
                </a>
              </li>
              <li>
                <a href="/dashboard" style={{ color: 'var(--text-body)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  👤 Customer Buyer Hub &amp; Offers
                </a>
              </li>
              <li>
                <a href="/compare" style={{ color: 'var(--text-body)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  ⚖️ Side-by-Side Comparison
                </a>
              </li>
              <li>
                <a href="/admin/login" style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  🔐 Staff Command Deck Login
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: DPDP Compliance & Grievance */}
          <div>
            <h4 style={{ color: 'var(--text-heading)', fontSize: '15px', fontWeight: '800', marginBottom: '18px' }}>
              Legal &amp; Privacy (DPDP Act)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
              Compliant with the Digital Personal Data Protection Act 2023. We protect your phone number with cryptographic hashing and never spam.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', fontSize: '13px' }}>
              <a href="/privacy-policy" style={{ color: 'var(--text-body)' }}>• Privacy Policy &amp; DPDP Terms</a>
              <a href="/grievance" style={{ color: 'var(--text-body)' }}>• Data Protection Officer &amp; Grievance</a>
              <a href="/opt-out" style={{ color: 'var(--danger)', fontWeight: '600' }}>• Instant Stop / DPDP Opt-Out</a>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          fontSize: '12.5px',
          color: 'var(--muted)'
        }}>
          <div>
            © {new Date().getFullYear()} <strong>{name}</strong> Nagpur. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '18px' }}>
            <span>Verified Pre-Owned Cars in Nagpur (MH-31)</span>
            <span>•</span>
            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>Powered by NeuroX Automotive</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
