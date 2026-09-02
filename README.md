# Kathryn website

Documentation and presentation site for the
[Kathryn](https://github.com/Tanawin1701d/Kathryn) RTL hardware compiler —
explicit RTL construction in Python, compiled to Verilog by a Rust core.

Published at **https://kathryn-tools.org**.

Built with [Astro](https://astro.build) + [Starlight](https://starlight.astro.build).

## Structure

- **Landing page** — `src/content/docs/index.mdx`
- **Userbook** (`/userbook/…`) — tutorials and feature guides for people
  building hardware with Kathryn
- **Devbook** (`/devbook/…`) — internal compiler architecture for contributors
- Theme: light mode is a warm cream tone, dark mode standard; both use the
  project palette (katblue `#185FA5`, katorange accents). All overrides live
  in `src/styles/custom.css`.

## Commands

| Command           | Action                                          |
| ----------------- | ----------------------------------------------- |
| `npm install`     | Install dependencies                            |
| `npm run dev`     | Local dev server at `localhost:4321`            |
| `npm run build`   | Production build to `dist/` (validates links)   |
| `npm run preview` | Serve the built site (search works here)        |

## Editing content

Pages are Markdown/MDX in `src/content/docs/`. The sidebar (and therefore the
canonical page list) is defined in `astro.config.mjs` — add new pages there.

## Deploying

See [DEPLOY.md](./DEPLOY.md). The build is pure static output; GitHub Pages,
Cloudflare Pages, Vercel, and Netlify all work with zero or one config change.

## Copyright

© Tanawin Devaveja. All rights reserved.

This repository is readable but **not** open-source licensed — see
[COPYRIGHT.md](./COPYRIGHT.md). Republishing or mirroring the documentation
requires written permission; https://kathryn-tools.org is the canonical
location.
