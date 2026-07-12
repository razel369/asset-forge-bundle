// CLI helper: signed-fetch for Asset Forge API.
// Usage:
//   export AF_KEY=af_live_xxxxx
//   export AF_SECRET=hexsecret...
//   node api/client.mjs og --title "Hi" --subtitle "World"
//
// Or import signedFetch from this file in your own scripts.

import crypto from "node:crypto";
import { readFileSync } from "node:fs";

const BASE = process.env.AF_BASE || "https://asset-forge-hire.vercel.app";

export function signedFetch(path, { method = "GET", body = null } = {}) {
  const key = process.env.AF_KEY;
  const secret = process.env.AF_SECRET;
  if (!key || !secret) throw new Error("Set AF_KEY and AF_SECRET env vars. Get them via GET /api/key");
  const t = Math.floor(Date.now() / 1000).toString();
  // Sign only the endpoint (no query string)
  const endpoint = path.split("?")[0];
  const payload = `${method} ${endpoint}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  const sep = path.includes("?") ? "&" : "?";
  const finalPath = `${path}${sep}key=${key}&t=${t}&sig=${sig}`;
  return fetch(`${BASE}${finalPath}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function getKey() {
  const r = await fetch(`${BASE}/api/key`);
  return r.json();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, ...rest] = process.argv.slice(2);
  const flags = Object.fromEntries(rest.reduce((acc, x, i, arr) => {
    if (x.startsWith("--")) acc[x.slice(2)] = arr[i + 1] || true;
    return acc;
  }, {}));
  if (cmd === "key") {
    const r = await getKey();
    console.log(JSON.stringify(r, null, 2));
  } else if (cmd === "og") {
    const params = new URLSearchParams(flags).toString();
    const r = await fetch(`${BASE}/api/og?${params}&demo=1`);
    const text = await r.text();
    if (flags.out) writeFileSync(flags.out, text);
    console.log(r.status, text.slice(0, 60), "...");
  } else {
    console.log("Usage: client.mjs key | og --title X --subtitle Y [--out file.svg]");
  }
}
