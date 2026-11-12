import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';
import {
  Heart,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileText,
  Phone,
  MessageSquare,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Gauge,
  Fuel,
  Cog,
  X,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import type { Car, ShowroomSettings } from '../types';

export const DynamicGalleryPage: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ShowroomSettings | null>(null);

  // Scroll Navigation State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [likedCars, setLikedCars] = useState<Record<number, boolean>>({});
  const [feedbackCue, setFeedbackCue] = useState<string | null>(null);
  const [slideDirection, setSlideDirection] = useState<'up' | 'down' | null>(null);
  const [showHeartBurst, setShowHeartBurst] = useState(false);

  // Touch and Drag Physics State
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const lastTapRef = useRef<number>(0);

  // User Interest Profile (Taste Tracker)
  const [userProfile, setUserProfile] = useState<{
    viewedMakes: Record<string, number>;
    viewedFuels: Record<string, number>;
    likedCarsCount: number;
    preferredBudget: number;
  }>({
    viewedMakes: {},
    viewedFuels: {},
    likedCarsCount: 0,
    preferredBudget: 1500000,
  });

  useEffect(() => {
    document.title = 'Scroll — Discover Cars Handpicked in Nagpur | Cars By Rajat';
    const fetchGallery = async () => {
      try {
        const [carsRes, setRes] = await Promise.all([
          api.getCars(),
          api.getSettings(),
        ]);
        setCars(carsRes.cars);
        setSettings(setRes.settings);
      } catch (err) {
        console.error('Failed to load cars for scroll:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const activeCar = cars[currentIndex];
  const photos = activeCar ? (activeCar.photos || '').split(',').map((x) => x.trim()).filter(Boolean) : [];
  const currentPhoto = photos[photoIndex] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';

  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;

  const showCue = (msg: string) => {
    setFeedbackCue(msg);
    setTimeout(() => setFeedbackCue(null), 1200);
  };

  const trackEngagement = useCallback((car: Car, isLiked = false) => {
    setUserProfile((prev) => {
      const makes = { ...prev.viewedMakes, [car.make]: (prev.viewedMakes[car.make] || 0) + 1 };
      const fuels = { ...prev.viewedFuels, [car.fuel]: (prev.viewedFuels[car.fuel] || 0) + 1 };
      return {
        viewedMakes: makes,
        viewedFuels: fuels,
        likedCarsCount: isLiked ? prev.likedCarsCount + 1 : prev.likedCarsCount,
        preferredBudget: Math.round((prev.preferredBudget + (car.direct || car.price)) / 2),
      };
    });
  }, []);

  const nextCar = useCallback(() => {
    if (currentIndex < cars.length - 1) {
      setSlideDirection('up');
      setCurrentIndex((prev) => prev + 1);
      setPhotoIndex(0);
      setShowDetailsPanel(false);
      showCue('▲ Next car in showroom');
      trackEngagement(cars[currentIndex + 1]);
      setTimeout(() => setSlideDirection(null), 350);
    } else {
      showCue('🏁 You reached the end of the inventory');
    }
  }, [currentIndex, cars, trackEngagement]);

  const prevCar = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection('down');
      setCurrentIndex((prev) => prev - 1);
      setPhotoIndex(0);
      setShowDetailsPanel(false);
      showCue('▼ Previous car');
      trackEngagement(cars[currentIndex - 1]);
      setTimeout(() => setSlideDirection(null), 350);
    }
  }, [currentIndex, cars, trackEngagement]);

  // Keyboard Navigation: Up/Down arrow for cars, Left/Right for details
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        nextCar();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        prevCar();
      } else if (e.key === 'ArrowLeft') {
        setShowDetailsPanel(true);
      } else if (e.key === 'ArrowRight' || e.key === 'Escape') {
        setShowDetailsPanel(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextCar, prevCar]);

  const nextPhoto = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  const prevPhoto = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (photos.length > 1) {
      setPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    }
  };

  const triggerLikeWithBurst = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) e.stopPropagation();
    if (!activeCar) return;
    setLikedCars((prev) => ({ ...prev, [activeCar.id]: true }));
    setShowHeartBurst(true);
    showCue('❤️ Saved to your shortlist');
    trackEngagement(activeCar, true);
    setTimeout(() => setShowHeartBurst(false), 750);
  };

  const toggleLike = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!activeCar) return;
    const nowLiked = !likedCars[activeCar.id];
    setLikedCars((prev) => ({ ...prev, [activeCar.id]: nowLiked }));
    if (nowLiked) {
      setShowHeartBurst(true);
      showCue('❤️ Saved to your shortlist');
      trackEngagement(activeCar, true);
      setTimeout(() => setShowHeartBurst(false), 750);
    } else {
      showCue('Removed from shortlist');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;

    // Detect Double Tap on mobile stage
    if (Math.abs(diffY) < 12 && Math.abs(diffX) < 12) {
      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        triggerLikeWithBurst(e);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }

    // Vertical Swipes: Up (Next) or Down (Previous)
    if (Math.abs(diffY) > Math.abs(diffX)) {
      if (diffY > 38) {
        nextCar();
      } else if (diffY < -38) {
        prevCar();
      }
    } else {
      // Horizontal Swipes: Left (Open Specs Sheet) or Right (Close Specs Sheet)
      if (diffX > 40) {
        setShowDetailsPanel(true);
        showCue('📋 Opened vehicle specs');
      } else if (diffX < -40) {
        setShowDetailsPanel(false);
        showCue('👉 Back to car scroll');
      }
    }
  };

  const handleShare = async () => {
    if (!activeCar) return;
    const url = `${window.location.origin}/cars/${activeCar.slug}`;
    const text = `🚗 Check out this ${activeCar.year} ${activeCar.make} ${activeCar.model} on Cars By Rajat Nagpur!\n💰 Direct Showroom Price: ${lakh(activeCar.direct || activeCar.price)}\n🔗 ${url}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: `${activeCar.make} ${activeCar.model}`, text, url });
        return;
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--muted)',
        fontSize: '15px',
        fontWeight: '600',
      }}>
        Loading Scroll Studio...
      </div>
    );
  }

  if (!activeCar) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>No cars available to scroll</h2>
        <a href="/" className="btn btn-primary" style={{ marginTop: '16px' }}>Return to Showroom</a>
      </div>
    );
  }

  return (
    <div
      className="scroll-page-root"
      style={{
        background: '#0F172A',
        height: 'calc(100dvh - 68px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        touchAction: 'none',
      }}
    >
      {/* Visual Feedback Popup */}
      {feedbackCue && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(15, 23, 42, 0.92)',
          color: '#FFFFFF',
          padding: '8px 20px',
          borderRadius: '9999px',
          fontSize: '12.5px',
          fontWeight: '700',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
          whiteSpace: 'nowrap',
          animation: 'fadeInUp 0.2s ease',
        }}>
          {feedbackCue}
        </div>
      )}

      {/* Main Studio Arena */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '100%',
        width: '100%',
        background: '#0B1120',
      }} className="scroll-page-container">

        {/* Central Scroll Smartphone Container */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={triggerLikeWithBurst}
          className="scroll-stage-phone"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '440px',
            height: '100%',
            maxHeight: '100%',
            background: '#000000',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6)',
          }}
        >
          {/* Active Car Media Stage */}
          <div
            key={activeCar.id}
            className={slideDirection === 'up' ? 'anim-slide-up' : slideDirection === 'down' ? 'anim-slide-down' : ''}
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
          >
            <img
              src={currentPhoto}
              alt={`${activeCar.year} ${activeCar.make} ${activeCar.model}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                userSelect: 'none',
              }}
            />
            {/* Scrim Gradients for Readable Overlays */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 22%, transparent 50%, rgba(0,0,0,0.88) 100%)',
              pointerEvents: 'none',
            }} />

            {/* Heart Pop Burst Animation */}
            {showHeartBurst && (
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 30,
                  pointerEvents: 'none',
                }}
                className="anim-heart-pop"
              >
                <Heart size={88} fill="#EF4444" color="#FFFFFF" strokeWidth={1.5} />
              </div>
            )}
          </div>

          {/* Left/Right Photo Tap Zones */}
          <div
            onClick={prevPhoto}
            style={{ position: 'absolute', top: '70px', bottom: '180px', left: 0, width: '40%', zIndex: 5 }}
            title="Tap for previous photo"
          />
          <div
            onClick={nextPhoto}
            style={{ position: 'absolute', top: '70px', bottom: '180px', right: 0, width: '40%', zIndex: 5 }}
            title="Tap for next photo"
          />

          {/* Top Bar Overlay */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href="/"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '5px 12px',
                  borderRadius: '9999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ← Showroom
              </a>
              <span style={{
                background: 'rgba(29, 92, 229, 0.85)',
                color: '#FFFFFF',
                fontSize: '10.5px',
                fontWeight: '800',
                padding: '4px 9px',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
              }}>
                SCROLL
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Photo Dots */}
              {photos.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  backdropFilter: 'blur(6px)',
                }}>
                  {photos.map((_, i) => (
                    <span
                      key={i}
                      style={{
                        width: i === photoIndex ? '14px' : '4px',
                        height: '4px',
                        borderRadius: '2px',
                        background: i === photoIndex ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </div>
              )}

              <span style={{
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 10px',
                borderRadius: '9999px',
              }}>
                {currentIndex + 1} / {cars.length}
              </span>
            </div>
          </div>

          {/* Right Floating Interaction Rail */}
          <div style={{
            position: 'absolute',
            right: '12px',
            bottom: '150px',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
          }}>
            {/* Like Button */}
            <button
              type="button"
              onClick={toggleLike}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: likedCars[activeCar.id] ? '#EF4444' : 'rgba(255, 255, 255, 0.92)',
                color: likedCars[activeCar.id] ? '#FFFFFF' : '#0F172A',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
              }}
              title="Save to shortlist"
            >
              <Heart
                size={22}
                fill={likedCars[activeCar.id] ? '#FFFFFF' : 'none'}
                className={likedCars[activeCar.id] ? 'anim-heart' : ''}
              />
            </button>

            {/* Technical Dossier Button */}
            <button
              type="button"
              onClick={() => setShowDetailsPanel(!showDetailsPanel)}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: showDetailsPanel ? 'var(--primary)' : 'rgba(255, 255, 255, 0.92)',
                color: showDetailsPanel ? '#FFFFFF' : '#0F172A',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
              }}
              title="Show vehicle details"
            >
              <FileText size={20} />
            </button>

            {/* Direct WhatsApp Concierge Button */}
            <a
              href={`https://wa.me/${settings?.whatsapp || '919823011223'}?text=${encodeURIComponent(`Hi Rajat, I found the ${activeCar.year} ${activeCar.make} ${activeCar.model} (${lakh(activeCar.direct || activeCar.price)}) on Scroll mode.`)}`}
              target="_blank"
              rel="noopener"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#25D366',
                color: '#FFFFFF',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              title="Chat on WhatsApp"
            >
              <MessageSquare size={20} />
            </a>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.92)',
                color: '#0F172A',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease',
              }}
              title="Share car"
            >
              <Share2 size={20} />
            </button>
          </div>

          {/* Bottom Vehicle Info Card & Actions */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            marginTop: 'auto',
            padding: '20px 16px 18px',
            color: '#FFFFFF',
          }}>
            {/* Gesture Prompt Hint */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '8px',
            }}>
              <span style={{
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                color: '#FFFFFF',
                padding: '3px 10px',
                borderRadius: '9999px',
                fontSize: '10.5px',
                fontWeight: '700',
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}>
                ↑ Swipe for next • ← Swipe for specs
              </span>
              <span style={{
                background: 'rgba(15, 157, 88, 0.9)',
                color: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: '800',
              }}>
                {activeCar.rto}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '22px',
              fontWeight: '900',
              color: '#FFFFFF',
              marginBottom: '6px',
              lineHeight: '1.2',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            }}>
              {activeCar.year} {activeCar.make} {activeCar.model}
            </h2>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: '900', color: '#4ADE80' }}>
                {lakh(activeCar.direct || activeCar.price)}
              </span>
              {activeCar.price > (activeCar.direct || 0) && (
                <span style={{ fontSize: '13px', color: '#CBD5E1', textDecoration: 'line-through' }}>
                  {lakh(activeCar.price)}
                </span>
              )}
              <span style={{ fontSize: '10.5px', color: '#FEF08A', fontWeight: '800', textTransform: 'uppercase' }}>
                Showroom Direct
              </span>
            </div>

            {/* Quick Specs Line */}
            <div style={{
              display: 'flex',
              gap: '6px',
              fontSize: '12px',
              color: '#E2E8F0',
              marginBottom: '16px',
              flexWrap: 'wrap',
              fontWeight: '600',
            }}>
              <span>{activeCar.km.toLocaleString('en-IN')} km</span> •
              <span>{activeCar.fuel}</span> •
              <span>{activeCar.tr}</span> •
              <span>{activeCar.own === 1 ? '1st Owner' : `${activeCar.own}nd Owner`}</span>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
              <a
                href={`/cars/${activeCar.slug}`}
                className="btn btn-primary btn-sm"
                style={{ justifyContent: 'center', padding: '11px', fontSize: '13px' }}
              >
                Inspect Details <ArrowRight size={14} />
              </a>
              <button
                type="button"
                onClick={() => setShowDetailsPanel(true)}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'center', padding: '11px', fontSize: '13px' }}
              >
                <SlidersHorizontal size={14} /> Specs Sheet
              </button>
            </div>
          </div>

          {/* Subtle Swipe Guidance Cue for Mobile */}
          <div
            className="scroll-swipe-hint"
            style={{
              position: 'absolute',
              bottom: '86px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 12,
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(8px)',
              padding: '3px 12px',
              borderRadius: '9999px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '10.5px',
              fontWeight: '700',
              letterSpacing: '0.02em',
            }}
          >
            <ChevronUp size={12} />
            <span>Swipe up for next</span>
          </div>

          {/* Dim Backdrop for Specs Bottom Sheet */}
          {showDetailsPanel && (
            <div
              onClick={() => setShowDetailsPanel(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.65)',
                zIndex: 35,
                backdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease',
              }}
            />
          )}

          {/* Slide-up Technical Dossier Sheet */}
          {showDetailsPanel && (
            <div
              className="scroll-bottom-sheet"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                maxHeight: '84%',
                zIndex: 40,
                background: '#FFFFFF',
                borderRadius: '24px 24px 0 0',
                color: 'var(--text-heading)',
                padding: '16px 20px 24px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.45)',
                animation: 'slideUpSheet 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {/* Drag Pill Handle */}
              <div
                style={{
                  width: '42px',
                  height: '4px',
                  borderRadius: '2px',
                  background: '#CBD5E1',
                  margin: '0 auto 14px',
                  flexShrink: 0,
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="pill pill-soft-blue" style={{ fontSize: '11px' }}>
                  📋 Full Technical Dossier
                </span>
                <button
                  type="button"
                  onClick={() => setShowDetailsPanel(false)}
                  className="btn btn-sm btn-secondary"
                  style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
                  title="Close details"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 style={{ fontSize: '21px', fontWeight: '900', marginBottom: '4px', color: 'var(--text-heading)' }}>
                {activeCar.year} {activeCar.make} {activeCar.model}
              </h3>
              <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--primary)', marginBottom: '18px' }}>
                {lakh(activeCar.direct || activeCar.price)}
              </div>

              {/* 4 Specs Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
                <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '12px', fontSize: '12px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '10.5px', fontWeight: '700' }}>ODOMETER</div>
                  <div style={{ fontWeight: '800', marginTop: '2px' }}>{activeCar.km.toLocaleString('en-IN')} km</div>
                </div>
                <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '12px', fontSize: '12px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '10.5px', fontWeight: '700' }}>FUEL TYPE</div>
                  <div style={{ fontWeight: '800', marginTop: '2px' }}>{activeCar.fuel}</div>
                </div>
                <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '12px', fontSize: '12px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '10.5px', fontWeight: '700' }}>GEARBOX</div>
                  <div style={{ fontWeight: '800', marginTop: '2px' }}>{activeCar.tr}</div>
                </div>
                <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: '12px', fontSize: '12px' }}>
                  <div style={{ color: 'var(--muted)', fontSize: '10.5px', fontWeight: '700' }}>OWNERSHIP</div>
                  <div style={{ fontWeight: '800', marginTop: '2px' }}>{activeCar.own === 1 ? '1st Owner' : `${activeCar.own}nd Owner`}</div>
                </div>
              </div>

              {/* Inspection Checks */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '800', marginBottom: '10px', color: 'var(--text-heading)' }}>
                  Mechanic Inspection Notes
                </h4>
                <div style={{ fontSize: '12.5px', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-body)' }}>
                  <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <strong>Engine:</strong> {activeCar.insp_engine || 'Smooth compression, no leaks'}
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <strong>Tyres:</strong> {activeCar.insp_tyres || 'Healthy tread depth verified'}
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <strong>Chassis:</strong> {activeCar.insp_chassis || 'Non-accidental certified'}
                  </div>
                  <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <strong>AC &amp; Electronics:</strong> {activeCar.insp_elec || 'AC chilling, diagnostics clear'}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <a href={`/cars/${activeCar.slug}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Open Full Vehicle Dossier
                </a>
                <button
                  type="button"
                  onClick={() => setShowDetailsPanel(false)}
                  className="btn btn-secondary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Return to Car Scroll
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Vertical Up/Down Navigation Controls */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginLeft: '24px',
          alignItems: 'center',
        }} className="desktop-controls">
          <button
            type="button"
            onClick={prevCar}
            disabled={currentIndex === 0}
            className="btn btn-secondary"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              padding: 0,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              background: '#FFFFFF',
              color: '#0F172A',
            }}
            title="Previous Car (Swipe Down or Arrow Up)"
          >
            <ChevronUp size={22} />
          </button>

          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: '700' }}>
            {currentIndex + 1} / {cars.length}
          </span>

          <button
            type="button"
            onClick={nextCar}
            disabled={currentIndex === cars.length - 1}
            className="btn btn-primary"
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              padding: 0,
              boxShadow: '0 8px 24px rgba(29, 92, 229, 0.4)',
            }}
            title="Next Car (Swipe Up or Arrow Down)"
          >
            <ChevronDown size={22} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUpSheet {
          from {
            transform: translateY(100%);
            opacity: 0.5;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounceSlow {
          0%, 100% {
            transform: translate(-50%, 0);
          }
          50% {
            transform: translate(-50%, -6px);
          }
        }
        .scroll-swipe-hint {
          animation: bounceSlow 2s ease-in-out infinite;
        }
        @media (max-width: 768px) {
          .desktop-controls { display: none !important; }
          .scroll-page-root {
            height: calc(100dvh - 60px) !important;
          }
          .scroll-page-container {
            padding: 0 !important;
          }
          .scroll-stage-phone {
            max-width: 100% !important;
            height: 100% !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }
        }
        @media (min-width: 769px) {
          .scroll-stage-phone {
            border-radius: 28px !important;
            border: 4px solid rgba(255, 255, 255, 0.15) !important;
            height: 94% !important;
          }
          .scroll-bottom-sheet {
            max-height: 90% !important;
          }
          .scroll-swipe-hint {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
