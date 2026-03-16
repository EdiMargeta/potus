import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryBadge from './CategoryBadge.jsx';
import SeverityDot from './SeverityDot.jsx';
import { format } from 'date-fns';
import { parseDate } from '../lib/dates.js';

const REACTIONS = [
  { type: 'absurd',       emoji: '😂', label: 'Absurd' },
  { type: 'outrageous',   emoji: '😤', label: 'Outrageous' },
  { type: 'unbelievable', emoji: '🤯', label: 'Unbelievable' },
  { type: 'classic',      emoji: '🤷', label: 'Classic' },
];

export default function EventCard({ event, style = {} }) {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const totalReactions = (event.reactions || []).reduce((s, r) => s + (r.count || 0), 0);
  const hasContradiction = event.contradictions && event.contradictions.length > 0;

  const catColors = {
    threat: 'var(--cat-threat)', nato: 'var(--cat-nato)',
    promise: 'var(--cat-promise)', reversal: 'var(--cat-reversal)',
    economic: 'var(--cat-economic)', legal: 'var(--cat-legal)',
    victory: 'var(--cat-victory)',
  };
  const accentColor = catColors[event.category] || 'var(--neon-blue)';

  return (
    <div
      onClick={() => navigate('/event/' + event.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: '1px solid ' + (hovered ? accentColor + '55' : 'var(--border)'),
        borderLeft: '3px solid ' + accentColor,
        borderRadius: 8,
        padding: '1.25rem 1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 4px 24px ' + accentColor + '15' : '0 2px 8px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Subtle glow on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, ' + accentColor + '08 0%, transparent 70%)',
        }} />
      )}

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <CategoryBadge category={event.category} />
          {hasContradiction && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              padding: '0.2rem 0.5rem', borderRadius: 3,
              background: 'var(--neon-purple-dim)',
              border: '1px solid var(--neon-purple)',
              color: 'var(--neon-purple)',
              letterSpacing: '0.05em',
            }}>⚡ CONTRADICTS</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <SeverityDot severity={event.severity} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--text-dim)',
          }}>
            {event.date ? format(parseDate(event.date), 'MMM d, yyyy') : ''}
          </span>
        </div>
      </div>

      {/* Title */}
      <h2 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: '1.3rem', lineHeight: 1.2, letterSpacing: '0.02em',
        color: 'var(--text-primary)', marginBottom: '0.5rem',
      }}>
        {event.title}
      </h2>

      {/* Summary */}
      <p style={{
        color: 'var(--text-secondary)', fontSize: '0.9rem',
        lineHeight: 1.5, marginBottom: '1rem',
      }}>
        {event.summary}
      </p>

      {/* Footer row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Source */}
        {event.source_label && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--text-dim)', letterSpacing: '0.05em',
          }}>📎 {event.source_label}</span>
        )}

        {/* Reactions preview */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginLeft: 'auto' }}>
          {REACTIONS.map(r => {
            const reaction = (event.reactions || []).find(rx => rx.type === r.type);
            const count = reaction?.count || 0;
            if (!count) return null;
            return (
              <span key={r.type} style={{
                fontSize: '0.8rem', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}>
                {r.emoji} <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>{count}</span>
              </span>
            );
          })}
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--text-dim)',
          }}>💬 READ MORE →</span>
        </div>
      </div>
    </div>
  );
}
