// Asset Forge — variant generator
// Reads existing icons and produces 3 style variants per icon:
//   filled.svg   - solid fill, no stroke
//   bold.svg     - heavy stroke (2.6)
//   compact.svg  - light stroke (1.0)
//   round.svg    - rounded line-caps emphasis (suffix "_round")
// Output: icons/<category>/<slug>/<slug>.svg  +  <slug>.filled.svg  + ...

import { readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

let produced = 0;
for (const cat of readdirSync(join(ROOT, "icons"))) {
  const catDir = join(ROOT, "icons", cat);
  let isDir = false;
  try { isDir = statSync(catDir).isDirectory(); } catch { continue; }
  if (!isDir) continue;
  for (const file of readdirSync(catDir)) {
    if (!file.endsWith(".svg")) continue;
    const slug = file.replace(/\.svg$/, "");
    const src = readFileSync(join(catDir, file), "utf8");
    const filled = src
      .replace(/fill="none"/g, 'fill="currentColor"')
      .replace(/stroke="currentColor"/g, 'fill="currentColor"')
      .replace(/<title>[^<]+<\/title>/, "");
    const bold = src.replace(/stroke-width="1.6"/, 'stroke-width="2.6"');
    const compact = src.replace(/stroke-width="1.6"/, 'stroke-width="1.0"');
    const round = src
      .replace(/stroke-linecap="round"/, 'stroke-linecap="round"')
      .replace(/<svg ([^>]+)>/, '<svg $1 stroke-linecap="round" stroke-linejoin="round">');
    const subDir = join(catDir, slug);
    mkdirSync(subDir, { recursive: true });
    // Inside the new dir, the "main" file becomes <slug>.svg and variants are siblings.
    writeFileSync(join(subDir, `${slug}.svg`), src);
    writeFileSync(join(subDir, `${slug}.filled.svg`), filled);
    writeFileSync(join(subDir, `${slug}.bold.svg`), bold);
    writeFileSync(join(subDir, `${slug}.compact.svg`), compact);
    writeFileSync(join(subDir, `${slug}.round.svg`), round);
    // Keep the legacy path working: a same-named .svg alongside the dir
    writeFileSync(join(catDir, `${slug}.filled.svg`), filled);
    writeFileSync(join(catDir, `${slug}.bold.svg`), bold);
    writeFileSync(join(catDir, `${slug}.compact.svg`), compact);
    writeFileSync(join(catDir, `${slug}.round.svg`), round);
    produced += 5;
  }
}

console.log(`Wrote ${produced} variant files.`);
