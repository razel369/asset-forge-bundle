// /api/sitemap — robots.txt + sitemap.xml + llms.txt bundle.
// Demo (?demo=1) is free. Paid path uses x402.

import { paywallGuard } from "./x402.js";

function safeDomain(s) {
  return s.toLowerCase().replace(/[^a-z0-9.-]/g, "").replace(/^[^a-z0-9]+/, "").slice(0, 64) || "example.com";
}

function robotsTxt(domain) {
  return `User-agent: *\nAllow: /\nSitemap: https://${domain}/sitemap.xml\nUser-agent: GPTBot\nAllow: /\n`;
}

function sitemapXml(domain) {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://${domain}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>
  <url><loc>https://${domain}/about</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>
  <url><loc>https://${domain}/blog</loc><lastmod>${today}</lastmod><priority>0.6</priority></url>
</urlset>
`;
}

function llmsTxt(domain) {
  return `# ${domain}\n\n> Site metadata optimised for LLM discovery.\nVisit https://asset-forge-hire.vercel.app/api-docs for the API that built this file.\n`;
}

export default async function handler(req, res) {
  const domain = safeDomain(String(req.query.domain || req.body?.domain || ""));
  if (!domain) {
    res.status(400).json({ error: "domain required", help: "GET /api/sitemap?domain=example.com" });
    return;
  }
  const isDemo = req.query.demo === "1" || req.body?.demo === true;

  if (!isDemo) {
    const guard = await paywallGuard(req, {
      resource: "https://asset-forge-hire.vercel.app/api/sitemap",
      description: "One SEO bundle (robots + sitemap + llms.txt). $0.01 USDC per call on Base.",
    });
    if (guard.needPayment) {
      for (const [k, v] of Object.entries(guard.response.headers)) res.setHeader(k, v);
      return res.status(guard.response.status).json(guard.response.body);
    }
    if (guard.error) {
      return res.status(402).json({
        error: "Payment Required",
        detail: guard.error,
        hint: "Retry with X-Payment: 0x<txHash> after paying 0.01 USDC to the address in /api/payment-required",
      });
    }
    res.setHeader("X-Payment-Receipt", JSON.stringify(guard.receipt || {}));
  }

  const out = {
    "robots.txt": robotsTxt(domain),
    "sitemap.xml": sitemapXml(domain),
    "llms.txt": llmsTxt(domain),
  };
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({ domain, files: out });
}
