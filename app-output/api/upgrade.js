// /api/upgrade — routes customers to the cheapest available upgrade path.
//
// Order of preference:
//   1. x402 (USDC on Base) — always available, no env needed
//   2. Stripe Payment Link — if STRIPE_PAY_LINK env set
//   3. LemonSqueezy — if LEMON_CHECKOUT_LINK env set
//   4. Ko-fi / GitHub Sponsors — manual fallback

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const options = {
    x402: {
      enabled: true,
      payment_required_endpoint: "https://asset-forge-hire.vercel.app/api/payment-required",
      instructions: "Read /api/payment-required first. Send 0.01 USDC on Base to 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e, then retry with X-Payment: 0x<txHash>.",
    },
    stripe: process.env.STRIPE_PAY_LINK || null,
    lemonsqueezy: process.env.LEMON_CHECKOUT_LINK || null,
    kofi: process.env.KOFI_LINK || "https://ko-fi.com/assetforge",
    github_sponsors: process.env.GH_SPONSORS_URL || "https://github.com/sponsors/razel369",
  };
  Object.keys(options).forEach(k => options[k] === null && delete options[k]);

  // If x402 is the only option, return 200 with how-to. Otherwise 200 with all paths.
  return res.status(200).json({
    preferred: "x402",
    reason: "x402 needs no human account. Send 0.01 USDC per call, retry with the hash.",
    options,
    bulk_discount: { "10_calls": "0.08 USDC", "100_calls": "0.7 USDC" },
    fixed_plan: {
      name: "Pro",
      price_per_month: "9 USDC",
      equivalent_calls: 900,
      overage: "0.01 USDC per call over quota",
    },
    hire_email: "mailto:hello@assetforge.dev",
  });
}
