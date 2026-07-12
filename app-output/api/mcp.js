// /api/mcp - Model Context Protocol server wrapping Asset Forge's x402-paid endpoints.
const BASE = "https://asset-forge-hire.vercel.app";
const SERVER_INFO = {
  name: "Asset Forge",
  version: "1.0.0",
  description: "x402-native image/SEO/bazaar generator. Each tool requires payment of $0.01 USDC on Base (recipient 0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e). Free tools (stats) are unauthenticated.",
};
const PROTOCOL_VERSION = "2024-11-05";
function jsonRpcResult(id, result) { return { jsonrpc: "2.0", id, result }; }
function jsonRpcError(id, code, message) { return { jsonrpc: "2.0", id, error: { code, message } }; }
const TOOL_TEMPLATES = {
  og: { description: "Generate an SVG OG card. $0.01 USDC on Base. Free path: append ?demo=1", properties: { title: { type: "string", description: "Card title" }, subtitle: { type: "string" }, author: { type: "string" }, url: { type: "string" } }, required: ["title"] },
  sitemap: { description: "Generate SEO bundle (robots + sitemap + llms.txt). $0.01 USDC.", properties: { domain: { type: "string" } }, required: ["domain"] },
  transform_avatar: { description: "Generate an initials avatar SVG. $0.01 USDC.", properties: { name: { type: "string" }, size: { type: "number" }, rounded: { type: "boolean" } }, required: ["name"] },
  transform_badge: { description: "Generate a shields-style status badge SVG. $0.01 USDC.", properties: { label: { type: "string" }, value: { type: "string" }, status: { type: "string", enum: ["passing", "failing", "building", "shipping", "default"] } }, required: ["label", "value"] },
  transform_preview: { description: "Fetch a URL and parse Open Graph meta. $1 USDC.", properties: { url: { type: "string" } }, required: ["url"] },
  transform_stats: { description: "Public traffic counters. Free.", properties: {}, required: [] },
};
async function discoverTools() {
  let endpoints = [];
  try {
    const r = await fetch(`${BASE}/api/payment-required`);
    if (r.ok) {
      const j = await r.json();
      const seen = new Set();
      for (const offer of j.endpoints || []) {
        for (const ep of offer.accepts?.[0]?.extra?.bazaar?.endpoints || []) {
          const key = ep.path?.startsWith("/api/transform?kind=") ? "transform_" + ep.kind : ep.kind;
          if (!seen.has(key) && TOOL_TEMPLATES[key]) { seen.add(key); endpoints.push(key); }
        }
      }
    }
  } catch {}
  return endpoints.map((kind) => ({
    name: `asset_forge_${kind}`,
    description: TOOL_TEMPLATES[kind].description,
    inputSchema: { type: "object", properties: TOOL_TEMPLATES[kind].properties, required: TOOL_TEMPLATES[kind].required },
  }));
}
function pathForCall(name, args) {
  switch (name) {
    case "asset_forge_og":
      return `/api/og?title=${encodeURIComponent(args.title || "")}` +
        (args.subtitle ? `&subtitle=${encodeURIComponent(args.subtitle)}` : "") +
        (args.author ? `&author=${encodeURIComponent(args.author)}` : "") +
        (args.url ? `&url=${encodeURIComponent(args.url)}` : "");
    case "asset_forge_transform_avatar":
      return `/api/transform?kind=avatar&name=${encodeURIComponent(args.name || "")}` +
        (args.size ? `&size=${args.size}` : "") + (args.rounded ? `&rounded=1` : "");
    case "asset_forge_transform_badge":
      return `/api/transform?kind=badge&label=${encodeURIComponent(args.label || "")}` +
        `&value=${encodeURIComponent(args.value || "")}` + (args.status ? `&status=${args.status}` : "");
    case "asset_forge_transform_preview":
      return `/api/transform?kind=preview&url=${encodeURIComponent(args.url || "")}`;
    case "asset_forge_sitemap":
      return `/api/sitemap?domain=${encodeURIComponent(args.domain || "example.com")}`;
    case "asset_forge_stats":
      return `/api/transform?kind=stats`;
  }
  return null;
}
async function callTool(name, args, req) {
  const path = pathForCall(name, args);
  if (!path) return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  let fullUrl = path.startsWith("http") ? path : `${BASE}${path}`;
  const headers = { "User-Agent": "asset-forge-mcp/1.0", Accept: "application/json" };
  if (args.demo === true) {
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + "demo=1";
  } else if (req?.headers?.["x-payment"]) {
    headers["X-Payment"] = req.headers["x-payment"];
  } else if (req?.headers?.["x-af-pay"]) {
    headers["X-Payment"] = req.headers["x-af-pay"];
  }
  const r = await fetch(fullUrl, { headers });
  const ct = r.headers.get("content-type") || "";
  const body = await r.text();
  if (r.status === 402) {
    return {
      content: [
        { type: "text", text: `Payment required. ${fullUrl}\n\n` + body },
        { type: "resource", resource: { uri: fullUrl, mimeType: ct || "application/json", text: body } },
      ],
      isError: false,
      _x402_requires_payment: true,
    };
  }
  if (!r.ok) return { content: [{ type: "text", text: `HTTP ${r.status}: ${body}` }], isError: true };
  if (ct.includes("image/svg+xml")) {
    return {
      content: [
        { type: "text", text: `SVG (${body.length} bytes) at ${fullUrl}` },
        { type: "resource", resource: { uri: fullUrl, mimeType: "image/svg+xml", text: body } },
      ],
    };
  }
  if (ct.includes("json")) return { content: [{ type: "text", text: `Response from ${fullUrl}:\n${body}` }] };
  return { content: [{ type: "text", text: `Response from ${fullUrl} (${body.length} bytes, ${ct}):\n${body.slice(0, 400)}` }] };
}
export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Payment, X-AF-Pay");
    return res.status(204).end();
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  if (req.method !== "POST") return res.status(405).json(jsonRpcError(null, -32601, "POST only - MCP uses JSON-RPC over HTTP POST"));
  let body;
  try { body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {}); }
  catch { return res.status(400).json(jsonRpcError(null, -32700, "Parse error")); }
  const { id, method, params } = body || {};
  try {
    if (method === "initialize") return res.json(jsonRpcResult(id, { protocolVersion: PROTOCOL_VERSION, serverInfo: SERVER_INFO, capabilities: { tools: {} } }));
    if (method === "ping") return res.json(jsonRpcResult(id, {}));
    if (method === "tools/list") { const tools = await discoverTools(); return res.json(jsonRpcResult(id, { tools })); }
    if (method === "tools/call") {
      const { name, arguments: args = {} } = params || {};
      if (!name) return res.json(jsonRpcError(id, -32602, "Missing tool name"));
      const result = await callTool(name, args, req);
      return res.json(jsonRpcResult(id, result));
    }
    return res.json(jsonRpcError(id, -32601, `Method not found: ${method}`));
  } catch (e) { return res.status(500).json(jsonRpcError(id, -32603, e.message)); }
}
