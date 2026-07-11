import React from 'react';

export default function MinimalLanding() {
  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui', color: '#0c0a1a', maxWidth: 880, margin: '0 auto', padding: '80px 24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 80 }}>
        <strong>Acme</strong>
        <a href="#pricing" style={{ color: '#0c0a1a' }}>Pricing</a>
      </header>
      <h1 style={{ fontSize: 'clamp(40px, 6vw, 72px)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
        Ship faster.<br />Sleep better.
      </h1>
      <p style={{ fontSize: 20, color: '#6b6680', maxWidth: 560, margin: '20px 0 32px' }}>
        The deploy platform that catches bugs before your users do.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <a href="#" style={{ background: '#0c0a1a', color: 'white', padding: '14px 24px', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>Start free</a>
        <a href="#" style={{ border: '1px solid #ece9f5', padding: '14px 24px', borderRadius: 10, textDecoration: 'none', color: '#0c0a1a' }}>Watch demo</a>
      </div>
      <section style={{ marginTop: 96, padding: '48px 32px', background: '#fbfafd', borderRadius: 20 }}>
        <h2 style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6680', margin: 0 }}>Trusted by</h2>
        <div style={{ display: 'flex', gap: 32, marginTop: 24, flexWrap: 'wrap', color: '#6b6680', fontWeight: 600 }}>Stripe · Vercel · Linear · Notion · Figma</div>
      </section>
      <section style={{ marginTop: 80, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
        <div><h3>Lightning deploys</h3><p style={{ color: '#6b6680' }}>Push to main, ship in 30 seconds.</p></div>
        <div><h3>Catch bugs early</h3><p style={{ color: '#6b6680' }}>Visual diffs and error tracking, automatic.</p></div>
        <div><h3>Sleep better</h3><p style={{ color: '#6b6680' }}>On-call has never been quieter.</p></div>
      </section>
    </div>
  );
}
