# Deploying the Kathryn website

The site is fully static: `npm run build` produces a self-contained `dist/`
directory with no server-side code. Any static host works. This guide covers
the four most common options — pick one; nothing vendor-specific is committed
to the repository.

## Build

Prerequisites: Node.js 20 or newer (22 recommended).

```sh
npm ci        # or: npm install
npm run build # output lands in dist/
```

Preview the built site locally (also enables the Pagefind search index, which
does not run under `npm run dev`):

```sh
npm run preview
```

## Option 1 — GitHub Pages

Best if the repo lives on GitHub anyway. Free.

**Important — project pages need a base path.** If the site will be served at
`https://<user>.github.io/<repo>/` (a *project* page, not a *user* page),
uncomment and adjust these two lines in `astro.config.mjs` first:

```js
site: 'https://<your-user>.github.io',
base: '/Kathryn_web',
```

Skip this if you use a custom domain or a `<user>.github.io` root site.

Then add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: withastro/action@v3
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Finally, in the repo settings → **Pages**, set the source to **GitHub Actions**.
Every push to `main` deploys automatically.

## Option 2 — Cloudflare Pages

Fast global CDN, free tier, nice `*.pages.dev` URLs.

1. Push the repo to GitHub/GitLab.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   connect the repo.
3. Build settings: framework preset **Astro**, build command `npm run build`,
   output directory `dist`.

Every push deploys; pull requests get preview URLs.

## Option 3 — Vercel

1. Push the repo to GitHub.
2. vercel.com → **New Project** → import the repo.
3. Framework preset **Astro** is detected automatically — zero config.

## Option 4 — Netlify

1. Push the repo to GitHub.
2. app.netlify.com → **Add new site** → **Import an existing project**.
3. Build command `npm run build`, publish directory `dist`.

## Manual / self-hosted

`dist/` is plain HTML/CSS/JS — copy it to any web server:

```sh
npm run build
rsync -av dist/ user@server:/var/www/kathryn/
```

## Recommendation

If you have no preference: **GitHub Pages** if the code already lives on
GitHub (one workflow file, done), otherwise **Cloudflare Pages** for the best
performance-per-effort.
