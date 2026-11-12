import type { Car, Lead, TeamMember, Enquiry, Negotiation, Notification, ShowroomSettings, CustomerInsights } from '../types';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are sent
  });

  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || 'Request failed. Please try again.');
  }
  return data;
}

export const api = {
  // Public APIs
  getSettings: () => request<{ ok: boolean; settings: ShowroomSettings }>('/api/settings'),
  
  getCars: (params?: { fuel?: string; tr?: string; minPrice?: number; maxPrice?: number; q?: string; sort?: string }) => {
    const q = new URLSearchParams();
    if (params?.fuel) q.set('fuel', params.fuel);
    if (params?.tr) q.set('tr', params.tr);
    if (params?.minPrice) q.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) q.set('maxPrice', String(params.maxPrice));
    if (params?.q) q.set('q', params.q);
    if (params?.sort) q.set('sort', params.sort);
    return request<{ ok: boolean; cars: Car[]; unlocked: boolean; userPhone: string | null }>(`/api/cars?${q.toString()}`);
  },

  getCarBySlug: (slug: string) =>
    request<{ ok: boolean; car: Car; unlocked: boolean; userPhone: string | null; negotiation: Negotiation | null }>(`/api/cars/${slug}`),

  unlockPrice: (body: { phone: string; name?: string; email?: string; car_id?: number | null; trail?: string; consent: number }) =>
    request<{ ok: boolean; phone: string; name: string; email: string; message: string }>('/api/unlock', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  bookTestDrive: (body: { phone: string; name?: string; car_id?: number | null; date: string; slot: string; consent: number }) =>
    request<{ ok: boolean; message: string }>('/api/testdrive', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  submitEnquiry: (body: { phone: string; name: string; email?: string; car_id?: number | null; message: string; source?: string }) =>
    request<{ ok: boolean; enquiry_id: number; message: string }>('/api/enquiry', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  submitNegotiation: (body: { phone: string; name: string; car_id: number; listed_price: number; offer_price: number; notes?: string }) =>
    request<{ ok: boolean; negotiation_id: number; message: string }>('/api/negotiate', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  acceptNegotiation: (negotiation_id: number) =>
    request<{ ok: boolean; message: string }>('/api/negotiate/accept', {
      method: 'POST',
      body: JSON.stringify({ negotiation_id }),
    }),

  counterNegotiation: (body: { negotiation_id: number; counter_price: number; notes?: string }) =>
    request<{ ok: boolean; message: string }>('/api/negotiate/counter', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  sendChatMessage: (message: string) =>
    request<{ ok: boolean; reply: string; showSalesPrompt: boolean }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  getCustomerDashboard: () =>
    request<{
      ok: boolean;
      authenticated: boolean;
      userPhone: string | null;
      customer: Lead | null;
      enquiries: Enquiry[];
      negotiations: Negotiation[];
      notifications: Notification[];
    }>('/api/customer/dashboard'),

  markNotificationsRead: (target?: string) =>
    request<{ ok: boolean; message: string }>('/api/notifications/mark-read', {
      method: 'POST',
      body: JSON.stringify({ target }),
    }),

  optOut: (phone: string) =>
    request<{ ok: boolean; status: string; message: string }>('/api/stop', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  // Admin APIs
  adminLogin: (body: { username: string; password: string }) =>
    request<{ ok: boolean; user: TeamMember; message: string }>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  adminLogout: () =>
    request<{ ok: boolean; message: string }>('/api/admin/auth/logout', { method: 'POST' }),

  getAdminSession: () =>
    request<{ ok: boolean; authenticated: boolean; user: TeamMember | null }>('/api/admin/auth/me'),

  getDashboardStats: () =>
    request<{
      ok: boolean;
      stats: {
        totalLeads: number;
        newLeads: number;
        activeTestDrives: number;
        activeNegotiations: number;
        closedDeals: number;
        totalFleet: number;
        pendingEnquiries: number;
      };
    }>('/api/admin/dashboard-stats'),

  getLeads: (params?: { status?: string; q?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.q) q.set('q', params.q);
    return request<{ ok: boolean; leads: Lead[] }>(`/api/admin/leads?${q.toString()}`);
  },

  getLeadById: (id: number) =>
    request<{ ok: boolean; lead: Lead; insights: CustomerInsights; interactions: any[] }>(`/api/admin/leads/${id}`),

  createLead: (body: Partial<Lead>) =>
    request<{ ok: boolean; lead_id: number; message: string }>('/api/admin/leads', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateLead: (id: number, body: Partial<Lead>) =>
    request<{ ok: boolean; message: string }>(`/api/admin/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  addLeadInteraction: (leadId: number, body: { type: string; outcome: string; customer_response?: string; decision_notes?: string; next_followup_date?: string }) =>
    request<{ ok: boolean; message: string }>(`/api/admin/leads/${leadId}/interaction`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAdminEnquiries: () =>
    request<{ ok: boolean; enquiries: Enquiry[] }>('/api/admin/enquiries'),

  respondToEnquiry: (id: number, body: { status: string; assigned_to?: string; response_notes?: string }) =>
    request<{ ok: boolean; message: string }>(`/api/admin/enquiries/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAdminNegotiations: () =>
    request<{ ok: boolean; negotiations: Negotiation[] }>('/api/admin/negotiations'),

  respondToNegotiation: (id: number, body: { action: 'accept' | 'counter' | 'reject'; counter_price?: number; notes?: string }) =>
    request<{ ok: boolean; message: string }>(`/api/admin/negotiations/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAdminInventory: () =>
    request<{ ok: boolean; cars: Car[] }>('/api/admin/inventory'),

  saveCar: (carData: Partial<Car>) =>
    request<{ ok: boolean; car_id?: number; message: string }>('/api/admin/inventory', {
      method: 'POST',
      body: JSON.stringify(carData),
    }),

  updateCarStatus: (id: number, status: 'AVAILABLE' | 'BOOKED' | 'SOLD') =>
    request<{ ok: boolean; message: string }>(`/api/admin/inventory/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),

  deleteCar: (id: number) =>
    request<{ ok: boolean; message: string }>(`/api/admin/inventory/${id}`, {
      method: 'DELETE',
    }),

  getTeamMembers: () =>
    request<{ ok: boolean; teamMembers: TeamMember[] }>('/api/admin/team'),

  createTeamMember: (body: { username: string; password: string; name: string; role: string; email?: string; phone?: string; responsibilities?: string }) =>
    request<{ ok: boolean; message: string }>('/api/admin/team', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  updateTeamMember: (id: number, body: { role?: string; status?: string; responsibilities?: string }) =>
    request<{ ok: boolean; message: string }>(`/api/admin/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  getVerificationData: () =>
    request<{ ok: boolean; cars: any[]; leads: any[] }>('/api/admin/verification'),

  updateCarVerification: (id: number, body: { verification_status?: string; verification_notes?: string; rc_verified?: boolean; insurance_verified?: boolean; puc_verified?: boolean; inspection_verified?: boolean }) =>
    request<{ ok: boolean; message: string }>(`/api/admin/verification/car/${id}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAuditActivities: () =>
    request<{ ok: boolean; activities: any[] }>('/api/admin/activities'),

  getAdminSettings: () =>
    request<{ ok: boolean; settings: ShowroomSettings }>('/api/admin/settings'),

  saveAdminSettings: (body: Partial<ShowroomSettings>) =>
    request<{ ok: boolean; settings: ShowroomSettings; message: string }>('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

