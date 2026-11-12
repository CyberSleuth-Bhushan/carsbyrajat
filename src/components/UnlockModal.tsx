import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { X, Lock, CheckCircle, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';

interface UnlockModalProps {
  carId?: number | null;
  carTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (phone: string) => void;
}

export const UnlockModal: React.FC<UnlockModalProps> = ({ carId, carTitle, isOpen, onClose, onSuccess }) => {
  const { setUnlockedPhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!consent) {
      setError('Please provide DPDP consent to receive vehicle price and verification details.');
      return;
    }

    setLoading(true);
    try {
      const trail = carTitle ? `Unlocked price for ${carTitle}` : 'Unlocked Showroom Catalog';
      const res = await api.unlockPrice({
        phone: cleanPhone,
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        car_id: carId,
        trail,
        consent: 1,
      });

      setUnlockedPhone(res.phone);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.phone);
        onClose();
        setSuccess(false);
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to unlock direct price. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', borderRadius: 'var(--radius-lg)' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted)',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        {success ? (
          <div style={{ textAlign: 'center', padding: '36px 12px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--success-soft)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}>
              <CheckCircle size={38} />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-heading)' }}>
              Direct Price Unlocked!
            </h3>
            <p style={{ color: 'var(--text-body)', fontSize: '14px', lineHeight: '1.6' }}>
              You now have full access to showroom confidential rates, inspection dossiers, and online negotiation tools.
            </p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span className="pill pill-soft-blue" style={{ fontSize: '11px' }}>
                <Sparkles size={12} /> CONFIDENTIAL SHOWROOM RATE
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
              <div className="icon-box">
                <Lock size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-heading)' }}>
                  Unlock Direct Dealer Pricing
                </h2>
                <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                  {carTitle ? `For ${carTitle}` : 'Full access to verified showroom inventory'}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '20px' }}>
              We keep direct dealer pricing confidential to protect our single-owner consignments. Enter your mobile number to view immediate showroom offer rates and inspection reports.
            </p>

            {error && (
              <div style={{
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-heading)' }}>
                  Mobile Number (WhatsApp Preferred) *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '11px 14px',
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--text-heading)'
                  }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="98230 11223"
                    className="inp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    autoFocus
                    style={{ borderRadius: '12px' }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
                  Valid 10-digit Indian number (starts with 6, 7, 8, or 9).
                </span>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-heading)' }}>
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Deshmukh"
                  className="inp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderRadius: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-body)', lineHeight: '1.5' }}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <span>
                    I agree under the <strong>DPDP Act 2023</strong> to receive confidential vehicle pricing and inspection reports via WhatsApp/SMS. No spam. You may opt out anytime.
                  </span>
                </label>
              </div>

              {/* Primary Pill Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '13px 20px', fontSize: '15px' }}
              >
                {loading ? 'Verifying Phone...' : '🔓 Reveal Confidential Showroom Price'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '16px', fontSize: '11.5px', color: 'var(--muted)' }}>
              <ShieldCheck size={14} color="var(--success)" /> 256-bit encrypted phone hash · DPDP 2023 certified
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
