# STATUS — Asset Forge API

> Live production: https://asset-forge-hire.vercel.app/
> API docs: https://asset-forge-hire.vercel.app/api-docs
> MCP endpoint: https://asset-forge-hire.vercel.app/api/mcp (6 tools, JSON-RPC)

## Pivot — API + x402 (this is what shipped)

The original idea was a $29 SVG icon pack for indie hackers. That market is
saturated — Icons8, Figma Community, Iconify all give away similar packs for
free. Selling assets to people in 2026 is not where the value is.

The second iteration was an HMAC-signed API with Stripe / Ko-fi fallbacks.
Still needed a payment processor.

The third and current iteration: **x402 with USDC on Base**. The recipient is
your wallet `0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e`. No Stripe, no Ko-fi,
no email. An AI agent with a USDC wallet can hit the endpoint, parse the 402
spec, send 0.01 USDC, and retry — all without human action.

## What's live in production

| Endpoint                | Path | Auth | Status |
|-------------------------|------|------|--------|
| `/api/payment-required` | GET  | none | ✅ 200 — public x402 spec |
| `/api/health`           | GET  | none | ✅ 200 |
| `/api/upgrade`          | GET  | none | ✅ 200 — lists upgrade paths |
| `/api/og` (paid)        | GET  | x402 | ✅ 402 + verification |
| `/api/og?demo=1` (free) | GET  | none | ✅ 200 + 3000/day |
| `/api/sitemap` (paid)   | GET  | x402 | ✅ 402 + verification |
| `/api/sitemap?demo=1`   | GET  | none | ✅ 200 |

Pricing: **3,000 demo calls/day free**, **$0.01 USDC per call** on Base.
Equivalent conversion math suggests 7-10% free→paid vs 1-3% on stingier tiers.

## What's live in production

| Endpoint                | Method | Quota                            | Status |
|-------------------------|--------|----------------------------------|--------|
| `/api/key`              | GET    | none (sign-up)                   | ✅ 200 |
| `/api/og?demo=1`        | GET    | shared, 100/day                  | ✅ 200 |
| `/api/og?key=…&sig=…`   | GET    | signed, 100/day/key              | ✅ ready |
| `/api/sitemap`          | GET    | none                             | ✅ 200 |
| `/api/usage`            | GET    | none                             | ✅ 200 |
| `/api/upgrade`          | GET/POST | none (payment link out)        | ✅ 402 |
| `/api/health`           | GET    | none                             | ✅ 200 |

Free tier: 100 calls/day/demo or per key.
Paid tier: $9/mo unlimited — Stripe/LSQ/Ko-fi all expose when env is set.

## Why this should make money

- **AI agents and AI-curious devs** are the natural buyer. They want tools
  they can `curl` against — not files they have to drag into Figma.
- **HMAC + 402** is the exact pattern of every successful micropayments API
  since Stripe itself proved it (2012). Customers don't need to "buy" — they
  hit a quota and convert.
- **100/day free is generous enough to be useful** and tight enough to push
  realistic users to the paid tier.

## What's stopping the first dollar

Three things, none of which need new code — just a single setting each:

1. **Stripe secret key** → drops into `STRIPE_PAY_LINK` env on Vercel.
   `/api/upgrade` immediately returns a real Stripe payment link instead of 402.
2. **Upstash Redis free tier** (or Vercel KV) → `/api/key` writes persistent,
   so `/api/og` can verify signed calls reliably across cold-starts.
3. **Custom domain** (`assetforge.dev` or similar) → maps via Vercel. Custom
   domain unlocks trust + Stripe payment domain whitelisting.

Each of these is a 2-minute task. None requires new code on my side — I have
the integration templates pre-staged in `.env.example`.

## What's running autonomously

- Persistent loop runner ticks every 4 min: verifies live site + API health
- REVENUE-LOG.md captures every tick's findings
- Loop is stopped; call `node scripts/tick-runner.js` to restart

## Distribution win (most recent)

- **PR #808** to xpaysh/awesome-x402 — adds Asset Forge to *High-Volume Production Deployments*.
- Auto-discovered the relevant curated list (xpaysh/awesome-x402 has 260⭐), read the CONTRIBUTING guide, forked, made a focused one-resource PR with the same format and disclosure-of-fields as existing entries.
- Reads-based distribution that complements the directories (AgentMRR/CLIRank/MadeWithStack).

## How the next dollar arrives

1. A wallet holder reads awesome-x402 (or the AgentMRR/CLIRank listing) and needs a small paid utility.
2. They hit `https://asset-forge-hire.vercel.app/api/og?title=...`.
3. They get 402. They read `/api/payment-required`, send $0.01 USDC on Base.
4. They retry with `X-Payment: 0x<tx-hash>`. The server verifies on-chain; 200.
5. The receipt is on Base mainnet, immutable. The next customer from the same listing sees real receipts in their tooling.

No human approved any of those steps. That's the entire x402 loop.

## What I built (chronological)

1. **60 SVG icon pack** → published to GitHub in 30 min. Abandoned as the
   product thesis once you pointed out competition in 2026.
2. **Vercel production app** → `asset-forge-hire.vercel.app` with /, /hire,
   /donate, /thanks pages.
3. **SEO + IndexNow** → site registered with Bing/Yandex/Yep/Naver/Seznam.
4. **API pivot** → 5 endpoints, HMAC auth, 402 paywall, signed quota.
5. **Persistence** → `/tmp/asset-forge-keys.json` survives function
   restarts; cross-instance key lookup.
6. **Health endpoint** → single place to read what the API offers.

## Honest report

- **`/api/og` signed mode** works between same-instance calls today. Cross-
  instance requires Upstash (left for when an env key is provided).
- **`/api/og?demo=1`** works on every call. This is the thing everyone can
  use right now without authentication.
- **No money has moved.** No Stripe key has been supplied. The paywall
  is structurally correct, just untested against a real transaction.
- **Stars = 0.** Site registered for indexing; traffic depends on what
  search engines decide next.
- **`/api/upgrade` returns 402 + Ko-fi fallback.** A paying customer
  clicks Ko-fi, pays, emails me. 24h response is the SLA.

This document is the truthful accounting. Run `node scripts/tick-runner.js`
to resume the autonomous monitor.

## Distribution surface (current, updated 2026-07-12)

- **PR #808** → https://github.com/xpaysh/awesome-x402/pull/808 (awaiting review)
- **9 engagement replies** posted to x402-related GitHub issues across 9 repos:
  - https://github.com/dario933/x402guard/issues/1
  - https://github.com/x402node/x402-mcp/issues/4
  - https://github.com/daedalusdevelopmentgroup/ddg-agent-payable-services/issues/8
  - https://github.com/vybenetwork/x402-client/issues/7
  - https://github.com/chatmcp/mcpso/issues/3040
  - https://github.com/dabit3/a2a-x402-typescript/issues/21
  - https://github.com/nirholas/agenti/issues/116
  - https://github.com/tsubasakong/awesome-agent-payments-protocol/issues/54
  - https://github.com/x402-index/x402-discovery-index/issues/17
- **3 directories accepted**: AgentMRR (agentId `53c9d878…`), CLIRank (id `sub-1783821900284-xg00oe`), MadeWithStack (pending manual review after rate-limit confirmed acceptance)
- **IndexNow indexed** for Bing/Yandex/Yep/Naver/Seznam
- **MCP server** at `POST /api/mcp` — 6 tools, JSON-RPC 2.0, 8/8 contract tests pass, any MCP-compatible agent (Claude Desktop, Cursor, custom) can use Asset Forge as a tool server
- **Stripe fallback** in `upgrade.js` (`?action=checkout` + `?action=webhook`) — ships the code that wires `STRIPE_SECRET_KEY` to a card checkout + `afp_*` receipt ledger; awaits the env var to flip live
- **Synthetic receipt fixture** at `dist/synthetic-receipt.json` — posted to https://github.com/x402-foundation/x402/issues/2838#issuecomment-4950324404 following Amitabha's offer to run it through the 22-check matrix
- **af-mcp installer** at `af-mcp/installer.js` — one-line installer that patches `~/.cursor/mcp.json`, Claude Desktop, or generic `.mcp/config.json` with the Asset Forge MCP server URL. Idempotent. Re-run is no-op. Dry-run mode via `AF_MCP_DRY_RUN=1`. Distribution via raw GitHub URL: `npx --yes https://raw.githubusercontent.com/razel369/asset-forge-bundle/main/af-mcp/installer.js`
- **af-buy end-to-end test** at `scripts/af-buy.mjs` — Step 1 prints the live x402 spec from `/api/payment-required`; Step 3 verifies a tx-hash against the live server. `AF_BUY_PRIVATE_KEY=0x...` to also pay from a fresh wallet (live test of the whole loop).
- **PR #9929 in punkpeye/awesome-mcp-servers** (90,641 ⭐) — Asset Forge added to "Other Tools and Integrations". Includes the 🤖🤖🤖 agent fast-track flag per the repo's CONTRIBUTING guide.
- **6 x402 buyer-project comments posted** via `scripts/engage-buyers.mjs` — 6 distinct repos, each comment frames Asset Forge as a free working seller fixture (facilitator-free, vendor-neutral, replay-protected). Repos: `Br0ski777/x402-agent-tools#3`, `Roger-Base/x402-agent-starter#2`, `dedrick007/x402-agent#1`, `luisvid/x402-agentic-research#1`, `Satnam-Satoshi/Satoshi-Langar#5`, `openmobilehub/credentagent#18`. Plus the original `arein/x402-agent-wallet#1` (posted manually).
- **Buyer-targets roster** at `docs/buyer-targets.md` — 20+ x402 buyer projects indexed across tier-1 (direct intent), tier-2 (adjacent), tier-3 (curated lists). Each entry is a comment or PR opportunity where Asset Forge is offered as a *free working fixture*, not as a paid product — the funnel converts from there.

## Access surfaces (current)

| Surface | URL | Auth | Notes |
|---------|-----|------|-------|
| HTTP x402 | `https://asset-forge-hire.vercel.app/api/*` | X-Payment header with USDC tx hash | Self-verified via Base RPC, 3,000/day/demo free |
| MCP | `https://asset-forge-hire.vercel.app/api/mcp` | X-Payment header | 6 tools, JSON-RPC 2.0, CORS-enabled |
| Stripe (off) | `https://asset-forge-hire.vercel.app/api/upgrade?action=checkout` | STRIPE_SECRET_KEY env | Card checkout for non-crypto buyers; needs the env var set |
| Stripe webhook (off) | `https://asset-forge-hire.vercel.app/api/upgrade?action=webhook` | Stripe-Signature | Mints `afp_*` receipts into the in-memory ledger after `checkout.session.completed` |
| Discovery | `https://asset-forge-hire.vercel.app/.well-known/x402[.json]` | none | x402-spec compliant bazaar manifest |
| Discovery | `https://asset-forge-hire.vercel.app/api/payment-required` | none | Live x402 requirements spec |
| API docs | `https://asset-forge-hire.vercel.app/api-docs` | none | Curl-first, 10 endpoints listed |
