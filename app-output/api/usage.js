// /api/usage — returns today's used/remaining for a key.

const STORE = (globalThis.__ASSET_FORGE_STORE__ ||= { keys: {}, ledger: {} });
const FREE = 3000;

function loadLedger() { return STORE.ledger; }

export default async function handler(req, res) {
  const day = new Date().toISOString().slice(0, 10);
  const key = String(req.query.key || "");
  if (!key) return res.status(400).json({ error: "key required" });
  const ledger = loadLedger();
  const used = ledger?.[day]?.[key] || 0;
  const remaining = Math.max(0, FREE - used);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({
    key,
    date: day,
    used,
    remaining,
    free_tier: FREE,
    next_reset: "00:00 UTC tomorrow",
    upgrade: "/api/upgrade to remove quota",
  });
}
