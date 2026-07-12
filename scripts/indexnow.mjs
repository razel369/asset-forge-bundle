// Generates a random IndexNow key, writes the verification file at site root,
// then submits a list of URLs to the public IndexNow endpoint.

import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function randomHex(n) {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, n * 2);
}

const SITE_DIR = join(ROOT, "app-output");
const KEY_FILE = join(ROOT, "INDEXNOW-KEY.txt");

let key;
if (existsSync(KEY_FILE)) {
  key = readFileSync(KEY_FILE, "utf8").trim();
  if (!/^[a-f0-9-]{8,128}$/.test(key)) {
    key = null;
  }
}
if (!key) {
  key = randomHex(16); // 32 hex chars
  writeFileSync(KEY_FILE, key + "\n");
  console.log(`Generated IndexNow key: ${key}`);
}

// Place the verification file at site root
writeFileSync(join(SITE_DIR, `${key}.txt`), `${key}\n`);

const urls = [
  "https://asset-forge-hire.vercel.app/",
  "https://asset-forge-hire.vercel.app/hire",
  "https://asset-forge-hire.vercel.app/donate",
  "https://asset-forge-hire.vercel.app/#icons",
  "https://asset-forge-hire.vercel.app/#illustrations",
  "https://asset-forge-hire.vercel.app/#templates",
  "https://asset-forge-hire.vercel.app/#pricing",
];

const body = {
  host: "asset-forge-hire.vercel.app",
  key,
  keyLocation: `https://asset-forge-hire.vercel.app/${key}.txt`,
  urlList: urls,
};

console.log("Submitting to IndexNow...");
const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
console.log(`IndexNow response: ${r.status} ${r.statusText}`);
const text = await r.text();
console.log(text);
