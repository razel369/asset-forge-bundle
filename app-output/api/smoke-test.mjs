// Round-trip: get a key, sign a request, render an OG card.
import crypto from "node:crypto";
import fs from "node:fs";

const BASE = "https://asset-forge-hire.vercel.app";

const keyRes = await fetch(`${BASE}/api/key`);
const { id, secret } = await keyRes.json();
console.log("Got key:", id);

function sign(method, endpoint) {
  return crypto.createHmac("sha256", secret).update(`${method} ${endpoint}`).digest("hex");
}

const path = `/api/og?title=Hello&subtitle=From%20a%20signed%20request&key=${id}&t=${Math.floor(Date.now()/1000)}`;
const sig = sign("GET", "/api/og");
const finalPath = `${path}&sig=${sig}`;

const ogRes = await fetch(`${BASE}${finalPath}`);
console.log("og signed:", ogRes.status, ogRes.headers.get("content-type"));
const ogBody = await ogRes.text();
console.log("body length:", ogBody.length);

fs.writeFileSync("/tmp/og-signed.svg", ogBody);
console.log("wrote /tmp/og-signed.svg");
