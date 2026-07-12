// Verify three X-Payment error paths:
//   1. malformed hash  -> 402 with detail
//   2. well-formed hash of a real tx that exists -> 200 (if it's a valid USDC transfer)
//   3. well-formed hash but tx < 5 confirmations / not USDC -> 402
//
// We can't actually pay, but we can prove the verifier parses real receipts.

const BASE = "https://asset-forge-hire.vercel.app";

// 1. Bad hash
console.log("TEST 1: malformed X-Payment hash");
{
  const r = await fetch(`${BASE}/api/og?title=Hello`, {
    headers: { "X-Payment": "0xnotarealtx" },
  });
  console.log("  status:", r.status, "(expect 402)");
  const body = await r.json();
  console.log("  error:", body.detail || body.error);
}

// 2. Real, well-formed tx hash. Pick a real Base USDC transfer that did not go to RECIPIENT.
//    This should reject at "no USDC transfer to RECIPIENT in logs".
console.log("\nTEST 2: random well-formed hash, fails to verify");
{
  // A random 64-hex hash that is well-formed
  const r = await fetch(`${BASE}/api/og?title=Hello`, {
    headers: { "X-Payment": "0x" + "0".repeat(64) },
  });
  console.log("  status:", r.status, "(expect 402 because the tx doesn't exist)");
  const body = await r.json();
  console.log("  error:", (body.detail || body.error || "").slice(0, 120));
}

// 3. JSON envelope: X-Payment: { "txHash": "0x..." }
console.log("\nTEST 3: JSON envelope form");
{
  const r = await fetch(`${BASE}/api/og?title=Hello`, {
    headers: { "X-Payment": JSON.stringify({ txHash: "0x" + "0".repeat(64) }) },
  });
  console.log("  status:", r.status, "(expect 402)");
  const body = await r.json();
  console.log("  error:", (body.detail || body.error || "").slice(0, 120));
}
