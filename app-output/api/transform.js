// /api/transform — bundled family of static SVGs and live URL fetch.
//   ?kind=preview&url=...              → /api/preview equivalent
//   ?kind=avatar&name=...&size=96      → /api/avatar equivalent
//   ?kind=badge&label=...&value=...&status=... → /api/badge equivalent
//   ?kind=stats                         → /api/stats equivalent (free)
//
// All `kind` modes with proof-of-payment need ?demo=1 for the free demo path;
// otherwise the default is paid via x402 USDC on Base.
//
// Consolidating into one function lets us stay under the Vercel Hobby plan
// limit of 12 serverless functions per deployment.

import { paywallGuard } from "./x402.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "X-Payment",
  "Access-Control-Expose-Headers": "X-Payment-Receipt, X-Payment-Required",
};

const STATS = (globalThis.__ASSET_FORGE_STATS__ ||= { byDay: {} });

// -------------------- preview --------------------
function safeUrl(s) {
  try {
    const u = new URL(String(s));
    if (!/^https?:$/.test(u.protocol)) return null;
    return u.toString();
  } catch { return null; }
}

function parseMetaTags(html, url) {
  const out = { url };
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  out.title = title ? title[1].trim() : "";
  const desc = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i);
  out.description = desc ? desc[1].trim() : "";
  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
  out.ogImage = ogImage ? ogImage[1].trim() : "";
  const favicon = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i);
  out.favicon = favicon ? favicon[1].trim() : "";
  out.hasOpenGraph = /<meta\s+property=["']og:/.test(html);
  return out;
}

async function fetchHtml(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": "asset-forge-transform/1.0 (+https://asset-forge-hire.vercel.app)" },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`target returned ${r.status}`);
  const ct = r.headers.get("content-type") || "";
  if (!ct.includes("text/html")) throw new Error(`target is not HTML (${ct})`);
  const text = await r.text();
  return text.slice(0, 512 * 1024);
}

const DEMO_HTML = `<!doctype html><html><head>
<title>Stripe — Payment Infrastructure for the Internet</title>
<meta name="description" content="Stripe is a financial infrastructure platform for businesses.">
<meta property="og:image" content="https://stripe.com/img/open-graph/logo.png">
<meta property="og:title" content="Stripe — Payments">
<link rel="icon" href="https://stripe.com/favicon.ico">
</head><body>Hello.</body></html>`;

// -------------------- avatar --------------------
const COLORS = [
  ["#fde68a", "#92400e"], ["#bfdbfe", "#1e3a8a"], ["#bbf7d0", "#166534"],
  ["#fbcfe8", "#9d174d"], ["#fecaca", "#7f1d1d"], ["#ddd6fe", "#5b21b6"],
  ["#a5f3fc", "#155e75"], ["#fed7aa", "#9a3412"],
];
function hashCode(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0; return Math.abs(h); }
function initials(name) {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function escapeXml(s) {
  return String(s).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
}

function buildAvatar(name, size, rounded) {
  const [bg, fg] = COLORS[hashCode(name) % COLORS.length];
  const W = size;
  const text = initials(name);
  const fontSize = Math.round(size * 0.45);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${W}" viewBox="0 0 ${W} ${W}">${
    rounded ? "" : `<rect width="${W}" height="${W}" fill="${bg}"/>`
  }${rounded ? `<circle cx="${W / 2}" cy="${W / 2}" r="${W / 2}" fill="${bg}"/>` : ""}<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${fontSize}" font-weight="700" fill="${fg}">${escapeXml(text)}</text></svg>`;
}

// -------------------- badge --------------------
const DEMO_PALETTE = {
  passing: "#22c55e", failing: "#ef4444", building: "#f59e0b",
  shipping: "#0ea5e9", default: "#475569",
};
function textWidth(text, fontSize) {
  return text.length * fontSize * 0.55;
}
function buildBadge(label, value, color) {
  const fontSize = 11, padX = 6, h = 20;
  const lw = Math.round(textWidth(label, fontSize) + padX * 2);
  const vw = Math.round(textWidth(value, fontSize) + padX * 2);
  const total = lw + vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${h}" width="${total}" height="${h}"><rect width="${lw}" height="${h}" fill="#555"/><rect x="${lw}" width="${vw}" height="${h}" fill="${color}"/><text x="${lw/2}" y="${h/2+fontSize/3}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${fontSize}" font-weight="600" fill="#fff">${escapeXml(label)}</text><text x="${lw + vw/2}" y="${h/2+fontSize/3}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${fontSize}" font-weight="600" fill="#fff">${escapeXml(value)}</text></svg>`;
}

// -------------------- stats --------------------
function readStats() {
  const days = Object.entries(STATS.byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([d, b]) => ({ date: d, total: b.totalCalls, demo: b.demoCalls, paid: b.paidCalls, unique_ips: b.uniqueIps.size }));
  const today = days.find(d => d.date === new Date().toISOString().slice(0, 10)) || { total: 0, demo: 0, paid: 0, unique_ips: 0 };
  const lifetime = days.reduce((a, d) => ({ total: a.total + d.total, demo: a.demo + d.demo, paid: a.paid + d.paid }), { total: 0, demo: 0, paid: 0 });
  return { today, lifetime, days_with_traffic: days.length };
}
function bumpStats(req, q) {
  const day = new Date().toISOString().slice(0, 10);
  const bucket = STATS.byDay[day] ||= { demoCalls: 0, paidCalls: 0, totalCalls: 0, uniqueIps: new Set() };
  bucket.totalCalls += 1;
  if (q && q.demo === "1") bucket.demoCalls += 1; else bucket.paidCalls += 1;
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  bucket.uniqueIps.add(ip);
}

// -------------------- dispatch --------------------
export default async function handler(req, res) {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
  if (req.method === "OPTIONS") return res.status(204).end();

  const q = req.query || {};
  const kind = String(q.kind || "").toLowerCase();

  // stats is free for everyone (gets bumped on every transform call)
  const trace = readStats();

  if (kind === "stats") {
    bumpStats(req, q);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ ...trace, note: "Aggregate only. No customer data, no payment amounts, no IPs." });
  }

  const isDemo = q.demo === "1" || q.demo === 1;
  let description, perCallUsdc = "0.01";

  if (kind === "preview") {
    description = "Fetch a URL and return parsed Open Graph meta. $1 USDC per call on Base.";
    perCallUsdc = "1";
    const url = q.url;
    if (!url) return res.status(400).json({ error: "url required", help: "GET /api/transform?kind=preview&url=…" });
    const safe = safeUrl(url);
    if (!safe) return res.status(400).json({ error: "url must be http(s)://..." });

    if (!isDemo) {
      const guard = await paywallGuard(req, {
        resource: "https://asset-forge-hire.vercel.app/api/transform?kind=preview",
        description,
      }, { perCallUsdc });
      if (guard.needPayment) { for (const [k, v] of Object.entries(guard.response.headers)) res.setHeader(k, v); return res.status(guard.response.status).json(guard.response.body); }
      if (guard.error) return res.status(402).json({ error: "Payment Required", detail: guard.error });
      res.setHeader("X-Payment-Receipt", JSON.stringify(guard.receipt || {}));
    }
    try {
      const html = isDemo ? DEMO_HTML : await fetchHtml(safe);
      bumpStats(req, q);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "public, max-age=300");
      return res.status(200).json(parseMetaTags(html, safe));
    } catch (e) {
      return res.status(502).json({ error: "fetch failed", detail: e.message });
    }
  }

  if (kind === "avatar") {
    description = "Generate one initials-based avatar SVG. $0.01 USDC per call on Base.";
    const name = String(q.name || "");
    const size = Math.max(16, Math.min(1024, parseInt(String(q.size || "96"), 10) || 96));
    const rounded = q.rounded === "1" || q.rounded === 1;
    if (!name) return res.status(400).json({ error: "name required", help: "GET /api/transform?kind=avatar&name=Mary%20Smith" });

    if (!isDemo) {
      const guard = await paywallGuard(req, {
        resource: "https://asset-forge-hire.vercel.app/api/transform?kind=avatar",
        description,
      }, { perCallUsdc });
      if (guard.needPayment) { for (const [k, v] of Object.entries(guard.response.headers)) res.setHeader(k, v); return res.status(guard.response.status).json(guard.response.body); }
      if (guard.error) return res.status(402).json({ error: "Payment Required", detail: guard.error });
      res.setHeader("X-Payment-Receipt", JSON.stringify(guard.receipt || {}));
    }
    bumpStats(req, q);
    const svg = buildAvatar(name, size, rounded);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.status(200).send(svg);
  }

  if (kind === "badge") {
    description = "Generate one shields.io-style status badge SVG. $0.01 USDC per call on Base.";
    const label = String(q.label || "build");
    const value = String(q.value || "passing");
    const status = String(q.status || "passing");

    if (!isDemo) {
      const guard = await paywallGuard(req, {
        resource: "https://asset-forge-hire.vercel.app/api/transform?kind=badge",
        description,
      }, { perCallUsdc });
      if (guard.needPayment) { for (const [k, v] of Object.entries(guard.response.headers)) res.setHeader(k, v); return res.status(guard.response.status).json(guard.response.body); }
      if (guard.error) return res.status(402).json({ error: "Payment Required", detail: guard.error });
      res.setHeader("X-Payment-Receipt", JSON.stringify(guard.receipt || {}));
    }
    bumpStats(req, q);
    const bg = DEMO_PALETTE[status] || DEMO_PALETTE.default;
    const svg = buildBadge(label, value, bg);
    res.setHeader("Content-Type", "image/svg+xml");
    res.setHeader("Cache-Control", "public, max-age=300");
    return res.status(200).send(svg);
  }

  return res.status(400).json({
    error: "kind required",
    kinds: ["preview", "avatar", "badge", "stats"],
    examples: [
      "GET /api/transform?kind=preview&url=https://stripe.com&demo=1",
      "GET /api/transform?kind=avatar?name=Mary%20Smith&size=128",
      "GET /api/transform?kind=badge&label=build&value=passing&status=passing",
      "GET /api/transform?kind=stats",
    ],
  });
}
