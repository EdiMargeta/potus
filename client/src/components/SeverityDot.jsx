import React from 'react';

export default function SeverityDot({ severity = 3 }) {
  const colors = ['', '#4a5568', '#ffb800', '#ff8c42', '#ff3b5c', '#ff0033'];
  const labels = ['', 'LOW', 'MINOR', 'MODERATE', 'HIGH', 'CRITICAL'];
  const color = colors[severity] || colors[3];
  return (
    <span title={labels[severity]} style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
      color: color, letterSpacing: '0.05em',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%',
        background: color,
        boxShadow: severity >= 4 ? '0 0 8px ' + color : 'none',
        display: 'inline-block',
      }} />
      {labels[severity]}
    </span>
  );
}
