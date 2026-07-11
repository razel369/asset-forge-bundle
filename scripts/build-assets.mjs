// Generate "open graph" preview cards as plain SVG files.
// These serve as social previews when shared on Slack, Discord, HN, etc.

import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "site", "og");
mkdirSync(OUT, { recursive: true });

// 1200 x 630 — standard OG card size
const W = 1200, H = 630;
const wrap = (id, body, bg = "#fbfafd", ink = "#0c0a1a") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${body}<text x="60" y="${H - 36}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="500" fill="${ink === '#0c0a1a' ? '#6b6680' : '#a3a3b8'}">asset-forge.dev · asset bundle · MIT + $29</text></svg>`;

const grids = `
  <g transform="translate(60,80)">
    <text font-family="ui-sans-serif, system-ui, sans-serif" font-size="32" font-weight="700" fill="#0c0a1a">60 SVG icons</text>
    <text y="40" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" fill="#6b6680">Tech · Business · Finance · Dev · Marketing · AI</text>
  </g>
  <g transform="translate(60,200)" stroke="#4f46e5" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="0" y="0" width="48" height="48" rx="6"/>
    <circle cx="120" cy="24" r="20"/>
    <path d="M188 48 L188 0 L220 24 L252 0 L252 48" />
    <rect x="288" y="0" width="48" height="48" rx="6"/>
    <circle cx="384" cy="24" r="20"/>
    <path d="M444 38 L444 10 L456 38 L468 10 L468 38"/>
    <rect x="504" y="0" width="48" height="48" rx="6"/>
    <circle cx="600" cy="24" r="20"/>
    <rect x="648" y="0" width="48" height="48" rx="6"/>
    <path d="M724 38 L724 10 L736 38 L748 10 L748 38 M756 38 L756 10"/>
  </g>
`;

const illustrations = `
  <g transform="translate(60,80)">
    <text font-family="ui-sans-serif, system-ui, sans-serif" font-size="32" font-weight="700" fill="#0c0a1a">12 illustrations</text>
    <text y="40" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" fill="#6b6680">Empty states · hero scenes · ready-to-ship</text>
  </g>
  <g transform="translate(60,200)" stroke="#0c0a1a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="100" cy="240" rx="80" ry="8"/>
    <path d="M40 80 L120 50 L200 80 L200 200 L120 230 L40 200 Z"/>
    <circle cx="320" cy="100" r="60"/>
    <path d="M260 200 L260 240 L380 240 L380 200" />
    <path d="M460 80 L460 240 M460 240 L520 240 L520 100"/>
    <circle cx="540" cy="140" r="20" fill="#0c0a1a"/>
  </g>
`;

const templates = `
  <g transform="translate(60,80)">
    <text font-family="ui-sans-serif, system-ui, sans-serif" font-size="32" font-weight="700" fill="#0c0a1a">3 landing templates</text>
    <text y="40" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" fill="#6b6680">Minimal · Bold · Magazine — HTML &amp; JSX</text>
  </g>
  <g transform="translate(60,180)">
    <rect width="280" height="380" rx="12" fill="white" stroke="#ece9f5"/>
    <rect x="20" y="20" width="160" height="20" rx="4" fill="#0c0a1a"/>
    <rect x="20" y="60" width="240" height="40" rx="6" fill="#fbfafd" stroke="#ece9f5"/>
    <rect x="20" y="120" width="240" height="20" rx="4" fill="#6b6680"/>
    <rect x="20" y="180" width="240" height="120" rx="8" fill="#fbfafd" stroke="#ece9f5"/>
  </g>
  <g transform="translate(380,180)">
    <rect width="280" height="380" rx="12" fill="#0c0a1a"/>
    <rect x="20" y="20" width="80" height="14" rx="4" fill="#a5b4fc"/>
    <rect x="20" y="60" width="240" height="60" rx="6" fill="#4f46e5"/>
    <rect x="20" y="140" width="180" height="14" rx="4" fill="#a3a3b8"/>
    <rect x="20" y="180" width="220" height="100" rx="8" fill="#1f1f2e"/>
  </g>
  <g transform="translate(700,180)">
    <rect width="280" height="380" rx="12" fill="white" stroke="#ece9f5"/>
    <rect x="0" y="0" width="280" height="3" fill="#0c0a1a"/>
    <line x1="20" y1="50" x2="260" y2="50" stroke="#ece9f5"/>
    <rect x="20" y="80" width="240" height="60" rx="6" fill="#0c0a1a"/>
    <rect x="20" y="160" width="240" height="20" rx="4" fill="#6b6680"/>
    <rect x="20" y="220" width="220" height="60" rx="4" fill="#fbfafd" stroke="#ece9f5"/>
  </g>
`;

const bundle = `
  <g transform="translate(60,80)">
    <text font-family="ui-sans-serif, system-ui, sans-serif" font-size="40" font-weight="700" fill="#0c0a1a">75 design assets</text>
    <text y="48" font-family="ui-sans-serif, system-ui, sans-serif" font-size="24" fill="#6b6680">60 icons · 12 illustrations · 3 templates</text>
    <text y="92" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" font-weight="600" fill="#4f46e5">From $29 · MIT for open-source</text>
  </g>
  <g transform="translate(60,240)" stroke="#0c0a1a" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="0" y="0" width="60" height="60" rx="6"/>
    <circle cx="160" cy="30" r="30"/>
    <path d="M220 60 L220 0 L260 30 L300 0 L300 60"/>
    <rect x="340" y="0" width="60" height="60" rx="6"/>
    <circle cx="500" cy="30" r="30"/>
    <path d="M560 50 L560 10 L580 30 L600 10 L600 50"/>
    <rect x="640" y="0" width="60" height="60" rx="6"/>
    <circle cx="800" cy="30" r="30"/>
  </g>
  <g transform="translate(0, ${H - 100})">
    <rect x="60" y="0" width="${W - 120}" height="60" rx="12" fill="#0c0a1a"/>
    <text x="${W/2}" y="38" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" font-weight="700" fill="white" text-anchor="middle">github.com/razel369/asset-forge-bundle</text>
  </g>
`;

const files = [
  ["og-icons.svg", wrap("icons", grids)],
  ["og-illustrations.svg", wrap("ill", illustrations)],
  ["og-templates.svg", wrap("tpl", templates)],
  ["og-bundle.svg", wrap("bundle", bundle)],
];

for (const [name, content] of files) {
  writeFileSync(join(OUT, name), content);
}
console.log(`Wrote ${files.length} OG cards to ${OUT}`);
