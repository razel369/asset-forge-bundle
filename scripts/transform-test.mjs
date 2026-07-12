// /api/transform end-to-end test.
// 4 modes: preview, avatar, badge, stats. Each behaves as a sub-endpoint.

const BASE = "https://asset-forge-hire.vercel.app";

async function check(label, fn) {
  try { await fn(); console.log(`  PASS  ${label}`); }
  catch (e) { console.error(`  FAIL  ${label}: ${e.message}`); process.exitCode = 1; }
}

async function main() {
  console.log("\n[transform — consolidated family]");

  await check("kind=preview&demo=1 returns parsed meta", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=preview&url=https://stripe.com&demo=1`);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    const j = await r.json();
    if (!j.title || !j.title.toLowerCase().includes("stripe")) throw new Error(`title ${j.title}`);
    if (typeof j.hasOpenGraph !== "boolean") throw new Error(`missing hasOpenGraph`);
  });

  await check("kind=avatar&demo=1 returns SVG", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=avatar&name=Mary+Smith&size=128&demo=1`);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    const t = await r.text();
    if (!t.includes("MS")) throw new Error(`expected MS initials, got ${t.slice(0,80)}`);
  });

  await check("kind=avatar&demo=1 with rounded returns SVG with circle", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=avatar&name=AC&size=64&rounded=1&demo=1`);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    const t = await r.text();
    if (!t.includes("<circle ")) throw new Error(`expected circle in rounded avatar`);
  });

  await check("kind=badge&demo=1 returns SVG with badge colors", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=badge&label=build&value=passing&status=passing&demo=1`);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    const t = await r.text();
    if (!t.includes("22c55e")) throw new Error(`expected passing green`);
  });

  await check("kind=stats returns JSON counters", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=stats`);
    if (r.status !== 200) throw new Error(`status ${r.status}`);
    const j = await r.json();
    if (typeof j.today !== "object") throw new Error(`no today`);
    if (typeof j.lifetime !== "object") throw new Error(`no lifetime`);
  });

  await check("no kind returns 400 with help", async () => {
    const r = await fetch(`${BASE}/api/transform`);
    if (r.status !== 400) throw new Error(`status ${r.status}`);
    const j = await r.json();
    if (!j.kinds || !j.kinds.length) throw new Error(`no kinds`);
  });

  await check("OPTIONS preflight on /api/transform returns 204", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=stats`, { method: "OPTIONS" });
    if (r.status !== 204) throw new Error(`status ${r.status}`);
    if (!r.headers.get("access-control-allow-origin")) throw new Error(`no CORS header`);
  });

  await check("paid kind=preview without payment returns 402", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=preview&url=https://stripe.com`);
    if (r.status !== 402) throw new Error(`status ${r.status}`);
  });

  await check("paid kind=avatar without payment returns 402", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=avatar&name=Mary+Smith`);
    if (r.status !== 402) throw new Error(`status ${r.status}`);
  });

  await check("paid kind=badge without payment returns 402", async () => {
    const r = await fetch(`${BASE}/api/transform?kind=badge&label=v&value=ok&status=passing`);
    if (r.status !== 402) throw new Error(`status ${r.status}`);
  });

  console.log("\n[all 9 transform sub-tests passing]");
}

main();
