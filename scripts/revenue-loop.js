// Revenue-focused loop: every tick, chase something that turns into money.
// Categories of effort are kept narrow to maximize hit rate:
//   - verify the live site still serves
//   - find a new place to advertise (no-auth channels only)
//   - stand up a new product page if a service tier doesn't convert
//   - explore a payment provider with zero-config onboarding

import { execSync } from "node:child_process";
import { writeFileSync, existsSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const log = (s) => console.log(`[rev ${new Date().toISOString()}] ${s}`);
const sh = (cmd) => {
  try { return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: "pipe" }); }
  catch (e) { return null; }
};

const REVENUE_LOG = join(ROOT, "REVENUE-LOG.md");

function logRevenue(text) {
  const entry = `\n## ${new Date().toISOString()}\n\n${text}\n`;
  try { appendFileSync(REVENUE_LOG, entry); } catch {}
}

async function tick(i) {
  log(`tick #${i + 1}`);
  // 1. Verify live site
  const vercel = sh(`powershell -NoProfile -Command "(Invoke-WebRequest 'https://asset-forge-hire.vercel.app/' -UseBasicParsing -TimeoutSec 10).StatusCode"`);
  log(`vercel /: ${vercel?.trim() || "ERR"}`);
  const donate = sh(`powershell -NoProfile -Command "(Invoke-WebRequest 'https://asset-forge-hire.vercel.app/donate' -UseBasicParsing -TimeoutSec 10).StatusCode"`);
  log(`donate:  ${donate?.trim() || "ERR"}`);
  const hire = sh(`powershell -NoProfile -Command "(Invoke-WebRequest 'https://asset-forge-hire.vercel.app/hire' -UseBasicParsing -TimeoutSec 10).StatusCode"`);
  log(`hire:    ${hire?.trim() || "ERR"}`);
  logRevenue(`Site health: /=${vercel?.trim()} /hire=${hire?.trim()} /donate=${donate?.trim()}`);
}

const runs = parseInt(process.env.LOOP_RUNS || "1", 10);
for (let i = 0; i < runs; i++) {
  await tick(i);
  if (i < runs - 1) { log("sleep 60s"); await new Promise(r => setTimeout(r, 60_000)); }
}
log(`complete ${runs}`);
