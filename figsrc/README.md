# Figure sources

`mainFigRepo.drawio` — 40-page draw.io file, the **source of truth** for the
line-art figures exported to `src/assets/cppbook/`.

| Exported PNG                  | draw.io page           |
| ----------------------------- | ---------------------- |
| `kathryn_philosophy.png`      | `KathrynPhilo`         |
| `Kathryn_hw_res_impl.png`     | `Kathryn_hw_res`       |
| `decentralize.png`            | `Copy of decentralize` |
| `stateNode.png`               | `node`                 |
| `storeBuffer.png`             | `Page-38`              |

Not from this file:

- `o3.png` came from a separate 3-page draw.io file (pages `Page-1`,
  `Copy of Page-1`, `rotated`) that is not in the repo; its closest in-repo
  analogues are the `ourO3` / `o3Simple` pages.
- `kride_ride_cycle_usage.png` is a Matplotlib chart; `prof_running.png` is a
  gnome-screenshot terminal capture.

## Re-exporting a figure

In draw.io: **File → Export as → PNG** with

- **Zoom 200%** (2x for the ~800 px content column; keep the result ≤ 1600 px
  wide)
- **Transparent Background ON** for line art (OFF for charts/screenshots)
- **Border Width 10**
- **UNCHECK "Include a copy of my diagram"** — that checkbox embeds the whole
  multi-page XML into the PNG as a `tEXt` chunk (~1 MB per file, 85–95 % of
  the old file weight)

Then strip metadata and cap the width (ImageMagick 6):

```bash
mogrify -strip -filter Lanczos -resize '1600>' -define png:compression-level=9 <file>.png
```

This directory is not served by the site build (only `public/` and imports
under `src/` reach `dist/`).
