// Proxies MCP tool calls to the live Asset Forge API.
// Tools are dynamic — discovered from /api/payment-required's bazaar manifest.

const BASE = process.env.AF_BASE || "https://asset-forge-hire.vercel.app";

// We rewrite each "kind" in the bazaar manifest into an MCP tool.
// Schema for each is auto-generated from the query-string shape of the URL.

function kindFromPath(path) {
  // paths like "/api/og?title=X" -> "og"; "/api/transform?kind=avatar&name=X" -> "transform_avatar"
  const url = new URL(path, BASE);
  const m = url.pathname.match(/\/api\/(\w+)/);
  if (!m) return null;
  let name = m[1];
  const k = url.searchParams.get("kind");
  if (k) name += "_" + k;
  return name;
}

function mcpTypeForKind(kind) {
  if (kind === "og") return "SVG image (text-only SVG card)";
  if (kind === "sitemap") return "JSON envelope with three SEO files";
  if (kind === "transform_avatar") return "Initials SVG (square or rounded)";
  if (kind === "transform_badge") return "Shields-style status badge SVG";
  if (kind === "transform_preview") return "JSON with parsed Open Graph meta + favicon";
  if (kind === "transform_stats") return "JSON with today's traffic counters";
  return "Image or text asset";
}

// Map each kind to an MCP tool.
const TOOL_TEMPLATES = {
  og: {
    description: "Generate an SVG OG card. $0.01 USDC on Base. Free path: append ?demo=1",
    properties: {
      title: { type: "string", description: "Card title (≤80 chars)" },
      subtitle: { type: "string", description: "Card subtitle (≤120 chars)" },
      author: { type: "string", description: "Byline (≤60 chars)" },
      url: { type: "string", description: "Domain to show in footer" },
    },
    required: ["title"],
  },
  transform_avatar: {
    description: "Generate an initials avatar SVG. $0.01 USDC. Free path: append ?demo=1",
    properties: {
      name: { type: "string", description: "Person's name (will be parsed to initials)" },
      size: { type: "number", description: "Pixel size (16..1024, default 96)" },
      rounded: { type: "boolean", description: "Use rounded background" },
    },
    required: ["name"],
  },
  transform_badge: {
    description: "Generate a shields-style status badge SVG. $0.01 USDC. Free path: append ?demo=1",
    properties: {
      label: { type: "string", description: "Left-side label" },
      value: { type: "string", description: "Right-side value" },
      status: { type: "string", enum: ["passing", "failing", "building", "shipping", "default"], description: "Color key" },
    },
    required: ["label", "value"],
  },
  transform_preview: {
    description: "Fetch a URL and parse Open Graph meta. $1 USDC. Free path: append ?demo=1",
    properties: {
      url: { type: "string", description: "https URL to fetch" },
    },
    required: ["url"],
  },
  transform_stats: {
    description: "Public traffic counters. Free.",
    properties: {},
    required: [],
  },
  sitemap: {
    description: "Generate SEO bundle (robots + sitemap + llms.txt). $0.01 USDC. Free path: append ?demo=1",
    properties: {
      domain: { type: "string", description: "Domain name, e.g. example.com" },
    },
    required: ["domain"],
  },
  stats: {
    description: "Public traffic counters. Free.",
    properties: {},
    required: [],
  },
};

export async function discoverTools() {
  // Pull live tools from /api/payment-required's bazaar manifest.
  let endpoints = [];
  try {
    const r = await fetch(`${BASE}/api/payment-required`);
    if (r.ok) {
      const j = await r.json();
      const seen = new Set();
      for (const offer of j.endpoints || []) {
        for (const ep of offer.accepts?.[0]?.extra?.bazaar?.endpoints || []) {
          // bazaar kinds are short (og, avatar, badge, preview, sitemap, stats);
          // MCP tool keys are normalised to 'transform_<kind>' for transform/* kinds
          // to mirror the path "/api/transform?kind=...".
          const key = ep.path?.startsWith("/api/transform?kind=")
            ? "transform_" + ep.kind
            : ep.kind;
          if (!seen.has(key) && TOOL_TEMPLATES[key]) {
            seen.add(key);
            endpoints.push(key);
          }
        }
      }
    }
  } catch {}

  const tools = endpoints.map((kind) => ({
    name: `asset_forge_${kind}`,
    description: TOOL_TEMPLATES[kind].description,
    inputSchema: {
      type: "object",
      properties: TOOL_TEMPLATES[kind].properties,
      required: TOOL_TEMPLATES[kind].required,
    },
  }));

  return tools;
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
             (args.size ? `&size=${args.size}` : "") +
             (args.rounded ? `&rounded=1` : "");
    case "asset_forge_transform_badge":
      return `/api/transform?kind=badge&label=${encodeURIComponent(args.label || "")}` +
             `&value=${encodeURIComponent(args.value || "")}` +
             (args.status ? `&status=${args.status}` : "");
    case "asset_forge_transform_preview":
      return `/api/transform?kind=preview&url=${encodeURIComponent(args.url || "")}`;
    case "asset_forge_sitemap":
      return `/api/sitemap?domain=${encodeURIComponent(args.domain || "example.com")}`;
    case "asset_forge_stats":
      return `/api/transform?kind=stats`;
  }
  return null;
}

export async function callTool(name, args, req) {
  const path = pathForCall(name, args);
  if (!path) return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };

  let fullUrl = path.startsWith("http") ? path : `${BASE}${path}`;
  const headers = { "User-Agent": "asset-forge-mcp/1.0", Accept: "application/json" };

  // Forward buyer X-Payment header verbatim if present.
  // For demo mode (when dev supplies ?demo=1), append &demo=1 to the URL.
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
    // The server returned a 402 Payment Required with the spec — return
    // that to the MCP caller so the buyer's wallet knows what to pay.
    return {
      content: [
        { type: "text", text: `Payment required. ${fullUrl}\n\n` + body },
        { type: "resource", resource: { uri: fullUrl, mimeType: ct || "application/json", text: body } },
      ],
      isError: false, // not an error — payment flow
      _x402_requires_payment: true,
    };
  }

  if (!r.ok) {
    return { content: [{ type: "text", text: `HTTP ${r.status}: ${body}` }], isError: true };
  }

  // Pass through SVG as text with proper mime hint
  if (ct.includes("image/svg+xml")) {
    return {
      content: [
        { type: "text", text: `SVG (${body.length} bytes) at ${fullUrl}` },
        { type: "resource", resource: { uri: fullUrl, mimeType: "image/svg+xml", text: body } },
      ],
    };
  }
  if (ct.includes("json")) {
    return {
      content: [
        { type: "text", text: `Response from ${fullUrl}:\n${body}` },
      ],
    };
  }
  return {
    content: [
      { type: "text", text: `Response from ${fullUrl} (${body.length} bytes, ${ct}):\n${body.slice(0, 400)}` },
    ],
  };
}
