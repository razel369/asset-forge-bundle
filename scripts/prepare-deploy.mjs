// Prepare a focused deploy payload for Vercel.
// Strips everything that isn't part of the live web app.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const SRC = join(process.cwd(), "app-output");
const OUT = join(process.cwd(), "deploy");

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.endsWith(".svg")) {
      out.push(full);
    }
  }
  return out;
}

// Keep these (the actual web app)
const keep = new Set([
  "index.html",
  "hire.html",
  "vercel.json",
  "package.json",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "humans.txt",
  "api/contact.js",
]);

// Include OG images (for social preview)
const ogFiles = readdirSync(join(SRC, "og")).map(f => `og/${f}`);

// Include only the "main" line SVG per icon (60 total) for preview deploy
const iconsToInclude = [];
for (const cat of readdirSync(join(SRC, "icons"))) {
  const catPath = join(SRC, "icons", cat);
  try {
    if (!statSync(catPath).isDirectory()) continue;
  } catch { continue; }
  for (const file of readdirSync(catPath)) {
    // main line variant has no extra suffix
    if (file.endsWith(".svg") && !/\.(filled|bold|compact|round)\.svg$/.test(file) && statSync(join(catPath, file)).isFile()) {
      iconsToInclude.push(`icons/${cat}/${file}`);
    }
  }
}

// Include templates/html for showcase
const templates = readdirSync(join(SRC, "templates", "html")).map(f => `templates/html/${f}`);

// Skip illustrations from this preview to keep payload small (can be added later)
const illustrations = [];
for (const file of readdirSync(join(SRC, "illustrations"))) {
  illustrations.push(`illustrations/${file}`);
}

const selection = [
  ...keep,
  ...ogFiles,
  ...iconsToInclude,
  ...templates,
  ...illustrations,
];

let total = 0;
const fileList = [];
for (const rel of new Set(selection)) {
  const full = join(SRC, rel);
  try {
    const st = statSync(full);
    total += st.size;
    fileList.push({ rel, size: st.size });
  } catch {}
}

console.log(JSON.stringify({ count: fileList.length, totalKB: Math.round(total / 1024), sample: fileList.slice(0, 5) }, null, 2));
