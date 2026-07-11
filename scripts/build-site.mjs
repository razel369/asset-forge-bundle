// Aggregator landing site — shows all 3 products on one page.
// Replaces the previous single-product page.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ICONS_DIR = join(ROOT, "icons");
const ILL_DIR = join(ROOT, "illustrations");
const OUT = join(ROOT, "site", "index.html");

const ICON_CATS = ["tech", "business", "finance", "dev", "marketing", "ai"];

const CSS = `
  :root { color-scheme: light; --ink:#0c0a1a; --muted:#6b6680; --line:#ece9f5; --bg:#fbfafd; --accent:#4f46e5; --soft:#ede9fe; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--ink); background: var(--bg); line-height: 1.55; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
  header.hero { padding: 72px 0 48px; border-bottom: 1px solid var(--line); }
  .pill { display: inline-block; font-size: 12px; padding: 4px 10px; border-radius: 999px; background: var(--soft); color: var(--accent); font-weight: 600; }
  h1 { font-size: clamp(40px, 6vw, 64px); margin: 18px 0 14px; line-height: 1.05; letter-spacing: -0.025em; }
  .lede { font-size: 18px; color: var(--muted); max-width: 700px; }
  h2 { font-size: 32px; letter-spacing: -0.02em; margin: 0 0 8px; }
  .sub { color: var(--muted); margin: 0 0 32px; }
  section { padding: 64px 0; border-bottom: 1px solid var(--line); }
  .grid-icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
  .grid-ill { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
  .cell { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 14px 6px; border: 1px solid var(--line); border-radius: 12px; background: white; }
  .cell svg { width: 26px; height: 26px; color: var(--ink); }
  .cell .lbl { font-size: 11px; color: var(--muted); margin-top: 8px; font-family: ui-monospace, monospace; }
  .ill { padding: 16px; border: 1px solid var(--line); border-radius: 16px; background: white; }
  .ill svg { width: 100%; height: auto; max-height: 160px; color: var(--ink); }
  .ill .lbl { font-size: 12px; color: var(--muted); margin-top: 8px; font-family: ui-monospace, monospace; }
  .templates { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; }
  .tpl { border: 1px solid var(--line); border-radius: 16px; overflow: hidden; background: white; }
  .tpl .thumb { height: 200px; border-bottom: 1px solid var(--line); }
  .tpl iframe { width: 100%; height: 100%; border: 0; }
  .tpl .meta { padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; }
  .tpl h3 { margin: 0; font-size: 16px; }
  .tpl a { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 600; }
  .pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  @media (max-width: 720px) { .pricing { grid-template-columns: 1fr; } }
  .tier { border: 1px solid var(--line); border-radius: 16px; padding: 24px; background: white; }
  .tier h3 { margin: 0; }
  .tier .price-big { font-size: 32px; font-weight: 700; margin: 12px 0 8px; letter-spacing: -0.02em; }
  .tier ul { padding-left: 18px; color: var(--muted); font-size: 14px; }
  .tier li { margin: 5px 0; }
  footer { padding: 48px 0; color: var(--muted); font-size: 14px; text-align: center; }
`;

function readSvg(dir, file) {
  return readFileSync(join(dir, file), "utf8");
}

function cellsForIcons() {
  let html = "";
  for (const cat of ICON_CATS) {
    const files = readdirSync(join(ICONS_DIR, cat)).filter(f => f.endsWith(".svg")).sort();
    for (const f of files) {
      const slug = f.replace(/\.svg$/, "");
      html += `<div class="cell">${readSvg(join(ICONS_DIR, cat), f)}<span class="lbl">${slug}</span></div>`;
    }
  }
  return html;
}

function cellsForIllustrations() {
  const files = readdirSync(ILL_DIR).filter(f => f.endsWith(".svg")).sort();
  return files.map(f => {
    const slug = f.replace(/\.svg$/, "");
    return `<div class="ill">${readSvg(ILL_DIR, f)}<div class="lbl">${slug}</div></div>`;
  }).join("");
}

function templatesHtml() {
  const tmpls = [
    { name: "Minimal", file: "minimal.html" },
    { name: "Bold", file: "bold.html" },
    { name: "Magazine", file: "magazine.html" },
  ];
  return tmpls.map(t => `
    <div class="tpl">
      <div class="thumb"><iframe src="templates/html/${t.file}" loading="lazy"></iframe></div>
      <div class="meta"><h3>${t.name}</h3><a href="templates/html/${t.file}" target="_blank">Open ↗</a></div>
    </div>`).join("");
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Asset Forge — design assets for indie hackers</title>
<meta name="description" content="60 icons · 12 illustrations · 3 landing templates. Made by an AI under tight constraints. MIT for open-source, $29 for commercial.">
<link rel="stylesheet" href="data:text/css,${encodeURIComponent(CSS)}">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
</head>
<body>
<header class="hero">
  <div class="wrap">
    <span class="pill">3 packs · 75 assets · entirely AI-authored</span>
    <h1>Design assets<br>built by an AI for indie builders.</h1>
    <p class="lede">60 icons, 12 illustrations, 3 landing templates — every asset hand-tuned under tight design constraints. MIT for open-source, $29+ for commercial use.</p>
  </div>
</header>

<section id="icons">
  <div class="wrap">
    <h2>Icon Pack</h2>
    <p class="sub">60 stroke-based icons across 6 categories. Single-color, &lt;600 bytes each, currentColor-aware.</p>
    <div class="grid-icons">${cellsForIcons()}</div>
  </div>
</section>

<section id="illustrations">
  <div class="wrap">
    <h2>Illustration Pack</h2>
    <p class="sub">12 empty-state and hero illustrations. Drop them into any React or HTML project.</p>
    <div class="grid-ill">${cellsForIllustrations()}</div>
  </div>
</section>

<section id="templates">
  <div class="wrap">
    <h2>Landing Templates</h2>
    <p class="sub">3 layouts, each in plain HTML and JSX. Pick one, swap your copy, ship.</p>
    <div class="templates">${templatesHtml()}</div>
  </div>
</section>

<section id="pricing">
  <div class="wrap">
    <h2>Pick a license.</h2>
    <p class="sub">All packs include every asset, every update, forever.</p>
    <div class="pricing">
      <div class="tier">
        <h3>Open-source</h3>
        <p style="color:var(--muted);margin:8px 0 0;">MIT — free</p>
        <ul>
          <li>All 75 assets</li>
          <li>Personal projects</li>
          <li>Open-source software</li>
          <li>Include attribution</li>
        </ul>
        <p style="margin-top:16px;"><a href="https://github.com/asset-forge/indie-bundle" style="color:var(--accent);font-weight:600;text-decoration:none;">View on GitHub →</a></p>
      </div>
      <div class="tier" style="border-color:var(--ink);box-shadow:0 0 0 2px var(--ink);">
        <h3>Indie Pack</h3>
        <p style="color:var(--muted);margin:8px 0 0;">For solo founders & tiny teams</p>
        <div class="price-big">$29 <span style="font-size:13px;color:var(--muted);">one-time</span></div>
        <ul>
          <li>Commercial use</li>
          <li>Up to 5 developers</li>
          <li>Unlimited products</li>
          <li>Lifetime updates</li>
        </ul>
      </div>
      <div class="tier">
        <h3>Studio Pack</h3>
        <p style="color:var(--muted);margin:8px 0 0;">For agencies & growing teams</p>
        <div class="price-big">$99 <span style="font-size:13px;color:var(--muted);">one-time</span></div>
        <ul>
          <li>Unlimited developers</li>
          <li>Unlimited products</li>
          <li>Priority email support</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    © 2026 Asset Forge · MIT for open-source use · <a href="mailto:hello@assetforge.dev">hello@assetforge.dev</a>
  </div>
</footer>
</body>
</html>
`;

writeFileSync(OUT, html);
console.log(`Wrote ${OUT}`);
