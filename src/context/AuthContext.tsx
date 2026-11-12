import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../api/client';
import type { TeamMember } from '../types';

interface AuthContextType {
  unlockedPhone: string | null;
  setUnlockedPhone: (phone: string | null) => void;
  adminUser: TeamMember | null;
  isAdmin: boolean;
  loginAdmin: (user: TeamMember) => void;
  logoutAdmin: () => Promise<void>;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [unlockedPhone, setUnlockedPhone] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      // 1. Check Admin Session
      const adminRes = await api.getAdminSession().catch(() => ({ ok: false, authenticated: false, user: null }));
      if (adminRes.authenticated && adminRes.user) {
        setAdminUser(adminRes.user);
      } else {
        setAdminUser(null);
      }

      // 2. Check Customer Unlock Session
      const dashRes = await api.getCustomerDashboard().catch(() => ({ ok: false, authenticated: false, userPhone: null }));
      if (dashRes.authenticated && dashRes.userPhone) {
        setUnlockedPhone(dashRes.userPhone);
      } else {
        setUnlockedPhone(null);
      }
    } catch {
      // Silent error for unauthenticated visitors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const loginAdmin = (user: TeamMember) => {
    setAdminUser(user);
  };

  const logoutAdmin = async () => {
    try {
      await api.adminLogout();
    } catch {}
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        unlockedPhone,
        setUnlockedPhone,
        adminUser,
        isAdmin: Boolean(adminUser),
        loginAdmin,
        logoutAdmin,
        loading,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

