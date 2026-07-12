// /api/payment-required — public, no auth.
// Returns x402 payment-requirements for each paid endpoint.
// A wallet/script reads this BEFORE paying to know exactly where to send.

import { RECIPIENT, CALL_PRICE_USDC, paymentRequirements } from "./x402.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({
    x402Version: "0.1.0",
    recipient: RECIPIENT,
    network: "base",
    assetContract: "0x833589fCD6eDb6E08f27cDef3e17f0BFf37c601fc",
    assetSymbol: "USDC",
    decimals: 6,
    pricePerCall: CALL_PRICE_USDC,
    pricePerCallUnits: "10000",
    confirmationsRequired: 5,
    maxTxAgeSeconds: 14400,
    note: "Send USDC to recipient via ERC-20 Transfer, then retry with header X-Payment: 0x<txHash>",
    endpoints: [
      paymentRequirements({
        resource: "https://asset-forge-hire.vercel.app/api/og",
        description: "Generate one SVG OG card. $0.01 USDC per call.",
      }),
      paymentRequirements({
        resource: "https://asset-forge-hire.vercel.app/api/sitemap",
        description: "Generate SEO bundle (robots + sitemap + llms.txt). $0.01 USDC per call.",
      }),
    ],
  });
}
