// Verify the 402 response body and check for x-payment-required header.
const BASE = "https://asset-forge-hire.vercel.app";
const url = `${BASE}/api/og?title=Hello`;

const r = await fetch(url);
console.log("status:", r.status);
console.log("x-payment-required header:", r.headers.get("x-payment-required") ? "present (base64-encoded JSON)" : "MISSING");
const body = await r.json();
console.log("\n402 body parsed:");
console.log(JSON.stringify(body, null, 2));

// The accepts[0] is exactly what x402 wallets consume.
const req = body.accepts[0];
console.log("\nSummary:");
console.log("  payTo:", req.payTo);
console.log("  amount:", req.maxAmountRequired, "(= 0.01 USDC at 6 decimals)");
console.log("  asset:", req.asset, "(USDC on Base)");
console.log("  resource:", req.resource);
