// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// ---------------------------------------------------------------------------
// Community / project links. These are the ONLY place the URLs live — the
// header social icons and landing-page CTAs read from here. This site IS
// kathryn-tools.org, so `cppBook` points at the internal "Kathryn C++" book
// (the legacy C++ implementation) rather than an external site.
// ---------------------------------------------------------------------------
export const LINKS = {
  github: 'https://github.com/Tanawin1701d/Kathryn',
  cppBook: '/cppbook/getting-started/introduction/', // the legacy C++ Kathryn (internal)
};

// ---------------------------------------------------------------------------
// GitHub Pages mirror support. The primary deploy (Cloudflare Pages at the
// kathryn-tools.org root) builds with KAT_BASE unset. The mirror at
// https://tanawin1701d.github.io/Kathryn_web/ builds with KAT_BASE=/Kathryn_web
// (see .github/workflows/gh-pages.yml): Astro/Starlight prefix their own
// generated URLs from `base`, and scripts/prefix-base-links.mjs post-processes
// dist/ to prefix the root-absolute links written in page content.
// ---------------------------------------------------------------------------
const BASE = process.env.KAT_BASE ?? '';

// https://astro.build/config
export default defineConfig({
  // Deployed at the root of kathryn-tools.org (Cloudflare Pages); `base` is
  // only set for the GitHub Pages mirror build (KAT_BASE above).
  site: 'https://kathryn-tools.org',
  ...(BASE ? { base: BASE } : {}),
  integrations: [
    // Mermaid must be registered BEFORE Starlight so its remark transform
    // rewrites ```mermaid fences before Expressive Code claims them.
    // Diagrams render client-side and follow the light/dark theme.
    mermaid({
      theme: 'neutral',
      autoTheme: true,
      mermaidConfig: {
        flowchart: { curve: 'basis', htmlLabels: true },
        themeVariables: {
          primaryColor: '#e8eef6',
          primaryBorderColor: '#185fa5',
          lineColor: '#854f0b',
          // MUST be an explicit stack, never 'inherit': diagrams render inside
          // a <pre class="mermaid">, so 'inherit' resolves to the monospace
          // code font — but mermaid MEASURES labels with its default sans
          // font, so every node box comes out too small and text overflows.
          // Keep this in sync with the pre.mermaid rule in custom.css.
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        },
      },
    }),
    starlight({
      title: 'Kathryn',
      description:
        'A cycle-accurate control-flow and resource-abstraction HDL framework. Describe hardware in Python; emit clean Verilog from a Rust core.',
      logo: { src: './src/assets/logo.svg', alt: 'Kathryn' },
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      // Footer override appends the all-rights-reserved copyright line to
      // Starlight's default footer. See src/components/Footer.astro.
      components: {
        Footer: './src/components/Footer.astro',
      },
      social: [
        { icon: 'github', label: 'GitHub', href: LINKS.github },
        { icon: 'open-book', label: 'Kathryn C++ book (Legacy)', href: LINKS.cppBook },
      ],
      head: [
        // Machine-readable counterpart to the visible footer notice. No license
        // is granted for this documentation; the tag travels with any scraped
        // copy of the page.
        {
          tag: 'meta',
          attrs: {
            name: 'copyright',
            content: '© Tanawin Devaveja. All rights reserved.',
          },
        },
        // Drag-to-resize handles for the nav sidebar and the "On this page" TOC.
        { tag: 'script', attrs: { src: `${BASE}/scripts/resizable-panes.js`, defer: true } },
        // Scroll the nav sidebar to the current page's entry on load.
        { tag: 'script', attrs: { src: `${BASE}/scripts/sidebar-autoscroll.js`, defer: true } },
        // Pan & zoom for every rendered mermaid diagram.
        { tag: 'script', attrs: { src: `${BASE}/scripts/diagram-pan-zoom.js`, defer: true } },
      ],
      expressiveCode: {
        themes: ['github-dark', 'vitesse-light'],
      },
      sidebar: [
        {
          label: 'Userbook',
          items: [
            {
              label: 'Getting Started',
              items: [
                'userbook/getting-started/introduction',
                'userbook/getting-started/installation',
                'userbook/getting-started/quickstart',
              ],
            },
            {
              label: 'Core Concepts',
              items: [
                'userbook/core/signals',
                'userbook/core/expressions',
                'userbook/core/assignment',
                'userbook/core/reset-and-defaults',
              ],
            },
            {
              label: 'Flow Control',
              items: [
                'userbook/flow/introduction',
                'userbook/flow/seq-and-par',
                'userbook/flow/conditionals',
                'userbook/flow/state-machines',
                'userbook/flow/pick',
                'userbook/flow/loops',
                'userbook/flow/waits',
              ],
            },
            {
              label: 'Pipelines',
              items: [
                'userbook/pipelines/pip-zync-basics',
                'userbook/pipelines/stalls-and-bubbles',
                'userbook/pipelines/flush-and-hazards',
                'userbook/pipelines/multi-assign-ordering',
                'userbook/pipelines/fanout',
                'userbook/pipelines/arbiters',
              ],
            },
            {
              label: 'Write Priority',
              items: ['userbook/priority/write-priority'],
            },
            {
              label: 'Karray',
              items: [
                'userbook/karray/basics',
                'userbook/karray/records',
                'userbook/karray/backings',
                'userbook/karray/indexing',
                'userbook/karray/dynamic-writes',
                'userbook/karray/reduce',
                'userbook/karray/conversion-and-resize',
              ],
            },
            {
              // The old `kathryn.lib` stdlib was removed upstream; what
              // survives is the `kathryn.combinational` combinators plus the
              // DynCounter CCP.
              label: 'Helpers',
              items: [
                'userbook/lib/combinational',
                'userbook/lib/counter',
              ],
            },
            {
              label: 'Modules & Build',
              items: [
                'userbook/modules/modules',
                'userbook/modules/building-and-emitting',
              ],
            },
            {
              label: 'Examples',
              items: ['userbook/examples/gallery'],
            },
          ],
        },
        {
          label: 'Devbook',
          collapsed: true,
          items: [
            {
              label: 'Architecture',
              items: ['devbook/architecture/overview'],
            },
            {
              label: 'Core Infrastructure',
              items: [
                'devbook/core/model-arena',
                'devbook/core/ident-pattern',
                'devbook/core/factories-and-crud',
                'devbook/core/dispatch',
                'devbook/core/memory-model',
              ],
            },
            {
              label: 'The Model',
              items: [
                'devbook/model/hw-components',
                'devbook/model/module-system',
                'devbook/model/flow-blocks',
                'devbook/model/update-events-and-priority',
                'devbook/model/complex-hardware',
                'devbook/model/combinational',
              ],
            },
            {
              label: 'Backend',
              items: [
                'devbook/backend/verilog-emission',
                'devbook/backend/io-routing',
              ],
            },
            {
              label: 'Python Bindings',
              items: ['devbook/bindings/python-layer'],
            },
            {
              label: 'Tooling',
              items: ['devbook/tooling/debug-system'],
            },
            {
              label: 'Contributing',
              items: ['devbook/contributing/conventions'],
            },
          ],
        },
        {
          // The original C++ Kathryn — the implementation evaluated in the
          // Kathryn paper. Kept as its own book alongside the Rust+Python rewrite.
          label: 'Kathryn C++',
          collapsed: true,
          items: [
            {
              // Everything a user of the C++ framework needs — the original
              // 28-page book, unchanged slugs.
              label: 'User Guide',
              items: [
                {
                  label: 'Getting Started',
                  items: [
                    'cppbook/getting-started/introduction',
                    'cppbook/getting-started/build-and-run',
                    'cppbook/getting-started/quickstart-blink',
                  ],
                },
                {
                  label: 'Core Concepts',
                  items: [
                    'cppbook/core/modules-and-flow',
                    'cppbook/core/hardware-resources',
                    'cppbook/core/assignments-and-expressions',
                  ],
                },
                {
                  label: 'Flow Control',
                  items: [
                    'cppbook/flow/hdb-overview',
                    'cppbook/flow/seq-and-par',
                    'cppbook/flow/conditionals',
                    'cppbook/flow/loops',
                    'cppbook/flow/pick',
                    'cppbook/flow/waits',
                    'cppbook/flow/structural-rtl',
                  ],
                },
                {
                  label: 'Pipelines',
                  items: [
                    'cppbook/pipelines/pip-and-zync',
                    'cppbook/pipelines/pipstream',
                  ],
                },
                {
                  label: 'Decentralized Update',
                  items: ['cppbook/update/decentralized-update'],
                },
                {
                  label: 'Hardware Aggregators',
                  items: [
                    'cppbook/aggregators/slots',
                    'cppbook/aggregators/tables',
                  ],
                },
                {
                  label: 'Backends',
                  items: [
                    'cppbook/backends/simulator',
                    'cppbook/backends/verilog-generation',
                    'cppbook/backends/parameters',
                  ],
                },
                {
                  label: 'Kride Case Study',
                  items: [
                    'cppbook/kride/overview',
                  ],
                },
                {
                  label: 'Reference',
                  items: [
                    'cppbook/reference/operators',
                    'cppbook/reference/driven-logic-structure',
                    'cppbook/reference/nodes',
                  ],
                },
              ],
            },
            {
              // Compiler internals of the C++ implementation, verified
              // against the Kathryn sources (src/model, src/sim, src/gen).
              label: 'Developer Guide',
              collapsed: true,
              items: [
                {
                  label: 'Architecture',
                  items: [
                    'cppbook/internals/architecture',
                    'cppbook/internals/model-controller',
                  ],
                },
                {
                  label: 'The Model Layer',
                  items: [
                    'cppbook/internals/hw-components',
                    'cppbook/internals/update-events',
                    'cppbook/internals/flow-blocks',
                    'cppbook/internals/hw-collections',
                  ],
                },
                {
                  label: 'The Hybrid Simulator',
                  items: [
                    'cppbook/internals/sim-jit',
                    'cppbook/internals/sim-runtime',
                  ],
                },
                {
                  label: 'The Verilog Generator',
                  items: [
                    'cppbook/internals/gen-passes',
                    'cppbook/internals/gen-emission',
                  ],
                },
              ],
            },
          ],
        },
        {
          // A separate research project built ON Kathryn. Site framing: a
          // universal microarchitecture generator with a user-defined ISA is
          // the direction; today it's one microarchitecture (an ISA-agnostic
          // out-of-order CPU generator). One page: the idea + current status,
          // work-in-progress.
          label: 'Carolyne',
          items: ['carolyne'],
        },
      ],
    }),
  ],
});
