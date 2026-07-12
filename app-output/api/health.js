// /api/health — returns uptime + endpoint status.

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    ok: true,
    name: "Asset Forge API",
    version: "1.0.0",
    endpoints: [
      "GET  /api/key        — mint a free HMAC key",
      "GET  /api/og          — SVG OG card generator (?demo=1 or signed)",
      "GET  /api/sitemap?domain=X — robots + sitemap + llms.txt",
      "POST /api/upgrade    — payment link for unlimited",
      "GET  /api/usage?key=X — quota ledger",
      "GET  /api/health      — this",
    ],
    pricing: { free_tier: "100 calls/day/key", paid: "$9/mo unlimited" },
    auth: "HMAC SHA-256, header-equivalent in ?key=…&t=<unix>&sig=<hex>",
    timestamp: new Date().toISOString(),
  });
}
