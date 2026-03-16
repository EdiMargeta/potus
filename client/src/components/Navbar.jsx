import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(8,11,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all 0.3s ease',
      padding: '0 2rem',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            boxShadow: '0 0 20px var(--neon-blue-dim)',
          }} />
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem',
              letterSpacing: '0.05em', lineHeight: 1,
              background: 'linear-gradient(90deg, var(--neon-blue), var(--neon-purple))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>POTUS PARADOX</div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'var(--text-dim)', letterSpacing: '0.15em',
            }}>EVERY PROMISE. ON THE RECORD.</div>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {[{ to: '/', label: 'TIMELINE' }, { to: '/promises', label: 'PROMISE TRACKER' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: '0.85rem', letterSpacing: '0.1em',
              padding: '0.5rem 1rem', borderRadius: 4,
              color: location.pathname === to ? 'var(--neon-blue)' : 'var(--text-secondary)',
              background: location.pathname === to ? 'var(--neon-blue-dim)' : 'transparent',
              border: '1px solid ' + (location.pathname === to ? 'var(--neon-blue)' : 'transparent'),
              transition: 'all 0.2s', textDecoration: 'none',
            }}>{label}</Link>
          ))}
          <Link to="/admin" style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
            padding: '0.4rem 0.8rem', borderRadius: 4,
            color: 'var(--text-dim)', border: '1px solid var(--border)',
            marginLeft: '0.5rem', transition: 'all 0.2s', textDecoration: 'none',
          }}>ADMIN</Link>
        </div>
      </div>
    </nav>
  );
}
