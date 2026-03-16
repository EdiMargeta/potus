import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { parseDate } from '../lib/dates.js';
import { api } from '../lib/api.js';
import TimelineCard from '../components/TimelineCard.jsx';
import SidePanel from '../components/SidePanel.jsx';
import HeroTicker from '../components/HeroTicker.jsx';
import FilterBar from '../components/FilterBar.jsx';

const CAT_COLORS = {
  threat: 'var(--cat-threat)', nato: 'var(--cat-nato)',
  promise: 'var(--cat-promise)', reversal: 'var(--cat-reversal)',
  economic: 'var(--cat-economic)', legal: 'var(--cat-legal)',
  victory: 'var(--cat-victory)',
};

export default function Timeline() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [offset, setOffset]         = useState(0);
  const [hasMore, setHasMore]       = useState(true);
  const [activeId, setActiveId]     = useState(null);
  const [panelOpen, setPanelOpen]   = useState(false);
  const LIMIT = 30;

  const fetchEvents = useCallback(async (cat, off) => {
    setLoading(true);
    try {
      const params = { limit: LIMIT, offset: off };
      if (cat !== 'all') params.category = cat;
      const data = await api.getEvents(params);
      if (off === 0) setEvents(data);
      else setEvents(prev => [...prev, ...data]);
      setHasMore(data.length === LIMIT);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => {
    setOffset(0);
    fetchEvents(filter, 0);
  }, [filter]);

  const openPanel = (id) => {
    setActiveId(id);
    setPanelOpen(true);
  };

  const closePanel = () => {
    setPanelOpen(false);
    setActiveId(null);
  };

  const loadMore = () => {
    const next = offset + LIMIT;
    setOffset(next);
    fetchEvents(filter, next);
  };

  // Events are newest-first from DB; we reverse so oldest is at bottom
  const ordered = [...events].reverse();

  return (
    <div>
      <HeroTicker />

      {/* Sticky filter bar */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 50,
        background: 'rgba(8,11,15,0.94)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <FilterBar active={filter} onChange={(f) => { setFilter(f); setOffset(0); }} />
        </div>
      </div>

      {/* Load more — at top since oldest is at bottom */}
      {!loading && hasMore && events.length > 0 && (
        <div style={{ textAlign: 'center', padding: '1.5rem 0 0' }}>
          <button onClick={loadMore} style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.85rem', letterSpacing: '0.1em',
            padding: '0.6rem 1.75rem', borderRadius: 6,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--neon-blue)'; e.currentTarget.style.color = 'var(--neon-blue)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >↑ LOAD OLDER RECORDS</button>
        </div>
      )}

      {/* Timeline */}
      <div style={{
        maxWidth: 1000, margin: '0 auto',
        padding: '2rem 2rem 6rem',
        position: 'relative',
      }}>

        {loading && events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '6rem 0', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--neon-blue)' }}>
            ◈ LOADING RECORDS...
          </div>
        )}

        {!loading && events.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '6rem 0',
            fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
            color: 'var(--text-dim)', border: '1px solid var(--border)',
            borderRadius: 8,
          }}>NO RECORDS FOUND FOR THIS CATEGORY</div>
        )}

        {ordered.length > 0 && (
          <div style={{ position: 'relative' }}>

            {/* Central vertical line */}
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              top: 0, bottom: 0,
              width: 2,
              background: 'linear-gradient(180deg, var(--neon-blue-dim) 0%, var(--border) 40%, var(--border) 80%, transparent 100%)',
              zIndex: 0,
            }} />

            {/* "NOW" label at top */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              marginBottom: '2rem', position: 'relative', zIndex: 1,
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                letterSpacing: '0.2em', color: 'var(--neon-blue)',
                background: 'var(--bg-base)',
                padding: '0.3rem 1rem',
                border: '1px solid var(--neon-blue-dim)',
                borderRadius: 20,
                boxShadow: '0 0 16px var(--neon-blue-dim)',
              }}>◈ MOST RECENT</div>
            </div>

            {/* Events — reversed so newest is at top */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[...ordered].reverse().map((event, i) => {
                const side = i % 2 === 0 ? 'right' : 'left';
                const accent = CAT_COLORS[event.category] || 'var(--neon-blue)';
                const isActive = event.id === activeId;
                const lit = isActive;

                return (
                  <div
                    key={event.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 64px 1fr',
                      alignItems: 'center',
                      marginBottom: '1.75rem',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    {/* Left slot */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 0 }}>
                      {side === 'left' ? (
                        <div style={{ width: '100%', maxWidth: 380 }}>
                          <TimelineCard
                            event={event} side="left"
                            onClick={() => openPanel(event.id)}
                            isActive={isActive}
                          />
                        </div>
                      ) : (
                        /* Date label on left when card is on right */
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                          color: lit ? accent : 'var(--text-dim)',
                          letterSpacing: '0.08em',
                          textAlign: 'right', paddingRight: '0.5rem',
                          transition: 'color 0.2s',
                          userSelect: 'none',
                        }}>
                          {format(parseDate(event.date), 'MMM d\nyyyy').split('\n').map((line, li) => (
                            <div key={li}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Center dot */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                      {/* Outer pulse ring on active */}
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          width: 28, height: 28,
                          borderRadius: '50%',
                          border: '2px solid ' + accent,
                          opacity: 0.4,
                          animation: 'pulse-ring 1.5s ease-out infinite',
                        }} />
                      )}
                      <div style={{
                        width: isActive ? 16 : 12,
                        height: isActive ? 16 : 12,
                        borderRadius: '50%',
                        background: lit ? accent : 'var(--border-bright)',
                        border: '2px solid ' + (lit ? accent : 'var(--bg-base)'),
                        boxShadow: lit ? '0 0 16px ' + accent + ', 0 0 32px ' + accent + '44' : 'none',
                        transition: 'all 0.2s ease',
                        zIndex: 2,
                        cursor: 'pointer',
                      }}
                      onClick={() => openPanel(event.id)}
                      />
                    </div>

                    {/* Right slot */}
                    <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 0 }}>
                      {side === 'right' ? (
                        <div style={{ width: '100%', maxWidth: 380 }}>
                          <TimelineCard
                            event={event} side="right"
                            onClick={() => openPanel(event.id)}
                            isActive={isActive}
                          />
                        </div>
                      ) : (
                        /* Date label on right when card is on left */
                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                          color: lit ? accent : 'var(--text-dim)',
                          letterSpacing: '0.08em',
                          paddingLeft: '0.5rem',
                          transition: 'color 0.2s',
                          userSelect: 'none',
                        }}>
                          {format(parseDate(event.date), 'MMM d\nyyyy').split('\n').map((line, li) => (
                            <div key={li}>{line}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* "START" label at bottom */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', position: 'relative', zIndex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                letterSpacing: '0.2em', color: 'var(--text-dim)',
                background: 'var(--bg-base)', padding: '0.3rem 1rem',
                border: '1px solid var(--border)', borderRadius: 20,
              }}>◈ ARCHIVE BEGINS</div>
            </div>
          </div>
        )}
      </div>

      {/* Side panel */}
      {panelOpen && (
        <SidePanel eventId={activeId} onClose={closePanel} />
      )}

      {/* Pulse animation keyframe */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
