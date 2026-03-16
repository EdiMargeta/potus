import React, { useState, useCallback } from 'react';
import { api } from '../lib/api.js';

// Defined outside component to avoid re-render / stale closure issues
const BLANK_EVENT = { title: '', summary: '', body: '', category: 'threat', date: '', source_url: '', source_label: '', severity: 3, president: 'trump' };
const BLANK_PROMISE = { text: '', category: 'economy', date_made: '', status: 'pending', notes: '', source_url: '', president: 'trump' };

const inputStyle = {
  background: 'var(--bg-elevated)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '0.6rem 0.85rem',
  color: 'var(--text-primary)', fontSize: '0.9rem',
  outline: 'none', fontFamily: 'var(--font-body)',
  width: '100%',
};

const labelStyle = {
  fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
  letterSpacing: '0.1em', color: 'var(--text-dim)',
  display: 'block', marginBottom: '0.4rem',
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState([]);
  const [promises, setPromises] = useState([]);
  const [msg, setMsg] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingPromise, setEditingPromise] = useState(null);

  const [eventForm, setEventForm] = useState(BLANK_EVENT);
  const [promiseForm, setPromiseForm] = useState(BLANK_PROMISE);

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleAuth = async () => {
    try {
      await api.verifyAdmin(password);
      setAuthed(true);
      loadData();
    } catch {
      setAuthError('Invalid password');
    }
  };

  const loadData = useCallback(async () => {
    try {
      const [ev, pr] = await Promise.all([api.getEvents({ limit: 100 }), api.getPromises()]);
      setEvents(ev);
      setPromises(pr);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  }, []);

  const saveEvent = async () => {
    try {
      if (editingEvent) {
        await api.adminReq('/events/' + editingEvent, 'PUT', eventForm, password);
        flash('Event updated');
      } else {
        await api.adminReq('/events', 'POST', eventForm, password);
        flash('Event created');
      }
      setEventForm(BLANK_EVENT); setEditingEvent(null);
      loadData();
    } catch (e) { flash('Error: ' + e.message); }
  };

  const deleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return;
    await api.adminReq('/events/' + id, 'DELETE', null, password);
    flash('Deleted'); loadData();
  };

  const editEvent = (ev) => {
    setEditingEvent(ev.id);
    setEventForm({ ...ev });
    setTab('events');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savePromise = async () => {
    try {
      if (editingPromise) {
        await api.adminReq('/promises/' + editingPromise, 'PUT', promiseForm, password);
        flash('Promise updated');
      } else {
        await api.adminReq('/promises', 'POST', promiseForm, password);
        flash('Promise created');
      }
      setPromiseForm(BLANK_PROMISE); setEditingPromise(null);
      loadData();
    } catch (e) { flash('Error: ' + e.message); }
  };

  const deletePromise = async (id) => {
    if (!confirm('Delete this promise?')) return;
    await api.adminReq('/promises/' + id, 'DELETE', null, password);
    flash('Deleted'); loadData();
  };

  const editPromise = (p) => {
    setEditingPromise(p.id);
    setPromiseForm({ ...p });
    setTab('promises');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!authed) return (
    <div style={{ maxWidth: 400, margin: '8rem auto', padding: '0 1.5rem' }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderTop: '3px solid var(--neon-amber)',
        borderRadius: 8, padding: '2rem',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
          letterSpacing: '0.15em', color: 'var(--neon-amber)',
          marginBottom: '0.5rem',
        }}>◈ RESTRICTED ACCESS</div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 900,
          fontSize: '1.8rem', letterSpacing: '0.05em',
          marginBottom: '1.5rem',
        }}>ADMIN PANEL</h2>
        <Field label="ADMIN PASSWORD">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAuth()}
            style={inputStyle}
            placeholder="Enter password"
          />
        </Field>
        {authError && <div style={{ color: 'var(--neon-red)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '1rem' }}>{authError}</div>}
        <button onClick={handleAuth} style={{
          width: '100%', fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: '1rem', letterSpacing: '0.1em',
          padding: '0.75rem', borderRadius: 6,
          border: '1px solid var(--neon-amber)',
          background: 'var(--neon-amber-dim)', color: 'var(--neon-amber)',
          cursor: 'pointer',
        }}>AUTHENTICATE</button>
      </div>
    </div>
  );

  const tabs = [{ id: 'events', label: 'EVENTS' }, { id: 'promises', label: 'PROMISES' }];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '5.5rem 1.5rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '2.5rem', letterSpacing: '0.05em', color: 'var(--neon-amber)' }}>
          ADMIN PANEL
        </h1>
        {msg && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--neon-green)', padding: '0.4rem 0.8rem', border: '1px solid var(--neon-green)', borderRadius: 4 }}>{msg}</div>}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: 'var(--font-display)', fontWeight: 700,
            fontSize: '0.9rem', letterSpacing: '0.1em',
            padding: '0.5rem 1.5rem', borderRadius: 4,
            border: '1px solid ' + (tab === t.id ? 'var(--neon-amber)' : 'var(--border)'),
            background: tab === t.id ? 'var(--neon-amber-dim)' : 'var(--bg-card)',
            color: tab === t.id ? 'var(--neon-amber)' : 'var(--text-secondary)',
            cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* EVENTS TAB */}
      {tab === 'events' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
          {/* Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--neon-amber)' }}>
              {editingEvent ? 'EDIT EVENT' : 'NEW EVENT'}
            </h3>
            <Field label="TITLE"><input value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} style={inputStyle} /></Field>
            <Field label="SUMMARY"><textarea value={eventForm.summary} onChange={e => setEventForm(p => ({ ...p, summary: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
            <Field label="BODY (FULL ARTICLE)"><textarea value={eventForm.body} onChange={e => setEventForm(p => ({ ...p, body: e.target.value }))} rows={5} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="CATEGORY">
                <select value={eventForm.category} onChange={e => setEventForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle }}>
                  {['threat','nato','promise','reversal','economic','legal','victory'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="DATE"><input type="date" value={eventForm.date} onChange={e => setEventForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></Field>
              <Field label="SEVERITY (1-5)"><input type="number" min={1} max={5} value={eventForm.severity} onChange={e => setEventForm(p => ({ ...p, severity: Number(e.target.value) }))} style={inputStyle} /></Field>
              <Field label="PRESIDENT"><input value={eventForm.president} onChange={e => setEventForm(p => ({ ...p, president: e.target.value }))} style={inputStyle} /></Field>
            </div>
            <Field label="SOURCE URL"><input value={eventForm.source_url} onChange={e => setEventForm(p => ({ ...p, source_url: e.target.value }))} style={inputStyle} /></Field>
            <Field label="SOURCE LABEL"><input value={eventForm.source_label} onChange={e => setEventForm(p => ({ ...p, source_label: e.target.value }))} style={inputStyle} /></Field>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={saveEvent} style={{
                flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.9rem', letterSpacing: '0.1em',
                padding: '0.65rem', borderRadius: 6,
                border: '1px solid var(--neon-green)', background: 'var(--neon-green-dim)',
                color: 'var(--neon-green)', cursor: 'pointer',
              }}>{editingEvent ? 'UPDATE' : 'CREATE'} EVENT</button>
              {editingEvent && (
                <button onClick={() => { setEditingEvent(null); setEventForm(BLANK_EVENT); }} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  padding: '0.65rem 1rem', borderRadius: 6,
                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                  color: 'var(--text-dim)', cursor: 'pointer',
                }}>CANCEL</button>
              )}
            </div>
          </div>

          {/* Event list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {events.map(ev => (
              <div key={ev.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '1rem 1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{ev.title}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>{ev.category} · {ev.date}</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => editEvent(ev)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid var(--neon-blue)', background: 'var(--neon-blue-dim)', color: 'var(--neon-blue)', cursor: 'pointer' }}>EDIT</button>
                  <button onClick={() => deleteEvent(ev.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid var(--neon-red)', background: 'var(--neon-red-dim)', color: 'var(--neon-red)', cursor: 'pointer' }}>DELETE</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROMISES TAB */}
      {tab === 'promises' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem', alignItems: 'start' }}>
          {/* Form */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem', color: 'var(--neon-amber)' }}>
              {editingPromise ? 'EDIT PROMISE' : 'NEW PROMISE'}
            </h3>
            <Field label="PROMISE TEXT"><textarea value={promiseForm.text} onChange={e => setPromiseForm(p => ({ ...p, text: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
            <Field label="NOTES / CONTEXT"><textarea value={promiseForm.notes} onChange={e => setPromiseForm(p => ({ ...p, notes: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} /></Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Field label="CATEGORY">
                <select value={promiseForm.category} onChange={e => setPromiseForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle }}>
                  {['economy','immigration','foreign','domestic','military','healthcare','other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="STATUS">
                <select value={promiseForm.status} onChange={e => setPromiseForm(p => ({ ...p, status: e.target.value }))} style={{ ...inputStyle }}>
                  {['kept','broken','pending','reversed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="DATE MADE"><input type="date" value={promiseForm.date_made} onChange={e => setPromiseForm(p => ({ ...p, date_made: e.target.value }))} style={inputStyle} /></Field>
              <Field label="PRESIDENT"><input value={promiseForm.president} onChange={e => setPromiseForm(p => ({ ...p, president: e.target.value }))} style={inputStyle} /></Field>
            </div>
            <Field label="SOURCE URL"><input value={promiseForm.source_url} onChange={e => setPromiseForm(p => ({ ...p, source_url: e.target.value }))} style={inputStyle} /></Field>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={savePromise} style={{
                flex: 1, fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.9rem', letterSpacing: '0.1em',
                padding: '0.65rem', borderRadius: 6,
                border: '1px solid var(--neon-green)', background: 'var(--neon-green-dim)',
                color: 'var(--neon-green)', cursor: 'pointer',
              }}>{editingPromise ? 'UPDATE' : 'CREATE'} PROMISE</button>
              {editingPromise && (
                <button onClick={() => { setEditingPromise(null); setPromiseForm(BLANK_PROMISE); }} style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                  padding: '0.65rem 1rem', borderRadius: 6,
                  border: '1px solid var(--border)', background: 'var(--bg-elevated)',
                  color: 'var(--text-dim)', cursor: 'pointer',
                }}>CANCEL</button>
              )}
            </div>
          </div>

          {/* Promise list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '70vh', overflowY: 'auto' }}>
            {promises.map(p => {
              const statuses = { kept: '#00ff87', broken: '#ff3b5c', reversed: '#b44dff', pending: '#ffb800' };
              return (
                <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: '3px solid ' + (statuses[p.status] || '#888'), borderRadius: 8, padding: '1rem 1.25rem' }}>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{p.text}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '0.75rem' }}>{p.status.toUpperCase()} · {p.category}</div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => editPromise(p)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid var(--neon-blue)', background: 'var(--neon-blue-dim)', color: 'var(--neon-blue)', cursor: 'pointer' }}>EDIT</button>
                    <button onClick={() => deletePromise(p.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid var(--neon-red)', background: 'var(--neon-red-dim)', color: 'var(--neon-red)', cursor: 'pointer' }}>DELETE</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
