import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api.js';
import EventCard from '../components/EventCard.jsx';
import FilterBar from '../components/FilterBar.jsx';
import HeroTicker from '../components/HeroTicker.jsx';

export default function Timeline() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const fetchEvents = useCallback(async (cat, off) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, offset: off };
      if (cat !== 'all') params.category = cat;
      const data = await api.getEvents(params);
      if (off === 0) setEvents(data);
      else setEvents(prev => [...prev, ...data]);
      setHasMore(data.length === LIMIT);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    setOffset(0);
    fetchEvents(filter, 0);
  }, [filter]);

  const loadMore = () => {
    const newOffset = offset + LIMIT;
    setOffset(newOffset);
    fetchEvents(filter, newOffset);
  };

  return (
    <div>
      <HeroTicker />

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {/* Sticky filter bar */}
        <div style={{
          position: 'sticky', top: 64, zIndex: 10,
          background: 'rgba(8,11,15,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          marginLeft: '-1.5rem', marginRight: '-1.5rem',
          padding: '0 1.5rem',
        }}>
          <FilterBar active={filter} onChange={setFilter} />
        </div>

        {/* Timeline line */}
        <div style={{ position: 'relative', paddingTop: '2rem' }}>
          {/* Vertical timeline line */}
          <div style={{
            position: 'absolute', left: -24, top: 0, bottom: 0,
            width: 1, background: 'linear-gradient(180deg, var(--neon-blue-dim), var(--border), transparent)',
          }} />

          {/* Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {events.map((event, i) => (
              <div key={event.id} style={{ position: 'relative' }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: -28, top: '1.4rem',
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--neon-blue)',
                  boxShadow: '0 0 8px var(--neon-blue)',
                  border: '1px solid var(--bg-base)',
                }} />
                <EventCard event={event} />
              </div>
            ))}
          </div>

          {loading && (
            <div style={{
              textAlign: 'center', padding: '2rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
              color: 'var(--neon-blue)',
            }}>
              <span style={{ animation: 'pulse 1s infinite' }}>◈ LOADING RECORDS...</span>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '4rem',
              fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
              color: 'var(--text-dim)',
              border: '1px solid var(--border)', borderRadius: 8,
            }}>
              NO RECORDS FOUND FOR THIS CATEGORY
            </div>
          )}

          {!loading && hasMore && events.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button onClick={loadMore} style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.9rem', letterSpacing: '0.1em',
                padding: '0.75rem 2rem', borderRadius: 6,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--neon-blue)'; e.target.style.color = 'var(--neon-blue)'; }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)'; }}
              >LOAD MORE RECORDS</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
