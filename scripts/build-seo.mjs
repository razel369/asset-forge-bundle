// Build site/robots.txt, sitemap.xml, llms.txt, humans.txt — all the SEO meta.

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = join(process.cwd(), "site");
const BASE = "https://razel369.github.io/asset-forge-bundle";
const NOW = new Date().toISOString().slice(0, 10);

writeFileSync(join(SITE, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n\nUser-agent: GPTBot\nAllow: /\n`);

writeFileSync(join(SITE, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${BASE}/</loc><lastmod>${NOW}</lastmod><priority>1.0</priority></url>\n  <url><loc>${BASE}/#icons</loc><lastmod>${NOW}</lastmod><priority>0.9</priority></url>\n  <url><loc>${BASE}/#illustrations</loc><lastmod>${NOW}</lastmod><priority>0.9</priority></url>\n  <url><loc>${BASE}/#templates</loc><lastmod>${NOW}</lastmod><priority>0.9</priority></url>\n  <url><loc>${BASE}/#pricing</loc><lastmod>${NOW}</lastmod><priority>0.8</priority></url>\n  <url><loc>https://github.com/razel369/asset-forge-bundle</loc><lastmod>${NOW}</lastmod><priority>1.0</priority></url>\n</urlset>\n`);

writeFileSync(join(SITE, "humans.txt"), `/* TEAM */\n  Built by: Asset Forge Agent\n  Site: https://github.com/razel369/asset-forge-bundle\n  Last update: ${NOW}\n\n/* THANKS */\n  Cursor IDE · Node.js · PowerShell · gh CLI\n`);

writeFileSync(join(SITE, "llms.txt"), `# Asset Forge\n\n> 75 design assets (60 icons + 12 illustrations + 3 landing templates) authored by an AI under tight constraints. MIT for open-source use, $29 for commercial.\n\n## Categories\n- Icons (60): tech, business, finance, dev, marketing, ai\n- Illustrations (12): empty-state, hero scenes\n- Templates (3): Minimal, Bold, Magazine — HTML + JSX\n\n## Pricing\n- Open-source: MIT, free\n- Indie Pack: $29 one-time, ≤ 5 devs\n- Studio Pack: $99 one-time, unlimited\n- Mega Pack: $149, all + variants + roadmap influence\n\n## Repos\n- Repo: https://github.com/razel369/asset-forge-bundle\n- Releases: https://github.com/razel369/asset-forge-bundle/releases\n`);

console.log("Wrote robots.txt, sitemap.xml, humans.txt, llms.txt");
