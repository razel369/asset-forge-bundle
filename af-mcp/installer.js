#!/usr/bin/env node
// af-mcp - Asset Forge MCP server installer.
//
// One-line install for any MCP-compatible client (Claude Desktop, Cursor, custom):
//   npx --yes https://raw.githubusercontent.com/razel369/asset-forge-bundle/main/af-mcp/installer.js
//
// On run, this script:
//   1. Detects MCP config file based on env vars or common locations
//   2. Patches in the Asset Forge URL if not already present
//   3. Reports success or skip status with a dry-run option
//
// Idempotent: re-running is safe; existing entries are not duplicated.

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const AF_MCP_URL = "https://asset-forge-hire.vercel.app/api/mcp";
const AF_NAME = "asset-forge";
const DRY_RUN = process.env.AF_MCP_DRY_RUN === "1";
const VERBOSE = process.env.AF_MCP_VERBOSE === "1";

// MCP config locations. First one we can write wins.
const CANDIDATES = [
  // Cursor
  path.join(process.cwd(), ".cursor", "mcp.json"),
  path.join(os.homedir(), ".cursor", "mcp.json"),
  // Claude Desktop
  process.platform === "darwin"
    ? path.join(os.homedir(), "Library", "Application Support", "Claude", "claude_desktop_config.json")
    : process.platform === "win32"
    ? path.join(process.env.APPDATA, "Claude", "claude_desktop_config.json")
    : path.join(os.homedir(), ".config", "Claude", "claude_desktop_config.json"),
  // Generic
  path.join(process.cwd(), ".mcp", "config.json"),
];

function log(...args) { if (VERBOSE || !DRY_RUN) console.log(...args); }
function err(...args) { console.error(...args); }

function buildConfigEntry(url) {
  // Cursor uses { url, transport }. Claude Desktop uses { command, args }. We support both.
  return {
    name: AF_NAME,
    url,
    transport: "streamable-http",
  };
}

async function readJson(path) {
  try {
    const raw = await fs.readFile(path, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}

async function writeJson(filepath, data) {
  if (DRY_RUN) {
    log(`[dry-run] would write ${filepath}:`);
    log(JSON.stringify(data, null, 2));
    return;
  }
  const dir = filepath.replace(/[\/\\][^\/\\]+$/, "");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  log(`  wrote ${filepath}`);
}

async function patchConfig(path) {
  const data = (await readJson(path)) || { mcpServers: {} };
  if (!data.mcpServers) data.mcpServers = {};
  const hasExisting = !!data.mcpServers[AF_NAME];
  if (hasExisting) {
    log(`  ${AF_NAME} already in ${path} - skipping`);
    return { status: "skipped", path };
  }
  data.mcpServers[AF_NAME] = buildConfigEntry(AF_MCP_URL);
  await writeJson(path, data);
  return { status: "patched", path };
}

async function main() {
  log(`af-mcp installer (Asset Forge)`);
  log(`Target MCP server: ${AF_MCP_URL}`);
  log(`Mode: ${DRY_RUN ? "dry-run" : "live"}`);
  log(``);
  log(`Probing ${CANDIDATES.length} config paths...`);

  const results = [];
  for (const path of CANDIDATES) {
    try {
      const data = await readJson(path);
      if (data === null) {
        log(`  - ${path} (not found, skipping)`);
        continue;
      }
      log(`  - ${path} (exists, checking for ${AF_NAME}...)`);
      const r = await patchConfig(path);
      results.push(r);
    } catch (e) {
      err(`  ! ${path}: ${e.message}`);
    }
  }

  if (results.length === 0) {
    log(``);
    log(`No existing MCP config found in standard locations.`);
    log(`To add Asset Forge manually, set this in your MCP client config:`);
    log(JSON.stringify({ mcpServers: { [AF_NAME]: buildConfigEntry(AF_MCP_URL) } }, null, 2));
    process.exit(0);
  }

  const patched = results.filter(r => r.status === "patched");
  const skipped = results.filter(r => r.status === "skipped");

  log(``);
  log(`Done: ${patched.length} patched, ${skipped.length} skipped.`);
  if (patched.length > 0) {
    log(`Restart your MCP client (Cursor / Claude Desktop) to load Asset Forge.`);
    log(`The 6 Asset Forge tools will appear alongside your existing tools.`);
  }
  if (DRY_RUN) {
    log(``);
    log(`This was a dry-run. Re-run without AF_MCP_DRY_RUN=1 to apply.`);
  }
}

main().catch(e => {
  err(`Fatal: ${e.message}`);
  process.exit(1);
});
