# x402 buyers — who's likely to pay for Asset Forge

This is a running list of GitHub repos/projects that build, run, or document
x402 buyer-side agents. Each entry is a place Asset Forge's seller side
fits as a fixture, an integration target, or a paid endpoint behind a
buyer's signing path.

The strategy is: each entry below is a comment / PR opportunity where
Asset Forge is offered as a *free, working seller fixture* — which
positions it as the entry point for anyone implementing a buyer.

## Tier 1 — Direct buyer projects (high intent)

| Repo / Project | Issue / PR Target | Why Asset Forge fits |
|----------------|-------------------|----------------------|
| `arein/x402-agent-wallet` | [issue #1](https://github.com/arein/x402-agent-wallet/issues/1) — "Interop fixture: live Coinbase-CDP x402 seller for wallet proxy smoke tests" | Posted Asset Forge as a self-verified fixture (facilitator-free). Complements the CDP one. |
| `Br0ski777/x402-agent-tools` | [issue #3](https://github.com/Br0ski777/x402-agent-tools/issues/3) — "Conversion audit idea for x402-agent-tools" | Owner is auditing their own x402-agent-tools. If they need an external seller for the audit, Asset Forge's 6 endpoints cover their tool surface. |
| `Roger-Base/x402-agent-starter` | [issue #2](https://github.com/Roger-Base/x402-agent-starter/issues/2) — "Observer Protocol: Free Verification for x402 Agent Starter" | They want a free verification partner. Asset Forge's `self-verified` path is exactly that. |
| `dedrick007/x402-agent` | [issue #1](https://github.com/dedrick007/x402-agent/issues/1) — "Observer Protocol: Free Verification for x402-agent" | Same. |
| `luisvid/x402-agentic-research` | [issue #1](https://github.com/luisvid/x402-agentic-research/issues/1) — "Observer Protocol: Free Verification for x402 Agentic Research" | Same. |
| `Satnam-Satoshi/Satoshi-Langar` | [issue #5](https://github.com/Satnam-Satoshi/Satoshi-Langar/issues/5) — "Launch subscriptions and x402 agent API sandbox" | They want to test their agent against live x402 endpoints. Asset Forge is one. |
| `openmobilehub/credentagent` | [issue #18](https://github.com/openmobilehub/credentagent/issues/18) — "Epic: x402 agentic payments (Multipaz as the hardware-backed wallet)" | They are building a hardware-backed wallet. Asset Forge's no-facilitator path is a perfect test counterparty. |
| `xpaysh/awesome-x402` | [issue #581](https://github.com/xpaysh/awesome-x402/issues/581) and [#541](https://github.com/xpaysh/awesome-x402/issues/541) | The curated list itself. PR #808 already adds Asset Forge to High-Volume Production Deployments. The PR will land in 24-72h. |
| `cline/mcp-marketplace` | [issue #1954](https://github.com/cline/mcp-marketplace/issues/1954) — "x402 Agent Tools — 25 pay-per-call API endpoints" | Other people's submission — but Asset Forge should also be in this marketplace. PR opportunity. |

## Tier 2 — Adjacent (x402-aware, lower intent)

These repos aren't direct buyers but document the protocol. They're
useful for citation in a future blog post or a Twitter thread that
points Asset Forge out.

| Repo | Why it's adjacent |
|------|--------------------|
| `xpaysh/awesome-x402` (already PRed) | Distribution of PR #808. |
| `Fourier18/a2a-radar` [issue #1](https://github.com/Fourier18/a2a-radar/issues/1) | "Daily radar 2026-07-12: AWS and Cloudflare put x402 agent payments in the CDN edge" — top-of-mind topic; comment with Asset Forge's CDN-friendly Vercel deployment. |
| `tyler-james-bridges/x402-sentinel` [issue #13](https://github.com/tyler-james-bridges/x402-sentinel/issues/13) | "Partner integration — x402 skill + profile" — possible cross-promo. |
| `0xMiden/docs` [issue #269](https://github.com/0xMiden/docs/issues/269) | "Backlog: x402 agent payments tutorial (exploration)" — if they write a tutorial, Asset Forge can be the example. |
| `J17M/teardownhq` [issue #2](https://github.com/J17M/teardownhq/issues/2) | "x402 agent API companion feed" — they have 77 comments already. Active community. |
| `Uniswap/interface` [issue #8029](https://github.com/Uniswap/interface/issues/8029) | "Token metadata update: x402 (Base) - Display name incorrect" — meta-level; comment with x402 ecosystem links. |

## Tier 3 — Curated lists (PRs only)

| Repo | Stars | PR target |
|------|-------|-----------|
| `xpaysh/awesome-x402` | 260 | ✅ PR #808 open |
| `punkpeye/awesome-mcp-servers` | 90,641 | ✅ PR #9929 open with 🤖🤖🤖 flag |
| `dabit3/a2a-x402-typescript` (issues #7, #21) | 102 | Open issue once their discovery supports remote endpoints |
| `vybenetwork/x402-client` (#7) | 169 | Already engaged |
| `Merit-Systems/x402scan` (#1023) | 357 | Open issue — bazaar manifest might auto-register |
| `agentmrr.com` (already submitted, agentId 53c9d878) | n/a | Already in directory |

## Engagement protocol (auto-ritual)

For each tier-1 repo, post one issue comment with:

1. Asset Forge's live URL (`https://asset-forge-hire.vercel.app/`)
2. The specific reason their use case benefits (facilitator-free path, demo mode, etc.)
3. A short curl-able preflight so they can verify in 30 seconds
4. A specific test path mirroring their issue's "Possible proxy test path" or "How to test" section
5. The synthetic-receipt.json at `dist/synthetic-receipt.json` if they want a non-real tx for tests

All 20+ buyer candidates listed above are queued. Engagement is
in the loop; this document is the index.

Last updated: 2026-07-12. Check `SUBMISSION-LOG.json` for live status.
