import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ChatbotWidget } from './components/ChatbotWidget';
import { HomePage } from './pages/HomePage';
import { CarDetailPage } from './pages/CarDetailPage';
import { DynamicGalleryPage } from './pages/DynamicGalleryPage';
import { BuyerDashboardPage } from './pages/BuyerDashboardPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ComparePage } from './pages/ComparePage';
import { LegalPage } from './pages/LegalPage';
import { api } from './api/client';
import type { ShowroomSettings } from './types';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);

  useEffect(() => {
    api.getSettings()
      .then((res) => setSettings(res.settings))
      .catch((err) => console.error(err));

    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const renderContent = () => {
    const p = currentPath.replace(/\/+$/, '') || '/';

    if (p === '/' || p === '/used-cars/nagpur' || p.startsWith('/used-cars/nagpur/')) {
      return <HomePage />;
    }

    if (p === '/dynamic-gallery' || p === '/gallery' || p === '/scroll') {
      return <DynamicGalleryPage />;
    }

    if (p === '/dashboard') {
      return <BuyerDashboardPage />;
    }

    if (p === '/compare') {
      return <ComparePage />;
    }

    if (p === '/admin/login') {
      return <AdminLoginPage />;
    }

    if (p.startsWith('/admin')) {
      return <AdminDashboardPage />;
    }

    if (p === '/privacy-policy') {
      return <LegalPage type="privacy" settings={settings} />;
    }

    if (p === '/grievance') {
      return <LegalPage type="grievance" settings={settings} />;
    }

    if (p === '/opt-out') {
      return <LegalPage type="opt-out" settings={settings} />;
    }

    if (p.startsWith('/cars/')) {
      const slug = p.slice(6);
      return <CarDetailPage slug={slug} />;
    }

    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '12px' }}>404 — Page Not Found</h1>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          The showroom page you are looking for does not exist or has been moved.
        </p>
        <a href="/" className="btn btn-primary">Return to Cars By Rajat Showroom</a>
      </div>
    );
  };

  const isScrollMode = currentPath === '/scroll' || currentPath === '/dynamic-gallery' || currentPath === '/gallery';

  return (
    <AuthProvider>
      <CompareProvider>
        <Navbar settings={settings || undefined} currentPath={currentPath} />
        <main style={{ flex: 1 }}>{renderContent()}</main>
        {!isScrollMode && <ChatbotWidget />}
        {!isScrollMode && <Footer settings={settings || undefined} />}
      </CompareProvider>
    </AuthProvider>
  );
};

