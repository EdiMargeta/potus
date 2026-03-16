import React from 'react';

const FILTERS = [
  { value: 'all',      label: 'ALL' },
  { value: 'threat',   label: '🔴 THREATS' },
  { value: 'nato',     label: '🔵 NATO' },
  { value: 'promise',  label: '🟡 PROMISES' },
  { value: 'reversal', label: '🟣 REVERSALS' },
  { value: 'economic', label: '🟢 ECONOMIC' },
  { value: 'legal',    label: '🟠 LEGAL' },
  { value: 'victory',  label: '⚪ VICTORIES' },
];

export default function FilterBar({ active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: '0.4rem', flexWrap: 'wrap',
      padding: '0.75rem 0',
    }}>
      {FILTERS.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          style={{
            fontFamily: 'var(--font-mono)', fontWeight: 500,
            fontSize: '0.7rem', letterSpacing: '0.08em',
            padding: '0.4rem 0.9rem', borderRadius: 4,
            border: '1px solid ' + (active === f.value ? 'var(--neon-blue)' : 'var(--border)'),
            background: active === f.value ? 'var(--neon-blue-dim)' : 'var(--bg-card)',
            color: active === f.value ? 'var(--neon-blue)' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
