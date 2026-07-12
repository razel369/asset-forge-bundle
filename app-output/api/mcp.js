// MCP server: Model Context Protocol wrapping Asset Forge's x402-paid endpoints.
//
// Free surface: og, sitemap, avatar, badge, preview, stats.
// All five "result" tools return the asset the buyer paid for.
//
// Inbound payment rules: this MCP server does NOT handle payment itself.
// It proxies every tool call to https://asset-forge-hire.vercel.app and
// requires the caller to attach an `X-Payment: 0x<txHash>` header that has
// already been paid to 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e.
//
// The server discovers tools dynamically by reading /api/payment-required
// and emits them as MCP tools. That keeps the surface honest: there are
// no static, hard-coded tools here — only what the live server declares.

import { discoverTools, callTool } from "./_mcp-client.js";

const SERVER_INFO = {
  name: "Asset Forge",
  version: "1.0.0",
  description:
    "x402-native image/SEO/bazaar generator. Each tool requires payment of " +
    "$0.01 USDC on Base (recipient 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e). " +
    "Free tools (stats) are unauthenticated.",
};

const PROTOCOL_VERSION = "2024-11-05";

function jsonRpcResult(id, result) {
  return { jsonrpc: "2.0", id, result };
}
function jsonRpcError(id, code, message, data) {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}

// ---- Vercel handlers ----
export default async function handler(req, res) {
  // CORS preflight for browser MCP clients
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Payment, X-AF-Pay");
    return res.status(204).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.status(405);
    return res.json(jsonRpcError(null, -32601, "POST only — MCP uses JSON-RPC over HTTP POST"));
  }

  // MCP JSON-RPC body
  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}); }
  catch { return res.status(400).json(jsonRpcError(null, -32700, "Parse error")); }

  const { id, method, params } = body || {};

  try {
    if (method === "initialize") {
      return res.json(jsonRpcResult(id, {
        protocolVersion: PROTOCOL_VERSION,
        serverInfo: SERVER_INFO,
        capabilities: { tools: {} },
      }));
    }

    if (method === "ping") return res.json(jsonRpcResult(id, {}));

    if (method === "tools/list") {
      // Discover tools by reading the public /api/payment-required
      const tools = await discoverTools();
      return res.json(jsonRpcResult(id, { tools }));
    }

    if (method === "tools/call") {
      const { name, arguments: args = {} } = params || {};
      if (!name) return res.json(jsonRpcError(id, -32602, "Missing tool name"));
      const result = await callTool(name, args, req);
      return res.json(jsonRpcResult(id, result));
    }

    return res.json(jsonRpcError(id, -32601, `Method not found: ${method}`));
  } catch (e) {
    return res.status(500).json(jsonRpcError(id, -32603, e.message));
  }
}
