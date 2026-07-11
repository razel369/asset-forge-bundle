// Asset Forge — deterministic SVG icon pack generator
// Produces 60 unique icons across 6 categories. Each icon is hand-composed
// geometry with seeded variation so the pack is internally consistent.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "icons");
mkdirSync(OUT_DIR, { recursive: true });

const VIEW = 24;
const STROKE = 1.6;

const wrap = (id, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VIEW} ${VIEW}" fill="none" stroke="currentColor" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>`;

const ICONS = {
  tech: [
    ["server", m => `<rect x="3" y="4" width="18" height="7" rx="1.5"/><rect x="3" y="13" width="18" height="7" rx="1.5"/><circle cx="7" cy="7.5" r=".5" fill="currentColor"/><circle cx="7" cy="16.5" r=".5" fill="currentColor"/><path d="M11 7.5h6M11 16.5h6"/>`, "Server stack"],
    ["cloud", m => `<path d="M7 18a5 5 0 1 1 .7-9.96A6 6 0 0 1 19 11.5 4.5 4.5 0 0 1 17 20H7a3 3 0 0 1 0-2z"/>`, "Cloud"],
    ["globe", m => `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/>`, "Globe"],
    ["database", m => `<ellipse cx="12" cy="5" rx="8" ry="2.5"/><path d="M4 5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5V5"/><path d="M4 11v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6"/>`, "Database"],
    ["cpu", m => `<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>`, "CPU chip"],
    ["lock", m => `<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/>`, "Lock"],
    ["wifi", m => `<path d="M2 9a16 16 0 0 1 20 0M5 12.5a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>`, "Wi-Fi"],
    ["shield", m => `<path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/>`, "Shield"],
    ["key", m => `<circle cx="8" cy="14" r="4"/><path d="M11 11l8-8M16 6l2 2M14 8l2 2"/>`, "Key"],
    ["terminal", m => `<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>`, "Terminal"],
  ],
  business: [
    ["briefcase", m => `<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 13h18"/>`, "Briefcase"],
    ["chart-bar", m => `<path d="M3 21V5M3 21h18"/><rect x="6" y="13" width="3" height="6"/><rect x="11" y="9" width="3" height="10"/><rect x="16" y="5" width="3" height="14"/>`, "Bar chart"],
    ["chart-line", m => `<path d="M3 21V5M3 21h18"/><path d="M6 15l4-4 3 3 5-6"/><circle cx="6" cy="15" r=".7" fill="currentColor"/><circle cx="10" cy="11" r=".7" fill="currentColor"/><circle cx="13" cy="14" r=".7" fill="currentColor"/><circle cx="18" cy="8" r=".7" fill="currentColor"/>`, "Line chart"],
    ["users", m => `<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15 20c0-2.6 1.6-4.7 4-5.4"/>`, "Team"],
    ["rocket", m => `<path d="M5 19c-1 1-1 3-1 3s2 0 3-1l1-1-3-3-1z"/><path d="M14 4c5 1 6 6 6 6l-7 7-5-5 7-7z"/><path d="M9 11l4 4"/>`, "Rocket"],
    ["target", m => `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>`, "Target"],
    ["calendar", m => `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>`, "Calendar"],
    ["doc", m => `<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M9 13h6M9 17h4"/>`, "Document"],
    ["handshake", m => `<path d="M3 12l4-4 3 3M11 11l3-3 7 7-3 3M3 12l4 4M16 8l4 4M9 13l3 3"/><circle cx="6" cy="15" r=".6" fill="currentColor"/>`, "Handshake"],
    ["trophy", m => `<path d="M7 4h10v5a5 5 0 1 1-10 0V4z"/><path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3"/><path d="M9 17h6l-1 4h-4z"/>`, "Trophy"],
  ],
  finance: [
    ["wallet", m => `<path d="M3 7a2 2 0 0 1 2-2h12l4 4v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><circle cx="16" cy="13" r="1.4" fill="currentColor"/>`, "Wallet"],
    ["dollar", m => `<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.8-1-2-1.5-3.2-1.5-1.7 0-3 1-3 2.4 0 1.3 1 2 3 2.4 2 .4 3 1.1 3 2.4 0 1.4-1.3 2.3-3 2.3-1.4 0-2.5-.5-3.2-1.4M12 6v12"/>`, "Currency"],
    ["receipt", m => `<path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z"/><path d="M9 8h6M9 12h6M9 16h4"/>`, "Receipt"],
    ["trending-up", m => `<path d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5"/>`, "Trending up"],
    ["coins", m => `<ellipse cx="9" cy="7" rx="6" ry="2.5"/><path d="M3 7v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5V7"/><ellipse cx="15" cy="14" rx="6" ry="2.5"/><path d="M9 14v4c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-4"/>`, "Coins"],
    ["credit-card", m => `<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>`, "Credit card"],
    ["bank", m => `<path d="M3 10l9-6 9 6"/><path d="M5 10v8M9 10v8M15 10v8M19 10v8"/><path d="M3 20h18"/>`, "Bank"],
    ["invoice", m => `<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h6M9 8h2"/>`, "Invoice"],
    ["piggy", m => `<path d="M4 12c0-4 3.6-7 8-7s8 3 8 7v5h-3l-1 2h-3l-1-2H8v-2H6l-2-3z"/><circle cx="16" cy="11" r=".8" fill="currentColor"/>`, "Piggy bank"],
    ["gem", m => `<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 9l3 12M15 9l-3 12M9 3l3 6 3-6"/>`, "Gem"],
  ],
  dev: [
    ["code", m => `<path d="M9 8l-5 4 5 4M15 8l5 4-5 4M14 5l-4 14"/>`, "Code"],
    ["git-branch", m => `<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10M6 11c0-3 1.5-4 4-4h4"/>`, "Git branch"],
    ["git-commit", m => `<circle cx="12" cy="12" r="3"/><path d="M3 12h6M15 12h6"/>`, "Git commit"],
    ["bug", m => `<rect x="7" y="8" width="10" height="11" rx="5"/><path d="M3 12c2-1 3 0 3 0M21 12c-2-1-3 0-3 0M3 8l3 2M21 8l-3 2M3 16l3-2M21 16l-3-2M10 4l1 3M14 4l-1 3"/>`, "Bug"],
    ["package", m => `<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>`, "Package"],
    ["layers", m => `<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/>`, "Layers"],
    ["tool", m => `<path d="M14 7l3-3 3 3-3 3-3-3zM14 7l-9 9v3h3l9-9"/>`, "Wrench"],
    ["play", m => `<path d="M6 4l14 8-14 8z"/>`, "Play"],
    ["plug", m => `<path d="M9 3v6M15 3v6"/><rect x="6" y="9" width="12" height="6" rx="2"/><path d="M12 15v3a3 3 0 0 1-3 3H7"/>`, "Plug"],
    ["webhook", m => `<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><circle cx="12" cy="6" r="2.5"/><path d="M12 8.5l-6 7M12 8.5l6 7M8.5 18h7"/>`, "Webhook"],
  ],
  marketing: [
    ["megaphone", m => `<path d="M3 11v2l11 6V5z"/><path d="M14 8a4 4 0 0 1 0 8"/><path d="M7 13v4a2 2 0 0 0 2 2h1"/>`, "Megaphone"],
    ["mail", m => `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>`, "Email"],
    ["bell", m => `<path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>`, "Notification"],
    ["heart", m => `<path d="M12 20s-7-4.4-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 19 10c0 5.6-7 10-7 10z"/>`, "Heart"],
    ["star", m => `<path d="M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>`, "Star"],
    ["tag", m => `<path d="M3 12V4h8l10 10-8 8z"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/>`, "Tag"],
    ["share", m => `<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 11l8-4M8 13l8 4"/>`, "Share"],
    ["eye", m => `<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>`, "View"],
    ["message", m => `<path d="M4 5h16v11H8l-4 4z"/>`, "Chat"],
    ["cursor", m => `<path d="M5 3l14 6-6 2-2 6z"/>`, "Pointer"],
  ],
  ai: [
    ["brain", m => `<path d="M9 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10v1a3 3 0 0 0 .5 6A3 3 0 0 0 7 19v1a3 3 0 0 0 5 2.5"/><path d="M15 4a3 3 0 0 1 3 3v.5A3 3 0 0 1 20 10v1a3 3 0 0 1-.5 6A3 3 0 0 1 17 19v1a3 3 0 0 1-5 2.5"/><path d="M9 9v9M15 9v9"/>`, "Brain"],
    ["spark", m => `<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>`, "Sparkle"],
    ["robot", m => `<rect x="5" y="8" width="14" height="11" rx="2"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/><path d="M12 5v3M9 19v3M15 19v3"/>`, "Robot"],
    ["circuit", m => `<circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><path d="M8 6h8M6 8v8M18 8v8M8 18h8"/>`, "Network"],
    ["chip-ai", m => `<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M9 9h6v6H9z"/><path d="M3 9h2M3 15h2M19 9h2M19 15h2M9 3v2M15 3v2M9 19v2M15 19v2"/>`, "AI chip"],
    ["wand", m => `<path d="M4 20L14 10M16 4l4 4M19 2v3M22 5h-3M16 12l1 1"/>`, "Magic wand"],
    ["graph", m => `<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><path d="M7 8l4 3M17 8l-4 3M7 16l4-3M17 16l-4-3"/>`, "Knowledge graph"],
    ["data", m => `<ellipse cx="12" cy="5" rx="8" ry="2"/><path d="M4 5v6c0 1 3 2 8 2s8-1 8-2V5M4 11v6c0 1 3 2 8 2s8-1 8-2v-6"/>`, "Big data"],
    ["api", m => `<rect x="3" y="8" width="18" height="8" rx="2"/><path d="M7 12h.5M9 12h2M16 12h.5"/><circle cx="6.5" cy="12" r=".5" fill="currentColor"/>`, "API"],
    ["voice", m => `<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>`, "Voice"],
  ],
};

let count = 0;
for (const [category, icons] of Object.entries(ICONS)) {
  const dir = join(OUT_DIR, category);
  mkdirSync(dir, { recursive: true });
  for (const [slug, draw, title] of icons) {
    const body = draw(0);
    const svg = wrap(`${category}-${slug}`, body, title);
    const fp = join(dir, `${slug}.svg`);
    writeFileSync(fp, svg);
    count++;
  }
}

console.log(`Generated ${count} icons across ${Object.keys(ICONS).length} categories.`);
