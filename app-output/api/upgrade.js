// /api/upgrade - routes customers to upgrade paths AND handles Stripe checkout.
//
// GET /api/upgrade        -> JSON of all available paths (x402, Stripe, Ko-fi, etc.)
// POST /api/upgrade?action=checkout  -> creates a Stripe Checkout Session (returns URL)
// POST /api/upgrade?action=webhook  -> Stripe webhook receiver (for payment_intent.succeeded)
//
// All three routes share this file because they are part of the same payment path.

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || STRIPE_KEY;
const PRICE_CENTS_USD = 1; // $0.01 per call

// In-memory ledger for Stripe-paid receipts: receipt -> {tool, args, paidAt, ...}
// Production would use Upstash Redis.
const STRIPE_PAID = (globalThis.__ASSET_FORGE_STRIPE__ ||= new Map());

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Stripe-Signature");
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const action = (req.query?.action || "list").toString();

  // ----- LIST: returns the upgrade-paths catalog -----
  if (req.method === "GET" || action === "list") {
    res.setHeader("Cache-Control", "no-store");
    const options = {
      x402: {
        enabled: true,
        payment_required_endpoint: "https://asset-forge-hire.vercel.app/api/payment-required",
        instructions: "Read /api/payment-required first. Send 0.01 USDC on Base to 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e, then retry with X-Payment: 0x<txHash>.",
      },
      stripe: STRIPE_KEY ? { enabled: true, action: "POST /api/upgrade?action=checkout" } : (process.env.STRIPE_PAY_LINK || null),
      lemonsqueezy: process.env.LEMON_CHECKOUT_LINK || null,
      kofi: process.env.KOFI_LINK || "https://ko-fi.com/assetforge",
      github_sponsors: process.env.GH_SPONSORS_URL || "https://github.com/sponsors/razel369",
    };
    Object.keys(options).forEach(k => options[k] === null && delete options[k]);
    return res.status(200).json({
      preferred: "x402",
      reason: "x402 needs no human account. Send 0.01 USDC per call, retry with the hash.",
      options,
      bulk_discount: { "10_calls": "0.08 USDC", "100_calls": "0.7 USDC" },
      fixed_plan: { name: "Pro", price_per_month: "9 USDC", equivalent_calls: 900, overage: "0.01 USDC per call over quota" },
      hire_email: "mailto:hello@assetforge.dev",
    });
  }

  // ----- CHECKOUT: create a Stripe Checkout Session -----
  if (action === "checkout") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    if (!STRIPE_KEY) {
      return res.status(503).json({
        error: "Stripe payment not configured",
        hint: "Set STRIPE_SECRET_KEY env var to enable card payments. x402 (USDC) is the default path and works without Stripe.",
      });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const { tool = "asset_forge_og", args = {}, email } = body;
    if (!email) return res.status(400).json({ error: "email required for receipt delivery" });

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("payment_method_types[]", "card");
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "usd");
    params.set("line_items[0][price_data][unit_amount]", String(PRICE_CENTS_USD));
    params.set("line_items[0][price_data][product_data][name]", `Asset Forge: ${tool}`);
    params.set("line_items[0][price_data][product_data][description]", `One paid call to Asset Forge ${tool}`);
    params.set("success_url", `https://asset-forge-hire.vercel.app/thanks?session_id={CHECKOUT_SESSION_ID}`);
    params.set("cancel_url", `https://asset-forge-hire.vercel.app/`);
    params.set("metadata[tool]", tool);
    params.set("metadata[args]", JSON.stringify(args));
    params.set("metadata[buyer_email]", email);

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const session = await r.json();
    if (!r.ok) return res.status(502).json({ error: "stripe error", detail: session });
    return res.status(200).json({
      checkout_url: session.url,
      session_id: session.id,
      expires_at: session.expires_at,
      price_usd: PRICE_CENTS_USD / 100,
    });
  }

  // ----- WEBHOOK: Stripe posts back on payment_intent.succeeded -----
  if (action === "webhook") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    if (!STRIPE_KEY) return res.status(503).json({ error: "Stripe not configured" });

    const sig = req.headers["stripe-signature"];
    const payload = await req.text();
    if (!sig) return res.status(400).json({ error: "missing signature" });
    // Production: full HMAC-SHA256 verification with stripe library.
    // For prototype: sig must be present.

    let event;
    try { event = JSON.parse(payload); }
    catch { return res.status(400).json({ error: "invalid JSON" }); }

    if (event.type !== "checkout.session.completed") {
      return res.status(200).json({ ignored: true });
    }

    const session = event.data.object;
    const buyerEmail = session.metadata?.buyer_email;
    const tool = session.metadata?.tool || "asset_forge_og";
    const args = session.metadata?.args || "{}";

    const receipt = `afp_${session.id}`;
    STRIPE_PAID.set(receipt, {
      tool,
      args: JSON.parse(args),
      email: buyerEmail,
      amountCents: session.amount_total,
      paidAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return res.status(200).json({ received: true, receipt });
  }

  return res.status(400).json({ error: `unknown action: ${action}` });
}
