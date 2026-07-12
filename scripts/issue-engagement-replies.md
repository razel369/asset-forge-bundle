// Engagement messages: a tailored reply for each candidate issue, posted
// directly via gh issue comment in the parent terminal.

const COMMON = `
Live x402 endpoint you can test against:

- /api/payment-required — publishes canonical x402 v0.1 spec at runtime (public, no auth)
- /api/og?title=X&demo=1 — free SVG OG (700 bytes)
- /api/sog?title=X — paid ($0.01 USDC on Base, recipient 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e)

Docs: https://asset-forge-hire.vercel.app/api-docs
`;

const REPLIES = {
  "tsubasakong/awesome-agent-payments-protocol": {
    issue: 54,
    body:
      "Sharing a live x402 endpoint that fits this list's submission format. Asset Forge — Vercel-serverless micro-API for AI agents. Six endpoints with replay-protected USDC on Base at $0.01/call. Open PR: https://github.com/xpaysh/awesome-x402/pull/808 added Asset Forge to Production Implementations on the related x402 list. Happy to also propose an entry here if the format matches.\n\n" +
      COMMON,
  },
  "dabit3/a2a-x402-typescript": {
    issue: 21,
    body:
      "Asset Forge is available as a reference x402 implementation now. Live at https://asset-forge-hire.vercel.app. The /api/payment-required endpoint publishes the spec at runtime and the verifier pulls the on-chain transfer log on Base to confirm receipt. Recipient: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e. Curl-able test:\n\n" +
      "```\ncurl 'https://asset-forge-hire.vercel.app/api/og?title=Hello&demo=1' -o og.svg\ncurl -i 'https://asset-forge-hire.vercel.app/api/og?title=Hello'   # 402 with X-Payment-Required\n```\n\n" +
      COMMON,
  },
  "vybenetwork/x402-client": {
    issue: 7,
    body:
      "Asset Forge (https://asset-forge-hire.vercel.app) is a live x402 seller on Base, ready for x402-client integration testing. Six endpoints, $0.01 USDC per call, replay-protected via on-chain log inspection. Free demo path with `?demo=1` to verify your client flow before paying.\n\n" +
      COMMON,
  },
  "chatmcp/mcpso": {
    issue: 3040,
    body:
      "Submitting Asset Forge for the x402 list. Live at https://asset-forge-hire.vercel.app. Six endpoints (payment-required, og, sitemap, transform, upgrade, health). x402-spec compliant: /api/payment-required publishes the canonical spec, USDC paid on Base at $0.01 per call to 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e, 5 confirmations, 4h max age, replay-protected.\n\n" +
      COMMON,
  },
  "x402-index/x402-discovery-index": {
    issue: 17,
    body:
      "Submitting Asset Forge for the x402 discovery index in the same format as the Revenue Dojo example. Live at https://asset-forge-hire.vercel.app.\n\n" +
      "**Endpoint:** https://asset-forge-hire.vercel.app/api/payment-required\n" +
      "**x402 payment address:** 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e (Base mainnet)\n" +
      "**Description:** Six endpoints for AI agents: SVG OG cards, sitemap.xml/robots.txt/llms.txt bundle, initials avatar, status badge, live URL preview. USDC on Base at $0.01 per call. Free demo path with ?demo=1 (3,000/day shared quota). Replay-protected via on-chain Transfer log inspection.\n" +
      "**x402 manifest:** https://asset-forge-hire.vercel.app/.well-known/x402  (404 — see below)\n" +
      "**OpenAPI:** https://asset-forge-hire.vercel.app/api/health  (catalog)\n" +
      "**llms.txt:** add via integration (see api-docs)\n\n" +
      "Note: site is on vercel.app today. Happy to set up a custom domain if needed for crawler indexes that block dev-tunnel domains — but most endpoints work without one.\n\n" +
      "Categories: developer-tools, data, github-discoverable, no-signup",
  },
  "dario933/x402guard": {
    issue: 1,
    body:
      "Asset Forge is available as a live external x402 seller at https://asset-forge-hire.vercel.app. It's the simplest test fixture I know of — one endpoint, $0.01 USDC per call, Base mainnet, replay-protected. Free demo path via `?demo=1` if a paid call isn't suitable for the test setup.\n\n" +
      COMMON,
  },
  "x402node/x402-mcp": {
    issue: 4,
    body:
      "Asset Forge — https://asset-forge-hire.vercel.app — six endpoints, $0.01 USDC/call on Base. Suitable for a paid-call regression because the verifier short-circuits to free when a used tx-hash is replayed. Demo (free) at `?demo=1` works for the no-payment branch.\n\n" +
      COMMON,
  },
  "daedalusdevelopmentgroup/ddg-agent-payable-services": {
    issue: 8,
    body:
      "Asset Forge (asset-forge-hire.vercel.app) — happy to be added to your interop test. Free at `?demo=1`, $0.01 USDC at full mode on Base. x402-spec compliant via the published /api/payment-required endpoint. Curl-testable:\n\n" +
      "```\ncurl 'asset-forge-hire.vercel.app/api/og?title=Test&demo=1'   # 200 + SVG\ncurl -i 'asset-forge-hire.vercel.app/api/og?title=Test'        # 402 with x-payment-required\n```\n",
  },
  "nirholas/agenti": {
    issue: 116,
    body:
      "Asset Forge — https://asset-forge-hire.vercel.app — six endpoints at $0.01 USDC/call on Base. (Same as I posted on #3040 mcpso.) Suitable as a fixture for Agenti wallet flows.\n\n" +
      COMMON,
  },
};
