// Audit all description strings in our codebase.
// We hit the 500-char cap on CDP facilitator; check that no description exceeds it.

import { readFileSync } from "node:fs";

const SOURCES = [
  "app-output/api/x402.js",
  "app-output/api/og.js",
  "app-output/api/sitemap.js",
  "app-output/api/transform.js",
  "app-output/api/upgrade.js",
  "app-output/api/payment-required.js",
];

let allGood = true;
for (const f of SOURCES) {
  try {
    const text = readFileSync(f, "utf8");
    const re = /description:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
    let m;
    while ((m = re.exec(text)) !== null) {
      const str = m[1];
      const len = [...str].length; // code points, like CDP's count
      const bytes = Buffer.byteLength(str, "utf8");
      const ok = len <= 500;
      if (!ok) allGood = false;
      console.log(`${f}:${m.index}  chars=${len}  bytes=${bytes}  ${ok ? "OK" : "OVER 500!!"}`);
      console.log(`   ${str.slice(0, 60)}…`);
    }
  } catch (e) {
    console.log(`Skip ${f}: ${e.message}`);
  }
}

console.log("\n" + (allGood ? "ALL DESCRIPTIONS UNDER 500 CHARS (CDP-safe)" : "FAIL — at least one description too long"));
process.exit(allGood ? 0 : 1);
