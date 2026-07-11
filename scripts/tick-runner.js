// Persistent tick runner: every 5 minutes, runs scripts/loop.js once.
// Keeps the heartbeat going in the background.

import { spawnSync } from "node:child_process";

const TICK_MS = 5 * 60 * 1000;

function tick(i) {
  const stamp = new Date().toISOString();
  console.log(`[runner ${stamp}] tick #${i + 1}`);
  const r = spawnSync("node", ["scripts/loop.js"], { stdio: "inherit" });
  if (r.status !== 0) console.error(`[runner] loop exit status ${r.status}`);
}

let i = 0;
tick(i);
setInterval(() => {
  i += 1;
  tick(i);
}, TICK_MS);

console.log("[runner] armed — ticks every 5 minutes");
