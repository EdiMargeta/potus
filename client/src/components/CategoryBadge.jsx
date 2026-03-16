import React from 'react';

const CATEGORIES = {
  threat:   { label: 'THREAT',    color: 'var(--cat-threat)' },
  nato:     { label: 'NATO',      color: 'var(--cat-nato)' },
  promise:  { label: 'PROMISE',   color: 'var(--cat-promise)' },
  reversal: { label: 'REVERSAL',  color: 'var(--cat-reversal)' },
  economic: { label: 'ECONOMIC',  color: 'var(--cat-economic)' },
  legal:    { label: 'LEGAL',     color: 'var(--cat-legal)' },
  victory:  { label: 'VICTORY',   color: 'var(--cat-victory)' },
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const cat = CATEGORIES[category] || { label: category.toUpperCase(), color: 'var(--text-secondary)' };
  const fontSize = size === 'lg' ? '0.75rem' : '0.65rem';
  const padding = size === 'lg' ? '0.35rem 0.75rem' : '0.25rem 0.55rem';

  return (
    <span style={{
      display: 'inline-block',
      fontFamily: 'var(--font-mono)', fontWeight: 500,
      fontSize, letterSpacing: '0.1em',
      padding, borderRadius: 3,
      color: cat.color,
      background: cat.color + '18',
      border: '1px solid ' + cat.color + '44',
      lineHeight: 1,
    }}>
      {cat.label}
    </span>
  );
}

export { CATEGORIES };
