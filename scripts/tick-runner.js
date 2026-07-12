// Persistent tick runner: every 4 minutes, runs a revenue-focused check.
// Stays loaded in the background between user turns.

import { spawnSync } from "node:child_process";

const TICK_MS = 4 * 60 * 1000;

function tick(i) {
  const stamp = new Date().toISOString();
  console.log(`[runner ${stamp}] tick #${i + 1}`);
  const r = spawnSync("node", ["scripts/revenue-loop.js"], { stdio: "inherit" });
  if (r.status !== 0) console.error(`[runner] rev exit ${r.status}`);
}

let i = 0;
tick(i);
setInterval(() => {
  i += 1;
  tick(i);
}, TICK_MS);

console.log("[runner] armed — revenue ticks every 4 minutes");
