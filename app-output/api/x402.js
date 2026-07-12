// x402 — payment-required protocol for USDC on Base.
//
// Flow:
//   1. client requests paid endpoint
//   2. server returns 402 + X-Payment-Required header with payment-requirements
//   3. client pays USDC on Base to RECIPIENT
//   4. client retries with X-Payment: <tx-hash>
//   5. server verifies the on-chain transfer via Base RPC
//   6. server caches the tx-hash → marks key as paid for N calls
//
// Pricing: $0.01 per call (settles as 0.01 USDC = 10000 / 1e6 = 10000 units at USDC decimals).

import crypto from "node:crypto";

const BASE_RPC = "https://mainnet.base.org";
const USDC_BASE = "0x833589fCD6eDb6E08f27cDef3e17f0BFf37c601fc";
export const RECIPIENT = "0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e";
export const CALL_PRICE_USDC = "0.01";     // 1 cent per call

// ERC-20 Transfer(address,address,uint256) event signature topic
// = keccak256("Transfer(address,address,uint256)") = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f9aab9059a05c4e
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f9aab9059a05c4e";

// USDC uses 6 decimals. 1 USDC = 1_000_000 units.
function usdcToUnits(usdc) {
  // "0.01" → 10000
  const [whole, frac = ""] = String(usdc).split(".");
  const padded = (frac + "000000").slice(0, 6);
  return BigInt((whole || "0") + padded);
}

// Maximum age of a tx (4 hours). Blocks reduce reorg risk but do not eliminate it.
const MAX_TX_AGE_SECONDS = 60 * 60 * 4;
const MIN_CONFIRMATIONS = 5;

// Replay protection + receipt budget.
// A single USDC tx is consumed once per x402 call. The amount paid maps to
// "remaining calls" for that tx hash. We cache (in-memory) for 24h to
// refuse re-use without spending another on-chain RPC call.
//
// For real production durability, swap this for Upstash/Redis — but the
// in-memory cache gives correct semantics within a single lambda warm
// lifetime, which is what most agents will hit short-term.
const RECON = (globalThis.__X402_RECEIPT__ ||= new Map()); // txHash -> { callsLeft, expiresAt }

async function rpc(method, params) {
  const r = await fetch(BASE_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", method, params, id: 1 }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`RPC ${method}: ${j.error.message}`);
  return j.result;
}

// Build the canonical payment requirements spec a wallet signs/pays against.
// We follow the x402 draft: extends common HTTP 402 semantics. v0.1.
export function paymentRequirements({ resource, description }) {
  return {
    x402Version: "0.1.0",
    resource,
    description,
    accepts: [{
      scheme: "exact",
      network: "base",
      maxAmountRequired: usdcToUnits(CALL_PRICE_USDC).toString(), // integer units
      resource,
      description,
      mimeType: "application/json",
      payTo: RECIPIENT,
      asset: USDC_BASE,                                       // contract address on Base
      assetSymbol: "USDC",
      decimals: 6,
      outputSchema: { type: "object" },
      // `extra.bazaar` makes this endpoint discoverable by x402scan and Coinbase Bazaar.
      // Fields mirror Coinbase Bazaar Manifest v0.1 + x402scan schema (see x402-foundation/x402#2833).
      extra: {
        name: "USD Coin",
        version: "2",
        bazaar: {
          discoverable: true,
          serviceName: "Asset Forge",
          serviceSlug: "asset-forge",
          serviceDescription: description.slice(0, 280),
          serviceUrl: "https://asset-forge-hire.vercel.app",
          docsUrl: "https://asset-forge-hire.vercel.app/api-docs",
          repoUrl: "https://github.com/razel369/asset-forge-bundle",
          tags: ["developer-tools", "ai-agents", "no-signup", "usdc-on-base"],
          categories: ["data", "developer-tools", "asset-generation"],
          pricingModel: "per_call",
          callPriceUsdc: CALL_PRICE_USDC,
          baseUrl: "https://asset-forge-hire.vercel.app",
          endpoints: [
            { kind: "og",       path: "/api/og?title=X",                   demoFree: true },
            { kind: "sitemap",  path: "/api/sitemap?domain=X",            demoFree: true },
            { kind: "avatar",   path: "/api/transform?kind=avatar&name=X", demoFree: true },
            { kind: "badge",    path: "/api/transform?kind=badge&label=X&value=Y&status=passing", demoFree: true },
            { kind: "preview",  path: "/api/transform?kind=preview&url=X", demoFree: true, priceUsdc: "1" },
            { kind: "stats",    path: "/api/transform?kind=stats",           demoFree: true },
          ],
          signingStrategy: "self-verified",
          // Discovery anchors point at the public endpoints that prove the bazaar metadata
          // is real: /api/health lists what we ship, /api/payment-required emits this same shape.
          anchors: [
            { rel: "health",              href: "https://asset-forge-hire.vercel.app/api/health" },
            { rel: "payment-required",   href: "https://asset-forge-hire.vercel.app/api/payment-required" },
          ],
        },
      },
    }],
    userAgent: "asset-forge-hire",
    acceptRange: { asset: USDC_BASE, min: usdcToUnits(CALL_PRICE_USDC).toString() },
  };
}

// Build the 402 response. Returns headers + JSON body.
export function buildPaymentRequiredResponse({ resource, description }) {
  const req = paymentRequirements({ resource, description });
  // x402 v0.1: encode the requirements as base64url JSON in X-Payment-Required header
  // (also return the same JSON as body for clients that don't read headers).
  const encoded = Buffer.from(JSON.stringify(req)).toString("base64");
  return {
    status: 402,
    headers: {
      "X-Payment-Required": encoded,
      "Content-Type": "application/json",
    },
    body: req,
  };
}

// Verify a tx hash — pulled fresh from Base RPC. Caches result for 1h to avoid RPC repeat.
const VERIFY_CACHE = (globalThis.__X402_VERIFY__ ||= new Map());

async function verifyOnChain(txHash) {
  const cached = VERIFY_CACHE.get(txHash);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  const [tx, receipt] = await Promise.all([
    rpc("eth_getTransactionByHash", [txHash]),
    rpc("eth_getTransactionReceipt", [txHash]),
  ]);
  if (!tx || !receipt) throw new Error("tx not found");
  if (receipt.status !== "0x1") throw new Error("tx reverted");

  // Confirm it's USDC going to RECIPIENT
  if (tx.to && tx.to.toLowerCase() !== USDC_BASE.toLowerCase()) {
    throw new Error("tx is not USDC contract");
  }

  // Find the USDC Transfer log to RECIPIENT
  const transferLog = (receipt.logs || []).find((log) => {
    if (log.address.toLowerCase() !== USDC_BASE.toLowerCase()) return false;
    if (log.topics[0] !== TRANSFER_TOPIC) return false;
    // The `to` address is padded to 32 bytes in the 3rd topic.
    const paddedTo = "0x" + log.topics[2].slice(-40).toLowerCase();
    return paddedTo === RECIPIENT.toLowerCase();
  });
  if (!transferLog) throw new Error("no USDC transfer to RECIPIENT in logs");

  // data is the amount in 6-decimal integer units
  const amount = BigInt(transferLog.data);
  const need = usdcToUnits(CALL_PRICE_USDC);

  // Coinbase/Binance require minimum confirmations to defeat reorgs
  const tipHex = await rpc("eth_blockNumber", []);
  const confirmations = Number(BigInt(tipHex) - BigInt(receipt.blockNumber));
  if (confirmations < MIN_CONFIRMATIONS) {
    throw new Error(`only ${confirmations} confirmations, need ${MIN_CONFIRMATIONS}`);
  }

  // Tx age check (block.timestamp inside the tx ≈ moment of inclusion; we don't trust
  // node time so we approximate by currentTime - (block - tip) * 12s on Base)
  // Simpler: look up the block timestamp
  const block = await rpc("eth_getBlockByNumber", [receipt.blockNumber, false]);
  const txTime = Number(BigInt(block.timestamp)) * 1000;
  if (Date.now() - txTime > MAX_TX_AGE_SECONDS * 1000) {
    throw new Error("tx too old");
  }

  const result = { ok: true, amount: amount.toString(), need: need.toString(), confirmations };
  VERIFY_CACHE.set(txHash, { result, expiresAt: Date.now() + 60 * 60 * 1000 });
  return result;
}

// Reserve one call from a paid tx. Returns null if the tx has zero remaining
// calls (already spent, or replay attempt). Decrements callsLeft atomically.
function reserveCall(txHash) {
  const now = Date.now();
  const rec = RECON.get(txHash);
  if (!rec || rec.expiresAt <= now) {
    // Re-validate from cache. (Re-validation itself already paid the RPC,
    // so we just create a fresh receipt now.)
    return null;
  }
  if (rec.callsLeft <= 0) return null;
  rec.callsLeft -= 1;
  return rec;
}

// Public API used by /api/og, /api/sitemap etc.
//
// Returns one of:
//   { ok: true, receipt: {…}, callRemaining: N }  → request may proceed
//   { needPayment: true, response: { status, headers, body } } → caller returns 402
//   { error: "..." }                                   → 500-class
export async function paywallGuard(req, { resource, description, perCallUsdc = CALL_PRICE_USDC }) {
  const txHashHeader = req.headers["x-payment"];
  if (!txHashHeader) {
    const p = buildPaymentRequiredResponse({ resource, description });
    return { needPayment: true, response: { status: p.status, headers: p.headers, body: p.body } };
  }

  let txHash = String(txHashHeader).trim();
  if (txHash.startsWith("{")) {
    try { txHash = JSON.parse(txHash).txHash; } catch { /* fall through */ }
  }
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
    return { error: "X-Payment must be a 0x-prefixed 64-hex tx hash" };
  }

  // First check the local receipt cache (cheap path). Then do the on-chain
  // verify only on cache miss or first use.
  let receipt = reserveCall(txHash);
  if (receipt) {
    return { ok: true, receipt: { txHash, amount: receipt.amount, callsLeft: receipt.callsLeft, expiresAt: receipt.expiresAt } };
  }

  try {
    const v = await verifyOnChain(txHash);
    const amount = BigInt(v.amount);
    const need = usdcToUnits(perCallUsdc);
    if (amount < need) {
      return {
        error: `payment amount ${amount.toString()} (units) below required ${need.toString()} per call`,
        hint: "Send enough USDC for at least one call. Use /api/payment-required for the exact amount.",
      };
    }
    // Number of calls this tx covers: floor(amount / needPerCall), capped at 1000 to bound resource use
    const callsCovered = Math.min(1000, Number(amount / need));
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    const rec = { amount: amount.toString(), callsLeft: callsCovered - 1, callsCovered, expiresAt };
    RECON.set(txHash, rec);
    return {
      ok: true,
      receipt: { txHash, amount: amount.toString(), callsCovered, callsLeft: rec.callsLeft, expiresAt },
    };
  } catch (e) {
    return { error: `payment verification failed: ${e.message}` };
  }
}

// Public API used by /api/og, /api/sitemap etc.
//
// Returns one of:
//   { ok: true }            → request may proceed
//   { needPayment: true, response: { status, headers, body } } → caller returns 402
//   { error: "..." }        → 500
// Replay-protected version is above — the call below is the legacy one, kept
// for ABI compatibility with helpers that imported it.

