// Asset #2 — Empty-state / hero SVG illustration pack (12 illustrations)
// Hand-composed geometric scenes for "no data", "success", "search", etc.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "illustrations");
mkdirSync(OUT_DIR, { recursive: true });

const VIEW = 480;
const wrap = (id, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;

const ILL = [
  ["empty-box", "Empty box",
    `<ellipse cx="240" cy="380" rx="160" ry="14"/><path d="M120 200l120-40 120 40v160l-120 40-120-40z"/><path d="M120 200l120 60 120-60M240 260v160"/>`],
  ["no-data", "No data yet",
    `<circle cx="240" cy="180" r="90"/><path d="M150 270v60h180v-60"/><path d="M210 180a30 30 0 1 1 60 0c0 17-15 23-30 33M240 240v.01"/>`],
  ["search", "Search results",
    `<circle cx="200" cy="200" r="110"/><path d="M280 280l90 90"/><path d="M160 200h80M160 200l40-40 40 40"/>`],
  ["success-check", "Success",
    `<circle cx="240" cy="240" r="120"/><path d="M170 240l50 50 100-110"/><path d="M120 140l-20-20M360 140l20-20M80 240l-30 0M420 240l30 0M240 60l0-30"/>`],
  ["error", "Error",
    `<path d="M240 80l160 280H80z"/><path d="M240 180v60M240 270v.01"/>`],
  ["loading", "Loading",
    `<circle cx="240" cy="240" r="120"/><path d="M240 120a120 120 0 0 1 120 120" stroke-dasharray="20 12"/>`],
  ["offline", "Offline",
    `<path d="M60 200a240 240 0 0 1 360 0M120 250a160 160 0 0 1 240 0M180 300a80 80 0 0 1 120 0"/><circle cx="240" cy="370" r="14"/>`],
  ["astronaut", "Astronaut",
    `<circle cx="240" cy="200" r="80"/><path d="M180 280c0 60 30 100 60 100s60-40 60-100"/><circle cx="240" cy="200" r="36"/><path d="M220 200a8 8 0 1 1 16 0M244 200a8 8 0 1 1 16 0"/>`],
  ["rocket-fly", "Rocket launching",
    `<path d="M240 60c70 0 90 80 90 160l-90 80-90-80c0-80 20-160 90-160z"/><circle cx="240" cy="190" r="22"/><path d="M180 280l-50 30 30 30 30-30M300 280l50 30-30 30-30-30M220 380l20 60 20-60"/>`],
  ["growth", "Growth chart",
    `<path d="M60 380h360M60 380V80"/><path d="M100 320l80-80 60 60 80-130 80 30"/><circle cx="100" cy="320" r="6" fill="currentColor"/><circle cx="180" cy="240" r="6" fill="currentColor"/><circle cx="240" cy="300" r="6" fill="currentColor"/><circle cx="320" cy="170" r="6" fill="currentColor"/><circle cx="400" cy="200" r="6" fill="currentColor"/>`],
  ["team", "Team collaboration",
    `<circle cx="160" cy="180" r="40"/><circle cx="320" cy="180" r="40"/><path d="M80 320c0-44 36-80 80-80s80 36 80 80"/><path d="M240 320c0-44 36-80 80-80s80 36 80 80"/><circle cx="240" cy="120" r="40"/><path d="M160 220l80-60 80 60"/>`],
  ["welcome", "Welcome",
    `<path d="M100 240c0-80 60-140 140-140s140 60 140 140v80H100z"/><path d="M180 290c0-30 25-50 60-50s60 20 60 50"/><path d="M210 200a10 10 0 1 1 20 0M250 200a10 10 0 1 1 20 0"/>`],
];

let count = 0;
for (const [slug, title, body] of ILL) {
  const svg = wrap(slug, body, title);
  const fp = join(OUT_DIR, `${slug}.svg`);
  writeFileSync(fp, svg);
  count++;
}
console.log(`Generated ${count} illustrations.`);
