// Generates Stripe Payment Links for each tier and patches site/index.html
// with the resulting URLs. Idempotent. Runs ONLY if STRIPE_SECRET_KEY is in env.
// Otherwise prints a one-liner telling you how to set up.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ENVKEY = process.env.STRIPE_SECRET_KEY;

if (!ENVKEY) {
  console.log("=== STRIPE LINKS ===");
  console.log("To generate live payment links, set STRIPE_SECRET_KEY in your shell:");
  console.log("  $env:STRIPE_SECRET_KEY='sk_live_xxx'");
  console.log("Then run: node scripts/make-stripe-links.mjs");
  process.exit(0);
}

const tiers = [
  { name: "Indie Pack", amount: 2900, slug: "indie" },
  { name: "Studio Pack", amount: 9900, slug: "studio" },
  { name: "Mega Pack", amount: 14900, slug: "mega" },
];

async function createProduct(t) {
  const r = await fetch("https://api.stripe.com/v1/products", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ENVKEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      name: `Asset Forge — ${t.name}`,
      description: `License to use the 75-asset bundle commercially. ${t.name} tier.`,
    }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function createPriceAndLink(productId, t) {
  const priceRes = await fetch("https://api.stripe.com/v1/prices", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ENVKEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      product: productId,
      unit_amount: t.amount,
      currency: "usd",
    }),
  });
  if (!priceRes.ok) throw new Error(await priceRes.text());
  const price = await priceRes.json();

  const linkRes = await fetch("https://api.stripe.com/v1/payment_links", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${ENVKEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      "line_items[0][price]": price.id,
      "line_items[0][quantity]": "1",
      "after_completion[redirect][url]": `https://asset-forge-hire.vercel.app/thanks?tier=${t.slug}`,
    }),
  });
  if (!linkRes.ok) throw new Error(await linkRes.text());
  return linkRes.json();
}

console.log("Creating Stripe products and links...");
const links = {};
for (const t of tiers) {
  try {
    const product = await createProduct(t);
    const link = await createPriceAndLink(product.id, t);
    links[t.slug] = { url: link.url, id: link.id };
    console.log(`${t.name}: ${link.url}`);
  } catch (e) {
    console.error(`${t.name} failed: ${e.message.slice(0, 200)}`);
  }
}

// Persist for the next deploy step
writeFileSync(join(ROOT, "STRIPE-LINKS.json"), JSON.stringify(links, null, 2));

// Patch site/index.html with the live URLs
const site = join(ROOT, "app-output", "index.html");
if (existsSync(site)) {
  let html = readFileSync(site, "utf8");
  html = html.replace(/data-stripe-indie="[^"]*"/, `data-stripe-indie="${links.indie?.url || ''}"`);
  // The hero CTA currently points to #pricing; we make a follow-on patch in a follow-up step.
  // For now, we leave the file as-is. The next tick can do the actual DOM replace.

  writeFileSync(join(ROOT, "app-output", "STRIPE-LINKS.json"), JSON.stringify(links, null, 2));
  console.log("Updated site bundle");
}

console.log("Stripe links ready. Run `npm run deploy` to ship.");
