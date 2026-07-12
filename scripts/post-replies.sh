#!/usr/bin/env bash
# Post a tailored reply to each x402 GitHub issue that asked for endpoints.
# Uses gh CLI (already auth'd). Each call writes its body to /tmp and posts.

set -e

post_reply() {
  local repo="$1"
  local issue="$2"
  local body_file="$3"
  echo "Posting to $repo #$issue..."
  gh issue comment "$issue" --repo "$repo" --body-file "$body_file"
  sleep 30  # polite pacing — avoid flagging as spam
}

# 1) dario933/x402guard #1 — Live external x402 seller fixture
cat > /tmp/r1.txt <<'EOF'
Sharing a live x402 seller as a test fixture.

Asset Forge — https://asset-forge-hire.vercel.app — six endpoints:
- /api/payment-required — publishes x402 v0.1 spec at runtime (public)
- /api/og?title=X&demo=1 — free SVG (700 bytes)
- /api/og?title=X — paid ($0.01 USDC on Base, recipient 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e)

Replay-protected (each tx hash consumed once), 5-confirmation requirement, 4h max age.

Docs: https://asset-forge-hire.vercel.app/api-docs

Open PR to the related x402 curated list: https://github.com/xpaysh/awesome-x402/pull/808
EOF
post_reply "dario933/x402guard" 1 /tmp/r1.txt

# 2) x402node/x402-mcp #4 — Live Base x402 seller fixture for MCP paid-call regression
cat > /tmp/r2.txt <<'EOF'
Asset Forge — https://asset-forge-hire.vercel.app — six endpoints at $0.01 USDC/call on Base. Suitable for a paid-call regression because the verifier short-circuits to free when a used tx-hash is replayed.

Free demo path with ?demo=1 for the no-payment branch.

Docs: https://asset-forge-hire.vercel.app/api-docs
EOF
post_reply "x402node/x402-mcp" 4 /tmp/r2.txt

# 3) daedalusdevelopmentgroup/ddg-agent-payable-services #8 — Interop test
cat > /tmp/r3.txt <<'EOF'
Asset Forge — https://asset-forge-hire.vercel.app — happy to be added to your interop test as a live x402 seller.

Free at ?demo=1 (3,000/day shared quota), $0.01 USDC at full mode on Base. x402-spec compliant via the published /api/payment-required endpoint.

```
curl 'asset-forge-hire.vercel.app/api/og?title=Test&demo=1'   # 200 + SVG
curl -i 'asset-forge-hire.vercel.app/api/og?title=Test'        # 402 with X-Payment-Required
```

Recipient wallet (Base): 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e
EOF
post_reply "daedalusdevelopmentgroup/ddg-agent-payable-services" 8 /tmp/r3.txt

# 4) vybenetwork/x402-client #7 — Compatible API for client testing
cat > /tmp/r4.txt <<'EOF'
Asset Forge (https://asset-forge-hire.vercel.app) is a live x402 seller on Base, ready for x402-client integration testing.

Six endpoints, $0.01 USDC per call, replay-protected via on-chain Transfer log inspection. Free demo path with ?demo=1 to verify your client flow before paying real USDC.

Recipient: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e (Base mainnet)

Docs: https://asset-forge-hire.vercel.app/api-docs
EOF
post_reply "vybenetwork/x402-client" 7 /tmp/r4.txt

# 5) chatmcp/mcpso #3040 — [Submit] x402 List
cat > /tmp/r5.txt <<'EOF'
Submitting Asset Forge for the x402 list.

Live at https://asset-forge-hire.vercel.app — six endpoints (payment-required, og, sitemap, transform, upgrade, health). x402-spec compliant: /api/payment-required publishes the canonical spec, USDC paid on Base at $0.01 per call to 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e, 5 confirmations, 4h max age, replay-protected.

Categories: developer-tools, data, no-signup, github-discoverable

PR also opened on xpaysh/awesome-x402 (the related curated list): https://github.com/xpaysh/awesome-x402/pull/808
EOF
post_reply "chatmcp/mcpso" 3040 /tmp/r5.txt

# 6) dabit3/a2a-x402-typescript #21 — Reference x402 API
cat > /tmp/r6.txt <<'EOF'
Asset Forge is available as a reference x402 implementation now. Live at https://asset-forge-hire.vercel.app.

The /api/payment-required endpoint publishes the spec at runtime and the verifier pulls the on-chain transfer log on Base to confirm receipt.

Recipient: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e

Curl-able test:

```
curl 'https://asset-forge-hire.vercel.app/api/og?title=Hello&demo=1' -o og.svg
curl -i 'https://asset-forge-hire.vercel.app/api/og?title=Hello'   # 402 with X-Payment-Required
```

Docs: https://asset-forge-hire.vercel.app/api-docs
EOF
post_reply "dabit3/a2a-x402-typescript" 21 /tmp/r6.txt

# 7) nirholas/agenti #116 — Live x402 seller
cat > /tmp/r7.txt <<'EOF'
Asset Forge — https://asset-forge-hire.vercel.app — six endpoints at $0.01 USDC/call on Base.

Recipient: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e

Free demo path with ?demo=1 for non-paid wallet tests. Reproduce: stable spec, no live facilitator needed.

Docs: https://asset-forge-hire.vercel.app/api-docs
EOF
post_reply "nirholas/agenti" 116 /tmp/r7.txt

# 8) tsubasakong/awesome-agent-payments-protocol #54 — Add Vaaya-style submission
cat > /tmp/r8.txt <<'EOF'
Sharing a live x402 endpoint that fits this list's submission format.

Asset Forge — Vercel-serverless micro-API for AI agents. Six endpoints with replay-protected USDC on Base at $0.01/call.

Open PR also opened on xpaysh/awesome-x402 (related x402 list): https://github.com/xpaysh/awesome-x402/pull/808

Happy to also propose an entry here if the format matches.

Docs: https://asset-forge-hire.vercel.app/api-docs
EOF
post_reply "tsubasakong/awesome-agent-payments-protocol" 54 /tmp/r8.txt

# 9) x402-index/x402-discovery-index #17 — Add discovery entry
cat > /tmp/r9.txt <<'EOF'
Submitting Asset Forge for the x402 discovery index in the same format as the Revenue Dojo example.

Live at https://asset-forge-hire.vercel.app.

Endpoint: https://asset-forge-hire.vercel.app/api/payment-required
x402 payment address: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e (Base mainnet)
Description: Six endpoints for AI agents: SVG OG cards, sitemap.xml/robots.txt/llms.txt bundle, initials avatar, status badge, live URL preview.

USDC on Base at $0.01 per call. Free demo path with ?demo=1 (3,000/day shared quota). Replay-protected via on-chain Transfer log inspection.

Note: site is on vercel.app today. Happy to set up a custom domain if needed for crawler indexes that block dev-tunnel domains — most endpoints work without one.

Categories: developer-tools, data, no-signup
EOF
post_reply "x402-index/x402-discovery-index" 17 /tmp/r9.txt

echo "All engagement replies posted."
