import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';

export default function HeroTicker() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getPromiseStats().then(setStats).catch(() => {});
  }, []);

  const items = stats ? [
    { label: 'PROMISES MADE', value: stats.total, color: 'var(--text-primary)' },
    { label: 'KEPT', value: stats.kept, color: 'var(--status-kept)' },
    { label: 'BROKEN', value: stats.broken, color: 'var(--status-broken)' },
    { label: 'REVERSED', value: stats.reversed, color: 'var(--status-reversed)' },
    { label: 'PENDING', value: stats.pending, color: 'var(--status-pending)' },
  ] : [];

  return (
    <div style={{
      padding: '5rem 2rem 3rem',
      maxWidth: 1200, margin: '0 auto',
      textAlign: 'center',
    }}>
      {/* Main title */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        letterSpacing: '0.3em', color: 'var(--neon-blue)',
        marginBottom: '1rem', opacity: 0.8,
      }}>
        ◈ CLASSIFIED — PRESIDENTIAL ACCOUNTABILITY ARCHIVE ◈
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)', fontWeight: 900,
        fontSize: 'clamp(2.5rem, 6vw, 5rem)',
        letterSpacing: '0.04em', lineHeight: 0.95,
        marginBottom: '1.5rem',
      }}>
        <span style={{
          background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 50%, var(--neon-red) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>POTUS PARADOX</span>
      </h1>

      <p style={{
        color: 'var(--text-secondary)', fontSize: '1rem',
        maxWidth: 500, margin: '0 auto 2.5rem',
        fontStyle: 'italic',
      }}>
        Every promise. Every threat. Every contradiction. On the record.
      </p>

      {/* Stats bar */}
      {stats && (
        <div style={{
          display: 'inline-flex', gap: 0,
          border: '1px solid var(--border)',
          borderRadius: 8, overflow: 'hidden',
          background: 'var(--bg-card)',
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              padding: '1rem 1.5rem',
              borderRight: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              textAlign: 'center', minWidth: 100,
            }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: '2rem', lineHeight: 1,
                color: item.color,
                textShadow: '0 0 20px ' + item.color + '55',
              }}>{item.value}</div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
                letterSpacing: '0.1em', color: 'var(--text-dim)',
                marginTop: '0.25rem',
              }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
