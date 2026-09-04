# shubh-astro.github.io

Personal academic website — [shubh-astro.github.io](https://shubh-astro.github.io/)

Shubh Mittal — incoming doctoral student at the Astronomical Institute, Czech
Academy of Sciences, Prague. Massive stars, transient astronomy, and
high-resolution spectroscopy.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Main page — about, research, publications, journey, contact |
| `adventures.html` | Photo essays from treks and travel |
| `images2/` | Image assets |
| `CV.pdf` | CV linked from the hero (filename is case-sensitive on Pages) |

Static HTML with no build step. Each page is self-contained: styles live in a
`<style>` block in the head, scripts in a `<script>` block before `</body>`.

## Design

Brutalist-sketchy on a light paper ground: hard 2.5px black borders with solid
offset shadows (no blur), a graph-paper background grid, Archivo Black display
type over Space Mono labels, and hand-drawn astro icons defined once as SVG
symbols in `<defs>` and instanced with `<use>`. The sketchy line quality comes
from an `feTurbulence` + `feDisplacementMap` filter; there are two strengths,
because small inline icons turn to mush past about 1px of displacement.

Palette is ink `#141414` on paper `#F4F1E8`, with orange, yellow and blue
accents. Note `--accent` (`#FF5A1F`) is for fills only — it is 2.76:1 against
paper, so orange *text* uses `--accent-ink` (`#B93E05`, 4.95:1). Every
foreground/background pair in use passes WCAG AA.

The one full-spectrum element is the rainbow bar under the name: a dispersed
continuum with 14 Fraunhofer-style absorption lines drawn as crisp 1-2px SVG
rects.

## Publications

The publications section on `index.html` renders from the public ORCID API at
runtime. To enable it, set your ORCID iD near the top of the page script:

```js
const ORCID_ID = '0009-0000-5975-2213';
```

Left blank, the section falls back to a placeholder message. No API key is
needed — `pub.orcid.org` is public and CORS-enabled. Duplicate entries (a
published article plus its arXiv preprint) are collapsed on title.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploying

GitHub Pages publishes `main` automatically. Push to `main` and the site
updates within a minute or two.

## Shared page furniture

`site.js` carries what both pages share: the sketch objects (black hole, galaxy, GRB,
solar system) drifting down the left and right margins, and the comet that trails the
pointer. Their four SVG symbols live in that file rather than in each page's sprite
sheet. The comet is skipped entirely on touch devices and under
`prefers-reduced-motion`, and its animation frame loop parks itself once it catches up
with the cursor.

The decoration layer (`#sky`) is positioned against the document, not the viewport, so
the objects spread down the whole page instead of piling into one screenful.

`site.js` also loads the visitor counter. Set `CODE` in the last block to the site code
from a [GoatCounter](https://www.goatcounter.com) account and every page reports its
views to that dashboard, tagged with the visitor's country and the time of the visit.
Localhost is skipped so local previews stay out of the numbers. GoatCounter sets no
cookies and stores no personal data, so no consent banner is needed. Leaving `CODE`
empty disables the whole thing.

## 3D models

`models/` holds two interactive three.js models (a mass-losing massive star and a
gamma-ray burst collapsar), linked from the **Models** section on the homepage.
Geometry is generated in the browser from a seeded RNG, so there are no mesh files to
ship. The stage can export what it shows as OBJ + MTL or GLB; both pages pass
`no-export` to hide that toolbar.

- `three-d-stage.js` — the `<three-d-stage>` custom element: renderer, lighting,
  orbit controls, auto-framing, export toolbar.
- `shedding-star.js`, `gamma-ray-burst.js` — one `build(THREE)` per model, shared by
  the standalone pages. The GRB returns a `tick(dt)` so the host drives (and can
  pause) the jet flow.
- `shedding-star.html`, `gamma-ray-burst.html` — the standalone pages.

three.js is loaded from a pinned, SRI-checked import map in each page's `<head>`.
All five files must stay in the same folder — the pages resolve each other by
relative path.
