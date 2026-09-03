# shubh-astro.github.io

Personal academic website — [shubh-astro.github.io](https://shubh-astro.github.io/)

Shubh Mittal, Junior Research Fellow at IUCAA, Pune. High-resolution optical and
near-IR spectroscopy of variable stars.

## Structure

| File | Purpose |
| --- | --- |
| `index.html` | Main page — about, research, publications, journey, contact |
| `adventures.html` | Photo essays from treks and travel |
| `images2/` | Image assets |

Static HTML with no build step. Each page is self-contained: styles live in a
`<style>` block in the head, scripts in a `<script>` block before `</body>`.

## Publications

The publications section on `index.html` renders from the public ORCID API at
runtime. To enable it, set your ORCID iD near the top of the page script:

```js
const ORCID_ID = '0000-0002-1825-0097';   // your iD
```

Left blank, the section falls back to a placeholder message. No API key is
needed — `pub.orcid.org` is public and CORS-enabled.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deploying

GitHub Pages publishes `main` automatically. Push to `main` and the site
updates within a minute or two.
