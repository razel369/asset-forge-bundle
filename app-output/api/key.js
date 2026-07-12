// /api/key — instantly mint a free HMAC key, returns JSON with secret.
// Tries to persist to /tmp for cross-instance lifetime.

import crypto from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const STORE = (globalThis.__ASSET_FORGE_STORE__ ||= { keys: {}, ledger: {} });
const TMP_FILE = "/tmp/asset-forge-keys.json";

function loadFromDisk() {
  try {
    if (existsSync(TMP_FILE)) {
      const data = JSON.parse(readFileSync(TMP_FILE, "utf8"));
      STORE.keys = { ...STORE.keys, ...data };
    }
  } catch {}
}

function saveToDisk() {
  try { writeFileSync(TMP_FILE, JSON.stringify(STORE.keys, null, 2)); } catch {}
}

let loaded = false;

export default async function handler(req, res) {
  if (!loaded) { loadFromDisk(); loaded = true; }

  const keys = STORE.keys;
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim()
          || req.socket?.remoteAddress
          || "unknown";

  const id = "af_live_" + crypto.randomBytes(12).toString("hex");
  const secret = crypto.randomBytes(32).toString("hex");
  keys[id] = { secret, ip, createdAt: new Date().toISOString() };
  saveToDisk();

  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    id,
    secret,
    note: "Private HMAC secret. Keep server-side. Signed quota: 100/day. Demo: ?demo=1 (shared quota, no signing).",
    signed_example: {
      endpoint: "GET /api/og",
      payload_to_sign: "GET /api/og",
      unix_seconds: Math.floor(Date.now() / 1000),
    },
    examples: [
      "curl 'https://asset-forge-hire.vercel.app/api/og?title=Hello&demo=1' -o og.svg",
      "curl 'https://asset-forge-hire.vercel.app/api/og?title=Hello&key=<id>&t=<unix>&sig=<hex>' -o og.svg",
    ],
    upgrade: "POST /api/upgrade to remove the quota (returns Stripe link when configured).",
  });
}
