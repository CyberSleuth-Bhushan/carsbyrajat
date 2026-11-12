import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { UnlockModal } from '../components/UnlockModal';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  FileCheck,
  MapPin,
  Phone,
  MessageSquare,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calculator,
  Handshake,
  Car as CarIcon,
  Wrench,
  Key,
  BookOpen,
} from 'lucide-react';
import type { Car, Negotiation, ShowroomSettings } from '../types';

interface CarDetailPageProps {
  slug: string;
}

export const CarDetailPage: React.FC<CarDetailPageProps> = ({ slug }) => {
  const { unlockedPhone } = useAuth();
  const { isShortlisted, toggleShortlist } = useCompare();

  const [car, setCar] = useState<Car | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  // EMI Calculator State
  const [downPayment, setDownPayment] = useState(200000);
  const [loanTenureYears, setLoanTenureYears] = useState(5);

  // Modals and Forms State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [offerName, setOfferName] = useState('');
  const [offerPhone, setOfferPhone] = useState('');
  const [offerSubmitting, setOfferSubmitting] = useState(false);
  const [offerSuccessMsg, setOfferSuccessMsg] = useState('');

  // Test Drive State
  const [tdDate, setTdDate] = useState('');
  const [tdSlot, setTdSlot] = useState('Morning (11:00 AM)');
  const [tdName, setTdName] = useState('');
  const [tdPhone, setTdPhone] = useState('');
  const [tdConsent, setTdConsent] = useState(true);
  const [tdSubmitting, setTdSubmitting] = useState(false);
  const [tdSuccessMsg, setTdSuccessMsg] = useState('');

  // Enquiry Form State
  const [enqMessage, setEnqMessage] = useState('I am interested in this vehicle. Please confirm availability and schedule a showroom visit.');
  const [enqName, setEnqName] = useState('');
  const [enqPhone, setEnqPhone] = useState('');
  const [enqSubmitting, setEnqSubmitting] = useState(false);
  const [enqSuccessMsg, setEnqSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, setRes] = await Promise.all([
          api.getCarBySlug(slug),
          api.getSettings(),
        ]);
        setCar(carRes.car);
        setUnlocked(carRes.unlocked);
        if (carRes.negotiation) setNegotiation(carRes.negotiation);
        setSettings(setRes.settings);
        setDownPayment(Math.round(carRes.car.direct * 0.2));
      } catch (err) {
        console.error('Failed to load car details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--muted)' }}>Loading vehicle dossier...</div>;
  }

  if (!car) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Vehicle Not Found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>The requested car is not available in our showroom.</p>
        <a href="/" className="btn btn-primary">Browse Showroom Fleet</a>
      </div>
    );
  }

  const title = `${car.year} ${car.make} ${car.model}`;
  const photos = (car.photos || '').split(',').map((x) => x.trim()).filter(Boolean);
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;

  // EMI Calculator Calculation
  const loanAmount = Math.max(0, (unlocked ? car.direct : car.price) - downPayment);
  const annualInterestRate = 0.0865;
  const monthlyInterestRate = annualInterestRate / 12;
  const totalMonths = loanTenureYears * 12;
  const calculatedEmi = loanAmount > 0
    ? Math.round(
        (loanAmount *
          monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, totalMonths)) /
          (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
      )
    : 0;

  const handleShare = async () => {
    const url = window.location.href;
    const text = `🚗 Check out this verified ${title} on Cars By Rajat Nagpur!\n💰 Price: ${inr(unlocked ? car.direct : car.price)}\n📍 Nagpur Hub (MH-31)\n🔗 Dossier: ${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleMakeOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPrice || isNaN(Number(offerPrice))) {
      alert('Please enter a valid target purchase offer amount.');
      return;
    }
    const p = offerPhone || unlockedPhone || '';
    if (!p) {
      alert('Please enter your mobile number to submit an offer.');
      return;
    }
    const n = offerName || 'Interested Buyer';
    setOfferSubmitting(true);
    try {
      const res = await api.submitNegotiation({
        phone: p,
        name: n,
        car_id: car.id,
        listed_price: unlocked ? car.direct : car.price,
        offer_price: Number(offerPrice),
        notes: offerNotes,
      });
      setNegotiation({
        id: res.negotiation_id,
        car_id: car.id,
        customer_phone: p,
        customer_name: n,
        listed_price: unlocked ? car.direct : car.price,
        current_customer_offer: Number(offerPrice),
        current_vendor_offer: null,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [{
          id: 1,
          negotiation_id: res.negotiation_id,
          sender_type: 'CUSTOMER',
          sender_name: n,
          offered_price: Number(offerPrice),
          notes: offerNotes,
          status: 'SUBMITTED',
          created_at: new Date().toISOString(),
        }]
      });
      setOfferSuccessMsg('Your purchase counteroffer has been submitted to Rajat Sharma for review. You can track decisions in your Buyer Hub.');
    } catch (err: any) {
      alert(err.message || 'Failed to submit counteroffer.');
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleBookTestDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = tdPhone || unlockedPhone || '';
    if (!p) {
      alert('Please enter your mobile number to schedule a test drive.');
      return;
    }
    setTdSubmitting(true);
    try {
      await api.bookTestDrive({
        phone: p,
        name: tdName || 'Interested Buyer',
        car_id: car.id,
        date: tdDate,
        slot: tdSlot,
        consent: tdConsent ? 1 : 0,
      });
      setTdSuccessMsg('Your showroom test drive appointment has been scheduled! Our concierge team will confirm your time slot on WhatsApp.');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule test drive.');
    } finally {
      setTdSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '36px 0 70px', background: 'var(--bg)' }}>
      <div className="container">
        {/* Breadcrumb & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
            <a href="/" style={{ color: 'var(--primary)', fontWeight: '600' }}>Showroom Fleet</a> &gt; <span>{car.make}</span> &gt; <strong style={{ color: 'var(--text-heading)' }}>{car.model}</strong>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => toggleShortlist(car.id)}
              className="btn btn-sm btn-secondary"
              style={{
                color: isShortlisted(car.id) ? '#EF4444' : 'var(--text-heading)',
                borderColor: isShortlisted(car.id) ? '#EF4444' : 'var(--border)',
              }}
            >
              <Heart size={14} fill={isShortlisted(car.id) ? '#EF4444' : 'none'} />
              {isShortlisted(car.id) ? 'Shortlisted' : 'Shortlist to Compare'}
            </button>
            <button type="button" onClick={handleShare} className="btn btn-sm btn-secondary">
              <Share2 size={14} color="var(--primary)" /> Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Top Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className={`status-pill st-${car.status}`}>{car.status}</span>
            <span style={{ background: '#0F172A', color: '#FFFFFF', fontSize: '11px', fontWeight: '800', padding: '3px 10px', borderRadius: '9999px' }}>
              {car.rto} Nagpur
            </span>
            <span className="pill pill-verified">
              ✓ Showroom Verified Fleet
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(26px, 4.2vw, 38px)', fontWeight: '900', letterSpacing: '-0.025em', color: 'var(--text-heading)' }}>
            {title}
          </h1>
          <p style={{ color: 'var(--text-body)', fontSize: '14px', marginTop: '4px' }}>
            📍 {car.location || 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur'}
          </p>
        </div>

        {/* 2-Column Main Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 0.9fr)', gap: '32px', marginBottom: '40px' }} className="detail-layout">
          {/* Left Column: Gallery & Inspections */}
          <div>
            {/* Main High-Res Image */}
            <div style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 10',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              background: '#0F172A',
              marginBottom: '14px',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--border)'
            }}>
              <img
                src={photos[selectedPhotoIdx] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80'}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoIdx((p) => (p > 0 ? p - 1 : photos.length - 1))}
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: '#FFFFFF',
                      border: 'none',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPhotoIdx((p) => (p < photos.length - 1 ? p + 1 : 0))}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: '#FFFFFF',
                      border: 'none',
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)'
                    }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '32px', paddingBottom: '4px' }}>
                {photos.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhotoIdx(idx)}
                    style={{
                      flex: '0 0 80px',
                      height: '56px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: idx === selectedPhotoIdx ? '2px solid var(--primary)' : '1px solid var(--border)',
                      padding: 0,
                      cursor: 'pointer',
                      opacity: idx === selectedPhotoIdx ? 1 : 0.7,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <img src={p} alt={`Angle ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* 6-Pack Vital Specs Grid */}
            <div className="panel" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '19px', fontWeight: '800', marginBottom: '18px', color: 'var(--text-heading)' }}>
                Vehicle Vital Specifications
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="icon-box-sm" style={{ marginBottom: '8px' }}>
                    <Gauge size={16} />
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Kilometers
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px' }}>
                    {car.km.toLocaleString('en-IN')} km
                  </div>
                </div>

                <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="icon-box-sm" style={{ marginBottom: '8px' }}>
                    <Fuel size={16} />
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Fuel Type
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px' }}>
                    {car.fuel}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="icon-box-sm" style={{ marginBottom: '8px' }}>
                    <Cog size={16} />
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Gearbox
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px' }}>
                    {car.tr}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="icon-box-sm" style={{ marginBottom: '8px' }}>
                    <FileCheck size={16} />
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Ownership
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px' }}>
                    {car.own === 1 ? '1st Owner' : `${car.own}nd Owner`}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="icon-box-sm" style={{ marginBottom: '8px' }}>
                    <Calendar size={16} />
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Year of Make
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px' }}>
                    {car.year}
                  </div>
                </div>

                <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div className="icon-box-sm" style={{ marginBottom: '8px' }}>
                    <ShieldCheck size={16} />
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase' }}>
                    Insurance
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-heading)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {car.ins || 'Comprehensive Active'}
                  </div>
                </div>
              </div>
            </div>

            {/* Certified Showroom Inspection Dossier */}
            <div className="panel" style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-heading)' }}>
                  🛡️ Certified Showroom Inspection Dossier
                </h2>
                <span className="pill pill-verified">
                  ✓ Showroom Inspection Verified
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wrench size={16} /> Engine &amp; Transmission
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.5' }}>
                    {car.insp_engine || 'Compression smooth | Zero oil leaks | Gear shifts verified'}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CarIcon size={16} /> Tyres &amp; Suspension
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.5' }}>
                    {car.insp_tyres || '75%+ tread depth | Factory alloys | Spare tyre healthy'}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={16} /> Frame &amp; Chassis
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.5' }}>
                    {car.insp_chassis || 'Non-accidental verified | Factory paint thickness intact | Zero flood history'}
                  </div>
                </div>

                <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '6px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={16} /> Electricals &amp; AC
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: '1.5' }}>
                    {car.insp_elec || 'AC chilling at 4.2°C | Power windows & infotainment tested | Airbags active'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-body)', background: 'var(--surface-alt)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={16} color="var(--primary)" /> <span><strong>Keys:</strong> {car.keys_count || 'Original 2 Smart Keys Available'}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-body)', background: 'var(--surface-alt)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} color="var(--primary)" /> <span><strong>History:</strong> {car.service_hist || 'Authorized Service Records Verified'}</span>
                </div>
              </div>
            </div>

            {/* Description & Features */}
            {car.description && (
              <div className="panel" style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-heading)' }}>Showroom Inspection &amp; Notes</h3>
                <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'var(--text-body)' }}>
                  {car.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Pricing, Negotiation, EMI, Booking */}
          <div>
            {/* Pricing Card */}
            <div className="panel" style={{ marginBottom: '24px', borderTop: '4px solid var(--primary)' }}>
              <div style={{ marginBottom: '16px' }}>
                <span className="pill pill-soft-blue" style={{ fontSize: '11px', marginBottom: '8px' }}>
                  <Sparkles size={12} color="var(--primary)" /> SHOWROOM GUARANTEED VALUE
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '700' }}>
                      {unlocked ? 'Showroom Direct Price' : 'Nagpur Market Est.'}
                    </div>
                    <div style={{ fontSize: '30px', fontWeight: '900', color: unlocked ? 'var(--primary)' : 'var(--text-heading)' }}>
                      {lakh(unlocked ? car.direct : car.price)}
                    </div>
                  </div>
                  {unlocked && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                        {lakh(car.price)}
                      </div>
                      <span className="pill pill-verified">
                        ✓ Save {inr(car.price - car.direct)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!unlocked && (
                <button
                  type="button"
                  onClick={() => setUnlockModalOpen(true)}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '15px', marginBottom: '16px' }}
                >
                  🔒 Unlock Direct Dealership Price
                </button>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <a
                  href={`https://wa.me/${settings?.whatsapp || '919823011223'}?text=${encodeURIComponent(`Hi Rajat, I am interested in the ${title} (${car.rto}) and would like to schedule a visit.`)}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-wa"
                  style={{ width: '100%' }}
                >
                  <MessageSquare size={16} /> WhatsApp
                </a>
                <a
                  href={`tel:${car.contact_number || settings?.phone || '+91 98230 11223'}`}
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Phone size={16} color="var(--primary)" /> Call Sales
                </a>
              </div>
            </div>

            {/* Price Negotiation System Card */}
            <div className="panel" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div className="icon-box-sm">
                  <Handshake size={18} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-heading)' }}>Propose Your Target Price</h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Direct bilateral price negotiation</div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-body)', marginBottom: '16px', lineHeight: '1.5' }}>
                Submit a genuine purchase offer. Our principal Rajat Sharma will review and counteroffer or confirm deal terms online.
              </p>

              {negotiation && (
                <div style={{ background: 'var(--surface-alt)', padding: '14px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Active Negotiation Status:</div>
                  <div style={{ fontWeight: '800', fontSize: '14.5px', color: 'var(--primary)', marginTop: '2px' }}>
                    {negotiation.status} (Your target: {inr(negotiation.current_customer_offer)})
                  </div>
                  {negotiation.current_vendor_offer && (
                    <div style={{ fontSize: '13px', color: 'var(--success)', fontWeight: '700', marginTop: '6px' }}>
                      Showroom Counteroffer: {inr(negotiation.current_vendor_offer)}
                    </div>
                  )}
                  <a href="/dashboard" className="btn btn-sm btn-secondary" style={{ marginTop: '10px', width: '100%' }}>
                    Open Negotiation in Buyer Hub →
                  </a>
                </div>
              )}

              {offerSuccessMsg ? (
                <div style={{ background: 'var(--success-soft)', color: 'var(--success)', padding: '14px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }}>
                  ✓ {offerSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleMakeOffer}>
                  {!unlockedPhone && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-heading)' }}>Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul"
                          className="inp"
                          value={offerName}
                          onChange={(e) => setOfferName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-heading)' }}>Mobile (+91)</label>
                        <input
                          type="tel"
                          required
                          placeholder="98230 11223"
                          className="inp"
                          value={offerPhone}
                          onChange={(e) => setOfferPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-heading)' }}>Your Expected Offer Amount (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder={`e.g. ${unlocked ? car.direct - 30000 : car.price - 50000}`}
                      className="inp"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-heading)' }}>Discussion Notes (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Ready for immediate down payment if included with RC transfer"
                      className="inp"
                      value={offerNotes}
                      onChange={(e) => setOfferNotes(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={offerSubmitting}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px' }}
                  >
                    {offerSubmitting ? 'Submitting Counteroffer...' : '🤝 Submit Target Purchase Offer'}
                  </button>
                </form>
              )}
            </div>

            {/* Interactive EMI Calculator Card */}
            <div className="panel" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div className="icon-box-sm">
                  <Calculator size={18} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-heading)' }}>Instant EMI Estimator</h3>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Transparent finance calculation</div>
                </div>
              </div>

              <div style={{ background: 'var(--surface-alt)', padding: '16px', borderRadius: 'var(--radius-sm)', textAlign: 'center', marginBottom: '18px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600' }}>Estimated Monthly Payment</div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: 'var(--primary)', marginTop: '2px' }}>
                  {inr(calculatedEmi)} / month
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '4px' }}>
                  Based on 8.65% p.a. tie-up rate with HDFC / ICICI
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>Down Payment:</span>
                  <span style={{ color: 'var(--primary)' }}>{inr(downPayment)}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max={unlocked ? car.direct - 50000 : car.price - 50000}
                  step="25000"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>
                  <span>Loan Duration:</span>
                  <span style={{ color: 'var(--primary)' }}>{loanTenureYears} Years ({loanTenureYears * 12} Mos)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={loanTenureYears}
                  onChange={(e) => setLoanTenureYears(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
              </div>
            </div>

            {/* Book Showroom Test Drive */}
            <div className="panel">
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '6px', color: 'var(--text-heading)' }}>
                📅 Schedule Showroom Test Drive
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-body)', marginBottom: '16px' }}>
                Visit our Wardha Road hub to take the {car.model} out for a road trial.
              </p>

              {tdSuccessMsg ? (
                <div style={{ background: 'var(--success-soft)', color: 'var(--success)', padding: '14px', borderRadius: '12px', fontSize: '13.5px', fontWeight: '700' }}>
                  ✓ {tdSuccessMsg}
                </div>
              ) : (
                <form onSubmit={handleBookTestDrive}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-heading)' }}>Preferred Date</label>
                      <input
                        type="date"
                        required
                        className="inp"
                        value={tdDate}
                        onChange={(e) => setTdDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-heading)' }}>Time Slot</label>
                      <select
                        className="inp"
                        value={tdSlot}
                        onChange={(e) => setTdSlot(e.target.value)}
                      >
                        <option>Morning (11:00 AM)</option>
                        <option>Afternoon (02:30 PM)</option>
                        <option>Evening (05:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  {!unlockedPhone && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        required
                        placeholder="Your Name"
                        className="inp"
                        value={tdName}
                        onChange={(e) => setTdName(e.target.value)}
                      />
                      <input
                        type="tel"
                        required
                        placeholder="Mobile (+91)"
                        className="inp"
                        value={tdPhone}
                        onChange={(e) => setTdPhone(e.target.value)}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={tdSubmitting}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    {tdSubmitting ? 'Booking...' : 'Confirm Test Drive Appointment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Unlock Modal */}
      <UnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        carId={car.id}
        carTitle={title}
        onSuccess={() => setUnlocked(true)}
      />

      <style>{`
        @media (max-width: 991px) {
          .detail-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
