import React from 'react';

export default function MagazineLanding() {
  return (
    <div style={{ fontFamily: 'ui-serif, Georgia, serif', color: '#0c0a1a', maxWidth: 720, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ borderTop: '4px double #0c0a1a', paddingTop: 16, textAlign: 'center', letterSpacing: '0.4em', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
        THE QUIET ESTABLISHMENT
      </div>
      <h1 style={{ fontSize: 'clamp(56px, 10vw, 120px)', margin: '40px 0 24px', letterSpacing: '-0.04em', lineHeight: 0.95, textAlign: 'center' }}>
        Time is the<br/>only asset.
      </h1>
      <p style={{ textAlign: 'center', color: '#4a4a55', fontSize: 18, fontStyle: 'italic', maxWidth: 480, margin: '0 auto 48px' }}>
        A weekly dispatch on productivity tools for engineers, founders, and quiet thinkers.
      </p>
      <form style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto' }}>
        <input type="email" placeholder="you@example.com" style={{ flex: 1, padding: '14px 18px', border: '1px solid #0c0a1a', borderRadius: 999, fontSize: 16, fontFamily: 'inherit' }} />
        <button type="submit" style={{ background: '#0c0a1a', color: 'white', padding: '14px 22px', border: 0, borderRadius: 999, fontWeight: 700, fontFamily: 'ui-sans-serif, system-ui' }}>Subscribe</button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 13, color: '#6b6680', marginTop: 12 }}>Free · No spam · Unsubscribe anytime</p>
    </div>
  );
}
