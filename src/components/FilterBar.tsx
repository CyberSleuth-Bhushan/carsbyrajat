import React from 'react';
import { Search, RotateCcw, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFuel: string;
  setSelectedFuel: (val: string) => void;
  selectedTr: string;
  setSelectedTr: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onReset: () => void;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  selectedFuel,
  setSelectedFuel,
  selectedTr,
  setSelectedTr,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onReset,
  totalCount,
}) => {
  const fuels = ['All', 'Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'];
  const transmissions = ['All', 'Automatic', 'Manual'];

  return (
    <div className="panel" style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="icon-box-sm">
            <SlidersHorizontal size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-heading)' }}>Filter Showroom Fleet</h3>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: '500' }}>
              Showing {totalCount} verified vehicles
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="btn btn-sm btn-secondary"
          style={{ fontSize: '12.5px' }}
        >
          <RotateCcw size={13} /> Reset Filters
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '18px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            className="inp"
            placeholder="Search make, model, variant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '12px' }}
          />
          <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)' }} />
        </div>

        {/* Min Price */}
        <div>
          <input
            type="number"
            className="inp"
            placeholder="Min Price (e.g. 500000)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            style={{ borderRadius: '12px' }}
          />
        </div>

        {/* Max Price */}
        <div>
          <input
            type="number"
            className="inp"
            placeholder="Max Price (e.g. 2000000)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            style={{ borderRadius: '12px' }}
          />
        </div>

        {/* Sort Select */}
        <div>
          <select className="inp" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ borderRadius: '12px' }}>
            <option value="latest">Latest Showroom Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="km_asc">Odometer: Lowest Kilometers</option>
          </select>
        </div>
      </div>

      {/* Fuel and Transmission Filter Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
        {/* Fuel Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', minWidth: '70px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Fuel Type:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {fuels.map((f) => {
              const active = (f === 'All' && !selectedFuel) || selectedFuel.toLowerCase() === f.toLowerCase();
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSelectedFuel(f === 'All' ? '' : f)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: active ? '700' : '600',
                    border: active ? '1px solid #D6E4FF' : '1px solid var(--border)',
                    background: active ? 'var(--primary-soft)' : '#FFFFFF',
                    color: active ? 'var(--primary)' : 'var(--text-body)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Transmission Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', minWidth: '70px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Gearbox:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {transmissions.map((t) => {
              const active = (t === 'All' && !selectedTr) || selectedTr.toLowerCase() === t.toLowerCase();
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTr(t === 'All' ? '' : t)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '9999px',
                    fontSize: '12.5px',
                    fontWeight: active ? '700' : '600',
                    border: active ? '1px solid #D6E4FF' : '1px solid var(--border)',
                    background: active ? 'var(--primary-soft)' : '#FFFFFF',
                    color: active ? 'var(--primary)' : 'var(--text-body)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
