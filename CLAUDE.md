# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this repo is

Documentation/presentation website for **Kathryn** — a cycle-accurate
control-flow and resource-abstraction HDL framework. The site documents the
current **Kathryn** implementation (Rust core + Python PyO3 DSL that emits
synthesizable Verilog) in the Userbook and Devbook, and the original **C++
implementation** in a third book, **Kathryn C++** (`/cppbook/`). Built with
**Astro 5 + Starlight**, pure static output, no server-side code. Served at
**https://kathryn-tools.org**.

The public-facing framework name is always **Kathryn**. "Kathryn2" refers
specifically to the Rust rewrite vs. the C++ ancestor — keep that usage inside
the devbook; don't blanket-rename it. In `cppbook/`, say "Kathryn" and
disambiguate as "the C++ implementation" only when needed.

## Commands

| Command           | Action                                                    |
| ----------------- | --------------------------------------------------------- |
| `npm install`     | Install dependencies                                      |
| `npm run dev`     | Dev server at `http://localhost:4321` (hot reload)        |
| `npm run build`   | Production build to `dist/`                               |
| `npm run preview` | Serve the built `dist/` — **search only works here**, not in dev |

Requires Node ≥ 20.

## Structure

- `src/content/docs/index.mdx` — landing page (`template: splash`). Sections:
  hero → FAA positioning (Mermaid "bridges the gap" diagram) → the three
  abstractions → Python→Verilog code pair plus the legacy-C++ sample → rest of
  the toolbox → three books → publication → community & contact. The C++ core
  is always framed as the **legacy version**.
- `src/content/docs/userbook/` — 32 tutorial pages for users of Kathryn
  (getting-started, core, flow, pipelines, priority, karray, lib, modules,
  examples). `karray/` is 7 pages; `lib/` is the **Helpers** group —
  `combinational` and `counter`.
- `src/content/docs/devbook/` — 16 compiler-internals pages for contributors
  (architecture, core, model, backend, bindings, tooling, contributing).
  `model/complex-hardware` covers the CCP layer (Arb / Karray / DynCounter).
- `src/content/docs/carolyne.md` — one page on **Carolyne** (GitHub
  `Tanawin1701d/Carolyne`), a separate work-in-progress research project built
  on Kathryn. The page carries a `:::caution[Work in progress]` banner and its
  homepage cards are labeled "(work in progress)" — keep those.
- `src/content/docs/cppbook/` — 38 pages on the original C++ Kathryn: the
  User Guide (getting-started, core, flow, pipelines, update, aggregators,
  backends, the Kride case study, and the `reference/` pages) plus the
  Developer Guide (`internals/`, 10 compiler-internals pages).
- Every content page carries at least one **Mermaid** diagram. See "Diagrams"
  below.
- `astro.config.mjs` — **the sidebar is the canonical page list.** Every page
  is listed explicitly (no autogenerate). Adding a page = create the `.md` file
  AND add its slug to the sidebar here, or the build won't show it. Also holds
  the `LINKS` constant, the `mermaid()` integration (must stay BEFORE
  `starlight()`), the `social` icons, the `head` script tags, and the
  `KAT_BASE` hook for the GitHub Pages mirror (see Deployment).
- `src/styles/custom.css` — all theme overrides and the resize-handle styling
  (see Design decisions).
- `public/scripts/resizable-panes.js` — drag-to-resize the nav sidebar and the
  "On this page" TOC (see "Resizable panes" below)
- `public/scripts/sidebar-autoscroll.js` — on load, scrolls the nav sidebar so
  the current page's entry is centered (the sidebar lists all three books, so
  deep links would otherwise land with the highlight below the fold). Skips
  scrolling when the entry is already visible.
- `public/scripts/diagram-pan-zoom.js` — every rendered mermaid diagram is a
  pan/zoom viewport (drag pans, Ctrl/Cmd+scroll or pinch zooms, double-click
  resets; keyboard `+`/`-`/arrows/`0` when focused) with overlay zoom buttons
  (`+` / `−` / `↺`, re-created after theme-toggle re-renders). Wired via the
  same Starlight `head` entry pattern; viewport and button CSS live in
  `custom.css` under the mermaid section. Interaction is browser-only — not
  verifiable in the build.
- `public/papers/Kathryn.pdf` — the Kathryn paper preprint, linked from the
  landing page's Publication section.
- `src/assets/` — `logo.svg` (K mark) and `cppbook/` raster figures (8 PNGs,
  post-processed: drawio metadata stripped, max width 1600 px). Content images
  get a light "chip" card in light mode; in dark mode they are **inverted**
  instead (`filter: invert(0.92) hue-rotate(180deg)` — the white chip inverts
  into a dark card; never float figures on a light box in dark mode).
  Dark-native screenshots (e.g. `prof_running`) are excluded via an
  `img[src*=...]` rule. Figures are size-capped (`max-width: 36rem`,
  `max-height: 26rem`) so they stay proportionate to the text column — don't
  let them fill the content width. All in the `.sl-markdown-content img`
  rules in `custom.css`.
- `figsrc/mainFigRepo.drawio` — the draw.io **source of truth** for the
  line-art figures (not served by the build). See `figsrc/README.md` for the
  page→PNG map and export settings; when re-exporting, never check draw.io's
  "Include a copy of my diagram" (it embeds ~1 MB of XML per PNG), and run the
  README's `mogrify -strip` command afterwards.
- `scripts/validate-mermaid.mjs` — parses every `mermaid` block with the real
  mermaid parser under jsdom; run via `npm run check:mermaid`.
- `scripts/prefix-base-links.mjs` — post-build pass for the GitHub Pages
  mirror (see Deployment).
- `DEPLOY.md` — vendor-neutral hosting guide (GitHub Pages / Cloudflare /
  Vercel / Netlify)

## Naming

Kathryn is a **Framework-Assisted Approach (FAA)** that bridges control-flow
abstraction and cycle-accurate control. Its three abstractions — use these
exact names in prose, and map them to the DSL as follows:

- **Hybrid Design Flow (HDF)** → the flow blocks (`seq`, `par`, `cif`/`sif`/`zif`,
  pipelines `pip`/`zync`).
- **Decentralized Update** → priority-resolved multi-writer registers (the
  Write-Priority chapter / `|=` with declared priority).
- **Hardware Aggregator** → the Table & Slot abstraction, exposed as `karray`.

Say **cycle-accurate** (never "cycle-deterministic"), and keep all concrete
DSL/API names verbatim — only the conceptual naming follows the terms above.

## Diagrams (Mermaid)

- Rendered client-side by the `astro-mermaid` integration; works in `.md` and
  `.mdx` via plain ```mermaid fences. Diagrams follow light/dark theme.
- **Only diagram what a page already states** — same ground-truth rule as prose;
  never invent API behavior in a diagram.
- Mermaid errors are **silent** (client-side) — they don't fail `npm run build`.
  Always run `npm run check:mermaid` after adding/editing diagrams.
- `themeVariables.fontFamily` (astro.config.mjs) must stay an **explicit sans
  stack — never `'inherit'`**: diagrams render inside a `<pre class="mermaid">`,
  so `inherit` resolves to the monospace code font while mermaid measures
  labels with sans, making text overflow every node box site-wide. A matching
  `pre.mermaid` rule lives in `custom.css`.
- Syntax gotchas that break the parser: labels with `( ) : | , . / = # < > &`
  must be double-quoted (`A["reg(8)"]`); use `<br/>` for line breaks and "and"
  instead of `&` in labels; never use `end` as a node id; keep state-diagram
  transition labels free of `=`, `::`, `+=`.
- Rendered diagrams are height-capped (`pre.mermaid svg { max-height: 26rem }`
  in `custom.css`) so tall flowcharts stay proportionate to the text — do NOT
  override mermaid's inline `max-width` (small diagrams would stretch up to
  fill it).

## Resizable panes

`public/scripts/resizable-panes.js` (wired via the Starlight `head` config)
injects drag handles: the left one drives `--sl-sidebar-width`, the right one
drives `--sl-content-width` (wider content = narrower TOC). Widths are inline
styles on `<html>` (which beat Starlight's stylesheet rules) and persist in
localStorage; double-click a handle to reset, arrow keys nudge it. Handle
styling lives in `custom.css` under "resizable panes". Drag behavior is only
verifiable in a browser (`npm run dev` / `npm run preview`), not in the build.

## Design decisions (deliberate — do not change casually)

- **Light mode is a warm cream, deliberately NOT pure white**: bg `#f6f1e3`,
  nav/sidebar `#f1ebd9`, warm-tinted gray ramp. Dark mode is standard Starlight
  with accent overrides.
- Accent palette from the Kathryn tech report: **katblue `#185FA5`**,
  **katorange `#854F0B`** (lightened to `#C98A3A` on dark surfaces).
- Code block themes: `github-dark` / `vitesse-light` (set in astro.config.mjs
  under `expressiveCode`).
- Aesthetic: minimal and flat — no textures, generous whitespace.
- **Deployment**: Cloudflare Pages, project `kathryn-web`, served at
  https://kathryn-tools.org (`site` is set in `astro.config.mjs`; no `base`).
  `.github/workflows/deploy.yml` auto-builds and deploys on every push to
  master (needs the `CLOUDFLARE_API_TOKEN` repo secret). Manual deploy:
  `npm run build && npx wrangler pages deploy dist --project-name kathryn-web
  --branch master`. `DEPLOY.md` remains as a general hosting guide.
- **Mirrors** (kathryn-tools.org stays canonical):
  https://kathryn-web.pages.dev (automatic Cloudflare Pages alias, zero
  config) and https://tanawin1701d.github.io/Kathryn_web/ (GitHub Pages,
  deployed by `.github/workflows/gh-pages.yml` on every push to master). The
  GH Pages build sets `KAT_BASE=/Kathryn_web`: `astro.config.mjs` turns that
  into Astro's `base` and prefixes the three head-script `src`s, and
  `scripts/prefix-base-links.mjs` post-processes `dist/` to prefix the
  root-absolute href/src links written in page content (Astro doesn't rewrite
  those). The primary build runs with `KAT_BASE` unset — keep it that way,
  and keep content links root-absolute (`/userbook/...`); the mirror pass
  handles them.
- **GitHub URL**: `https://github.com/Tanawin1701d/Kathryn` (in the `LINKS`
  constant at the top of `astro.config.mjs`, repeated in `index.mdx`).

## Writing/editing doc content — ground truth rules

Never invent Kathryn API behavior — every API statement, code sample, and
emitted-Verilog excerpt must be verified against the Kathryn sources (and
real emitted output; never fabricate Verilog). Known-broken/limitation
behavior is documented honestly in `:::caution` asides — keep it that way.

Conventions used across pages:

- Internal links: absolute with trailing slash, e.g. `/userbook/flow/loops/`
- Code fences tagged `python`, `verilog`, `rust`
- Frontmatter: `title:` and `description:` on every page

## Verification before finishing any change

1. `npm run build` must exit 0.
2. `npm run check:mermaid` must report all blocks valid (mermaid errors are
   otherwise silent — the build won't catch them).
3. There is no built-in internal-link validation — check links manually if you
   add/rename pages (renaming a page breaks inbound links silently). A quick
   scan: collect every `src/content/docs/**/*.md*` path as a slug and grep the
   pages for `](/...)` targets that are not in that set.
4. Search index only builds in `npm run preview`, not dev.
5. Resizable panes and diagram rendering are visual — confirm in a browser
   (`npm run preview`) when you touch them.
