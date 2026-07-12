// Generate deploy-manifest.json for the Vercel MCP.
// Lists every file we plan to push and its contents.

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";

const SRC = join(process.cwd(), "app-output");
const OUT = join(process.cwd(), "deploy-manifest.json");

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

function listFiles(rel) {
  const full = join(SRC, rel);
  const out = [];
  let st;
  try { st = statSync(full); } catch { return out; }
  if (st.isFile()) {
    return [rel];
  }
  for (const entry of readdirSync(full)) {
    out.push(...listFiles(`${rel}/${entry}`));
  }
  return out;
}

const all = [];
for (const k of keep) all.push(...listFiles(k));
all.push(...listFiles("og"));
for (const c of readdirSync(join(SRC, "icons"))) {
  let catSt;
  try { catSt = statSync(join(SRC, "icons", c)); } catch { continue; }
  if (!catSt?.isDirectory()) continue;
  // main line SVG only
  for (const f of readdirSync(join(SRC, "icons", c))) {
    if (f.endsWith(".svg") && !/\.(filled|bold|compact|round)\.svg$/.test(f)) {
      all.push(`icons/${c}/${f}`);
    }
  }
}
all.push(...listFiles("illustrations"));
all.push(...listFiles("templates"));

const uniq = [...new Set(all)];
const files = uniq.map(rel => {
  const data = readFileSync(join(SRC, rel), "utf8");
  return { file: rel.replaceAll("\\", "/"), data, encoding: "utf-8" };
});

writeFileSync(OUT, JSON.stringify({ files, total: files.length, totalBytes: files.reduce((s, f) => s + f.data.length, 0) }, null, 2));
console.log(JSON.stringify({ total: files.length, totalKB: Math.round(files.reduce((s, f) => s + f.data.length, 0) / 1024) }));
