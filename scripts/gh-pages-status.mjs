// Fetch GH Pages status using the gh CLI's own auth.
import { execSync } from "node:child_process";

const token = execSync("gh auth token", { encoding: "utf8" }).trim();

async function gh(url) {
  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "asset-forge",
    },
  });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`${r.status} ${r.statusText}: ${body}`);
  }
  return r.json();
}

async function ghPut(url, body) {
  const r = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "asset-forge",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`${r.status} ${r.statusText}: ${txt}`);
  }
  return r.json();
}

async function main() {
  try {
    const cfg = await gh("https://api.github.com/repos/razel369/asset-forge-bundle/pages");
    console.log("Pages:", cfg.status, cfg.url || "(building)");
  } catch (e) {
    if (String(e.message).includes("404")) {
      console.log("Pages not enabled yet — enabling now…");
      const enableBody = {
        source: { branch: "master", path: "/site" },
        build_type: "legacy",
      };
      try {
        const r = await ghPut("https://api.github.com/repos/razel369/asset-forge-bundle/pages", enableBody);
        console.log("Pages enabled:", r.url || "(building)");
      } catch (e2) {
        console.log("Enable failed:", e2.message);
      }
    } else {
      console.log("Error:", e.message);
    }
  }
}

main();
