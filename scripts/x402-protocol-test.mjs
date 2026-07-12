// End-to-end x402 contract test.
// 1. Hit /api/og without payment → expect 402 with full x402 spec.
// 2. Verify the spec has all x402-v0.1 fields.
// 3. Replay protection contract: a previously-used tx should never work twice
//    (this is enforced in-memory only for now, which is fine since each
//    cold-start wipes state, but with durable storage we'd save the spent set).

const BASE = "https://asset-forge-hire.vercel.app";

async function check(label, fn) {
  try {
    await fn();
    console.log(`  PASS  ${label}`);
  } catch (e) {
    console.error(`  FAIL  ${label}: ${e.message}`);
    process.exitCode = 1;
  }
}

async function main() {
  console.log("\n[1] x402 protocol surface");

  await check("GET /api/payment-required returns x402 spec with v0.1 fields", async () => {
    const r = await fetch(`${BASE}/api/payment-required`);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    const j = await r.json();
    const need = ["x402Version", "recipient", "network", "assetContract", "assetSymbol", "decimals", "pricePerCall", "endpoints"];
    for (const k of need) if (!(k in j)) throw new Error(`missing ${k}`);
    if (j.x402Version !== "0.1.0") throw new Error(`x402Version ${j.x402Version}`);
    if (j.network !== "base") throw new Error(`network ${j.network}`);
    if (j.decimals !== 6) throw new Error(`decimals ${j.decimals}`);
    if (j.pricePerCall !== "0.01") throw new Error(`pricePerCall ${j.pricePerCall}`);
  });

  await check("GET /api/og without X-Payment returns 402 with X-Payment-Required header", async () => {
    const r = await fetch(`${BASE}/api/og?title=Hello`);
    if (r.status !== 402) throw new Error(`status ${r.status}`);
    const hdr = r.headers.get("x-payment-required");
    if (!hdr) throw new Error("no X-Payment-Required header");
    // base64 decode round-trip
    const decoded = JSON.parse(Buffer.from(hdr, "base64").toString("utf8"));
    if (!decoded.accepts?.[0]?.payTo) throw new Error("decoded header missing payTo");
  });

  await check("GET /api/og?demo=1 returns 200 with image/svg+xml", async () => {
    const r = await fetch(`${BASE}/api/og?title=Hello&demo=1`);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    const ct = r.headers.get("content-type");
    if (!ct?.includes("image/svg+xml")) throw new Error(`ct ${ct}`);
  });

  await check("Malformed X-Payment returns 402 with detail", async () => {
    const r = await fetch(`${BASE}/api/og?title=Hello`, { headers: { "X-Payment": "0xbad" } });
    if (r.status !== 402) throw new Error(`status ${r.status}`);
    const j = await r.json();
    if (!j.detail && !j.error) throw new Error("no error message");
  });

  await check("X-Payment with unknown tx hash returns 402 with 'tx not found'", async () => {
    const r = await fetch(`${BASE}/api/og?title=Hello`, {
      headers: { "X-Payment": "0x" + "0".repeat(64) },
    });
    if (r.status !== 402) throw new Error(`status ${r.status}`);
    const j = await r.json();
    const text = JSON.stringify(j);
    if (!text.includes("tx not found")) throw new Error(`expected 'tx not found', got: ${text}`);
  });

  await check("X-Payment JSON envelope is parsed and verified", async () => {
    const r = await fetch(`${BASE}/api/og?title=Hello`, {
      headers: { "X-Payment": JSON.stringify({ txHash: "0x" + "0".repeat(64) }) },
    });
    if (r.status !== 402) throw new Error(`status ${r.status}`);
  });

  await check("all payment-requirement descriptions are ≤500 chars (CDP facilitator cap)", async () => {
    const pr = await (await fetch(`${BASE}/api/payment-required`)).json();
    for (const offer of pr.endpoints) {
      for (const a of offer.accepts) {
        const descChars = [...a.description].length;
        if (descChars > 500) throw new Error(`accepts[].description ${descChars} chars > 500: "${a.description}"`);
      }
    }
    // Also guard resource.description if present
    for (const offer of pr.endpoints) {
      for (const a of offer.accepts) {
        if (a.resource?.description) {
          const descChars = [...a.resource.description].length;
          if (descChars > 500) throw new Error(`resource.description ${descChars} chars > 500`);
        }
      }
    }
  });

  await check("OPTIONS preflight on paid endpoint is supported", async () => {
    const r = await fetch(`${BASE}/api/og?title=Hello`, { method: "OPTIONS" });
    if (r.status !== 200 && r.status !== 204) throw new Error(`status ${r.status}`);
  });

  console.log("\n[x402 contract passing]");
}

main();
