import React, { useState } from 'react';
import { format } from 'date-fns';
import { parseDate } from '../lib/dates.js';
import CategoryBadge from './CategoryBadge.jsx';

const CAT_COLORS = {
  threat:   'var(--cat-threat)',
  nato:     'var(--cat-nato)',
  promise:  'var(--cat-promise)',
  reversal: 'var(--cat-reversal)',
  economic: 'var(--cat-economic)',
  legal:    'var(--cat-legal)',
  victory:  'var(--cat-victory)',
};

// side: 'left' | 'right'
export default function TimelineCard({ event, side, onClick, isActive }) {
  const [hovered, setHovered] = useState(false);
  const accent = CAT_COLORS[event.category] || 'var(--neon-blue)';
  const lit = hovered || isActive;

  const totalReactions = (event.reactions || []).reduce((s, r) => s + (r.count || 0), 0);
  const hasContradiction = (event.contradictions || []).length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: side === 'left' ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 0,
        width: '100%',
      }}
    >
      {/* Card */}
      <div
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          background: lit ? 'var(--bg-card-hover)' : 'var(--bg-card)',
          border: '1px solid ' + (lit ? accent : 'var(--border)'),
          borderRadius: 8,
          padding: '0.9rem 1.1rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: lit
            ? '0 0 24px ' + accent + '25, 0 4px 16px rgba(0,0,0,0.4)'
            : '0 2px 8px rgba(0,0,0,0.25)',
          position: 'relative',
          overflow: 'hidden',
          // Active state: slightly brighter border
          ...(isActive && { borderColor: accent, borderWidth: 1 }),
        }}
      >
        {/* Top glow on hover */}
        {lit && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 80% 50% at 50% -10%, ' + accent + '12 0%, transparent 70%)',
          }} />
        )}

        {/* Category + contradiction badge */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.5rem', alignItems: 'center' }}>
          <CategoryBadge category={event.category} />
          {hasContradiction && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.58rem',
              padding: '0.18rem 0.45rem', borderRadius: 3,
              background: 'var(--neon-purple-dim)',
              border: '1px solid var(--neon-purple)',
              color: 'var(--neon-purple)',
              letterSpacing: '0.05em',
            }}>⚡ CONTRADICTS</span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: '1rem', lineHeight: 1.2, letterSpacing: '0.02em',
          color: lit ? 'var(--text-primary)' : 'var(--text-primary)',
          marginBottom: '0.35rem',
          transition: 'color 0.2s',
        }}>{event.title}</h3>

        {/* Summary — only show on hover/active */}
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.78rem',
          lineHeight: 1.4,
          maxHeight: lit ? '4rem' : '0',
          overflow: 'hidden',
          opacity: lit ? 1 : 0,
          marginBottom: lit ? '0.5rem' : 0,
          transition: 'max-height 0.25s ease, opacity 0.2s ease, margin 0.2s',
        }}>{event.summary}</p>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: '0.3rem',
        }}>
          {event.source_label && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'var(--text-dim)',
            }}>📎 {event.source_label}</span>
          )}
          {totalReactions > 0 && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'var(--text-dim)', marginLeft: 'auto',
            }}>
              {totalReactions} reactions
            </span>
          )}
        </div>
      </div>

      {/* Connector line from card to dot */}
      <div style={{
        width: 32,
        height: 2,
        background: lit
          ? 'linear-gradient(' + (side === 'left' ? '270deg' : '90deg') + ', ' + accent + ', ' + accent + '44)'
          : 'var(--border)',
        transition: 'background 0.2s',
        flexShrink: 0,
      }} />
    </div>
  );
}
