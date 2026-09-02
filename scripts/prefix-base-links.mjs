// Post-build pass for the GitHub Pages mirror (base-path deploy).
//
// Astro only prefixes `base` onto URLs it generates itself (assets, sidebar,
// pagefind, ...). Root-absolute links written in page content — markdown
// `](/userbook/...)`, LinkCard hrefs, hero-action links, raw HTML in the
// hero — come through verbatim, so under /Kathryn_web/ they would 404.
// This script rewrites every remaining root-absolute href/src in the built
// HTML to carry the base prefix. Links already prefixed by Astro are skipped
// (lookahead), so the pass is idempotent.
//
// Usage: node scripts/prefix-base-links.mjs <dist-dir> <base>
//   e.g. node scripts/prefix-base-links.mjs dist /Kathryn_web

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [distDir, baseArg] = process.argv.slice(2);
if (!distDir || !baseArg || !baseArg.startsWith('/')) {
  console.error('usage: node scripts/prefix-base-links.mjs <dist-dir> </base>');
  process.exit(1);
}
const base = baseArg.replace(/\/+$/, ''); // "/Kathryn_web"
const baseName = base.slice(1);

// href="/..." or src="/..." where the path is NOT protocol-relative ("//")
// and NOT already under the base.
const attrRe = new RegExp(
  `\\b(href|src)="/(?!/)(?!${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:/|"))`,
  'g'
);

let files = 0;
let rewrites = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith('.html')) {
      const src = readFileSync(p, 'utf8');
      let count = 0;
      const out = src.replace(attrRe, (_m, attr) => {
        count++;
        return `${attr}="${base}/`;
      });
      if (count > 0) {
        writeFileSync(p, out);
        files++;
        rewrites += count;
      }
    }
  }
}

walk(distDir);
console.log(`prefix-base-links: rewrote ${rewrites} link(s) in ${files} file(s) under ${distDir} with base ${base}`);
