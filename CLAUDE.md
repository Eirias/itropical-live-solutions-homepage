# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static company homepage for PT. ITROPICAL LIVE SOLUTIONS, hosted on GitHub Pages at `itropical-live-solutions.com`. No build tools, no bundler, no framework — plain HTML/CSS/JS served directly.

## Local Development

```bash
python -m http.server 8080
# Open http://localhost:8080
```

There is no build step, no linting, and no test suite.

## Architecture

### Pages

All pages are flat HTML files in the root directory: `index.html`, `contact.html`, `privacy.html`, `imprint.html`. Each page includes the same four deferred scripts in order:

```html
<script src="i18n.js" defer></script>
<script src="header.js" defer></script>
<script src="lang.js" defer></script>
<script src="sw-register.js" defer></script>
```

### Shared Header (Dynamic Injection)

The header is **not** duplicated across pages. `header.html` contains the shared header markup (logo, nav, language switcher). `header.js` fetches it at runtime and injects it into `<div id="site-header"></div>`, then highlights the active nav link and triggers `window.initLang()` to apply translations to the newly injected DOM.

### Internationalization (i18n)

- `i18n.js` defines `window.I18N` — a flat object with `en` and `de` translation dictionaries.
- `lang.js` provides `window.setLang(lang)` and `window.initLang()`. It reads language from URL param (`?lang=de`), then `localStorage`, defaulting to `en`.
- Translatable elements use `data-i18n="key"` attributes. The i18n system replaces `innerHTML`, so translations can contain HTML (e.g., `<strong>`, `<br>`).
- To add a new translatable string: add the key to both `en` and `de` in `i18n.js`, then use `data-i18n="your.key"` on the HTML element.

### Service Worker

`sw.js` implements a cache-first strategy, pre-caching all site assets listed in the `PRECACHE` array. When adding or renaming files, update this array. Bump the `CACHE` version string (e.g., `site-cache-v2` → `v3`) to invalidate old caches.

### Styling

Single `styles.css` file. Dark theme (`#0b1220` background). Mobile breakpoint at 640px. Cards use CSS Grid with `auto-fit`. Header is `position: sticky`. Accent color is `#ffd166`.

## Deployment

Deployed via GitHub Pages. The `CNAME` file sets the custom domain. DNS configuration is documented in `dns.txt`.
