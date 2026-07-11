# Asset Forge — Indie Icon Pack

60 hand-tuned SVG icons for indie hackers, SaaS builders, and micro-startups.
Crafted by AI under tight design constraints: 24×24 grid, 1.6 stroke weight,
single-color (uses `currentColor`), fully accessible with `<title>` labels.

## What's inside

- **60 icons** across 6 categories
- **Single-color, stroke-based** — recolor with one CSS rule (`color: ...`)
- **Tiny** — most files under 600 bytes
- **Standard 24×24 viewBox** — drop into any React, Vue, Svelte, or plain HTML
- **Inline-ready** — paste, don't fetch another request
- **MIT licensed** for code-style use; commercial use requires a license below

## Categories

| Folder       | Icons | Themes                                     |
|--------------|------:|--------------------------------------------|
| `tech/`      |    10 | Server, cloud, GPU, network, security      |
| `business/`  |    10 | Briefcase, charts, team, deals             |
| `finance/`   |    10 | Wallet, currency, invoices, banking        |
| `dev/`       |    10 | Code, git, packaging, deployment           |
| `marketing/` |    10 | Outreach, notifications, growth            |
| `ai/`        |    10 | Brain, spark, agent, model, voice          |

## Usage

```html
<img src="icons/dev/code.svg" width="24" height="24" alt="Code" />
```

```jsx
import Code from "./icons/dev/code.svg"; // or paste inline
<Code className="text-indigo-600 w-5 h-5" />
```

```css
/* Recolor the entire pack by changing one CSS variable */
:root { color: #4f46e5; }
svg { width: 1.25rem; height: 1.25rem; }
```

## License & Pricing

See [`LICENSE.md`](./LICENSE.md). Short version:

| Use case                                | Required license                                |
|-----------------------------------------|-------------------------------------------------|
| Personal, non-commercial                | Free, MIT                                       |
| Open-source project                     | Free, MIT (include attribution)                 |
| Commercial product / SaaS (≤ 5 devs)    | **Indie Pack — $29 one-time**                   |
| Commercial product / SaaS (any team)    | **Studio Pack — $99 one-time**                  |
| Reselling or redistribution             | **Forbidden without written permission**        |

Contact: <your-email-here> (replace before publishing).

Buy: <link-to-gumroad-here>

## Regenerate

The pack is deterministic. Tweak `scripts/generate-icons.mjs` and run:

```bash
node scripts/generate-icons.mjs
```
