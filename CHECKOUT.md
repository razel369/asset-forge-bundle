# Checkout guide — how to wire Asset Forge to a payment processor

This bundle currently has no payments wired up. The buttons in `site/index.html`
point to a placeholder email. This document is the plug-and-play wiring guide
for the moment any of these API keys arrive.

## 1. Stripe Payment Links (no code change)

1. Open https://dashboard.stripe.com/payment-links
2. Create three Payment Links:
   - **Indie Pack** — $29 USD, one-time
   - **Studio Pack** — $99 USD, one-time
   - **Mega Pack** — $149 USD, one-time
3. Copy each link. Replace the placeholder URLs in `site/index.html`:
   - Search for `Get the pack` and replace `#pricing` link href
   - Or update the `<a href="#pricing" class="btn btn-primary">Get the pack</a>`
     to `<a href="STRIPE_INDIE_LINK" class="btn btn-primary">Get the Indie Pack</a>`

## 2. LemonSqueezy (cleanest for digital goods)

1. Sign in at https://www.lemonsqueezy.com
2. Create store named "Asset Forge"
3. Create product variants:
   - Indie Pack ($29) — license slug: `indie-pack`
   - Studio Pack ($99) — license slug: `studio-pack`
   - Mega Pack ($149) — license slug: `mega-pack`
4. Get the checkout URLs from each variant's "Share" tab
5. Update `site/index.html` exactly like Stripe

## 3. Polar.sh (open-source-friendly)

1. Sign in at https://polar.sh
2. Create organization "Asset Forge"
3. Create products with the same three tiers
4. Pass product IDs via `POST /v1/checkouts/`

## 4. GitHub Sponsors (recurring)

Already wired: `https://github.com/sponsors/razel369` linked from
`.github/FUNDING.yml` and shown in the LP "Sponsor this project" CTA.

## 5. Buy Me a Coffee

Already wired via FUNDING.yml custom URL. Replace
`https://example.com/pay` with your actual bm.ac link.

## Required info per tier

After configuring any provider, edit `site/index.html` and replace these
exact strings:

| Placeholder                       | Replace with          |
|------------------------------------|-----------------------|
| `Get the pack` (hero CTA)         | Indie Pack checkout   |
| `Get the Indie Pack` (tier 2 CTA) | Indie Pack checkout   |
| `Get the Studio Pack` (tier 3)    | Studio Pack checkout  |
| `Get the Mega Pack` (tier 4)      | Mega Pack checkout    |

## What I will do once any key is provided

- Drop the chosen checkout URLs into `site/index.html` in one targeted edit
- Verify with `node scripts/build-site.mjs` and a curl request
- Commit, push, redeploy GitHub Pages if Pages is configured by then
- Update `STATUS.md` and `DASHBOARD.md` with the live revenue stream

## Why not built already

- No API key for any payment processor has been supplied in this session
- Adding a merchant account would require identity verification that no
  AI assistant can complete on behalf of a human
- Forcing a placeholder payment form would damage trust on day one
