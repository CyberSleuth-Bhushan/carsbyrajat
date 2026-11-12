import React, { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, User, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.adminLogin({ username, password });
      loginAdmin(res.user);
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 140px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg)' }}>
      <div className="panel" style={{ width: '100%', maxWidth: '450px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: 'var(--shadow-primary)',
          }}>
            <Shield size={28} />
          </div>
          <span className="pill pill-soft-blue" style={{ fontSize: '11px', marginBottom: '8px' }}>
            <Sparkles size={12} color="var(--primary)" /> DEALERSHIP COMMAND DECK
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: '900', marginTop: '6px', color: 'var(--text-heading)' }}>
            Staff &amp; Admin Sign In
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px' }}>
            Cars By Rajat • Nagpur Fleet &amp; CRM Deck
          </p>
        </div>

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
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-heading)' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                className="inp"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ paddingLeft: '38px', borderRadius: '12px' }}
                autoFocus
              />
              <User size={16} color="var(--muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '6px', color: 'var(--text-heading)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                className="inp"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px', borderRadius: '12px' }}
              />
              <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', fontSize: '15px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Command Deck'}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--muted)', marginBottom: '10px' }}>
            Quick Demo Profiles (Click to fill):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11.5px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'admin123')}
              className="btn btn-sm btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px' }}
            >
              👑 Principal Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('rajesh_mgr', 'admin123')}
              className="btn btn-sm btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px' }}
            >
              💼 Sales Manager
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('amit_sales', 'admin123')}
              className="btn btn-sm btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px' }}
            >
              🚗 Sales Rep
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('vikram_inv', 'admin123')}
              className="btn btn-sm btn-secondary"
              style={{ justifyContent: 'flex-start', fontSize: '11.5px' }}
            >
              🔧 Inventory Mgr
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
