// Extract every ```mermaid block from src/content and validate it with the
// real mermaid parser under a jsdom DOM. Prints PASS/FAIL per block.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body></body>', { pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
if (!globalThis.navigator) {
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
}

const mermaid = (await import('mermaid')).default;
mermaid.initialize({ startOnLoad: false });

const ROOT = 'src/content';
function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out = out.concat(walk(p));
    else if (p.endsWith('.md') || p.endsWith('.mdx')) out.push(p);
  }
  return out;
}

function blocks(text) {
  const re = /```mermaid\r?\n([\s\S]*?)```/g;
  const res = [];
  let m;
  while ((m = re.exec(text))) res.push(m[1]);
  return res;
}

let total = 0,
  failed = 0;
for (const file of walk(ROOT)) {
  const bs = blocks(readFileSync(file, 'utf8'));
  for (let i = 0; i < bs.length; i++) {
    total++;
    try {
      const ok = await mermaid.parse(bs[i]);
      if (ok === false) throw new Error('parse returned false');
    } catch (err) {
      failed++;
      console.log(`FAIL ${file} [block ${i + 1}]: ${String(err.message || err).split('\n')[0]}`);
    }
  }
}
console.log(`\n${total - failed}/${total} mermaid blocks valid, ${failed} failed.`);
process.exit(failed ? 1 : 0);
