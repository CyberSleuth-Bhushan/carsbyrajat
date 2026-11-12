export interface Car {
  id: number;
  slug: string;
  make: string;
  model: string;
  year: number;
  km: number;
  fuel: string;
  tr: string;
  tr_detail?: string;
  own: number;
  rto: string;
  ins?: string;
  feat?: string;
  price: number;
  direct: number;
  photos: string;
  reel?: string;
  status: 'AVAILABLE' | 'BOOKED' | 'SOLD';
  insp_engine?: string;
  insp_tyres?: string;
  insp_chassis?: string;
  insp_elec?: string;
  keys_count?: string;
  service_hist?: string;
  dealer_source?: string;
  dealer_contact?: string;
  dealer_cost?: number;
  verification_status?: string;
  verified_by?: string;
  verified_at?: string;
  verification_notes?: string;
  rc_verified?: number;
  insurance_verified?: number;
  puc_verified?: number;
  inspection_verified?: number;
  description?: string;
  location?: string;
  contact_number?: string;
  created_at?: string;
}

export interface Lead {
  id: number;
  ts: string;
  phone: string;
  name: string;
  email?: string;
  car_id?: number | null;
  status: 'NEW' | 'CONTACTED' | 'TEST_DRIVE_SCHEDULED' | 'NEGOTIATION' | 'DEAL_CLOSED' | 'LOST' | 'OPTED_OUT';
  note?: string;
  trail?: string;
  consent: number;
  consent_ts: string;
  followup_date?: string;
  assigned_to?: string;
  assigned_member_id?: number;
  source?: string;
  budget?: string;
  exchange?: string;
  location?: string;
  requirements?: string;
  verification_status?: string;
  engagement_score?: number;
  // Joined fields from Car
  year?: number;
  make?: string;
  model?: string;
  direct?: number;
  dealer_source?: string;
  dealer_contact?: string;
  dealer_cost?: number;
}

export interface TeamMember {
  id: number;
  username: string;
  password_hash?: string;
  password_salt?: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'ADMIN' | 'SALES_MANAGER' | 'SALES_REP' | 'INVENTORY_MANAGER';
  responsibilities?: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
  last_login?: string;
}

export interface TeamActivity {
  id: number;
  ts: string;
  member_id: number;
  member_name: string;
  action: string;
  target_type: string;
  target_id: string;
  details: string;
}

export interface LeadInteraction {
  id: number;
  lead_id: number;
  ts: string;
  type: 'CALL' | 'MEETING' | 'OFFER' | 'TEST_DRIVE' | 'ENQUIRY' | 'NOTE';
  outcome: string;
  customer_response?: string;
  decision_notes?: string;
  next_followup_date?: string;
  created_by: string;
}

export interface Enquiry {
  id: number;
  ts: string;
  lead_id?: number | null;
  car_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  message: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESPONDED' | 'RESOLVED';
  assigned_to?: string;
  assigned_member_id?: number;
  response_notes?: string;
  responded_at?: string;
  // Joined fields
  year?: number;
  make?: string;
  model?: string;
  slug?: string;
  direct?: number;
  price?: number;
  photos?: string;
}

export interface Negotiation {
  id: number;
  car_id: number;
  customer_phone: string;
  customer_name: string;
  lead_id?: number | null;
  listed_price: number;
  current_customer_offer: number;
  current_vendor_offer?: number | null;
  status: 'PENDING' | 'VENDOR_COUNTERED' | 'CUSTOMER_COUNTERED' | 'ACCEPTED' | 'REJECTED';
  assigned_to?: string;
  assigned_member_id?: number;
  created_at: string;
  updated_at: string;
  // Joined fields & sub-messages
  year?: number;
  make?: string;
  model?: string;
  slug?: string;
  photos?: string;
  messages?: NegotiationMessage[];
}

export interface NegotiationMessage {
  id: number;
  negotiation_id: number;
  sender_type: 'CUSTOMER' | 'VENDOR';
  sender_name: string;
  offered_price: number;
  notes?: string;
  status: 'SUBMITTED' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export interface Notification {
  id: number;
  ts: string;
  recipient_type: 'CUSTOMER' | 'ADMIN_TEAM';
  recipient_target: string;
  title: string;
  message: string;
  event_type: string;
  link_url?: string;
  is_read: number;
}

export interface ShowroomSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  insta: string;
  followers: string;
  officer: string;
  officer_email: string;
  lat: string;
  lng: string;
  hours: string;
  adsense_id?: string;
}

export interface CustomerInsights {
  lead: Lead;
  enquiries: Enquiry[];
  negotiations: Negotiation[];
  interactions: LeadInteraction[];
  preferredMakes: string[];
  preferredVehicles: string[];
  budgetRange: string;
  engagementScore: number;
  conversionProbability: 'HOT 🔥' | 'HIGH' | 'MEDIUM' | 'LOW';
  probabilityColor: string;
  totalEnquiries: number;
  totalNegotiations: number;
  totalInteractions: number;
}

