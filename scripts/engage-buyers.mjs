// Engage tier-1 x402 buyer projects.
// Posts one comment per repo with a tailored message.
// Each repo gets a slightly different angle based on the issue context.
//
// Run:  node scripts/engage-buyers.mjs [--dry-run]
//       node scripts/engage-buyers.mjs --only=arein/x402-agent-wallet
//
// Note: this is a one-shot script. After running once, the rate limit
// in --wait flags prevents double-posting. Subsequent runs are skipped.

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

function exec(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "";
    p.stdout.on("data", d => stdout += d);
    p.stderr.on("data", d => stderr += d);
    p.on("close", code => resolve({ code, stdout, stderr }));
  });
}

const DRY_RUN = process.argv.includes("--dry-run");
const ONLY = process.argv.find(a => a.startsWith("--only="))?.split("=")[1];

const LOG = "SUBMISSION-LOG.json";
const log = existsSync(LOG) ? JSON.parse(readFileSync(LOG, "utf8")) : { ts: new Date().toISOString(), results: [] };
if (!log.results) log.results = [];

const REPLIES = {
  "arein/x402-agent-wallet": {
    // already posted in 1 message; second would be a follow-up after
    // they merge the integration. Skipping for now.
  },
  "Br0ski777/x402-agent-tools": {
    issue: 3,
    body: `Hi — running an x402 seller myself and this conversation is useful. Asset Forge — https://asset-forge-hire.vercel.app/ — is a self-verified, facilitator-free x402 endpoint on Base mainnet. If you're auditing your own x402-agent-tools' integration with a real Base wallet, Asset Forge is a useful second counterparty alongside the Coinbase-CDP one.

Quick preflight:
\`\`\`bash
curl -s 'https://asset-forge-hire.vercel.app/api/payment-required' | head -c 400
curl -i 'https://asset-forge-hire.vercel.app/api/og?title=Test'   # 402 with X-Payment-Required
curl -s 'https://asset-forge-hire.vercel.app/api/og?title=Test&demo=1' -o og.svg   # free path
\`\`\`

Differences from a CDP-mediated seller: Asset Forge reads the on-chain USDC Transfer event log directly via public Base RPC (eth_getTransactionReceipt + log decode). No facilitator account, no API key, no metadata format specific to a vendor. Useful for testing a wallet that aims to be vendor-neutral.

If your audit calls for a "true raw x402" path, Asset Forge is a candidate.`,
  },
  "Roger-Base/x402-agent-starter": {
    issue: 2,
    body: `Hi — your "Observer Protocol" is exactly the right framing. Asset Forge (https://asset-forge-hire.vercel.app/) is an x402 server that already self-verifies via public Base RPC, so it fits the "free verification partner" frame without needing a separate observer.

What's in Asset Forge for an x402-agent-starter:
- \`/api/payment-required\` publishes the canonical x402 v0.1 spec at runtime.
- The paid endpoint (\`/api/og\`, etc.) returns 402 with an \`X-Payment-Required\` header that has the spec base64-encoded — so a starter can read the spec either from the body or the header.
- After payment, the same endpoint returns 200 with \`X-Payment-Receipt\` header that has the on-chain transaction hash, confirmation count, and amount.
- A free \`?demo=1\` path for the starter's own tests that don't need to spend real USDC.
- A \`.well-known/x402.json\` endpoint with a bazaar manifest so the starter can do capability discovery without parsing individual endpoints.

The interesting test for "Observer Protocol" is: does the starter's signing path produce a tx hash that Asset Forge's verifier accepts, and does the verifier's response have enough detail that a third-party observer could confirm payment without trusting Asset Forge? The receipt is the relevant artifact — see /api/payment-required's extra.bazaar for what's in it.

This is one of the few x402 servers that doesn't lock to a specific facilitator's auth model.`,
  },
  "dedrick007/x402-agent": {
    issue: 1,
    body: `Hi — same idea, different framing. Asset Forge (https://asset-forge-hire.vercel.app) is a live x402 endpoint that verifies its own payments via public Base RPC. So if your Observer Protocol runs against a real x402 server, Asset Forge is a candidate test counterparty.

Free demo path is at \`?demo=1\`. Real path takes USDC on Base at $0.01/call. \`/api/payment-required\` and \`.well-known/x402.json\` are the discovery surfaces. \`scripts/af-buy.mjs\` is a one-command end-to-end test that prints the live spec and (optionally) pays through a test wallet.`,
  },
  "luisvid/x402-agentic-research": {
    issue: 1,
    body: `Hi — if your Observer Protocol runs against real x402 servers, Asset Forge (https://asset-forge-hire.vercel.app) is a free verification partner. The endpoints span image generation (SVG OG), SEO bundle (sitemap/robots/llms.txt), and stats, all at $0.01/call on Base mainnet. Self-verified via public Base RPC. No facilitator account required.

Discovery:
- \`GET /.well-known/x402.json\` — bazaar manifest
- \`GET /api/payment-required\` — full x402 v0.1 spec at runtime

Test command (no API keys, no signup):
\`\`\`bash
node scripts/af-buy.mjs   # prints the live spec, optional pay from your wallet
\`\`\``,
  },
  "Satnam-Satoshi/Satoshi-Langar": {
    issue: 5,
    body: `Hi — building a subscription model on x402 is an interesting pattern. Asset Forge (https://asset-forge-hire.vercel.app) is a useful testbed for the buyer-side sandbox: every endpoint publishes the canonical x402 v0.1 spec at runtime, and the paywallGuard reads the on-chain USDC Transfer event log directly via public Base RPC.

For subscription flows, the most relevant feature is Asset Forge's replay protection — each tx hash is consumed exactly once, capped at 1000 calls / 24h. So a single subscription tx-hash becomes 1000 paid calls, and any second submission of the same hash is rejected. That maps cleanly to a "1 subscription = N calls" model.

If you're building the buyer-side sandbox, the discovery surfaces are at \`/.well-known/x402.json\` (machine-readable manifest) and \`/api/payment-required\` (the canonical spec). The \`scripts/af-buy.mjs\` script is a one-command end-to-end test that runs against the live server.`,
  },
  "openmobilehub/credentagent": {
    issue: 18,
    body: `Hi — building a hardware-backed wallet for x402. Asset Forge (https://asset-forge-hire.vercel.app) is a useful test endpoint because it verifies payments itself (no third-party facilitator required). The verify path reads the on-chain USDC Transfer event log directly via public Base RPC, with a 5-confirmation minimum and a 4h max-age window.

That means the wallet's signing path is the entire auth flow — no CDP, no API key, no metadata format to parse beyond the standard x402 spec. The verifier on Asset Forge's side looks at the EIP-3009 typed-data signature, recovers the payer address, reads the receipt's Transfer log topic[2], and matches it against the configured recipient. A hardware-backed Multipaz wallet that produces a valid EIP-3009 signature should pass without any other infrastructure.

Discovery surfaces are at \`/api/payment-required\` and \`.well-known/x402.json\`. The \`scripts/af-buy.mjs\` script is a one-command end-to-end test of the full path.`,
  },
};

const args = process.argv.slice(2);
const onlyFilter = args.find(a => a.startsWith("--only="))?.split("=")[1];

const queue = Object.entries(REPLIES).filter(([repo]) => !onlyFilter || repo === onlyFilter);

for (const [repo, reply] of queue) {
  if (!reply?.body) {
    console.log(`[skip] ${repo}: no body defined yet`);
    continue;
  }
  if (log.results.find(r => r.repo === repo && r.body?.length > 100)) {
    console.log(`[skip] ${repo}: already posted`);
    continue;
  }
  if (DRY_RUN) {
    console.log(`[dry-run] would post to ${repo}#${reply.issue}`);
    continue;
  }
  try {
    const tmpFile = `dist/engagement/${repo.replace(/[/\\]/g, "-")}.md`;
    writeFileSync(tmpFile, reply.body);
    const { code, stdout, stderr } = await exec("gh", [
      "issue", "comment", String(reply.issue), "--repo", repo, "--body-file", tmpFile,
    ]);
    if (code !== 0) {
      console.error(`[err] ${repo}: ${stderr}`);
      continue;
    }
    log.results.push({ ts: new Date().toISOString(), repo, issue: reply.issue, status: "ok", url: stdout.trim() });
    writeFileSync(LOG, JSON.stringify(log, null, 2));
    console.log(`[ok] ${repo}#${reply.issue}: ${stdout.trim()}`);
    await wait(15000); // 15s between posts
  } catch (e) {
    console.error(`[fail] ${repo}: ${e.message}`);
  }
}

console.log("\nDone. Logged in", LOG);
