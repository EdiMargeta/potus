import React, { useState } from 'react';
import { api } from '../lib/api.js';

const REACTIONS = [
  { type: 'absurd',       emoji: '😂', label: 'Absurd' },
  { type: 'outrageous',   emoji: '😤', label: 'Outrageous' },
  { type: 'unbelievable', emoji: '🤯', label: 'Unbelievable' },
  { type: 'classic',      emoji: '🤷', label: 'Classic' },
];

export default function ReactionsBar({ eventId, initialReactions = [] }) {
  const [reactions, setReactions] = useState(
    REACTIONS.map(r => ({
      ...r,
      count: initialReactions.find(ir => ir.type === r.type)?.count || 0,
    }))
  );
  const [reacted, setReacted] = useState({});

  const handleReact = async (type) => {
    if (reacted[type]) return;
    try {
      await api.postReaction(eventId, type);
      setReactions(prev => prev.map(r => r.type === type ? { ...r, count: r.count + 1 } : r));
      setReacted(prev => ({ ...prev, [type]: true }));
    } catch (e) {}
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {reactions.map(r => (
        <button
          key={r.type}
          onClick={() => handleReact(r.type)}
          title={r.label}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: reacted[r.type] ? 'var(--bg-elevated)' : 'var(--bg-card)',
            border: '1px solid ' + (reacted[r.type] ? 'var(--neon-blue)' : 'var(--border)'),
            borderRadius: 6, padding: '0.5rem 0.9rem',
            cursor: reacted[r.type] ? 'default' : 'pointer',
            transition: 'all 0.2s', color: 'var(--text-primary)',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{r.emoji}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            color: reacted[r.type] ? 'var(--neon-blue)' : 'var(--text-secondary)',
          }}>{r.count}</span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
            color: 'var(--text-dim)',
          }}>{r.label}</span>
        </button>
      ))}
    </div>
  );
}
