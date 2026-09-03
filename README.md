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
