import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { parseDate } from '../lib/dates.js';

const STATUS_CONFIG = {
  kept:     { label: 'KEPT',     color: 'var(--status-kept)',    hex: '#00ff87', emoji: '✅' },
  broken:   { label: 'BROKEN',   color: 'var(--status-broken)',  hex: '#ff3b5c', emoji: '❌' },
  reversed: { label: 'REVERSED', color: 'var(--status-reversed)',hex: '#b44dff', emoji: '🔄' },
  pending:  { label: 'PENDING',  color: 'var(--status-pending)', hex: '#ffb800', emoji: '🟡' },
};

const CAT_LABELS = {
  economy: 'Economy', immigration: 'Immigration', foreign: 'Foreign Policy',
  domestic: 'Domestic', military: 'Military', healthcare: 'Healthcare', other: 'Other',
};

export default function PromiseTracker() {
  const [promises, setPromises] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getPromises(), api.getPromiseStats()])
      .then(([p, s]) => { setPromises(p); setStats(s); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = promises.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    return true;
  });

  const chartData = stats ? Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    name: cfg.label, value: stats[key] || 0, color: cfg.hex,
  })).filter(d => d.value > 0) : [];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5.5rem 1.5rem 4rem' }}>
      {/* Page header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          letterSpacing: '0.2em', color: 'var(--neon-blue)',
          marginBottom: '0.5rem',
        }}>◈ PROMISE ACCOUNTABILITY MODULE</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          letterSpacing: '0.04em', lineHeight: 0.95,
          background: 'linear-gradient(90deg, var(--neon-amber), var(--neon-red))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>PROMISE TRACKER</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--neon-blue)', padding: '4rem' }}>
          ◈ LOADING RECORDS...
        </div>
      ) : (
        <>
          {/* Dashboard */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1.5fr',
            gap: '1.5rem', marginBottom: '2.5rem',
          }}>
            {/* Chart */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '1.5rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                letterSpacing: '0.1em', color: 'var(--text-dim)',
                marginBottom: '1rem',
              }}>PROMISE BREAKDOWN</div>
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value" stroke="none">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6 }}
                      labelStyle={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                      itemStyle={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Legend */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
                {chartData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      {d.name} ({d.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {stats && Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <div key={key} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderLeft: '3px solid ' + cfg.color,
                  borderRadius: 8, padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: statusFilter !== 'all' && statusFilter !== key ? 0.5 : 1,
                }}
                onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 900,
                    fontSize: '2.5rem', lineHeight: 1, color: cfg.color,
                    textShadow: '0 0 20px ' + cfg.color + '44',
                  }}>{stats[key] || 0}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    letterSpacing: '0.1em', color: 'var(--text-dim)',
                    marginTop: '0.25rem',
                  }}>{cfg.emoji} {cfg.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em',
                padding: '0.35rem 0.8rem', borderRadius: 4, cursor: 'pointer',
                border: '1px solid ' + (statusFilter === s ? (STATUS_CONFIG[s]?.hex || 'var(--neon-blue)') : 'var(--border)'),
                background: statusFilter === s ? (STATUS_CONFIG[s]?.hex || 'var(--neon-blue)') + '22' : 'var(--bg-card)',
                color: statusFilter === s ? (STATUS_CONFIG[s]?.hex || 'var(--neon-blue)') : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>
                {s === 'all' ? 'ALL' : STATUS_CONFIG[s].emoji + ' ' + STATUS_CONFIG[s].label}
              </button>
            ))}
            <div style={{ width: 1, background: 'var(--border)', margin: '0 0.25rem' }} />
            {['all', ...Object.keys(CAT_LABELS)].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.06em',
                padding: '0.35rem 0.7rem', borderRadius: 4, cursor: 'pointer',
                border: '1px solid ' + (catFilter === c ? 'var(--neon-blue)' : 'var(--border)'),
                background: catFilter === c ? 'var(--neon-blue-dim)' : 'var(--bg-card)',
                color: catFilter === c ? 'var(--neon-blue)' : 'var(--text-dim)',
                transition: 'all 0.15s',
              }}>
                {c === 'all' ? 'ALL TOPICS' : CAT_LABELS[c].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Promise list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(p => {
              const cfg = STATUS_CONFIG[p.status];
              return (
                <div key={p.id} style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderLeft: '3px solid ' + cfg.color,
                  borderRadius: 8, padding: '1rem 1.5rem',
                  display: 'flex', gap: '1.5rem', alignItems: 'flex-start',
                }}>
                  <div style={{ flexShrink: 0, marginTop: '0.15rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 900,
                      fontSize: '1.3rem', lineHeight: 1,
                      filter: 'drop-shadow(0 0 8px ' + cfg.hex + ')',
                    }}>{cfg.emoji}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      color: 'var(--text-primary)', fontSize: '0.95rem',
                      lineHeight: 1.4, marginBottom: '0.4rem',
                    }}>{p.text}</p>
                    {p.notes && (
                      <p style={{
                        color: 'var(--text-secondary)', fontSize: '0.82rem',
                        lineHeight: 1.4, fontStyle: 'italic', marginBottom: '0.4rem',
                      }}>{p.notes}</p>
                    )}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                        color: 'var(--text-dim)',
                      }}>📅 {format(parseDate(p.date_made), 'MMM yyyy')}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                        color: 'var(--text-dim)',
                      }}>🏷 {CAT_LABELS[p.category] || p.category}</span>
                      {p.source_url && (
                        <a href={p.source_url} target="_blank" rel="noopener noreferrer" style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                          color: 'var(--neon-blue)',
                        }}>📎 SOURCE ↗</a>
                      )}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                      letterSpacing: '0.08em', padding: '0.3rem 0.6rem',
                      borderRadius: 4, border: '1px solid ' + cfg.color + '55',
                      background: cfg.color + '18', color: cfg.color,
                    }}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '3rem',
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                color: 'var(--text-dim)', border: '1px solid var(--border)', borderRadius: 8,
              }}>NO PROMISES FOUND FOR THIS FILTER</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
