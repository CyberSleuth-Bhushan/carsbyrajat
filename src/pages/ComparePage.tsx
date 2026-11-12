import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { Scale, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import type { Car } from '../types';

export const ComparePage: React.FC = () => {
  const { shortlist, toggleShortlist, clearShortlist } = useCompare();
  const { unlockedPhone } = useAuth();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCars()
      .then((res) => setAllCars(res.cars))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const comparedCars = allCars.filter((c) => shortlist.includes(c.id));
  const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const lakh = (n: number) => `₹${(n / 100000).toFixed(2)} Lakh`;
  const unlocked = Boolean(unlockedPhone);

  if (loading) {
    return <div className="container" style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--muted)' }}>Loading comparison matrix...</div>;
  }

  return (
    <div style={{ padding: '40px 0 70px', background: 'var(--bg)', minHeight: 'calc(100vh - 74px)' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pill pill-soft-blue" style={{ fontSize: '11px' }}>
                <Sparkles size={12} color="var(--primary)" /> SIDE-BY-SIDE EVALUATION
              </span>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: '900', marginTop: '6px', color: 'var(--text-heading)', letterSpacing: '-0.025em' }}>
              Vehicle Comparison Matrix
            </h1>
          </div>

          {comparedCars.length > 0 && (
            <button type="button" onClick={clearShortlist} className="btn btn-sm btn-secondary">
              <Trash2 size={13} /> Clear Comparison
            </button>
          )}
        </div>

        {comparedCars.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="icon-box" style={{ margin: '0 auto 16px', width: '56px', height: '56px' }}>
              <Scale size={32} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-heading)' }}>
              No Vehicles Shortlisted for Comparison
            </h3>
            <p style={{ color: 'var(--text-body)', fontSize: '14px', marginBottom: '22px', maxWidth: '460px', margin: '0 auto 22px', lineHeight: '1.6' }}>
              Click the ❤️ heart icon on any vehicle card in our showroom to add it to this side-by-side comparison matrix.
            </p>
            <a href="/" className="btn btn-primary">Browse Showroom Fleet</a>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '180px' }}>Feature / Spec</th>
                  {comparedCars.map((car) => {
                    const photos = (car.photos || '').split(',').map((p) => p.trim()).filter(Boolean);
                    return (
                      <th key={car.id} style={{ minWidth: '220px', textAlign: 'center' }}>
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                          <img
                            src={photos[0] || '/cbr-client-logo.jpg'}
                            alt={car.model}
                            style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px' }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleShortlist(car.id)}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: 'rgba(15, 23, 42, 0.7)',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '50%',
                              width: '26px',
                              height: '26px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backdropFilter: 'blur(4px)',
                              fontSize: '14px'
                            }}
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-heading)' }}>{car.year} {car.make} {car.model}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{car.rto} Nagpur</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Showroom Price</strong></td>
                  {comparedCars.map((c) => (
                    <td key={c.id} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: unlocked ? 'var(--primary)' : 'var(--text-heading)' }}>
                        {lakh(unlocked ? c.direct : c.price)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {unlocked ? 'Direct Showroom Rate' : 'Market Estimate'}
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td><strong>Kilometres Driven</strong></td>
                  {comparedCars.map((c) => (
                    <td key={c.id} style={{ textAlign: 'center', fontWeight: '700', color: 'var(--text-heading)' }}>
                      {c.km.toLocaleString('en-IN')} km
                    </td>
                  ))}
                </tr>

                <tr>
                  <td><strong>Fuel &amp; Transmission</strong></td>
                  {comparedCars.map((c) => (
                    <td key={c.id} style={{ textAlign: 'center', color: 'var(--text-body)' }}>
                      {c.fuel} • {c.tr}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td><strong>Ownership &amp; RTO</strong></td>
                  {comparedCars.map((c) => (
                    <td key={c.id} style={{ textAlign: 'center', color: 'var(--text-body)' }}>
                      {c.own === 1 ? '1st Owner' : `${c.own}nd Owner`} ({c.rto})
                    </td>
                  ))}
                </tr>

                <tr>
                  <td><strong>Showroom Inspection</strong></td>
                  {comparedCars.map((c) => (
                    <td key={c.id} style={{ textAlign: 'center' }}>
                      <span className="pill pill-verified" style={{ fontSize: '10px' }}>
                        ✓ Passed &amp; Verified
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td><strong>Key Equipment</strong></td>
                  {comparedCars.map((c) => (
                    <td key={c.id} style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--muted)' }}>
                      {c.feat || 'Full factory equipment verified'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td><strong>Action</strong></td>
                  {comparedCars.map((c) => (
                    <td key={c.id} style={{ textAlign: 'center' }}>
                      <a href={`/cars/${c.slug}`} className="btn btn-sm btn-primary" style={{ width: '100%' }}>
                        View Dossier
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
