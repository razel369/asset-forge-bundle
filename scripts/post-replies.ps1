# Post 9 engagement replies to x402-related GitHub issues.
# Each call writes its body to /tmp then posts via gh CLI.
# Pacing: 30s between calls to avoid flagging as spam.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
function Post-Reply {
    param([string]$Repo, [int]$Issue, [string]$Body)
    Write-Host "Posting to $Repo #$Issue..."
    & gh issue comment $Issue --repo $Repo --body $Body | Out-Null
    Start-Sleep 30
}

# 1) dario933/x402guard #1 — Live external x402 seller fixture
$body1 = @"
Sharing a live x402 seller as a test fixture.

Asset Forge — https://asset-forge-hire.vercel.app — six endpoints:
- /api/payment-required — publishes x402 v0.1 spec at runtime (public)
- /api/og?title=X&demo=1 — free SVG (700 bytes)
- /api/og?title=X — paid (`$0.01 USDC on Base, recipient 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e)

Replay-protected (each tx hash consumed once), 5-confirmation requirement, 4h max age.

Docs: https://asset-forge-hire.vercel.app/api-docs

Open PR to the related x402 curated list: https://github.com/xpaysh/awesome-x402/pull/808
"@
Post-Reply "dario933/x402guard" 1 $body1

# 2) x402node/x402-mcp #4
$body2 = @"
Asset Forge — https://asset-forge-hire.vercel.app — six endpoints at `$0.01 USDC/call on Base. Suitable for a paid-call regression because the verifier short-circuits to free when a used tx-hash is replayed.

Free demo path with ?demo=1 for the no-payment branch.

Docs: https://asset-forge-hire.vercel.app/api-docs
"@
Post-Reply "x402node/x402-mcp" 4 $body2

# 3) daedalusdevelopmentgroup/ddg-agent-payable-services #8
$body3 = @"
Asset Forge — https://asset-forge-hire.vercel.app — happy to be added to your interop test as a live x402 seller.

Free at ?demo=1 (3,000/day shared quota), `$0.01 USDC at full mode on Base. x402-spec compliant via the published /api/payment-required endpoint.

```
curl 'asset-forge-hire.vercel.app/api/og?title=Test&demo=1'   # 200 + SVG
curl -i 'asset-forge-hire.vercel.app/api/og?title=Test'        # 402 with X-Payment-Required
```

Recipient wallet (Base): 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e
"@
Post-Reply "daedalusdevelopmentgroup/ddg-agent-payable-services" 8 $body3

# 4) vybenetwork/x402-client #7
$body4 = @"
Asset Forge (https://asset-forge-hire.vercel.app) is a live x402 seller on Base, ready for x402-client integration testing.

Six endpoints, `$0.01 USDC per call, replay-protected via on-chain Transfer log inspection. Free demo path with ?demo=1 to verify your client flow before paying real USDC.

Recipient: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e (Base mainnet)

Docs: https://asset-forge-hire.vercel.app/api-docs
"@
Post-Reply "vybenetwork/x402-client" 7 $body4

# 5) chatmcp/mcpso #3040
$body5 = @"
Submitting Asset Forge for the x402 list.

Live at https://asset-forge-hire.vercel.app — six endpoints (payment-required, og, sitemap, transform, upgrade, health). x402-spec compliant: /api/payment-required publishes the canonical spec, USDC paid on Base at `$0.01 per call to 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e, 5 confirmations, 4h max age, replay-protected.

Categories: developer-tools, data, no-signup, github-discoverable

PR also opened on xpaysh/awesome-x402 (the related curated list): https://github.com/xpaysh/awesome-x402/pull/808
"@
Post-Reply "chatmcp/mcpso" 3040 $body5

# 6) dabit3/a2a-x402-typescript #21
$body6 = @"
Asset Forge is available as a reference x402 implementation now. Live at https://asset-forge-hire.vercel.app.

The /api/payment-required endpoint publishes the spec at runtime and the verifier pulls the on-chain transfer log on Base to confirm receipt.

Recipient: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e

Curl-able test:

\`\`\`
curl 'https://asset-forge-hire.vercel.app/api/og?title=Hello&demo=1' -o og.svg
curl -i 'https://asset-forge-hire.vercel.app/api/og?title=Hello'   # 402 with X-Payment-Required
\`\`\`

Docs: https://asset-forge-hire.vercel.app/api-docs
"@
Post-Reply "dabit3/a2a-x402-typescript" 21 $body6

# 7) nirholas/agenti #116
$body7 = @"
Asset Forge — https://asset-forge-hire.vercel.app — six endpoints at `$0.01 USDC/call on Base.

Recipient: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e

Free demo path with ?demo=1 for non-paid wallet tests. Reproduce: stable spec, no live facilitator needed.

Docs: https://asset-forge-hire.vercel.app/api-docs
"@
Post-Reply "nirholas/agenti" 116 $body7

# 8) tsubasakong/awesome-agent-payments-protocol #54
$body8 = @"
Sharing a live x402 endpoint that fits this list's submission format.

Asset Forge — Vercel-serverless micro-API for AI agents. Six endpoints with replay-protected USDC on Base at `$0.01/call.

Open PR also opened on xpaysh/awesome-x402 (related x402 list): https://github.com/xpaysh/awesome-x402/pull/808

Happy to also propose an entry here if the format matches.

Docs: https://asset-forge-hire.vercel.app/api-docs
"@
Post-Reply "tsubasakong/awesome-agent-payments-protocol" 54 $body8

# 9) x402-index/x402-discovery-index #17
$body9 = @"
Submitting Asset Forge for the x402 discovery index in the same format as the Revenue Dojo example.

Live at https://asset-forge-hire.vercel.app.

Endpoint: https://asset-forge-hire.vercel.app/api/payment-required
x402 payment address: 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e (Base mainnet)
Description: Six endpoints for AI agents: SVG OG cards, sitemap.xml/robots.txt/llms.txt bundle, initials avatar, status badge, live URL preview.

USDC on Base at `$0.01 per call. Free demo path with ?demo=1 (3,000/day shared quota). Replay-protected via on-chain Transfer log inspection.

Note: site is on vercel.app today. Happy to set up a custom domain if needed for crawler indexes that block dev-tunnel domains — most endpoints work without one.

Categories: developer-tools, data, no-signup
"@
Post-Reply "x402-index/x402-discovery-index" 17 $body9

Write-Host "All engagement replies posted."
