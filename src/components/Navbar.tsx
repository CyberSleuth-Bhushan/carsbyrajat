import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import {
  Car,
  Film,
  User,
  Scale,
  Phone,
  MessageSquare,
  Shield,
  Menu,
  X,
  LogIn,
  LogOut,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  settings?: { phone?: string; whatsapp?: string; name?: string; address?: string };
  currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, currentPath }) => {
  const { adminUser, unlockedPhone, logoutAdmin } = useAuth();
  const { shortlist } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(currentPath || '/');

  useEffect(() => {
    setActiveRoute(currentPath || window.location.pathname);
  }, [currentPath]);

  const phone = settings?.phone || '+91 98230 11223';
  const whatsapp = settings?.whatsapp || '919823011223';

  const isFleetActive = activeRoute === '/' || activeRoute.startsWith('/used-cars') || activeRoute.startsWith('/cars');
  const isScrollActive = activeRoute === '/scroll' || activeRoute === '/dynamic-gallery' || activeRoute === '/gallery';
  const isBuyerActive = activeRoute === '/dashboard';
  const isCompareActive = activeRoute === '/compare';

  return (
    <header className="cbr-header">
      <div className="container cbr-header-inner">
        {/* ============================================================
            ZONE 1: Brand Emblem & Dealership Identity
            ============================================================ */}
        <a href="/" className="cbr-brand">
          <div className="cbr-logo-wrapper">
            <img src="/cbr-client-logo.jpg" alt="Cars By Rajat" className="cbr-logo-img" />
          </div>
          <div className="cbr-brand-meta">
            <div className="cbr-brand-name">
              CARS BY <span className="cbr-brand-accent">RAJAT</span>
            </div>
            <div className="cbr-brand-tagline">
              <span className="cbr-pulse-dot" />
              <span className="cbr-hub-text">NAGPUR HUB</span>
              <span className="cbr-hub-sep">•</span>
              <span className="cbr-verified-chip">MH-31 VERIFIED</span>
            </div>
          </div>
        </a>

        {/* ============================================================
            ZONE 2: Center Segmented Navigation Bar
            ============================================================ */}
        <nav className="cbr-nav-segmented desktop-nav">
          <a
            href="/"
            className={`cbr-nav-pill ${isFleetActive ? 'cbr-nav-pill-active' : ''}`}
          >
            <Car size={15} className="cbr-nav-icon" />
            <span>Showroom Fleet</span>
          </a>

          <a
            href="/scroll"
            className={`cbr-nav-pill ${isScrollActive ? 'cbr-nav-pill-active' : ''}`}
          >
            <Film size={15} className="cbr-nav-icon" />
            <span>Scroll</span>
            <span className="cbr-reel-tag">Swipe</span>
          </a>

          <a
            href="/dashboard"
            className={`cbr-nav-pill ${isBuyerActive ? 'cbr-nav-pill-active' : ''}`}
          >
            <User size={15} className="cbr-nav-icon" />
            <span>Buyer Hub</span>
            {unlockedPhone && <span className="cbr-online-indicator" title="Logged in via phone" />}
          </a>

          <a
            href="/compare"
            className={`cbr-nav-pill ${isCompareActive ? 'cbr-nav-pill-active' : ''}`}
          >
            <Scale size={15} className="cbr-nav-icon" />
            <span>Compare</span>
            {shortlist.length > 0 && (
              <span className="cbr-compare-count">{shortlist.length}</span>
            )}
          </a>
        </nav>

        {/* ============================================================
            ZONE 3: Right Action Cluster (Contact, WhatsApp, Staff)
            ============================================================ */}
        <div className="cbr-actions-cluster">
          {/* Quick Helpline Call (Desktop) */}
          <a href={`tel:${phone}`} className="cbr-helpline-pill desktop-only" title="Call Showroom Sales Desk">
            <div className="cbr-helpline-icon">
              <Phone size={13} />
            </div>
            <div className="cbr-helpline-info">
              <span className="cbr-helpline-label">Showroom Desk</span>
              <span className="cbr-helpline-number">{phone}</span>
            </div>
          </a>

          {/* Primary WhatsApp Action */}
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Rajat, I am exploring your verified Nagpur car showroom.')}`}
            target="_blank"
            rel="noopener"
            className="btn btn-sm btn-wa cbr-whatsapp-btn"
          >
            <MessageSquare size={15} />
            <span className="cbr-whatsapp-text">WhatsApp</span>
          </a>

          {/* Staff Login / Command Deck */}
          {adminUser ? (
            <div className="cbr-admin-group desktop-only">
              <a href="/admin" className="btn btn-sm btn-primary cbr-command-deck-btn">
                <Shield size={14} />
                <span>Command Deck</span>
              </a>
              <button
                type="button"
                onClick={() => logoutAdmin()}
                className="btn btn-sm btn-secondary cbr-logout-btn"
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <a href="/admin/login" className="cbr-staff-login-link desktop-only" title="Dealership Staff Portal">
              <LogIn size={14} />
              <span>Staff</span>
            </a>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="cbr-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation drawer"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ============================================================
          MOBILE NAVIGATION DRAWER (< 992px)
          ============================================================ */}
      {mobileMenuOpen && (
        <div className="cbr-mobile-drawer">
          <div className="cbr-drawer-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="cbr-drawer-panel">
            {/* Drawer Hub Header */}
            <div className="cbr-drawer-header">
              <div className="cbr-drawer-title">
                <span>CARS BY RAJAT</span>
                <span className="pill pill-verified" style={{ fontSize: '10px' }}>✓ VERIFIED SHOWROOM</span>
              </div>
              <p className="cbr-drawer-address">
                Plot 42, Central Avenue &amp; Wardha Road Hub, Nagpur (MH-31)
              </p>
            </div>

            {/* Navigation Cards List */}
            <div className="cbr-drawer-nav">
              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`cbr-drawer-item ${isFleetActive ? 'cbr-drawer-item-active' : ''}`}
              >
                <div className="cbr-drawer-icon-box">
                  <Car size={18} />
                </div>
                <div className="cbr-drawer-item-text">
                  <div className="cbr-drawer-item-title">Browse Showroom Fleet</div>
                  <div className="cbr-drawer-item-sub">Handpicked verified vehicles with inspection reports</div>
                </div>
                <ChevronRight size={16} className="cbr-drawer-chevron" />
              </a>

              <a
                href="/scroll"
                onClick={() => setMobileMenuOpen(false)}
                className={`cbr-drawer-item ${isScrollActive ? 'cbr-drawer-item-active' : ''}`}
              >
                <div className="cbr-drawer-icon-box cbr-icon-accent">
                  <Film size={18} />
                </div>
                <div className="cbr-drawer-item-text">
                  <div className="cbr-drawer-item-title">
                    Scroll <span className="cbr-reel-tag" style={{ marginLeft: '4px' }}>Swipe</span>
                  </div>
                  <div className="cbr-drawer-item-sub">Swipe up & down to discover cars with smart suggestions</div>
                </div>
                <ChevronRight size={16} className="cbr-drawer-chevron" />
              </a>

              <a
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`cbr-drawer-item ${isBuyerActive ? 'cbr-drawer-item-active' : ''}`}
              >
                <div className="cbr-drawer-icon-box">
                  <User size={18} />
                </div>
                <div className="cbr-drawer-item-text">
                  <div className="cbr-drawer-item-title">
                    Buyer Hub &amp; Live Negotiations
                    {unlockedPhone && <span className="cbr-online-indicator" style={{ marginLeft: '6px' }} />}
                  </div>
                  <div className="cbr-drawer-item-sub">Review counteroffers and test drive appointments</div>
                </div>
                <ChevronRight size={16} className="cbr-drawer-chevron" />
              </a>

              <a
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className={`cbr-drawer-item ${isCompareActive ? 'cbr-drawer-item-active' : ''}`}
              >
                <div className="cbr-drawer-icon-box">
                  <Scale size={18} />
                </div>
                <div className="cbr-drawer-item-text">
                  <div className="cbr-drawer-item-title">
                    Compare Selected Vehicles
                    {shortlist.length > 0 && <span className="cbr-compare-count" style={{ marginLeft: '6px' }}>{shortlist.length}</span>}
                  </div>
                  <div className="cbr-drawer-item-sub">Side-by-side technical specification matrix</div>
                </div>
                <ChevronRight size={16} className="cbr-drawer-chevron" />
              </a>
            </div>

            {/* Drawer Bottom Actions */}
            <div className="cbr-drawer-footer">
              <div className="cbr-drawer-cta-grid">
                <a href={`tel:${phone}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '13px' }}>
                  <Phone size={14} color="var(--primary)" /> Call Helpline
                </a>
                <a
                  href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hi Rajat, I am browsing your Nagpur car inventory on my phone.')}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-wa"
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>
              </div>

              <div className="cbr-drawer-staff-strip">
                {adminUser ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <a href="/admin" onClick={() => setMobileMenuOpen(false)} className="btn btn-sm btn-primary" style={{ width: 'auto' }}>
                      <Shield size={14} /> Open Command Deck
                    </a>
                    <button type="button" onClick={() => { logoutAdmin(); setMobileMenuOpen(false); }} className="btn btn-sm btn-secondary">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <a href="/admin/login" onClick={() => setMobileMenuOpen(false)} className="cbr-drawer-staff-link">
                    <Shield size={14} /> Dealership Staff Portal Sign In →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MOBILE BOTTOM APP BAR (< 769px) - Pro Mobile App Navigation
          ============================================================ */}
      {!isScrollActive && (
        <nav className="cbr-mobile-bottom-bar">
          <a href="/" className={`cbr-bottom-tab ${isFleetActive ? 'active' : ''}`}>
            <Car size={18} />
            <span>Fleet</span>
          </a>

          <a href="/scroll" className={`cbr-bottom-tab ${isScrollActive ? 'active' : ''}`}>
            <div className="cbr-bottom-scroll-pill">
              <Film size={17} />
            </div>
            <span>Scroll</span>
          </a>

          <a href="/dashboard" className={`cbr-bottom-tab ${isBuyerActive ? 'active' : ''}`}>
            <User size={18} />
            <span>Buyer Hub</span>
            {unlockedPhone && <span className="cbr-bottom-dot" />}
          </a>

          <a href="/compare" className={`cbr-bottom-tab ${isCompareActive ? 'active' : ''}`}>
            <div style={{ position: 'relative' }}>
              <Scale size={18} />
              {shortlist.length > 0 && <span className="cbr-bottom-badge">{shortlist.length}</span>}
            </div>
            <span>Compare</span>
          </a>
        </nav>
      )}

      {/* ============================================================
          Scoped Header CSS Styling
          ============================================================ */}
      <style>{`
        .cbr-header {
          position: sticky;
          top: 0;
          z-index: 900;
          background: rgba(255, 255, 255, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 4px 20px -4px rgba(15, 23, 42, 0.04);
          transition: background 0.2s ease, box-shadow 0.2s ease;
        }

        .cbr-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 74px;
          gap: 16px;
        }

        /* ------------------------------------------------------------
           Zone 1: Brand Emblem & Meta
           ------------------------------------------------------------ */
        .cbr-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          text-decoration: none;
        }

        .cbr-logo-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          overflow: hidden;
          background: #FFFFFF;
          border: 1.5px solid #D6E4FF;
          box-shadow: 0 4px 12px -2px rgba(29, 92, 229, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cbr-brand:hover .cbr-logo-wrapper {
          transform: scale(1.04);
          box-shadow: 0 6px 16px -2px rgba(29, 92, 229, 0.25);
        }

        .cbr-logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cbr-brand-meta {
          display: flex;
          flex-direction: column;
        }

        .cbr-brand-name {
          font-family: var(--font-heading);
          font-size: 19px;
          font-weight: 900;
          letter-spacing: -0.03em;
          color: var(--text-heading);
          line-height: 1.15;
        }

        .cbr-brand-accent {
          color: var(--primary);
        }

        .cbr-brand-tagline {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
          margin-top: 2px;
          letter-spacing: 0.02em;
        }

        .cbr-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 0 2px rgba(15, 157, 88, 0.25);
          animation: cbrPulse 2s infinite;
        }

        @keyframes cbrPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }

        .cbr-hub-text {
          font-weight: 700;
          color: var(--text-heading);
        }

        .cbr-hub-sep {
          color: var(--border);
        }

        .cbr-verified-chip {
          background: var(--success-soft);
          color: var(--success);
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        /* ------------------------------------------------------------
           Zone 2: Center Segmented Navigation Bar
           ------------------------------------------------------------ */
        .cbr-nav-segmented {
          display: flex;
          align-items: center;
          background: #F1F5F9;
          border: 1px solid var(--border);
          border-radius: 9999px;
          padding: 4px;
          gap: 2px;
          box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03);
        }

        .cbr-nav-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 9999px;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--text-body);
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          position: relative;
        }

        .cbr-nav-pill:hover {
          color: var(--text-heading);
          background: rgba(255, 255, 255, 0.65);
        }

        .cbr-nav-pill-active {
          background: #FFFFFF !important;
          color: var(--primary) !important;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
        }

        .cbr-nav-icon {
          color: currentColor;
          opacity: 0.85;
          flex-shrink: 0;
        }

        .cbr-nav-pill-active .cbr-nav-icon {
          opacity: 1;
        }

        .cbr-reel-tag {
          font-size: 9.5px;
          font-weight: 800;
          background: var(--primary);
          color: #FFFFFF;
          padding: 1px 6px;
          border-radius: 9999px;
          letter-spacing: 0.04em;
        }

        .cbr-online-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--success);
          box-shadow: 0 0 0 2px rgba(15, 157, 88, 0.2);
          display: inline-block;
        }

        .cbr-compare-count {
          background: var(--primary);
          color: #FFFFFF;
          font-size: 10px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 10px;
          line-height: 1.2;
        }

        /* ------------------------------------------------------------
           Zone 3: Right Action Cluster
           ------------------------------------------------------------ */
        .cbr-actions-cluster {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Helpline Pill */
        .cbr-helpline-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 9999px;
          border: 1px solid var(--border);
          background: var(--surface);
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .cbr-helpline-pill:hover {
          border-color: #CBD5E1;
          background: var(--surface-alt);
          transform: translateY(-1px);
        }

        .cbr-helpline-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cbr-helpline-info {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .cbr-helpline-label {
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--muted);
          letter-spacing: 0.02em;
        }

        .cbr-helpline-number {
          font-size: 12.5px;
          font-weight: 800;
          color: var(--text-heading);
        }

        /* WhatsApp Button */
        .cbr-whatsapp-btn {
          padding: 8px 16px !important;
          font-size: 13.5px !important;
          font-weight: 700 !important;
        }

        /* Admin / Staff Access */
        .cbr-admin-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .cbr-command-deck-btn {
          padding: 8px 14px !important;
          font-size: 13px !important;
        }

        .cbr-logout-btn {
          padding: 8px 10px !important;
          color: var(--muted) !important;
        }

        .cbr-staff-login-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--muted);
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 9999px;
          transition: color 0.15s ease, background 0.15s ease;
        }

        .cbr-staff-login-link:hover {
          color: var(--text-heading);
          background: var(--surface-alt);
        }

        /* Mobile Hamburger Toggle */
        .cbr-mobile-toggle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--text-heading);
          display: none;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cbr-mobile-toggle:hover {
          background: var(--surface-alt);
          border-color: #CBD5E1;
        }

        /* ------------------------------------------------------------
           Mobile Drawer Layout (< 992px)
           ------------------------------------------------------------ */
        .cbr-mobile-drawer {
          position: fixed;
          inset: 0;
          top: 74px;
          z-index: 899;
          display: flex;
          flex-direction: column;
        }

        .cbr-drawer-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .cbr-drawer-panel {
          position: relative;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: 20px 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: cbrDrawerSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          max-height: calc(100vh - 74px);
          overflow-y: auto;
        }

        @keyframes cbrDrawerSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .cbr-drawer-header {
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }

        .cbr-drawer-title {
          font-family: var(--font-heading);
          font-size: 16px;
          font-weight: 800;
          color: var(--text-heading);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .cbr-drawer-address {
          font-size: 12px;
          color: var(--muted);
          margin-top: 4px;
          line-height: 1.4;
        }

        .cbr-drawer-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cbr-drawer-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-heading);
          transition: all 0.2s ease;
        }

        .cbr-drawer-item:hover, .cbr-drawer-item-active {
          background: var(--primary-soft);
          border-color: #D6E4FF;
        }

        .cbr-drawer-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--primary-soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cbr-icon-accent {
          background: #EBF2FF;
          color: var(--primary);
        }

        .cbr-drawer-item-text {
          flex: 1;
        }

        .cbr-drawer-item-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-heading);
          display: flex;
          align-items: center;
        }

        .cbr-drawer-item-sub {
          font-size: 11.5px;
          color: var(--muted);
          margin-top: 2px;
        }

        .cbr-drawer-chevron {
          color: var(--muted);
          flex-shrink: 0;
        }

        .cbr-drawer-footer {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 8px;
          border-top: 1px solid var(--border);
        }

        .cbr-drawer-cta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .cbr-drawer-staff-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          padding-top: 6px;
        }

        .cbr-drawer-staff-link {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--muted);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s ease;
        }

        .cbr-drawer-staff-link:hover {
          color: var(--primary);
        }

        /* ------------------------------------------------------------
           Responsive Breakpoints
           ------------------------------------------------------------ */
        @media (min-width: 992px) {
          .desktop-nav { display: flex !important; }
          .desktop-only { display: inline-flex !important; }
          .cbr-mobile-toggle { display: none !important; }
        }

        @media (max-width: 991px) {
          .cbr-header-inner {
            height: 60px !important;
            padding: 0 14px !important;
            gap: 10px !important;
          }
          .cbr-brand {
            min-width: 0 !important;
            flex-shrink: 1 !important;
            gap: 8px !important;
          }
          .cbr-logo-wrapper {
            width: 36px !important;
            height: 36px !important;
            border-radius: 10px !important;
          }
          .cbr-brand-meta {
            min-width: 0 !important;
            overflow: hidden !important;
          }
          .cbr-brand-name {
            font-size: 15px !important;
            letter-spacing: -0.02em !important;
          }
          .cbr-brand-tagline {
            font-size: 10px !important;
          }
          .cbr-actions-cluster {
            gap: 8px !important;
            flex-shrink: 0 !important;
            margin-left: auto !important;
          }
          .desktop-nav { display: none !important; }
          .desktop-only { display: none !important; }
          .cbr-whatsapp-text { display: none !important; }
          .cbr-whatsapp-btn {
            width: 36px !important;
            height: 36px !important;
            padding: 0 !important;
            border-radius: 50% !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          .cbr-mobile-toggle {
            display: flex !important;
            width: 38px !important;
            height: 38px !important;
            border-radius: 50% !important;
            background: #FFFFFF !important;
            border: 1.5px solid var(--border) !important;
            color: var(--text-heading) !important;
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08) !important;
          }
          .cbr-mobile-drawer {
            top: 60px !important;
            z-index: 1000 !important;
          }
        }

        @media (max-width: 480px) {
          .cbr-verified-chip { display: none !important; }
          .cbr-hub-sep { display: none !important; }
        }

        /* Mobile Bottom App Bar */
        .cbr-mobile-bottom-bar {
          display: none;
        }

        @media (max-width: 768px) {
          .cbr-mobile-bottom-bar {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 58px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid var(--border);
            z-index: 890;
            align-items: center;
            justify-content: space-around;
            padding: 0 6px;
            box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.06);
          }

          .cbr-bottom-tab {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            text-decoration: none;
            color: #64748B;
            font-size: 11px;
            font-weight: 600;
            flex: 1;
            height: 100%;
            position: relative;
            transition: color 0.15s ease;
          }

          .cbr-bottom-tab.active {
            color: var(--primary);
            font-weight: 800;
          }

          .cbr-bottom-scroll-pill {
            background: #EBF2FF;
            color: var(--primary);
            padding: 2px 8px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cbr-bottom-tab.active .cbr-bottom-scroll-pill {
            background: var(--primary);
            color: #FFFFFF;
          }

          .cbr-bottom-dot {
            position: absolute;
            top: 7px;
            right: 28%;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--success);
          }

          .cbr-bottom-badge {
            position: absolute;
            top: -4px;
            right: -8px;
            background: var(--primary);
            color: #FFFFFF;
            font-size: 9.5px;
            font-weight: 800;
            padding: 1px 5px;
            border-radius: 9999px;
          }
        }
      `}</style>
    </header>
  );
};
