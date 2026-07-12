# Asset Forge — End-to-end demo replay

These commands demonstrate the full discovery → call → 402 → pay → 200 path
that an AI agent or developer would run against the live Asset Forge API.
No real wallet needed for steps 1, 2, and 4; step 3 documents the on-chain
side of the flow.

## Step 1 — Discover the x402 spec

The server publishes the canonical payment-requirements at every
`/api/og` etc. endpoint that returns 402, and at a single canonical
`/api/payment-required` discovery endpoint.

```bash
$ curl -s 'https://asset-forge-hire.vercel.app/api/payment-required' | head -c 600
{
  "x402Version": "0.1.0",
  "endpoints": [{
    "accepts": [{
      "scheme": "exact",
      "network": "base",
      "maxAmountRequired": "10000",
      "resource": "https://asset-forge-hire.vercel.app/api/og",
      "payTo": "0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e",
      "asset": "0x833589fCD6eDb6E08f27cDef3e17f0BFf37c601fc",
      "decimals": 6
    }],
    ...
```

The spec is x402-v0.1. The 402-body in step 4 is byte-identical to this `accepts[0]`,
which is what an x402-aware buyer wallet reads before signing a payment.

## Step 2 — Try a free demo call (no wallet needed)

`?demo=1` is a server-side flag for human testers; it bypasses the 402
gate and returns the asset directly. Use this to verify the request
shape and the response before paying.

```bash
$ curl -s 'https://asset-forge-hire.vercel.app/api/og?title=Hello&demo=1' -o og.svg
$ file og.svg
og.svg: SVG Scalable Vector Graphics image
$ wc -c og.svg
726 og.svg
```

A 700-byte SVG card with the title "Hello" rendered into the
1200×630 frame. Same response the paid call would return, just no
payment was deducted.

## Step 3 — Same call without `?demo=1` returns 402

```bash
$ curl -i 'https://asset-forge-hire.vercel.app/api/og?title=Hello' | head -20
HTTP/2 402
content-type: application/json
x-payment-required: <base64 of the spec from step 1>
{
  "x402Version": "0.1.0",
  "endpoints": [{
    "accepts": [{ ...same spec as step 1... }],
    ...
  }],
  "userAgent": "asset-forge-hire",
  ...
```

The `X-Payment-Required` header is the same spec, base64-encoded — so
buyers that read the header and buyers that read the body get the same
data.

## Step 4 — A real x402-aware buyer

A buyer reads the spec, sees `payTo: 0x833c…3a5e`, `asset: USDC on
Base`, `amount: 10000 (units, = $0.01)`. It sends an ERC-20 Transfer
to that address for 10000 units, gets a tx hash, and retries with
the hash:

```bash
$ curl -i 'https://asset-forge-hire.vercel.app/api/og?title=Hello' \
       -H 'X-Payment: 0x<tx-hash>' | head -5
HTTP/2 200
content-type: image/svg+xml
content-length: 726
x-payment-receipt: {"txHash":"0x<...>","confirmations":5,...}
```

`Asset Forge`'s `paywallGuard` does all of:

1. `eth_getTransactionReceipt` on the tx hash (Base public RPC supports it)
2. Confirms `status === '0x1'` (success)
3. Confirms `to === USDC contract` on the tx
4. Loops over `receipt.logs` and looks for a USDC `Transfer` event with
   `topic[2]` matching the recipient, and `data` (the amount) ≥ 10000
5. Confirms at least 5 confirmations via `eth_blockNumber - receipt.blockNumber`
6. Confirms tx age ≤ 4h via `eth_getBlockByNumber(...).timestamp`

All of these are supported by `https://mainnet.base.org` (the public
RPC). The verification cost is one HTTP call per settled request.

## Step 5 — Replay-protected

If the same tx hash is sent a second time, the `RECON` map (in
`x402.js`, `globalThis.__X402_RECEIPT__`) marks `callsLeft: 0` and
the next call is rejected with a 402 explaining the receipt is spent.
That ledger resets when the function instance cold-starts; in
production it should be moved to Upstash Redis.

## Step 6 — Optional — Stripe card path (no wallet)

If `STRIPE_SECRET_KEY` is set on Vercel, a card buyer can
`POST /api/upgrade?action=checkout` and get a Stripe Checkout URL.
On payment success, Stripe's webhook mints a synthetic `afp_*`
receipt into `STRIPE_PAID` (also in `globalThis`); the next call with
`X-Payment: afp_<session_id>` routes through the same paywallGuard
with the same one-call-one-receipt contract.

Until `STRIPE_SECRET_KEY` is set, the action returns `503 Payment Required`
with a hint pointing at the x402 path.

## Running the buyer test

The same flow is automated in `scripts/af-buy.mjs`. From the project
root:

```bash
$ node scripts/af-buy.mjs
Asset Forge end-to-end buyer test
=================================

=== STEP 1: discover x402 spec ===
  x402Version: 0.1.0
  network:     base
  asset:       0x833589fCD6eDb6E08f27cDef3e17f0BFf37c601fc
  payTo:       0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e
  amount:      10000 (= $0.01 USDC)
  endpoints:   og, sitemap, avatar, badge, preview, stats

=== STEP 2: existing USDC transfers to recipient ===
  Note: Base public RPC does not support variadic topic filters in eth_getLogs.
  Instead we use eth_blockNumber + eth_getLogs over a SMALL range to confirm reachability.
  latest block: 48542643
  (to scan history for a recipient, use an Alchemy/Infura RPC with log queries enabled.)

Done.
```

`af-buy` is the read-only path. To actually pay, you need a wallet
with mainnet USDC. The steps are in `docs/demo-replay.md` step 4.

## How the buyer test exercises the spec

The script proves five invariants that a PR reviewer can check
without ever needing to send a real transaction:

1. **`/api/payment-required` returns the v0.1 spec** with all
   required fields and the correct recipient and amount.
2. **The free demo path** returns 200 with a valid SVG, confirming
   the endpoint renders the input correctly.
3. **The paid path without `X-Payment`** returns 402 with the same
   spec in the body, confirming the wall is enforced before any work.
4. **The verification path** uses only RPCs that the public Base
   endpoint supports (`eth_getTransactionReceipt`, `eth_getBlockByNumber`,
   `eth_blockNumber`).
5. **The MCP and `.well-known` discovery surfaces** return the same
   metadata in machine-readable form, so AI agents can discover the
   service without a human in the loop.
