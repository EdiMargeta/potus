import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import CategoryBadge from '../components/CategoryBadge.jsx';
import SeverityDot from '../components/SeverityDot.jsx';
import ReactionsBar from '../components/ReactionsBar.jsx';
import CommentsSection from '../components/CommentsSection.jsx';
import { format } from 'date-fns';
import { parseDate } from '../lib/dates.js';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvent(id).then(data => { setEvent(data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ textAlign: 'center', paddingTop: '8rem', fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)' }}>
      ◈ LOADING RECORD...
    </div>
  );

  if (!event) return (
    <div style={{ textAlign: 'center', paddingTop: '8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
      RECORD NOT FOUND
    </div>
  );

  const catColors = {
    threat: 'var(--cat-threat)', nato: 'var(--cat-nato)',
    promise: 'var(--cat-promise)', reversal: 'var(--cat-reversal)',
    economic: 'var(--cat-economic)', legal: 'var(--cat-legal)',
    victory: 'var(--cat-victory)',
  };
  const accentColor = catColors[event.category] || 'var(--neon-blue)';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '5.5rem 1.5rem 4rem' }}>
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{
        fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
        letterSpacing: '0.1em', color: 'var(--text-dim)',
        background: 'none', border: 'none', cursor: 'pointer',
        marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--neon-blue)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-dim)'}
      >← BACK TO TIMELINE</button>

      {/* Article card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderTop: '3px solid ' + accentColor,
        borderRadius: 8, overflow: 'hidden',
        marginBottom: '2rem',
        boxShadow: '0 8px 40px ' + accentColor + '10',
      }}>
        <div style={{ padding: '2rem 2.5rem' }}>
          {/* Meta row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <CategoryBadge category={event.category} size="lg" />
              <SeverityDot severity={event.severity} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {event.date ? format(parseDate(event.date), 'MMMM d, yyyy') : ''}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display)', fontWeight: 900,
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            lineHeight: 1.15, letterSpacing: '0.02em',
            color: 'var(--text-primary)', marginBottom: '1rem',
          }}>{event.title}</h1>

          {/* Summary */}
          <p style={{
            color: 'var(--neon-blue)', fontSize: '1rem',
            fontStyle: 'italic', lineHeight: 1.5,
            borderLeft: '2px solid var(--neon-blue)',
            paddingLeft: '1rem', marginBottom: '1.5rem',
          }}>{event.summary}</p>

          {/* Body */}
          {event.body && (
            <div style={{
              color: 'var(--text-secondary)', fontSize: '1rem',
              lineHeight: 1.7, marginBottom: '1.5rem',
            }}>
              {event.body.split('\n').map((p, i) => <p key={i} style={{ marginBottom: '0.75rem' }}>{p}</p>)}
            </div>
          )}

          {/* Source */}
          {event.source_url && (
            <a href={event.source_url} target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              color: 'var(--neon-blue)', letterSpacing: '0.05em',
              border: '1px solid var(--neon-blue-dim)',
              padding: '0.4rem 0.8rem', borderRadius: 4,
              transition: 'background 0.2s',
            }}>
              📎 {event.source_label || 'SOURCE'} ↗
            </a>
          )}
        </div>

        {/* Contradictions */}
        {event.contradictions && event.contradictions.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border)',
            background: 'var(--neon-purple-dim)',
            padding: '1.25rem 2.5rem',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
              letterSpacing: '0.1em', color: 'var(--neon-purple)',
              marginBottom: '0.75rem',
            }}>⚡ CONTRADICTIONS DETECTED</div>
            {event.contradictions.map(c => {
              const other = c.event_a?.id === id ? c.event_b : c.event_a;
              return other ? (
                <div key={c.id} style={{ marginBottom: '0.5rem' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    {c.description}
                  </p>
                  <Link to={'/event/' + other.id} style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                    color: 'var(--neon-purple)', letterSpacing: '0.05em',
                    textDecoration: 'underline',
                  }}>
                    → SEE: "{other.title}"
                  </Link>
                </div>
              ) : null;
            })}
          </div>
        )}

        {/* Reactions */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 2.5rem' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
            letterSpacing: '0.1em', color: 'var(--text-dim)',
            marginBottom: '0.75rem',
          }}>REACT TO THIS</div>
          <ReactionsBar eventId={event.id} initialReactions={event.reactions || []} />
        </div>
      </div>

      {/* Comments */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8, padding: '2rem 2.5rem',
      }}>
        <CommentsSection eventId={event.id} />
      </div>
    </div>
  );
}
