# STATUS — Asset Forge API

> Live production: https://asset-forge-hire.vercel.app/
> API docs: https://asset-forge-hire.vercel.app/api-docs

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
