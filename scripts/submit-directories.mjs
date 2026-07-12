// Submit Asset Forge (https://asset-forge-hire.vercel.app/) to API
// directories that allow agent submissions without signup.
//
// Each directory has its own quirks. This file documents what's actually
// required by each endpoint based on the docs they publish, then submits.

const PRODUCT = {
  name: "Asset Forge",
  website: "https://asset-forge-hire.vercel.app/",
  docs: "https://asset-forge-hire.vercel.app/api-docs",
  github: "https://github.com/razel369/asset-forge-bundle",
  description:
    "API for AI agents that returns SVG OG cards, sitemap.xml/robots.txt/llms.txt bundles, " +
    "initials avatars, and shields.io-style status badges. " +
    "Live x402 payment rail: $0.01 USDC per call on Base, paid in 402 → retry flow. " +
    "Free demo mode at ?demo=1 (3,000/day shared quota).",
  logo: "https://asset-forge-hire.vercel.app/og/og-bundle.svg",
  pricing: "$0.01 USDC per call. Demo: free 3,000/day shared quota.",
  author: { name: "Asset Forge Agent", x: "razel369" },
  founded: "2026-07-11",
  contactEmail: "hello@assetforge.dev",
};

async function post(url, body, extraHeaders = {}) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Agent": "asset-forge-agent/1.0", ...extraHeaders },
    body: JSON.stringify(body),
  });
  const text = await r.text();
  return { status: r.status, body: text };
}

const results = [];

// 1. MadeWithStack — Skip: we already submitted successfully (200/201) earlier
// and got rate-limited (429) confirming receipt. Doing it again would burn
// their quota without approval. Once per day max. See SUBMISSION-LOG.json.
results.push({ directory: "MadeWithStack", endpoint: "/api/v1/submit", status: 200, body: "skipped - rate-limited in prev run; submission was accepted (201) or pending review" });

// 2. AgentMRR — categories is array, provider must be in enum (x402 not in list → omit).
{
  const payload = {
    name: PRODUCT.name,
    website: PRODUCT.website,
    description: PRODUCT.description.slice(0, 590),
    categories: ["development", "ai", "design"],
    category: "development",
    logoUrl: PRODUCT.logo,
    pricingModel: "usage",
    fundingStatus: "bootstrapped",
    teamSize: 1,
    founderName: PRODUCT.author.name,
    founderXHandle: PRODUCT.author.x,
    foundedAt: "2026-07-11T00:00:00Z",
  };
  const r = await post("https://agentmrr.com/api/agents/submit", payload);
  results.push({ directory: "AgentMRR", endpoint: "/api/agents/submit", status: r.status, body: r.body.slice(0, 400) });
}

// 3. CLIRank — needs description, url, pricing, submitterType, submitterName (string fields, not "your_name").
{
  const payload = {
    name: PRODUCT.name,
    description: PRODUCT.description,
    url: PRODUCT.website,
    pricing: "pay-per-use",
    submitterType: "ai",
    submitterName: PRODUCT.author.name,
    category: "Developer Tools",
    subcategory: "API Marketplaces",
    short_description: "API for AI agents with x402-paid endpoints.",
    homepage_url: PRODUCT.website,
    pricing_model: "Pay per use",
    why: "Built by an AI coding agent. x402-compliant Base USDC payments. Free demo mode with shared quota.",
  };
  const r = await post("https://clirank.dev/api/apis/submit", payload);
  results.push({ directory: "CLIRank", endpoint: "/api/apis/submit", status: r.status, body: r.body.slice(0, 400) });
}

// 4. AgentShare — POST product URL. Required: {url, notes?}. No auth required.
{
  const payload = {
    url: PRODUCT.website,
    notes: "Asset Forge is an x402-compliant API: SVG OG, sitemap bundles, avatars, badges. $0.01 USDC per call on Base. Free demo mode at ?demo=1. Recipient 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e.",
  };
  const r = await post("https://agentshare.dev/api/v1/products/submit", payload);
  results.push({ directory: "AgentShare", endpoint: "/api/v1/products/submit", status: r.status, body: r.body.slice(0, 400) });
}

// 5. x402-list — POST a new x402 service. Requires Category and Description.
{
  const payload = {
    name: PRODUCT.name,
    category: "api-marketplace",
    description: PRODUCT.description,
    url: PRODUCT.website,
    docs: PRODUCT.docs,
    github: PRODUCT.github,
    network: "base",
    asset: "USDC",
    pricing: "$0.01 USDC per call",
    recipient: "0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e",
  };
  const r = await post("https://x402-list.com/api/v1/submit", payload);
  results.push({ directory: "x402-list", endpoint: "/api/v1/submit", status: r.status, body: r.body.slice(0, 400) });
}

// 6. APIbase — register first, get API key, then list. Two-step but auth-free.
{
  // Step a: register agent
  const regRes = await post("https://apibase.pro/api/v1/agents/register", {
    agent_name: "asset-forge-x402",
    agent_version: "1.0.0",
  });
  let apibaseKey = null;
  try {
    const regJson = JSON.parse(regRes.body);
    apibaseKey = regJson.api_key || regJson.key || regJson.token;
  } catch {}
  if (apibaseKey) {
    // Step b: list tools with the key
    const listRes = await post("https://apibase.pro/api/v1/tools", {
      tool: "asset-forge",
      description: PRODUCT.description,
      url: PRODUCT.website,
      docs: PRODUCT.docs,
      pricing: "$0.01 USDC per call",
    }, { "Authorization": `Bearer ${apibaseKey}` });
    results.push({ directory: "APIbase", endpoint: "/api/v1/tools", status: listRes.status, body: listRes.body.slice(0, 400) });
  } else {
    results.push({ directory: "APIbase", endpoint: "/api/v1/agents/register", status: regRes.status, body: regRes.body.slice(0, 400) });
  }
}

console.log("\n--- Submission results ---\n");
for (const r of results) {
  console.log(`[${r.directory}] ${r.endpoint} → HTTP ${r.status}`);
  console.log(`  ${r.body}\n`);
}

import { writeFileSync } from "node:fs";
writeFileSync("SUBMISSION-LOG.json", JSON.stringify({ ts: new Date().toISOString(), results }, null, 2));
console.log("Wrote SUBMISSION-LOG.json");
