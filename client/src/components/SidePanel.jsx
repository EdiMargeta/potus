import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { parseDate } from '../lib/dates.js';
import CategoryBadge from './CategoryBadge.jsx';
import SeverityDot from './SeverityDot.jsx';
import ReactionsBar from './ReactionsBar.jsx';
import CommentsSection from './CommentsSection.jsx';
import { api } from '../lib/api.js';

export default function SidePanel({ eventId, onClose }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    setEvent(null);
    requestAnimationFrame(() => setVisible(true));
    api.getEvent(eventId)
      .then(data => { setEvent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!eventId) return null;

  const catColors = {
    threat: 'var(--cat-threat)', nato: 'var(--cat-nato)',
    promise: 'var(--cat-promise)', reversal: 'var(--cat-reversal)',
    economic: 'var(--cat-economic)', legal: 'var(--cat-legal)',
    victory: 'var(--cat-victory)',
  };
  const accentColor = event ? (catColors[event.category] || 'var(--neon-blue)') : 'var(--neon-blue)';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(2px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(520px, 92vw)',
        zIndex: 201,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
        boxShadow: '-8px 0 48px rgba(0,0,0,0.6)',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Top accent line */}
        <div style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          transition: 'background 0.3s',
          flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            letterSpacing: '0.15em', color: 'var(--text-dim)',
          }}>◈ EVENT RECORD</div>
          <button onClick={handleClose} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 4, color: 'var(--text-dim)',
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            padding: '0.3rem 0.7rem', cursor: 'pointer',
            transition: 'all 0.15s',
            letterSpacing: '0.1em',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-red)'; e.currentTarget.style.color = 'var(--neon-red)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
          >ESC ✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {loading && (
            <div style={{
              textAlign: 'center', paddingTop: '4rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              color: 'var(--neon-blue)',
            }}>◈ LOADING RECORD...</div>
          )}

          {!loading && !event && (
            <div style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              RECORD NOT FOUND
            </div>
          )}

          {event && (
            <>
              {/* Meta */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <CategoryBadge category={event.category} size="lg" />
                  <SeverityDot severity={event.severity} />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                  {format(parseDate(event.date), 'MMMM d, yyyy')}
                </span>
              </div>

              {/* Title */}
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 900,
                fontSize: 'clamp(1.3rem, 3vw, 1.7rem)',
                lineHeight: 1.15, letterSpacing: '0.02em',
                color: 'var(--text-primary)', marginBottom: '1rem',
              }}>{event.title}</h2>

              {/* Summary */}
              <p style={{
                color: accentColor, fontSize: '0.95rem',
                fontStyle: 'italic', lineHeight: 1.5,
                borderLeft: '2px solid ' + accentColor,
                paddingLeft: '0.85rem', marginBottom: '1.25rem',
              }}>{event.summary}</p>

              {/* Body */}
              {event.body && (
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
                  {event.body.split('\n').map((p, i) => p.trim() && (
                    <p key={i} style={{ marginBottom: '0.75rem' }}>{p}</p>
                  ))}
                </div>
              )}

              {/* Source */}
              {event.source_url && (
                <a href={event.source_url} target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                  color: 'var(--neon-blue)', letterSpacing: '0.05em',
                  border: '1px solid var(--neon-blue-dim)',
                  padding: '0.35rem 0.7rem', borderRadius: 4,
                  marginBottom: '1.5rem', display: 'inline-flex',
                }}>📎 {event.source_label || 'SOURCE'} ↗</a>
              )}

              {/* Contradictions */}
              {event.contradictions && event.contradictions.length > 0 && (
                <div style={{
                  background: 'var(--neon-purple-dim)',
                  border: '1px solid var(--neon-purple)',
                  borderRadius: 6, padding: '1rem',
                  marginBottom: '1.5rem',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    letterSpacing: '0.1em', color: 'var(--neon-purple)',
                    marginBottom: '0.6rem',
                  }}>⚡ CONTRADICTIONS DETECTED</div>
                  {event.contradictions.map(c => {
                    const other = c.event_a?.id === eventId ? c.event_b : c.event_a;
                    return other ? (
                      <div key={c.id} style={{ marginBottom: '0.4rem' }}>
                        {c.description && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
                            {c.description}
                          </p>
                        )}
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                          color: 'var(--neon-purple)',
                        }}>↔ "{other.title}"</span>
                      </div>
                    ) : null;
                  })}
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

              {/* Reactions */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  letterSpacing: '0.1em', color: 'var(--text-dim)',
                  marginBottom: '0.75rem',
                }}>REACT TO THIS</div>
                <ReactionsBar eventId={event.id} initialReactions={event.reactions || []} />
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

              {/* Comments */}
              <CommentsSection eventId={event.id} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
