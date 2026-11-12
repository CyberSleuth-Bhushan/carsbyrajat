import React, { useState } from 'react';
import { useCompare } from '../context/CompareContext';
import { Heart, ChevronLeft, ChevronRight, Share2, Mail, FileText, CheckCircle2 } from 'lucide-react';
import type { Car } from '../types';

interface CarCardProps {
  car: Car;
  unlocked: boolean;
  onUnlockClick: (carId: number, carTitle: string) => void;
  onEnquireClick?: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, unlocked, onUnlockClick, onEnquireClick }) => {
  const { isShortlisted, toggleShortlist } = useCompare();
  const photos = (car.photos || '').split(',').map((x) => x.trim()).filter(Boolean);
  const [photoIndex, setPhotoIndex] = useState(0);

  const title = `${car.year} ${car.make} ${car.model}`;
  const imgUrl = photos[photoIndex] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80';
  const savings = car.price - car.direct;
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;
  const calcEmi = (price: number) => Math.round((price * 0.85 * 0.0865 * Math.pow(1.0865, 5)) / (Math.pow(1.0865, 5) - 1) / 12);

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    const shareUrl = `${window.location.origin}/cars/${car.slug}`;
    const shareText = `🚗 Check out this verified ${title} on Cars By Rajat Nagpur!\n💰 Price: ${inr(unlocked ? car.direct : car.price)}\n📍 Nagpur Hub (MH-31)\n✨ Specs: ${car.km.toLocaleString('en-IN')} km, ${car.fuel}, ${car.tr}\n🔗 Dossier: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
        return;
      } catch {}
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <article className="card" style={{ height: '100%' }}>
      {/* Media Box */}
      <div className="card-media">
        <a href={`/cars/${car.slug}`}>
          <img src={imgUrl} alt={title} loading="lazy" />
        </a>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.65)',
                color: '#FFFFFF',
                border: 'none',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                transition: 'background 0.15s ease'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(15, 23, 42, 0.65)',
                color: '#FFFFFF',
                border: 'none',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
                transition: 'background 0.15s ease'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Top Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span className={`status-pill st-${car.status}`}>{car.status}</span>
          <span style={{ background: '#0F172A', color: '#FFFFFF', fontSize: '10.5px', fontWeight: '800', padding: '3px 8px', borderRadius: '9999px' }}>
            {car.rto}
          </span>
          <span className="pill pill-verified" style={{ fontSize: '10px', padding: '3px 8px' }}>
            ✓ Verified
          </span>
        </div>

        {/* Heart / Shortlist */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggleShortlist(car.id);
          }}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: isShortlisted(car.id) ? '#EF4444' : 'rgba(255, 255, 255, 0.9)',
            color: isShortlisted(car.id) ? '#FFFFFF' : '#475569',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease',
          }}
          title={isShortlisted(car.id) ? 'Remove from Comparison' : 'Shortlist to Compare'}
        >
          <Heart size={16} fill={isShortlisted(car.id) ? '#FFFFFF' : 'none'} />
        </button>

        {/* Dots */}
        {photos.length > 1 && (
          <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '5px' }}>
            {photos.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: idx === photoIndex ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: idx === photoIndex ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px' }}>
          <a href={`/cars/${car.slug}`} style={{ color: 'var(--text-heading)' }}>
            {title}
          </a>
        </h3>

        {/* Spec Chips: Soft Sky / Slate */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
          <span style={{ background: 'var(--surface-alt)', padding: '4px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-body)' }}>
            {car.km.toLocaleString('en-IN')} km
          </span>
          <span style={{ background: 'var(--surface-alt)', padding: '4px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-body)' }}>
            {car.fuel}
          </span>
          <span style={{ background: 'var(--surface-alt)', padding: '4px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-body)' }}>
            {car.tr}
          </span>
          <span style={{ background: 'var(--surface-alt)', padding: '4px 9px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--text-body)' }}>
            {car.own === 1 ? '1st Owner' : `${car.own}nd Owner`}
          </span>
        </div>

        {car.feat && (
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            ✨ {car.feat}
          </div>
        )}

        {/* Price Box */}
        <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid var(--border)', marginBottom: '14px' }}>
          {unlocked ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600' }}>
                    Showroom Direct Price <span style={{ textDecoration: 'line-through', color: '#94A3B8' }}>{lakh(car.price)}</span>
                  </div>
                  <div style={{ fontSize: '21px', fontWeight: '900', color: 'var(--primary)' }}>
                    {lakh(car.direct)}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-heading)', fontWeight: '700' }}>
                    EMI ~{inr(calcEmi(car.direct))}/mo
                  </div>
                  <span style={{ background: 'var(--success-soft)', color: 'var(--success)', fontSize: '10.5px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' }}>
                    ✓ Save {inr(savings)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600' }}>
                  Nagpur Market Est.
                </div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-heading)' }}>
                  {lakh(car.price)}
                </div>
              </div>
              {/* Primary CTA: Pill-shaped, #1D5CE5 fill, #FFFFFF text, soft blue glow */}
              <button
                type="button"
                onClick={() => onUnlockClick(car.id, title)}
                className="btn btn-primary btn-sm"
              >
                🔒 Unlock Direct Price
              </button>
            </div>
          )}
        </div>

        {/* Action Row: Pill-shaped secondary buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '8px' }}>
          <a href={`/cars/${car.slug}`} className="btn btn-sm btn-secondary" style={{ fontSize: '12px' }}>
            <FileText size={13} color="var(--primary)" /> Dossier
          </a>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '12px' }}
            onClick={() => {
              if (onEnquireClick) onEnquireClick(car);
              else window.location.href = `/cars/${car.slug}#enquiry`;
            }}
          >
            <Mail size={13} color="var(--primary)" /> Enquire
          </button>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            style={{ fontSize: '12px' }}
            onClick={handleShare}
            title="Share vehicle on WhatsApp"
          >
            <Share2 size={13} color="var(--primary)" /> Share
          </button>
        </div>
      </div>
    </article>
  );
};
