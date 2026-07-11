// Live dashboard — runs once at the end of each "session" and writes DASHBOARD.md.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const sh = (cmd) => {
  try { return execSync(cmd, { cwd: process.cwd(), encoding: "utf8", stdio: "pipe" }); } catch { return ""; }
};

let stars = "?", watch = "?", forks = "?", openIssues = "?";
try {
  const repo = JSON.parse(sh(`gh api -H "Accept: application/vnd.github+json" repos/razel369/asset-forge-bundle`));
  stars = repo.stargazer_count ?? 0;
  watch = repo.subscribers_count ?? 0;
  forks = repo.forks_count ?? 0;
  openIssues = repo.open_issues_count ?? 0;
} catch {}

let recentCommits = [];
try {
  const log = sh("git log --oneline -n 10");
  recentCommits = log.split("\n").filter(Boolean);
} catch {}

const md = `# Asset Forge | Live dashboard

Generated: ${new Date().toISOString()}

## GitHub

- Stars: ${stars}
- Watchers: ${watch}
- Forks: ${forks}
- Open issues: ${openIssues}
- Repo: https://github.com/razel369/asset-forge-bundle

## Recent commits

${recentCommits.slice(0, 8).map(c => `- \`${c}\``).join("\n")}

## What's live

- 60 SVG icons
- 12 SVG illustrations
- 3 landing templates (HTML + JSX)
- 4 OG share cards
- robots.txt, sitemap.xml, humans.txt, llms.txt
- FUNDING.yml
- Issue template (icon request)
- Local preview: http://localhost:4173
`;

writeFileSync("DASHBOARD.md", md);
console.log("DASHBOARD.md updated");
