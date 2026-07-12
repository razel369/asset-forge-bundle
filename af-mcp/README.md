# af-mcp

One-line installer for the Asset Forge MCP server. Idempotent. Re-run
without re-patching.

## Install

### From GitHub (no npm publish required)

```bash
npx --yes https://raw.githubusercontent.com/razel369/asset-forge-bundle/main/af-mcp/installer.js
```

This detects Cursor (`~/.cursor/mcp.json`), Claude Desktop
(`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS,
`%APPDATA%\Claude\claude_desktop_config.json` on Windows,
`~/.config/Claude/` on Linux), and a generic `.mcp/config.json`. The
first existing config is patched; Asset Forge is added under
`mcpServers["asset-forge"]`. Re-running is a no-op.

### From npm (when published)

```bash
npx af-mcp
```

The package on npm does the same thing.

## What Asset Forge exposes to your MCP client

The MCP server is at `https://asset-forge-hire.vercel.app/api/mcp`. It
advertises 6 tools (auto-discovered from the live `bazaar` manifest in
`/api/payment-required`):

- `asset_forge_og` — Generate an SVG Open Graph card. $0.01 USDC.
- `asset_forge_sitemap` — robots.txt + sitemap.xml + llms.txt bundle. $0.01.
- `asset_forge_transform_avatar` — Initials-based monogram. $0.01.
- `asset_forge_transform_badge` — Shields-style status badge. $0.01.
- `asset_forge_transform_preview` — Live URL fetch + Open Graph meta parsing. $1.
- `asset_forge_transform_stats` — Public traffic counters. **Free.**

Every tool accepts `demo: true` in its args to bypass payment (the
server appends `?demo=1` to the request). Without it, the call returns a
402 with the x402 payment-requirements spec; the buyer's MCP client is
expected to send a USDC transfer on Base to
`0x833ca7dcdb6a681ddc0c15982ef0d609bceb3a5e` and retry with
`X-Payment: 0x<tx-hash>`.

## Behaviour

- **Detects existing config**: never overwrites. Skips if `asset-forge` already present.
- **Doesn't clobber unrelated keys**: if `railway`, `github`, etc. are in `mcpServers`, they're preserved.
- **Dry-run support**: set `AF_MCP_DRY_RUN=1` to see what would be written.
- **Verbose mode**: set `AF_MCP_VERBOSE=1` to see which paths are probed.

## Demo

```bash
AF_MCP_DRY_RUN=1 npx --yes https://raw.githubusercontent.com/razel369/asset-forge-bundle/main/af-mcp/installer.js
```

Output:
```
af-mcp installer (Asset Forge)
Target MCP server: https://asset-forge-hire.vercel.app/api/mcp
Mode: dry-run

[dry-run] would write /home/user/.cursor/mcp.json:
{
  "mcpServers": {
    "asset-forge": {
      "name": "asset-forge",
      "url": "https://asset-forge-hire.vercel.app/api/mcp",
      "transport": "streamable-http"
    }
  }
}
```

## License

MIT. See `LICENSE.md` in the project root.
