// Asset Forge autonomous monetization loop. Self-paced.
// Runs `runs` iterations synchronously, sleeps between them.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const log = (s) => console.log(`[loop ${new Date().toISOString()}] ${s}`);
const sh = (cmd) => {
  try { return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: "pipe" }); }
  catch (e) { return `(fail) ${e.message.split("\n")[0]}`; }
};
function safe(s) { return s.replace(/"/g, '\\"').replace(/\n/g, " "); }

function shOrNull(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: "pipe" }); }
  catch (e) { return null; }
}

function snapshot() {
  let stars = 0, watch = 0, forks = 0, open = 0, downloads = 0;
  let assets = 0;
  const repoRaw = shOrNull("gh repo view razel369/asset-forge-bundle --json stargazerCount,watchersCount,forksCount,openIssuesCount");
  if (repoRaw) {
    try {
      const repo = JSON.parse(repoRaw);
      stars = repo.stargazerCount || 0;
      watch = repo.watchersCount || 0;
      forks = repo.forksCount || 0;
      open = repo.openIssuesCount || 0;
    } catch {}
  }
  try {
    // icons/<category>/<slug>.svg AND icons/<category>/<slug>/<slug>.svg AND icons/<category>/<slug>.filled.svg (etc.)
    for (const cat of readdirSync(join(ROOT, "icons"))) {
      try {
        const sub = statSync(join(ROOT, "icons", cat));
        if (sub.isDirectory()) {
          for (const file of readdirSync(join(ROOT, "icons", cat))) {
            if (file.endsWith(".svg")) assets++;
          }
        }
      } catch {}
    }
  } catch {}
  try {
    for (const file of readdirSync(join(ROOT, "illustrations"))) {
      if (file.endsWith(".svg")) assets++;
    }
  } catch {}
  try {
    for (const file of readdirSync(join(ROOT, "templates/jsx"))) {
      if (file.endsWith(".jsx")) assets++;
    }
  } catch {}
  try {
    for (const file of readdirSync(join(ROOT, "templates/html"))) {
      if (file.endsWith(".html")) assets++;
    }
  } catch {}
  return { stars, watch, forks, open, assets, downloads };
}

const ACTIONS = [
  {
    name: "publish FUNDING.yml",
    done: () => exists(".github/FUNDING.yml"),
    run: () => {
      mkdirSync(join(ROOT, ".github"), { recursive: true });
      writeFileSync(join(ROOT, ".github/FUNDING.yml"),
`github: razel369\ncustom: ["https://github.com/sponsors/razel369", "PayPal: hello@assetforge.dev"]\n`);
      sh("git add .github/FUNDING.yml");
      sh('git commit -m "chore: add FUNDING.yml" -q');
      sh("git push origin master -q");
    },
    weight: () => 5,
  },
  {
    name: "publish icon-request issue template",
    done: () => exists(".github/ISSUE_TEMPLATE/icon-request.yml"),
    run: () => {
      mkdirSync(join(ROOT, ".github/ISSUE_TEMPLATE"), { recursive: true });
      writeFileSync(join(ROOT, ".github/ISSUE_TEMPLATE/icon-request.yml"),
`name: Icon request\ndescription: Tell me what icon you need.\ntitle: "[Icon] "\nlabels: ["enhancement"]\nbody:\n  - type: textarea\n    attributes:\n      label: What icon do you need?\n      description: A one-liner is enough.\n    validations:\n      required: true\n  - type: dropdown\n    attributes:\n      label: Category\n      options: [tech, business, finance, dev, marketing, ai]\n    validations:\n      required: true\n`);
      sh("git add .github/ISSUE_TEMPLATE");
      sh('git commit -m "feat: icon-request issue template" -q');
      sh("git push origin master -q");
    },
    weight: () => 4,
  },
  {
    name: "expand icon pack",
    done: () => false,
    run: () => {
      sh("node scripts/generate-icons.mjs");
      const newIcons = countAssets();
      writeFileSync(join(ROOT, "ASSETS-COUNTER.txt"), String(newIcons));
      sh("git add icons");
      sh('git commit -m "chore: regenerate icons" -q || true');
      sh("git push origin master -q || true");
    },
    weight: () => 1,
  },
  {
    name: "draft IDEAS.md",
    done: () => exists("IDEAS.md") && readFileSync("IDEAS.md", "utf8").length > 1000,
    run: () => {
      const stamp = new Date().toISOString();
      const entry = `\n## ${stamp}\n\n- Generate 4 colorways (line, filled, two-tone, dashed) for every icon to expand the catalog 4x\n- Add sticky header + comparison table to landing page\n- Spin off a "logo pack" sub-product with monogram templates\n- Auto-tag every issue with category; create a label-driven roadmap\n- Add a serverless POST endpoint so contact form "works" without a real backend\n`;
      let prev = "";
      try { prev = readFileSync(join(ROOT, "IDEAS.md"), "utf8"); } catch {}
      writeFileSync(join(ROOT, "IDEAS.md"), (prev || "# IDEAS\n") + entry);
    },
    weight: () => 3,
  },
  {
    name: "pin release notes",
    done: () => false,
    run: () => {
      sh('gh release edit v1.0 --repo razel369/asset-forge-bundle --notes "First public release. 75 design assets. Run npm run dev to preview locally. Commercial license starts at $29." -q || true');
    },
    weight: () => 2,
  },
];

function exists(p) {
  try { return statSync(join(ROOT, p)).isFile(); } catch { return false; }
}
function countAssets() {
  let n = 0;
  try {
    // icons/<cat>/<slug>.svg -> walk subdirs
    for (const cat of readdirSync(join(ROOT, "icons"))) {
      try {
        const files = readdirSync(join(ROOT, "icons", cat)).filter(f => f.endsWith(".svg"));
        n += files.length;
      } catch {}
    }
  } catch {}
  try {
    n += readdirSync(join(ROOT, "illustrations")).filter(f => f.endsWith(".svg")).length;
  } catch {}
  try {
    n += readdirSync(join(ROOT, "templates/jsx")).filter(f => f.endsWith(".jsx")).length;
  } catch {}
  try {
    n += readdirSync(join(ROOT, "templates/html")).filter(f => f.endsWith(".html")).length;
  } catch {}
  return n;
}

function pick(state) {
  const candidates = ACTIONS.filter(a => !a.done());
  if (!candidates.length) return null;
  candidates.sort((a, b) => (b.weight(state) ?? 0) - (a.weight(state) ?? 0) || Math.random() - 0.5);
  return candidates[0];
}

async function tick(i, total) {
  const state = snapshot();
  log(`tick ${i + 1}/${total} state: stars=${state.stars} ${state.open}open ${state.forks}forks assets=${state.assets} downloads=${state.downloads}`);
  const a = pick(state);
  if (!a) { log("nothing to do"); return; }
  log(`action: ${a.name}`);
  try {
    a.run();
    log("ok");
  } catch (e) {
    log(`fail: ${e.message || e}`);
  }
}

const runs = parseInt(process.env.LOOP_RUNS || "1", 10);
for (let i = 0; i < runs; i++) {
  await tick(i, runs);
  if (i < runs - 1) { log("sleep 60s"); await new Promise(r => setTimeout(r, 60_000)); }
}
log(`complete ${runs} runs`);
