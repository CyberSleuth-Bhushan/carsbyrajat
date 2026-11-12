import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const ENV = {
  PORT: Number(process.env.PORT || 3000),
  BASE_URL: (process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/+$/, ''),
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin123',
  SECRET: process.env.SECRET || 'neurox-carsbyrajat-hmac-secret-2026',
  WEBHOOK_TOKEN: process.env.WEBHOOK_TOKEN || 'neurox-whatsapp-stop-webhook-secret-2026',
  ADSENSE_ID: process.env.ADSENSE_ID || '',
  DB_PATH: process.env.DB || join(process.cwd(), 'data.db'),
  NODE_ENV: process.env.NODE_ENV || 'development',
};

export const DEFAULT_SETTINGS = {
  name: 'Cars By Rajat',
  tagline: "Nagpur's #1 Certified Pre-Owned Luxury & Fleet Hub",
  address: 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur, Maharashtra 440015',
  phone: '+91 98230 11223',
  whatsapp: '919823011223',
  insta: 'carsbyrajat',
  followers: '48.2K',
  officer: 'Rajat Sharma (Data Protection & Grievance Officer)',
  officer_email: 'grievance@carsbyrajat.in',
  lat: '21.1145',
  lng: '79.0682',
  hours: 'Mo-Su 10:00-20:30',
  adsense_id: ENV.ADSENSE_ID,
};

export const SEO_SEGMENTS: Record<string, { col?: string; val?: string; max?: number; h1: string; intro: string }> = {
  petrol: { col: 'fuel', val: 'Petrol', h1: 'Certified Used Petrol Cars in Nagpur', intro: 'Pre-owned verified Petrol cars & hatchbacks at Cars By Rajat Nagpur (MH-31/40).' },
  diesel: { col: 'fuel', val: 'Diesel', h1: 'Certified Used Diesel Cars & SUVs in Nagpur', intro: 'High-torque, single-owner certified Diesel SUVs and sedans ready for immediate delivery in Nagpur.' },
  electric: { col: 'fuel', val: 'Electric', h1: 'Certified Pre-Owned Electric (EV) Cars in Nagpur', intro: 'Battery-health certified Electric vehicles in Nagpur with warranty and charging kit.' },
  cng: { col: 'fuel', val: 'CNG', h1: 'Used Factory-Fitted CNG Cars in Nagpur', intro: 'High-mileage certified CNG cars in Nagpur with RTO & hydro-test verification.' },
  hybrid: { col: 'fuel', val: 'Hybrid', h1: 'Certified Luxury Hybrid Cars in Nagpur', intro: 'Ultra-refined self-charging Hybrid luxury sedans in Nagpur.' },
  automatic: { col: 'tr', val: 'Automatic', h1: 'Used Automatic Cars in Nagpur (DCT, CVT & Torque Converter)', intro: 'Effortless city driving — explore Nagpur’s largest certified Automatic fleet at Cars By Rajat.' },
  manual: { col: 'tr', val: 'Manual', h1: 'Certified Used Manual Transmission Cars in Nagpur', intro: 'Pure enthusiast & value-packed Manual cars with verified clutch and gearbox health.' },
  'under-5-lakh': { max: 500000, h1: 'Certified Used Cars Under ₹5 Lakh in Nagpur', intro: 'Reliable verified budget cars under ₹5 Lakh in Nagpur with easy EMI.' },
  'under-10-lakh': { max: 1000000, h1: 'Best Used Cars Under ₹10 Lakh in Nagpur', intro: 'Top-variant hatchbacks, compact SUVs, and sedans under ₹10 Lakh at Cars By Rajat Nagpur.' },
  'under-20-lakh': { max: 2000000, h1: 'Certified Used SUVs & Sedans Under ₹20 Lakh in Nagpur', intro: 'Feature-loaded Creta, Seltos, Innova Crysta & City models under ₹20 Lakh in Nagpur.' },
};

