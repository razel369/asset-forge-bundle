import React from 'react';

export default function BoldLanding() {
  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui', background: '#0c0a1a', color: 'white', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 120 }}>
          <strong style={{ fontSize: 20 }}>⚡ Bolt</strong>
          <nav style={{ display: 'flex', gap: 24 }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Product</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Login</a>
          </nav>
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 999, border: '1px solid #4f46e5', color: '#a5b4fc', fontSize: 13 }}>Now in public beta</span>
            <h1 style={{ fontSize: 'clamp(48px, 7vw, 96px)', margin: '24px 0 16px', letterSpacing: '-0.04em', lineHeight: 1 }}>Code at the speed of thought.</h1>
            <p style={{ fontSize: 20, color: '#a3a3b8' }}>Cursor-native AI pair programmer.</p>
            <div style={{ marginTop: 32 }}>
              <a href="#" style={{ background: '#4f46e5', color: 'white', padding: '16px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 700 }}>Try free →</a>
            </div>
          </div>
          <div style={{ padding: 32, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, fontFamily: 'ui-monospace, monospace', fontSize: 14 }}>
            <div style={{ color: '#6b6680' }}>$ bolt deploy</div>
            <pre style={{ margin: '8px 0', color: '#e4e4e7' }}>{'Building... → done in 4.2s\nTests:    142 passing\nBundle:   312 kb\nURL:      https://acme.bolt.app'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
