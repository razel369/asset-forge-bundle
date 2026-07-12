// /api/og — minimal SVG generator.
// Demo (free) flag: ?demo=1 — shared 3,000/day quota.
// Paid (x402): client pays USDC on Base, retries with X-Payment: <tx hash>.

import crypto from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { paywallGuard } from "./x402.js";

const FREE_TIER = 3000;
const TMP_FILE = "/tmp/asset-forge-keys.json";

function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const STORE = (globalThis.__ASSET_FORGE_STORE__ ||= { keys: {}, ledger: {} });
let diskLoaded = false;
function loadFromDisk() {
  try {
    if (existsSync(TMP_FILE)) {
      const data = JSON.parse(readFileSync(TMP_FILE, "utf8"));
      STORE.keys = { ...STORE.keys, ...data };
    }
  } catch {}
}

function verifyHMAC(method, path, query, secret) {
  const { key, t, sig } = query;
  if (!key || !t || !sig) return false;
  const ts = parseInt(t, 10);
  if (Number.isNaN(ts) || Math.abs(Date.now() - ts * 1000) > 5 * 60 * 1000) return false;
  const endpoint = String(path).split("?")[0];
  const payload = `${method} ${endpoint}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch (e) { return false; }
}

function buildSvg(t, s, a, u) {
  const W = 1200, H = 630;
  return '<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '"><rect width="' + W + '" height="' + H + '" fill="#fbfafd"/><rect x="0" y="0" width="' + W + '" height="6" fill="#4f46e5"/><text x="60" y="120" font-family="ui-sans-serif, system-ui, sans-serif" font-size="40" font-weight="700" fill="#0c0a1a">' + escapeXml(t.slice(0, 80)) + '</text><text x="60" y="180" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" fill="#6b6680">' + escapeXml(s.slice(0, 120)) + '</text>' + (a ? '<text x="60" y="600" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" fill="#6b6680">— ' + escapeXml(a.slice(0, 60)) + '</text>' : "") + '<rect x="60" y="' + (H - 80) + '" width="' + (W - 120) + '" height="56" rx="12" fill="#0c0a1a"/><text x="' + (W / 2) + '" y="' + (H - 44) + '" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20" font-weight="600" fill="white" text-anchor="middle">' + escapeXml((u || "asset-forge.dev").replace(/^https?:\/\//, "").slice(0, 60)) + "</text></svg>";
}

export default async function handler(req, res) {
  try {
    if (!diskLoaded) { loadFromDisk(); diskLoaded = true; }

    const q = req.query || {};
    const title = String(q.title || "");
    if (!title) return res.status(400).json({ error: "title required" });

    const isDemo = q.demo === "1" || q.demo === 1;
    const ledger = STORE.ledger;

    // Paid path: x402 / USDC on Base
    if (!isDemo) {
      const guard = await paywallGuard(req, {
        resource: "https://asset-forge-hire.vercel.app/api/og",
        description: "Generate one SVG OG card. $0.01 USDC per call on Base.",
      });
      if (guard.needPayment) {
        for (const [k, v] of Object.entries(guard.response.headers)) res.setHeader(k, v);
        return res.status(guard.response.status).json(guard.response.body);
      }
      if (guard.error) {
        return res.status(402).json({
          error: "Payment Required",
          detail: guard.error,
          hint: "Retry with X-Payment: 0x<txHash> after paying 0.01 USDC to the address in /api/payment-required",
        });
      }
      res.setHeader("X-Payment-Receipt", JSON.stringify(guard.receipt || {}));
    } else {
      // Demo path stays free with the public quota
      const demoKey = "_demo";
      const day = todayKey();
      ledger[day] ||= {};
      ledger[day][demoKey] = (ledger[day][demoKey] || 0) + 1;
      if (ledger[day][demoKey] > FREE_TIER) {
        return res.status(402).json({
          error: "Free tier (demo) reached. Pay 0.01 USDC per call to skip the queue.",
          upgrade: "Send USDC on Base to the address in /api/payment-required",
        });
      }
    }

    const svg = buildSvg(title, String(q.subtitle || ""), String(q.author || ""), String(q.url || ""));
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(svg);
  } catch (e) {
    return res.status(500).json({ error: "internal", message: String((e && e.message) || e).slice(0, 200) });
  }
}
