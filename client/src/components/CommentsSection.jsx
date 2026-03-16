import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';
import { format } from 'date-fns';

export default function CommentsSection({ eventId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [upvoted, setUpvoted] = useState({});

  useEffect(() => {
    api.getComments(eventId).then(data => { setComments(data); setLoading(false); }).catch(() => setLoading(false));
  }, [eventId]);

  const handleSubmit = async () => {
    if (!body.trim()) return;
    setSubmitting(true); setError('');
    try {
      const c = await api.postComment({ event_id: eventId, author_name: name || 'Anonymous', body });
      setComments(prev => [c, ...prev]);
      setBody(''); setName('');
    } catch (e) {
      setError(e.message);
    }
    setSubmitting(false);
  };

  const handleUpvote = async (id) => {
    if (upvoted[id]) return;
    const updated = await api.upvoteComment(id);
    setUpvoted(prev => ({ ...prev, [id]: true }));
    setComments(prev => prev.map(c => c.id === id ? { ...c, upvotes: updated.upvotes } : c));
  };

  const inputStyle = {
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 6, padding: '0.65rem 0.85rem',
    color: 'var(--text-primary)', fontSize: '0.9rem',
    outline: 'none', fontFamily: 'var(--font-body)',
    transition: 'border-color 0.2s', width: '100%',
  };

  return (
    <div>
      <h3 style={{
        fontFamily: 'var(--font-display)', fontWeight: 800,
        fontSize: '1.1rem', letterSpacing: '0.05em',
        color: 'var(--text-primary)', marginBottom: '1.25rem',
        paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)',
      }}>
        COMMENTS {comments.length > 0 && <span style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>({comments.length})</span>}
      </h3>

      {/* Comment form */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '1.25rem', marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <input
            placeholder="Your name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{ ...inputStyle, maxWidth: 220 }}
            onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <textarea
          placeholder="What do you think?"
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={1000}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical', marginBottom: '0.75rem' }}
          onFocus={e => e.target.style.borderColor = 'var(--neon-blue)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        {error && <div style={{ color: 'var(--neon-red)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)' }}>
            {body.length}/1000
          </span>
          <button
            onClick={handleSubmit}
            disabled={submitting || !body.trim()}
            style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '0.85rem', letterSpacing: '0.1em',
              padding: '0.5rem 1.25rem', borderRadius: 4,
              border: '1px solid var(--neon-blue)',
              background: body.trim() ? 'var(--neon-blue-dim)' : 'transparent',
              color: body.trim() ? 'var(--neon-blue)' : 'var(--text-dim)',
              cursor: body.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {submitting ? 'POSTING...' : 'POST COMMENT'}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '2rem',
          color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
        }}>No comments yet. Be the first to weigh in.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {comments.map(c => (
            <div key={c.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '1rem 1.25rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 700,
                  fontSize: '0.9rem', color: 'var(--neon-blue)',
                }}>{c.author_name}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                  color: 'var(--text-dim)',
                }}>{format(new Date(c.created_at), 'MMM d, yyyy')}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                {c.body}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleUpvote(c.id)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: upvoted[c.id] ? 'var(--neon-green)' : 'var(--text-dim)',
                    transition: 'color 0.2s',
                  }}
                >▲ {c.upvotes || 0} AGREE</button>
                <button
                  onClick={() => api.flagComment(c.id)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-dim)',
                  }}
                >🚩 FLAG</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
