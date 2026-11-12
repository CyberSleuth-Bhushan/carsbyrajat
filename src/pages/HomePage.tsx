import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { HorizontalCarTrack } from '../components/HorizontalCarTrack';
import { FilterBar } from '../components/FilterBar';
import { CarCard } from '../components/CarCard';
import { UnlockModal } from '../components/UnlockModal';
import {
  Sparkles,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Film,
  MessageSquare,
  Car as CarIcon,
  ArrowRight,
  Wrench,
  Shield,
  FileText,
  Handshake,
  Search,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  Star,
  MapPin,
  Clock,
  Phone,
  Zap,
  Award,
  Layers,
  Heart,
  Pause,
  Play,
  RotateCw,
  Eye,
} from 'lucide-react';
import type { Car, ShowroomSettings } from '../types';

export const HomePage: React.FC = () => {
  const { unlockedPhone } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('');
  const [selectedTr, setSelectedTr] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  // Hero Spotlight Car State (Dynamic auto-rotation & photo switching)
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [spotlightPhotoIndex, setSpotlightPhotoIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 5000; // 5 seconds per featured vehicle
  const TICK_INTERVAL = 100;

  // Auto-advance spotlight vehicle smoothly unless paused or hovered
  useEffect(() => {
    if (!isAutoPlaying || isHovered || cars.length <= 1) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setSpotlightIndex((idx) => (idx + 1) % cars.length);
          setSpotlightPhotoIndex(0);
          return 0;
        }
        return prev + (TICK_INTERVAL / SLIDE_DURATION) * 100;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, cars.length]);

  const handlePrevSpotlight = () => {
    setSpotlightIndex((prev) => (prev > 0 ? prev - 1 : cars.length - 1));
    setSpotlightPhotoIndex(0);
    setProgress(0);
  };

  const handleNextSpotlight = () => {
    setSpotlightIndex((prev) => (prev + 1) % cars.length);
    setSpotlightPhotoIndex(0);
    setProgress(0);
  };

  const handleSelectSpotlightCar = (idx: number) => {
    setSpotlightIndex(idx);
    setSpotlightPhotoIndex(0);
    setProgress(0);
  };

  // Unlock Modal State
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [selectedCarForUnlock, setSelectedCarForUnlock] = useState<{ id: number; title: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carsRes, settingsRes] = await Promise.all([
          api.getCars(),
          api.getSettings(),
        ]);
        setCars(carsRes.cars);
        setSettings(settingsRes.settings);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenUnlock = (carId: number, carTitle: string) => {
    setSelectedCarForUnlock({ id: carId, title: carTitle });
    setUnlockModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFuel('');
    setSelectedTr('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
    setActiveCategory('ALL');
  };

  // Quick category selection
  const handleSelectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'ALL') {
      setSelectedFuel('');
      setSelectedTr('');
      setMinPrice('');
      setMaxPrice('');
    } else if (cat === 'SUV') {
      setSearchQuery('SUV Creta Seltos XUV700');
    } else if (cat === 'LUXURY') {
      setMinPrice('2000000');
      setMaxPrice('');
    } else if (cat === 'AUTOMATIC') {
      setSelectedTr('Automatic');
      setSelectedFuel('');
    } else if (cat === 'DIESEL') {
      setSelectedFuel('Diesel');
      setSelectedTr('');
    } else if (cat === 'EV_HYBRID') {
      setSelectedFuel('Electric');
      setSearchQuery('Electric Hybrid');
    } else if (cat === 'UNDER_10L') {
      setMinPrice('');
      setMaxPrice('1000000');
    }

    const inventoryEl = document.getElementById('inventory');
    if (inventoryEl) {
      inventoryEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered & Sorted Fleet
  const filteredCars = useMemo(() => {
    let list = [...cars];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) =>
        `${c.year} ${c.make} ${c.model} ${c.feat || ''} ${c.rto} ${c.fuel} ${c.tr}`.toLowerCase().includes(q)
      );
    }

    if (selectedFuel) {
      list = list.filter((c) => c.fuel.toLowerCase() === selectedFuel.toLowerCase());
    }

    if (selectedTr) {
      list = list.filter((c) => c.tr.toLowerCase() === selectedTr.toLowerCase());
    }

    if (minPrice && !isNaN(Number(minPrice))) {
      list = list.filter((c) => c.price >= Number(minPrice));
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      list = list.filter((c) => c.price <= Number(maxPrice));
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'km_asc') {
      list.sort((a, b) => a.km - b.km);
    } else {
      list.sort((a, b) => b.year - a.year || b.id - a.id);
    }

    return list;
  }, [cars, searchQuery, selectedFuel, selectedTr, minPrice, maxPrice, sortBy]);

  // Spotlight Car (Default to premier car like BMW 3 Series or Creta)
  const spotlightCar = cars.length > 0 ? cars[spotlightIndex % cars.length] : null;
  const spotlightPhotos = spotlightCar ? (spotlightCar.photos || '').split(',').map((p) => p.trim()).filter(Boolean) : [];
  const currentPhoto = (spotlightPhotos.length > spotlightPhotoIndex && spotlightPhotos[spotlightPhotoIndex])
    ? spotlightPhotos[spotlightPhotoIndex]
    : (spotlightPhotos[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80');
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;
  const calcEmi = (price: number) => Math.round((price * 0.85 * 0.0865 * Math.pow(1.0865, 5)) / (Math.pow(1.0865, 5) - 1) / 12);

  return (
    <div style={{ paddingBottom: '70px', background: 'var(--bg)' }}>
      {/* ============================================================
          1. HERO SECTION: Split Value Proposition & Spotlight Stage
          ============================================================ */}
      <section className="hero-section" style={{
        background: 'radial-gradient(100% 100% at 50% 0%, #FFFFFF 0%, #EEF4FF 45%, #DCE8FC 100%)',
        borderBottom: '1px solid var(--border)',
        padding: '52px 0 48px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.95fr)',
            gap: '40px',
            alignItems: 'center',
          }} className="hero-split-grid">
            {/* Left Column: Headline, Search, Metrics */}
            <div className="anim-fade-in-up">
              {/* Trust Tag */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <span className="pill pill-soft-blue" style={{ fontSize: '11px', padding: '5px 14px' }}>
                  <Sparkles size={12} color="var(--primary)" /> MH-31 REGISTERED CARS
                </span>
                <span className="pill pill-verified" style={{ fontSize: '10.5px', padding: '5px 12px' }}>
                  ✓ WARDHA ROAD SHOWROOM
                </span>
              </div>

              {/* Authentic Automotive Headline */}
              <h1 className="hero-heading" style={{
                fontSize: 'clamp(32px, 4.4vw, 50px)',
                fontWeight: '900',
                lineHeight: '1.14',
                marginBottom: '18px',
                letterSpacing: '-0.03em',
                color: 'var(--text-heading)',
              }}>
                Pre-Owned Cars in Nagpur, <span style={{ color: 'var(--primary)' }}>Inspected &amp; Verified</span>.
              </h1>

              {/* Subtitle */}
              <p className="hero-subtitle" style={{
                fontSize: 'clamp(15px, 1.6vw, 17px)',
                color: 'var(--text-body)',
                lineHeight: '1.65',
                marginBottom: '26px',
                maxWidth: '600px',
              }}>
                Every car is physically checked by our technicians before it reaches the showroom floor. Clear MH-31 paperwork, honest pricing, and test drives on Wardha Road.
              </p>

              {/* Hero Search Box */}
              <div className="hero-search-box" style={{
                background: '#FFFFFF',
                padding: '6px',
                borderRadius: '9999px',
                border: '1.5px solid var(--border)',
                boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                maxWidth: '560px',
                marginBottom: '26px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, paddingLeft: '14px', gap: '8px' }}>
                  <Search size={18} color="var(--primary)" />
                  <input
                    type="text"
                    placeholder="Search by model, brand, or fuel (e.g. Creta, BMW, Petrol)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '14px',
                      color: 'var(--text-heading)',
                      background: 'transparent',
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '10px 22px' }}
                >
                  Explore Fleet
                </button>
              </div>

              {/* Action Buttons: Direct invite to Scroll Mode */}
              <div className="hero-actions-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <a
                  href="/scroll"
                  className="btn btn-primary btn-lg"
                  style={{
                    background: 'var(--primary)',
                    boxShadow: '0 8px 24px -4px rgba(29, 92, 229, 0.45)',
                  }}
                >
                  <Film size={17} /> ⚡ Try Scroll Mode
                </a>

                <a
                  href={`https://wa.me/${settings?.whatsapp || '919823011223'}?text=${encodeURIComponent('Hi Rajat, I am exploring your verified Nagpur car inventory.')}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-wa btn-lg"
                >
                  <MessageSquare size={17} /> WhatsApp Rajat
                </a>
              </div>

              {/* 4 Clean Metric Counters */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                paddingTop: '20px',
                borderTop: '1px solid rgba(226, 232, 240, 0.8)',
              }} className="hero-metrics-strip">
                <div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-heading)' }}>
                    {cars.length}+
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>
                    Available Cars
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--success)' }}>
                    100%
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>
                    Clear Titles
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)' }}>
                    0%
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>
                    Broker Margin
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-heading)' }}>
                    48-Hr
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontWeight: '600' }}>
                    RC Transfer
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Spotlight Vehicle Stage Card (Minimalist Luxury Aesthetic) */}
            {spotlightCar && (
              <div
                className="spotlight-card-minimal hero-spotlight-card anim-fade-in-up"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 16px 40px -10px rgba(15, 23, 42, 0.08)',
                  overflow: 'hidden',
                }}
              >
                {/* Minimal Header Strip */}
                <div style={{
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #F1F5F9',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="spotlight-live-beacon" />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-heading)' }}>
                      Featured Car
                    </span>
                    <span style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: '600' }}>
                      • {((spotlightIndex % cars.length) + 1)} of {cars.length}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="btn btn-sm btn-secondary"
                      style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
                      title={isAutoPlaying ? 'Pause rotation' : 'Resume rotation'}
                    >
                      {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={handlePrevSpotlight}
                      className="btn btn-sm btn-secondary"
                      style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
                      title="Previous car"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextSpotlight}
                      className="btn btn-sm btn-secondary"
                      style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
                      title="Next car"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Subtle Auto-Rotation Progress Track */}
                <div style={{ height: '2px', background: '#F1F5F9', width: '100%', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: 'var(--primary)',
                      width: isAutoPlaying && !isHovered ? `${progress}%` : isHovered ? `${progress}%` : '0%',
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>

                {/* Vehicle Media Viewport */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 10.5', background: '#0F172A', overflow: 'hidden' }}>
                  <a href={`/cars/${spotlightCar.slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                    <img
                      key={`${spotlightCar.id}-${spotlightPhotoIndex}`}
                      src={currentPhoto}
                      alt={`${spotlightCar.year} ${spotlightCar.make} ${spotlightCar.model}`}
                      className="spotlight-image-fade"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </a>

                  {/* Minimal Status Badges */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    gap: '6px',
                  }}>
                    <span style={{
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                    }}>
                      {spotlightCar.rto}
                    </span>
                    <span style={{
                      background: 'rgba(15, 157, 88, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#FFFFFF',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                    }}>
                      Verified
                    </span>
                  </div>

                  {/* Multi-Photo Subtle Dots */}
                  {spotlightPhotos.length > 1 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '4px',
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(6px)',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                    }}>
                      {spotlightPhotos.map((_, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSpotlightPhotoIndex(pIdx);
                          }}
                          style={{
                            width: pIdx === spotlightPhotoIndex ? '14px' : '5px',
                            height: '5px',
                            borderRadius: '3px',
                            background: pIdx === spotlightPhotoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          title={`Photo ${pIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Minimal Card Body */}
                <div style={{ padding: '20px' }}>
                  {/* Model & Year */}
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '4px', lineHeight: '1.25' }}>
                    <a href={`/cars/${spotlightCar.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {spotlightCar.year} {spotlightCar.make} {spotlightCar.model}
                    </a>
                  </h3>

                  {/* Clean Single-line Specs */}
                  <div style={{
                    fontSize: '12.5px',
                    color: 'var(--text-body)',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    flexWrap: 'wrap',
                    fontWeight: '500',
                  }}>
                    <span>{spotlightCar.km.toLocaleString('en-IN')} km</span>
                    <span>•</span>
                    <span>{spotlightCar.fuel}</span>
                    <span>•</span>
                    <span>{spotlightCar.tr}</span>
                    <span>•</span>
                    <span>{spotlightCar.own === 1 ? '1st Owner' : `${spotlightCar.own}nd Owner`}</span>
                  </div>

                  {/* Clean Pricing */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '10px',
                    marginBottom: '18px',
                  }}>
                    <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--primary)' }}>
                      {lakh(unlockedPhone ? spotlightCar.direct : spotlightCar.price)}
                    </span>
                    {!unlockedPhone && (
                      <span style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'line-through' }}>
                        {lakh(spotlightCar.price)}
                      </span>
                    )}
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--success)',
                      fontWeight: '700',
                      background: 'var(--success-soft)',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                    }}>
                      Save {inr(spotlightCar.price - spotlightCar.direct)}
                    </span>
                  </div>

                  {/* Clean Action Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                    <a
                      href={`/cars/${spotlightCar.slug}`}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '10px 14px', fontSize: '13px', justifyContent: 'center' }}
                    >
                      View Details <ArrowRight size={13} />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenUnlock(spotlightCar.id, `${spotlightCar.year} ${spotlightCar.make} ${spotlightCar.model}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '10px 12px', fontSize: '12.5px', justifyContent: 'center' }}
                    >
                      🔒 {unlockedPhone ? 'Target Price' : 'Unlock Price'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          2. LIFESTYLE & POPULAR CATEGORY SELECTOR (Quick Nav Chips)
          ============================================================ */}
      <section className="category-section" style={{ marginTop: '-24px', position: 'relative', zIndex: 10, marginBottom: '36px' }}>
        <div className="container">
          <div className="category-scroll-bar" style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-soft)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '6px' }}>
              Quick Categories:
            </span>

            <button
              type="button"
              onClick={() => handleSelectCategory('ALL')}
              className={`btn btn-sm ${activeCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              🚗 All Showroom Fleet ({cars.length})
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('SUV')}
              className={`btn btn-sm ${activeCategory === 'SUV' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              🚙 Compact &amp; Mid SUVs
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('LUXURY')}
              className={`btn btn-sm ${activeCategory === 'LUXURY' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              🏎️ Luxury &amp; Executive (BMW / Benz)
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('AUTOMATIC')}
              className={`btn btn-sm ${activeCategory === 'AUTOMATIC' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              ⚡ Automatic Gearbox
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('DIESEL')}
              className={`btn btn-sm ${activeCategory === 'DIESEL' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              ⛽ Diesel Long-Range
            </button>

            <button
              type="button"
              onClick={() => handleSelectCategory('UNDER_10L')}
              className={`btn btn-sm ${activeCategory === 'UNDER_10L' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              💰 Under ₹10 Lakh
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          DYNAMIC SCROLL FEATURE INVITATION BANNER
          ============================================================ */}
      <section className="container anim-fade-in-up" style={{ marginBottom: '36px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          color: '#FFFFFF',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 0.6fr)',
          gap: '24px',
          alignItems: 'center',
          boxShadow: '0 16px 36px -10px rgba(15, 23, 42, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }} className="scroll-invite-grid">
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(29, 92, 229, 0.4)',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.04em',
              color: '#93C5FD',
              marginBottom: '12px'
            }}>
              <Film size={12} /> NEW WAY TO BROWSE • SCROLL MODE
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#FFFFFF', marginBottom: '8px', lineHeight: '1.25' }}>
              Discover Cars Faster on Scroll
            </h2>
            <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: '1.6', maxWidth: '620px', margin: 0 }}>
              Swipe through our showroom like Instagram Reels or TikTok. Swipe up for the next car, tap for photos, and swipe left for technical specs. Our taste tracker automatically recommends cars that match your style.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-start' }} className="scroll-invite-action">
            <a
              href="/scroll"
              className="btn btn-primary"
              style={{
                background: '#1D5CE5',
                color: '#FFFFFF',
                padding: '12px 24px',
                fontSize: '14.5px',
                fontWeight: '700',
                borderRadius: '9999px',
                boxShadow: '0 8px 24px rgba(29, 92, 229, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <span>⚡ Open Scroll Mode</span>
              <ArrowRight size={16} />
            </a>
            <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
              Optimized for mobile &amp; touch screens
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. FEATURED HORIZONTAL SPOTLIGHT CAROUSEL
          ============================================================ */}
      <div className="container">
        <HorizontalCarTrack
          cars={cars.slice(0, 8)}
          unlocked={Boolean(unlockedPhone)}
          onUnlockClick={handleOpenUnlock}
        />

        {/* ============================================================
            4. MAIN FLEET DISCOVERY & FILTER SYSTEM
            ============================================================ */}
        <div id="inventory">
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFuel={selectedFuel}
            setSelectedFuel={setSelectedFuel}
            selectedTr={selectedTr}
            setSelectedTr={setSelectedTr}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onReset={handleResetFilters}
            totalCount={filteredCars.length}
          />
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            Loading verified showroom fleet...
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>No matching vehicles found</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginBottom: '16px' }}>
              Try adjusting your price range or fuel/transmission filters.
            </p>
            <button type="button" onClick={handleResetFilters} className="btn btn-primary">
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="inventory-cars-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            marginBottom: '60px',
          }}>
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                unlocked={Boolean(unlockedPhone)}
                onUnlockClick={handleOpenUnlock}
              />
            ))}
          </div>
        )}

        {/* ============================================================
            5. 6-POINT PHYSICAL INSPECTION STANDARDS
            ============================================================ */}
        <section className="panel anim-fade-in-up" style={{ marginBottom: '48px', padding: '36px' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <span className="pill pill-soft-blue" style={{ marginBottom: '12px' }}>
              <ShieldCheck size={13} color="var(--primary)" /> 6-Point Inspection
            </span>
            <h2 className="section-heading-lg" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-heading)' }}>
              How We Inspect Each Car
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-body)', marginTop: '8px', lineHeight: '1.6' }}>
              Every vehicle on our floor is thoroughly evaluated by experienced mechanics before being listed for sale. No hidden surprises.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="icon-box" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Wrench size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>1. Engine &amp; Compression</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px', lineHeight: '1.5' }}>
                  Compression tested across all cylinders. Zero head gasket leaks, clean turbo spooling, and fresh oil diagnostics.
                </p>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="icon-box" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Cog size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>2. Gearbox &amp; Transmission</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px', lineHeight: '1.5' }}>
                  Fluid pressure tested. Smooth torque-converter, dual-clutch, and manual shifts with zero clutch plate slippage.
                </p>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="icon-box" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>3. Non-Accidental Frame</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px', lineHeight: '1.5' }}>
                  Chassis alignment and factory spot welds verified. 100% structural integrity with zero flood or rust history.
                </p>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="icon-box" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <CarIcon size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>4. Tyres &amp; Suspension</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px', lineHeight: '1.5' }}>
                  Minimum 70%+ tread depth guaranteed on all 4 road tyres. Struts, steering rack, and bushings checked.
                </p>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="icon-box" style={{ background: 'var(--primary-soft)', color: 'var(--primary)' }}>
                <Zap size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>5. Electronics &amp; AC Cooling</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px', lineHeight: '1.5' }}>
                  OBD scanner scan of all ECUs, sensors, and airbags. AC system chilled below 5.0°C with clean pollen filters.
                </p>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              display: 'flex',
              gap: '14px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div className="icon-box" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>
                <FileCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>6. RTO Title &amp; History</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-body)', marginTop: '4px', lineHeight: '1.5' }}>
                  Direct MH-31 / MH-40 smart card RC verified. Zero police disputes, no hypothecation issues, and full service stamps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            6. 4-STEP BUYING PROCESS
            ============================================================ */}
        <section style={{ marginBottom: '48px' }} className="anim-fade-in-up">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <span className="pill pill-soft-blue" style={{ marginBottom: '12px' }}>
              <Layers size={13} color="var(--primary)" /> Simple Process
            </span>
            <h2 className="section-heading-lg" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-heading)' }}>
              Buying a Car at Cars By Rajat
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-body)', marginTop: '8px', lineHeight: '1.6' }}>
              From test drive to RC transfer in 4 clear steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="panel" style={{ padding: '24px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '28px',
                fontWeight: '900',
                color: 'rgba(29, 92, 229, 0.12)',
              }}>
                01
              </div>
              <div className="icon-box" style={{ marginBottom: '16px' }}>
                <CarIcon size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>
                1. Browse &amp; Inspect
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                Explore exterior and interior photos, verified specifications, and mechanic inspection notes.
              </p>
            </div>

            <div className="panel" style={{ padding: '24px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '28px',
                fontWeight: '900',
                color: 'rgba(29, 92, 229, 0.12)',
              }}>
                02
              </div>
              <div className="icon-box" style={{ marginBottom: '16px' }}>
                <Handshake size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>
                2. Propose Target Price
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                Unlock direct dealer pricing or submit your target counteroffer. Track responses in your Buyer Hub.
              </p>
            </div>

            <div className="panel" style={{ padding: '24px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '28px',
                fontWeight: '900',
                color: 'rgba(29, 92, 229, 0.12)',
              }}>
                03
              </div>
              <div className="icon-box" style={{ marginBottom: '16px' }}>
                <Calendar size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>
                3. Wardha Road Test Drive
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                Schedule a test drive at our Wardha Road hub or request a trial at your doorstep in Nagpur.
              </p>
            </div>

            <div className="panel" style={{ padding: '24px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                fontSize: '28px',
                fontWeight: '900',
                color: 'rgba(29, 92, 229, 0.12)',
              }}>
                04
              </div>
              <div className="icon-box" style={{ background: 'var(--success-soft)', color: 'var(--success)', marginBottom: '16px' }}>
                <CheckCircle2 size={22} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>
                4. Fast RC Transfer
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6' }}>
                Clear paperwork and invoicing. Our dedicated desk handles the RTO ownership transfer for you.
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
            7. RECENT NAGPUR BUYERS (REVIEWS)
            ============================================================ */}
        <section className="panel anim-fade-in-up" style={{ marginBottom: '48px', padding: '36px' }}>
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 36px' }}>
            <span className="pill pill-soft-blue" style={{ marginBottom: '12px' }}>
              <Star size={13} color="var(--primary)" /> Customer Reviews
            </span>
            <h2 className="section-heading-lg" style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-heading)' }}>
              Recent Nagpur Buyers
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-body)', marginTop: '8px', lineHeight: '1.6' }}>
              Real feedback from customers across Ramdaspeth, Civil Lines, and Dharampeth.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: '3px', color: '#F59E0B', marginBottom: '12px' }}>
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
                "Bought a 2021 Hyundai Creta SX(O) Turbo. The inspection report matched the exact condition of the vehicle. Rajat personally assisted with the RTO transfer which was completed within 10 days."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-heading)' }}>Vikram Deshmukh</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Ramdaspeth, Nagpur</div>
                </div>
                <span className="pill pill-verified" style={{ fontSize: '10px' }}>✓ Verified Buyer</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: '3px', color: '#F59E0B', marginBottom: '12px' }}>
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
                "The price negotiation system on this website is outstanding. I submitted an offer for a BMW 3 Series, received a counteroffer within an hour, and finalized the deal without broker hassles."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-heading)' }}>Dr. Anjali Verma</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Civil Lines, Nagpur</div>
                </div>
                <span className="pill pill-verified" style={{ fontSize: '10px' }}>✓ Verified Buyer</span>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: '3px', color: '#F59E0B', marginBottom: '12px' }}>
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
                <Star size={16} fill="#F59E0B" />
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '16px' }}>
                "We were looking for a clean Innova Crysta for family trips. The car had full authorized Toyota service history stamps. Zero odometer tampering. Very trustworthy showroom."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-heading)' }}>Sanjay Patil</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Dharampeth, Nagpur</div>
                </div>
                <span className="pill pill-verified" style={{ fontSize: '10px' }}>✓ Verified Buyer</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            8. SHOWROOM HUB LOCATION & VISIT
            ============================================================ */}
        <section className="panel anim-fade-in-up" style={{
          background: 'radial-gradient(100% 100% at 50% 0%, #FFFFFF 0%, #EEF4FF 60%, #F7F9FC 100%)',
          border: '1.5px solid #D6E4FF',
          padding: '36px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
            gap: '32px',
            alignItems: 'center',
          }} className="hub-split-grid">
            <div>
              <span className="pill pill-soft-blue" style={{ marginBottom: '12px' }}>
                <MapPin size={12} color="var(--primary)" /> Wardha Road Showroom
              </span>
              <h2 className="section-heading-lg" style={{ fontSize: '26px', fontWeight: '900', color: 'var(--text-heading)', marginBottom: '10px' }}>
                Visit Our Wardha Road Showroom
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '20px' }}>
                Stop by for a test drive, paperwork verification, or an on-the-spot vehicle valuation.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MapPin size={16} color="var(--primary)" />
                  <span style={{ fontWeight: '600', color: 'var(--text-heading)' }}>{settings?.address || 'Plot 42, Central Avenue & Wardha Road Hub, Nagpur, MH 440015'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clock size={16} color="var(--primary)" />
                  <span style={{ color: 'var(--text-body)' }}>Open All 7 Days: 10:00 AM – 8:30 PM (Sundays Open)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Phone size={16} color="var(--primary)" />
                  <a href={`tel:${settings?.phone || '+91 98230 11223'}`} style={{ color: 'var(--primary)', fontWeight: '700' }}>
                    {settings?.phone || '+91 98230 11223'}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href={`https://wa.me/${settings?.whatsapp || '919823011223'}?text=${encodeURIComponent('Hi Rajat, I would like to schedule a showroom visit on Wardha Road.')}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-wa"
                >
                  <MessageSquare size={16} /> Book Showroom Visit
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(settings?.address || 'Plot 42, Wardha Road Hub, Nagpur')}`}
                  target="_blank"
                  rel="noopener"
                  className="btn btn-secondary"
                >
                  <MapPin size={16} color="var(--primary)" /> Get Google Maps Directions
                </a>
              </div>
            </div>

            {/* Hub Feature Box */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              padding: '24px',
              boxShadow: 'var(--shadow-soft)',
            }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-heading)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--success)" /> Showroom Consignment Facility
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: 'var(--text-body)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--success)', fontWeight: '800' }}>✓</span>
                  <span>Hydraulic ramps &amp; underbody inspection station on site</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--success)', fontWeight: '800' }}>✓</span>
                  <span>Direct computerized OBD diagnostic scanner tests</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--success)', fontWeight: '800' }}>✓</span>
                  <span>Instant digital loan approvals with HDFC &amp; ICICI Bank</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--success)', fontWeight: '800' }}>✓</span>
                  <span>Air-conditioned customer lounge with complimentary refreshments</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Unlock Direct Price Modal */}
      <UnlockModal
        isOpen={unlockModalOpen}
        onClose={() => setUnlockModalOpen(false)}
        carId={selectedCarForUnlock?.id}
        carTitle={selectedCarForUnlock?.title}
      />

      {/* Responsive adjustments */}
      <style>{`
        @media (max-width: 991px) {
          .hero-split-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .hub-split-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .scroll-invite-grid {
            grid-template-columns: 1fr !important;
            padding: 24px 20px !important;
          }
        }
        @media (max-width: 640px) {
          .hero-metrics-strip {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};
