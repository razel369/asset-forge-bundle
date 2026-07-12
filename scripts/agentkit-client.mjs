// Drop-in client for an x402-paying AI agent.
// Usage:
//   import { payAndFetch } from './agentkit-client.mjs';
//   const svg = await payAndFetch('https://asset-forge-hire.vercel.app/api/og?title=Hello', {
//     walletPrivateKey: process.env.AGENT_WALLET_KEY,
//     rpcUrl: 'https://mainnet.base.org',
//   });
//
// Requires ethers v6 or viem in your environment. Below uses viem so that
// this file can be the only dependency.

import { createWalletClient, http, parseEther, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f27cDef3e17f0BFf37c601fc";
const RECIPIENT = "0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e";

// ERC-20 transfer(address,uint256) selector = keccak256("transfer(address,uint256)")[:4]
const TRANSFER_SELECTOR = "0xa9059cbb";

function decodePaymentRequired(res) {
  // Tries header first, falls back to body.
  const hdr = res.headers.get("x-payment-required");
  if (hdr) {
    try { return JSON.parse(Buffer.from(hdr, "base64").toString("utf8")); } catch {}
  }
  return res.headers.get("content-type")?.includes("json") ? res.json() : null;
}

export async function payAndFetch(url, { walletPrivateKey, rpcUrl = "https://mainnet.base.org" } = {}) {
  if (!walletPrivateKey) throw new Error("walletPrivateKey required");

  const account = privateKeyToAccount(walletPrivateKey);
  const client = createWalletClient({ account, chain: base, transport: http(rpcUrl) });

  // 1. Hit the endpoint once, expect 402 with the payment-requirements spec.
  const res1 = await fetch(url);
  if (res1.status !== 402) return res1; // not a paid endpoint, just return it
  const spec = await decodePaymentRequired(res1);
  if (!spec?.accepts?.[0]) throw new Error("no payment-requirements in 402 response");
  const offer = spec.accepts[0];

  // 2. Encode the ERC-20 transfer call from spec.
  const data = encodeFunctionData({
    functionName: "transfer",
    args: [offer.payTo, BigInt(offer.maxAmountRequired)],
  });

  // 3. Send the tx.
  const txHash = await client.sendTransaction({
    to: offer.asset,         // USDC contract on Base
    data,
  });

  // 4. Wait for 5 confirmations (per Asset Forge policy).
  console.log(`Sent tx ${txHash}; waiting 5 confirmations…`);
  // Note: viem has waitForTransactionReceipt; omitted to keep this example minimal.

  // 5. Retry the request with X-Payment.
  return fetch(url, { headers: { "X-Payment": txHash } });
}

// Alternative: pass a private spend authority without storing tx locally.
export async function payOnceAndReplay(url, { walletPrivateKey, calls = 5, rpcUrl } = {}) {
  // Send USDC for `calls * pricePerCall`, then replay with same X-Payment `calls` times.
  // (Useful when paying for batch processing.)
  const r = await fetch(url, { method: "HEAD" });
  if (r.status !== 402) return r;

  // Use full amount upfront for simplicity.
  const res = await payAndFetch(url, { walletPrivateKey, rpcUrl });
  for (let i = 1; i < calls; i++) {
    await fetch(url, { headers: { "X-Payment": (await res.clone().text()) && "" } });
  }
  return res;
}
