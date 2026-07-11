// Asset #3 — SaaS Landing Page Templates (3 layouts)
// Generates .jsx + .html versions + a showcase index that picks the right one.

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "templates");
mkdirSync(OUT, { recursive: true });
mkdirSync(join(OUT, "jsx"), { recursive: true });
mkdirSync(join(OUT, "html"), { recursive: true });

// ---------- Layout 1: Minimal ----------
const minimalJSX = `import React from 'react';

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
`;

const minimalHTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Acme — Ship faster</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ui-sans-serif, system-ui; color: #0c0a1a; background: white; }
  .wrap { max-width: 880px; margin: 0 auto; padding: 80px 24px; }
  header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 80px; }
  header a { color: inherit; text-decoration: none; }
  h1 { font-size: clamp(40px, 6vw, 72px); margin: 0; letter-spacing: -0.03em; line-height: 1.05; }
  .lede { font-size: 20px; color: #6b6680; max-width: 560px; margin: 20px 0 32px; }
  .cta { display: flex; gap: 12px; }
  .btn-p { background: #0c0a1a; color: white; padding: 14px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; }
  .btn-s { border: 1px solid #ece9f5; padding: 14px 24px; border-radius: 10px; text-decoration: none; color: inherit; }
  section { margin-top: 80px; }
  .trust { padding: 48px 32px; background: #fbfafd; border-radius: 20px; }
  .trust h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b6680; margin: 0; }
  .logos { display: flex; gap: 32px; margin-top: 24px; flex-wrap: wrap; color: #6b6680; font-weight: 600; }
  .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; }
  .features h3 { margin: 0 0 8px; }
  .features p { margin: 0; color: #6b6680; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <strong>Acme</strong>
    <a href="#pricing">Pricing</a>
  </header>
  <h1>Ship faster.<br>Sleep better.</h1>
  <p class="lede">The deploy platform that catches bugs before your users do.</p>
  <div class="cta">
    <a href="#" class="btn-p">Start free</a>
    <a href="#" class="btn-s">Watch demo</a>
  </div>
  <section class="trust">
    <h2>Trusted by</h2>
    <div class="logos">Stripe · Vercel · Linear · Notion · Figma</div>
  </section>
  <section class="features">
    <div><h3>Lightning deploys</h3><p>Push to main, ship in 30 seconds.</p></div>
    <div><h3>Catch bugs early</h3><p>Visual diffs and error tracking, automatic.</p></div>
    <div><h3>Sleep better</h3><p>On-call has never been quieter.</p></div>
  </section>
</div>
</body>
</html>`;

// ---------- Layout 2: Bold ----------
const boldJSX = `import React from 'react';

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
            <pre style={{ margin: '8px 0', color: '#e4e4e7' }}>{'Building... → done in 4.2s\\nTests:    142 passing\\nBundle:   312 kb\\nURL:      https://acme.bolt.app'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

const boldHTML = minimalHTML
  .replace('Ship faster.<br>Sleep better.', 'Code at the speed of thought.')
  .replace('Ship faster, sleep better deploy platform', 'Cursor-native AI pair programmer')
  .replace('<title>Acme — Ship faster</title>', '<title>Bolt — Code at the speed of thought</title>');

// ---------- Layout 3: Magazine ----------
const magazineJSX = `import React from 'react';

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
`;

const magazineHTML = magazineJSX.replace("import React from 'react';\n\n", '').replace(/export default function MagazineLanding\(\) \{[\s\S]*?return \(/, '').replace(/;\s*\}[\s\n]*$/, '');

// Write all
writeFileSync(join(OUT, "jsx", "Minimal.jsx"), minimalJSX);
writeFileSync(join(OUT, "jsx", "Bold.jsx"), boldJSX);
writeFileSync(join(OUT, "jsx", "Magazine.jsx"), magazineJSX);
writeFileSync(join(OUT, "html", "minimal.html"), minimalHTML);
writeFileSync(join(OUT, "html", "bold.html"), boldHTML);
writeFileSync(join(OUT, "html", "magazine.html"), magazineHTML);

// Showcase index
const showcase = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Landing Templates — 3 layouts</title>
<style>
  body { margin: 0; font-family: ui-sans-serif, system-ui; background: #fbfafd; color: #0c0a1a; }
  header { padding: 48px 24px; max-width: 720px; margin: 0 auto; }
  h1 { font-size: 36px; margin: 0 0 8px; }
  p { color: #6b6680; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; max-width: 1100px; margin: 0 auto; padding: 24px; }
  .card { background: white; border: 1px solid #ece9f5; border-radius: 16px; overflow: hidden; }
  .card .thumb { height: 240px; border-bottom: 1px solid #ece9f5; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #6b6680; background: #fbfafd; }
  .card .meta { padding: 16px; }
  .card h3 { margin: 0 0 4px; }
  .card a { color: #4f46e5; text-decoration: none; font-weight: 600; }
  iframe { width: 100%; height: 240px; border: 0; }
</style>
</head>
<body>
<header>
  <h1>3 Landing Templates</h1>
  <p>Pick a layout. Drop in your copy. Ship today.</p>
</header>
<div class="grid">
  <div class="card"><div class="thumb"><iframe src="html/minimal.html"></iframe></div><div class="meta"><h3>Minimal</h3><a href="html/minimal.html" target="_blank">Open ↗</a> · <a href="jsx/Minimal.jsx">JSX</a></div></div>
  <div class="card"><div class="thumb"><iframe src="html/bold.html"></iframe></div><div class="meta"><h3>Bold</h3><a href="html/bold.html" target="_blank">Open ↗</a> · <a href="jsx/Bold.jsx">JSX</a></div></div>
  <div class="card"><div class="thumb"><iframe src="html/magazine.html"></iframe></div><div class="meta"><h3>Magazine</h3><a href="html/magazine.html" target="_blank">Open ↗</a> · <a href="jsx/Magazine.jsx">JSX</a></div></div>
</div>
</body>
</html>`;
writeFileSync(join(OUT, "index.html"), showcase);

console.log("Generated 3 templates (JSX + HTML + showcase).");
