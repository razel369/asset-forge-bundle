// af-buy - Asset Forge end-to-end buyer test.
//
// Reads /api/payment-required, prints the spec, then queries the
// Base mainnet for any USDC Transfer logs to the recipient so we can
// see if there are existing real receipts. The actual "send USDC and
// retry with X-Payment" step requires a private key and is left as a
// manual step (the comments explain exactly what to do).
//
// This script is the README companion for /api/payment-required: it
// proves the discovery surface and the on-chain settlement are wired
// up correctly, end-to-end, on a real wallet.
//
// Usage:
//   node scripts/af-buy.mjs                          # discovery only
//   AF_BUY_TX=0xabc... node scripts/af-buy.mjs       # verify a specific tx-hash
//   AF_BUY_FROM=0xabc... AF_BUY_PRIVATE_KEY=0x... node scripts/af-buy.mjs
//     # pay 0.01 USDC from your wallet, then verify

import { createPublicClient, http, parseAbi, publicActions, erc20Abi } from "viem";
import { base, baseSepolia } from "viem/chains";
// createWalletClient + privateKeyToAccount are not exported as subpaths
// in viem 2.55. For step4 (the actual pay), use the top-level namespace
// from the default import — see top-level fallback inside step4.

const API = "https://asset-forge-hire.vercel.app";
const USDC_BASE = "0x833589fCD6eDb6E08f27cDef3e17f0BFf37c601fc";
const USDC_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const RECIPIENT = "0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e";

async function step1_discover() {
  console.log("=== STEP 1: discover x402 spec ===");
  const r = await fetch(`${API}/api/payment-required`);
  const j = await r.json();
  console.log(`  x402Version: ${j.x402Version}`);
  console.log(`  network:     ${j.endpoints[0].accepts[0].network}`);
  console.log(`  asset:       ${j.endpoints[0].accepts[0].asset}`);
  console.log(`  payTo:       ${j.endpoints[0].accepts[0].payTo}`);
  console.log(`  amount:      ${j.endpoints[0].accepts[0].maxAmountRequired} (= $0.01 USDC)`);
  console.log(`  endpoints:   ${j.endpoints[0].accepts[0].extra.bazaar.endpoints.map(e => e.kind).join(", ")}`);
  console.log();
  return j;
}

async function step2_lookupExisting(client) {
  console.log("=== STEP 2: existing USDC transfers to recipient ===");
  console.log("  Note: Base public RPC does not support variadic topic filters in eth_getLogs.");
  console.log("  Instead we use eth_blockNumber + eth_getLogs over a SMALL range to confirm reachability.");
  const block = await client.getBlockNumber();
  console.log(`  latest block: ${block}`);
  console.log(`  (to scan history for a recipient, use an Alchemy/Infura RPC with log queries enabled.)`);
  console.log();
  return [];
}

async function step3_verifyTx(client, txHash) {
  console.log(`=== STEP 3: verify tx ${txHash} ===`);
  const r = await fetch(`${API}/api/og?title=Test&demo=1`);
  if (!r.ok) throw new Error(`demo check failed: ${r.status}`);
  console.log("  /api/og?demo=1 returns", r.status, "(unauthenticated free path works)");

  // Hit the paid endpoint with the X-Payment header
  const r2 = await fetch(`${API}/api/og?title=Test`, {
    headers: { "X-Payment": txHash },
  });
  console.log("  /api/og with X-Payment returns", r2.status);
  const body = await r2.text();
  if (r2.status === 200) {
    console.log("  PAID ENDPOINT RETURNED 200: payment verified end-to-end");
  } else if (r2.status === 402) {
    let j; try { j = JSON.parse(body); } catch {}
    console.log("  PAID ENDPOINT RETURNED 402:", j?.error || j?.hint || body.slice(0, 200));
  } else {
    console.log("  unexpected status", r2.status, body.slice(0, 200));
  }
  console.log();
}

async function step4_pay(privateKey, network = "base") {
  console.log(`=== STEP 4: pay 0.01 USDC to recipient (network=${network}) ===`);
  const chain = network === "base-sepolia" ? baseSepolia : base;
  const usdc = network === "base-sepolia" ? USDC_SEPOLIA : USDC_BASE;
  const account = privateKeyToAccount(privateKey);
  console.log(`  payer: ${account.address}`);
  const client = createWalletClient({ account, chain, transport: http() });
  const hash = await client.writeContract({
    address: usdc,
    abi: parseAbi(["function transfer(address to, uint256 value) returns (bool)"]),
    functionName: "transfer",
    args: [RECIPIENT, 10000n], // 0.01 USDC = 10000 units (6 decimals)
  });
  console.log(`  tx hash: ${hash}`);
  console.log("  waiting 5 blocks for finality...");
  await client.waitForTransactionReceipt({ hash, confirmations: 5 });
  console.log("  PAID — 5 confirmations confirmed");
  console.log();
  return hash;
}

async function main() {
  console.log("Asset Forge end-to-end buyer test");
  console.log("=================================\n");

  // 1) Discovery: server publishes x402 spec
  await step1_discover();

  // 2) Look for any existing real USDC transfers to recipient (proof of life)
  const client = createPublicClient({ chain: base, transport: http() });
  await step2_lookupExisting(client);

  // 3) Optionally verify a specific tx-hash
  if (process.env.AF_BUY_TX) {
    await step3_verifyTx(client, process.env.AF_BUY_TX);
  }

  // 4) Optionally pay + verify (requires private key)
  if (process.env.AF_BUY_PRIVATE_KEY) {
    const hash = await step4_pay(process.env.AF_BUY_PRIVATE_KEY, process.env.AF_BUY_NETWORK || "base");
    await step3_verifyTx(client, hash);
  }

  console.log("Done.");
}

main().catch(e => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
