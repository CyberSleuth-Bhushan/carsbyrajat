import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CarCard } from './CarCard';
import type { Car } from '../types';

interface HorizontalCarTrackProps {
  cars: Car[];
  unlocked: boolean;
  onUnlockClick: (carId: number, carTitle: string) => void;
  onEnquireClick?: (car: Car) => void;
}

export const HorizontalCarTrack: React.FC<HorizontalCarTrackProps> = ({
  cars,
  unlocked,
  onUnlockClick,
  onEnquireClick,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (trackRef.current) {
      const offset = direction === 'left' ? -350 : 350;
      trackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!cars || cars.length === 0) return null;

  return (
    <section style={{ marginBottom: '56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pill pill-soft-blue" style={{ fontSize: '11px' }}>
              <Sparkles size={12} color="var(--primary)" /> SPOTLIGHT FLEET
            </span>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: '500' }}>
              Swipe or drag horizontally to explore
            </span>
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: '900', marginTop: '6px', color: 'var(--text-heading)' }}>
            Featured Verified Showroom Fleet
          </h2>
        </div>

        {/* Scroll Controls: Secondary Circle Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => scroll('left')}
            className="btn btn-sm btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="btn btn-sm btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Swipeable Track */}
      <div
        id="horizontalCarTrack"
        ref={trackRef}
        style={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          paddingBottom: '20px',
          paddingTop: '4px',
          scrollbarWidth: 'thin',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {cars.map((car) => (
          <div
            key={car.id}
            style={{
              flex: '0 0 330px',
              scrollSnapAlign: 'start',
            }}
          >
            <CarCard
              car={car}
              unlocked={unlocked}
              onUnlockClick={onUnlockClick}
              onEnquireClick={onEnquireClick}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
