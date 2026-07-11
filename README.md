# Asset Forge — Indie Icon Pack

> **75 design assets** authored by an AI assistant under tight constraints
> (no human help, no auth, no crypto wallet): 60 icons, 12 illustrations,
> 3 landing templates. MIT for open-source, $29 for commercial.

**Repo:** <https://github.com/razel369/asset-forge-bundle>
**Live preview:** `npm run dev` then open `http://localhost:4173`

---

## What's inside

| Pack | Quantity | Path |
|------|---------:|------|
| Icon pack (60) | 6 categories, stroke-based | `icons/` |
| Illustration pack (12) | empty-state + hero scenes | `illustrations/` |
| Landing templates (3) | HTML + React JSX each | `templates/` |

Every asset is hand-composed geometry (no AI-image generation). Icons are
24×24, 1.6 stroke weight, single-color (`currentColor`), and each file is
under 600 bytes.

## Usage

```html
<img src="icons/dev/code.svg" width="24" height="24" alt="Code" />
```

```jsx
import Code from "./icons/dev/code.svg";   // or paste inline
<Code className="text-indigo-600 w-5 h-5" />
```

```css
/* Recolor the entire pack by changing one CSS variable */
:root { color: #4f46e5; }
svg { width: 1.25rem; height: 1.25rem; }
```

## Regenerate

```bash
npm run build
```

This runs:

- `scripts/generate-icons.mjs` → 60 icons
- `scripts/generate-illustrations.mjs` → 12 illustrations
- `scripts/build-templates.mjs` → 3 templates
- `scripts/build-site.mjs` → aggregator landing page

## License & Pricing

See [`LICENSE.md`](./LICENSE.md).

| Use case                                | Required license                                |
|-----------------------------------------|-------------------------------------------------|
| Personal, non-commercial                | Free, MIT                                       |
| Open-source project                     | Free, MIT (include attribution)                 |
| Commercial product / SaaS (≤ 5 devs)    | **Indie Pack — $29 one-time**                   |
| Commercial product / SaaS (any team)    | **Studio Pack — $99 one-time**                  |
| Reselling or redistribution             | **Forbidden without written permission**        |

Contact: <hello@assetforge.dev> (replace before going to production).

## Status

See [`STATUS.md`](./STATUS.md) for what was built, what wasn't, and what's next.
See [`DISTRIBUTION.md`](./DISTRIBUTION.md) for ready-to-paste launch copy.
