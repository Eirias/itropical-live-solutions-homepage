# Animation & Micro-Interaction Spec — itropical-live-solutions.com

**Goal:** Lift the site from "rudimentary" to "quietly premium" — Apple-like restraint, B2B-appropriate.
**Constraints honored:** vanilla CSS + one small JS file, only `transform`/`opacity` animated, no scroll-jacking, full `prefers-reduced-motion` support, header-injection-safe (reveal system targets `<main>` only).

**Files to touch:**

| File | Change |
|---|---|
| `styles.css` | Append all CSS in this spec (sections 1–6) |
| `reveal.js` | **New file** — the only JS (section 2) |
| `index.html`, `portfolio.html`, `dicetales.html`, `markr.html`, `evanthium.html`, `contact.html`, `privacy.html`, `imprint.html` | Add `<script src="reveal.js" defer></script>` after `sw-register.js`; add `data-reveal` attributes per section 2.3 |
| `sw.js` | Add `reveal.js` to `PRECACHE`, bump `CACHE` version |

**Global timing language (use these everywhere, no other values):**

```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);      /* "swift out" — decisive, settles softly */
  --ease-spring: cubic-bezier(0.34, 1.4, 0.64, 1);  /* tiny overshoot — hover only, never layout */
  --dur-fast: 0.2s;    /* hovers */
  --dur-med: 0.45s;   /* reveals */
  --dur-slow: 0.7s;   /* hero entrance */
}
```

One easing for entrances, one for hovers. Consistency is what reads as "professional."

---

## 1. Page-Load Hero Entrance (stagger-in)

The hero's four children (`h1`, `.lead`, `p`, `.cta`) fade up in sequence. Pure CSS — runs on every page load, no JS needed, no FOUC risk because the animation starts immediately from the hidden keyframe.

**CSS — append to `styles.css`:**

```css
/* === 1. Hero entrance === */
@keyframes rise-in {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.hero > h1,
.hero > h2,
.hero > .lead,
.hero > p,
.hero > .cta,
.hero .app-hero-content > * {
  animation: rise-in var(--dur-slow) var(--ease-out) both;
}

.hero > :nth-child(1), .hero .app-hero-content > :nth-child(1) { animation-delay: 0.05s; }
.hero > :nth-child(2), .hero .app-hero-content > :nth-child(2) { animation-delay: 0.13s; }
.hero > :nth-child(3) { animation-delay: 0.21s; }
.hero > :nth-child(4) { animation-delay: 0.29s; }
```

**Decisions:**
- `14px` travel, not 30–40px — long travels read as "template." Short travel + long duration = expensive feel.
- `both` fill mode so elements are hidden during their delay (no flash).
- 80ms stagger step — perceptible rhythm without feeling slow; whole hero settles in under 1s.
- App pages (`dicetales.html` etc.): the icon + text block inside `.app-hero-content` stagger as children 1 and 2 — covered by the selectors above, zero markup changes.
- Do **not** animate the header. It's injected async via `header.js`; animating it would draw attention to its late arrival. It should just be there.

---

## 2. Scroll-Reveal System

### 2.1 The JS — new file `reveal.js` (complete, 28 lines)

```js
/* reveal.js — scroll-reveal via IntersectionObserver. No deps. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var els = document.querySelectorAll('main [data-reveal]');
  if (!els.length) return;

  if (reduce.matches || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('is-revealed'); });
    return;
  }

  document.documentElement.classList.add('reveal-ready');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      // Stagger siblings that share the same parent (e.g. cards in a grid)
      var group = el.parentElement.querySelectorAll(':scope > [data-reveal]');
      var i = Array.prototype.indexOf.call(group, el);
      el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
      el.classList.add('is-revealed');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  els.forEach(function (el) { io.observe(el); });
})();
```

**Decisions baked in:**
- **Header-safe:** selector is `main [data-reveal]` — the injected header is outside `<main>` and untouched. No MutationObserver gymnastics needed.
- **No-JS / no-IO safe:** content is only hidden after `reveal-ready` lands on `<html>` (added by this script). If JS fails or the browser is ancient, everything is visible. This is the load-bearing FOUC guard.
- **Stagger is computed, not hard-coded:** sibling index × 70ms, capped at 350ms so a 6th+ card never lags. Works for 3 service cards and 5 dice-pack cards alike.
- `rootMargin: -8%` bottom — elements reveal slightly after entering the viewport, so the user actually sees the motion instead of it firing below the fold.
- `unobserve` after reveal: animate once, never re-hide on scroll-up. Re-hiding is portfolio-playground behavior.

### 2.2 The CSS — append to `styles.css`

```css
/* === 2. Scroll reveal === */
.reveal-ready [data-reveal] {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity var(--dur-med) var(--ease-out),
    transform var(--dur-med) var(--ease-out);
  will-change: opacity, transform;
}
.reveal-ready [data-reveal].is-revealed {
  opacity: 1;
  transform: translateY(0);
  will-change: auto;
}
```

Note `will-change` is released (`auto`) after reveal — keeps GPU layer count low on mobile.

### 2.3 Markup changes — add `data-reveal` to:

- Every `.section > h2` (section headings)
- Every `.card` and `.app-card` inside `.cards` grids (these get the auto-stagger)
- The `.screenshot-row` on app pages (the row as one unit, **not** per-screenshot — per-image stagger in a horizontal scroller looks broken)
- The `services.hint` paragraph on `index.html`

Do **not** put `data-reveal` on hero children (section 1 owns those) or on the footer (footer popping in feels glitchy on short pages).

Example:

```html
<section id="services" class="section container">
  <h2 data-i18n="services.title" data-reveal>Services</h2>
  <div class="cards">
    <div class="card" data-reveal>…</div>
    <div class="card" data-reveal>…</div>
    <div class="card" data-reveal>…</div>
  </div>
</section>
```

### 2.4 Script include (all 8 pages)

```html
<script src="sw-register.js" defer></script>
<script src="reveal.js" defer></script>
```

And in `sw.js`: add `'/reveal.js'` to `PRECACHE`, bump cache version string.

---

## 3. Hover Micro-Interactions

### 3.1 Cards (services, dice packs — non-link cards)

Static info cards get a whisper of response — border brightens, no lift (lift implies clickable; these aren't).

```css
/* === 3. Hovers === */
.card {
  transition: border-color var(--dur-fast) ease;
}
.card:hover {
  border-color: #3a4a6e;
}
```

### 3.2 App cards (clickable) — replace the existing `.app-card` hover block

```css
.app-card {
  text-decoration: none;
  color: #eaeef7;
  cursor: pointer;
  transition:
    border-color var(--dur-fast) ease,
    transform var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) ease;
}
.app-card:hover {
  border-color: #ffd166;
  transform: translateY(-3px);
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.35),
    0 2px 8px rgba(255, 209, 102, 0.12);
}
.app-card:active {
  transform: translateY(-1px);
  transition-duration: 0.08s;
}

/* App icon nudge inside the hovered card */
.app-card-icon {
  border-radius: 14px;
  flex-shrink: 0;
  transition: transform 0.25s var(--ease-spring);
}
.app-card:hover .app-card-icon {
  transform: scale(1.06) rotate(-2deg);
}
```

The icon's `1.06` scale with `-2deg` tilt on the spring curve is the single "delight" beat per card — it reads as the app icon waking up, exactly the right note for an iOS agency. Larger values get childish; this is the ceiling.

### 3.3 Buttons — replace the existing `.button` hover/active block

```css
.button {
  /* keep existing layout props; update transitions: */
  transition:
    transform var(--dur-fast) var(--ease-out),
    box-shadow var(--dur-fast) ease,
    opacity var(--dur-fast) ease;
}
.button:hover {
  opacity: 1;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}
.button.primary:hover {
  box-shadow: 0 6px 20px rgba(255, 209, 102, 0.28);
}
.button:active {
  transform: translateY(0);
  box-shadow: none;
  transition-duration: 0.08s;
}
```

Primary CTA glows in its own accent color on hover — subtle conversion cue. The fast `:active` snap-down (80ms) gives buttons a physical, pressed feel.

### 3.4 Nav links — animated underline (replaces the permanent underline)

In `styles.css`, **replace** the `.header .nav a` rules:

```css
.header .nav a {
  position: relative;
  text-decoration: none;
  color: #fff;
  padding-bottom: 3px;
}
.header .nav a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: #ffd166;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.25s var(--ease-out);
}
.header .nav a:hover::after,
.header .nav a:focus-visible::after,
.header .nav a.active::after {
  transform: scaleX(1);
}
.header .nav a.active {
  color: #ffd166;
  font-weight: bold;
  text-decoration: none;
}
.header .nav a:hover {
  opacity: 1;
  color: #ffd166;
}
```

The underline draws left-to-right on hover and stays solid for the active page. `scaleX` not `width` — GPU-composited. This works fine with the injected header: it's pure CSS, applies the moment the DOM lands.

**Mobile note:** in the `@media (max-width: 640px)` block the nav is a vertical right-aligned stack; the underline still works because `transform-origin: left` on a `width:100%` pseudo just draws under the text. No override needed.

### 3.5 Store badges & language buttons

```css
.store-badge {
  transition: transform var(--dur-fast) var(--ease-out), opacity var(--dur-fast) ease;
}
.store-badge:hover {
  transform: translateY(-2px) scale(1.02);
  opacity: 1;
}

.lang button {
  transition: background-color var(--dur-fast) ease, transform var(--dur-fast) var(--ease-out);
}
.lang button:hover {
  transform: translateY(-1px);
  background: #324061;
}
.lang button.active:hover {
  background: #ffd166;
}
```

---

## 4. Ambient Background — Hero Glow

One slow-breathing radial glow behind the hero. Pre-rendered gradient on a pseudo-element, animated with `transform` + `opacity` only — zero paint cost after first frame, no `filter` anywhere.

```css
/* === 4. Ambient hero glow === */
.hero {
  position: relative;
  /* keep existing padding */
}
.hero::before {
  content: '';
  position: absolute;
  top: -120px;
  left: 50%;
  width: 720px;
  height: 480px;
  margin-left: -360px;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 209, 102, 0.07) 0%,
    rgba(255, 209, 102, 0.03) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
  animation: glow-drift 14s ease-in-out infinite alternate;
}
@keyframes glow-drift {
  from { transform: translateX(-40px) scale(1);    opacity: 0.7; }
  to   { transform: translateX(40px)  scale(1.08); opacity: 1; }
}
```

**Decisions:**
- Peak alpha `0.07` — on `#0b1220` this is felt, not seen. If you can point at it, it's too strong.
- 14s cycle, `alternate` — below conscious attention; the page feels "alive" without anyone knowing why.
- `z-index: -1` + `pointer-events: none` — can't intercept clicks on the CTA.
- Applies automatically to app-page heroes too (they share `.hero`). Intentional — gives every page the same warm signature.
- **Skip the noise/grid texture.** On a content site this size it adds bytes and visual debt without payoff. The glow alone is the ambient layer.

---

## 5. Delight Details (Swift-agency flavored)

### 5.1 Screenshot tilt on hover (app pages)

Phone screenshots straighten and lift slightly on hover — like picking up a device.

```css
/* === 5. Delights === */
.screenshot {
  transition: transform 0.3s var(--ease-out);
}
@media (hover: hover) and (pointer: fine) {
  .screenshot:hover {
    transform: translateY(-6px) rotate(0.6deg);
  }
  .screenshot:nth-child(even):hover {
    transform: translateY(-6px) rotate(-0.6deg);
  }
}
```

Gated behind `(hover: hover)` so touch devices (where the row is a swipe-scroller) never trigger sticky hover states. `0.6deg` is the whole trick — at 1.5deg+ it becomes a gimmick.

### 5.2 Section heading accent tick

Each revealed `h2` gets a short accent bar that draws in as the heading reveals — ties scroll-reveal and brand color together, echoes Xcode's section markers.

```css
.section h2 {
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
}
.section h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 36px;
  height: 3px;
  border-radius: 2px;
  background: #ffd166;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.5s var(--ease-out) 0.25s; /* draws after the heading lands */
}
.reveal-ready .section h2.is-revealed::after,
html:not(.reveal-ready) .section h2::after {
  transform: scaleX(1);
}
```

(The `html:not(.reveal-ready)` fallback keeps the bar visible when JS is off or reduced-motion short-circuits the observer — `is-revealed` is added in that path anyway, but this belt-and-suspenders it for the no-JS case.)

### 5.3 Hero headline accent — the cursor blink, exactly once

A terminal-style caret after the hero `h1` that blinks **3 times and stops**. A wink at "we write code" that doesn't loop into annoyance.

`index.html` only (not app pages):

```css
.hero h1::after {
  content: '';
  display: inline-block;
  width: 3px;
  height: 0.85em;
  margin-left: 6px;
  vertical-align: -0.1em;
  background: #ffd166;
  opacity: 0;
  animation: caret-blink 0.7s steps(1) 0.9s 6; /* 6 half-cycles = 3 blinks, starts after h1 lands */
}
@keyframes caret-blink {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}
```

Finite iteration count is the professionalism line: infinite blink = childish, three blinks = signature.

### 5.4 What we deliberately do NOT do

- No parallax-on-scroll (needs scroll listeners → jank risk, and reads as 2015 template)
- No animated gradient text, no confetti, no floating shapes
- No card-tilt-toward-cursor 3D effects (JS mousemove cost + dated)
- No loading spinners/transitions between pages — static site, pages load instantly; pretending otherwise is fake

---

## 6. `prefers-reduced-motion` Strategy

Three layers, all required:

**Layer 1 — keep the existing global kill switch** in `styles.css` (already present, lines 455–460). It nukes all animation/transition durations to 0.01ms. Keep as-is.

**Layer 2 — JS short-circuit** (already in `reveal.js` section 2.1): when `matchMedia('(prefers-reduced-motion: reduce)')` matches, every `data-reveal` element gets `is-revealed` immediately and `reveal-ready` is never added — so nothing is ever hidden, not even for 0.01ms. The observer never instantiates.

**Layer 3 — explicit opacity guards.** The global kill switch zeroes durations but `animation-fill-mode: both` could still leave a `from { opacity: 0 }` frame applied for elements with `animation-delay`. Add this right after the existing reduce block:

```css
@media (prefers-reduced-motion: reduce) {
  .hero > *,
  .hero .app-hero-content > *,
  .hero h1::after {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
  .hero::before {
    animation: none !important;
  }
  .section h2::after {
    transform: scaleX(1) !important;
  }
}
```

Result under reduced motion: fully static site, all content visible instantly, accent bars shown, glow frozen at its rest frame, no caret. Identical information, zero motion.

---

## Implementation order

1. `styles.css`: add `:root` timing tokens + sections 1, 3, 4, 5, 6 CSS (replace the existing `.button`, `.app-card`, `.header .nav a` blocks rather than duplicating)
2. Create `reveal.js`, add section 2.2 CSS
3. Add `data-reveal` attributes + script tag to all 8 pages
4. `sw.js`: add `reveal.js` to `PRECACHE`, bump cache version
5. Test: desktop hover pass, mobile scroll pass (DevTools CPU 4x throttle — must hold 60fps), `prefers-reduced-motion` emulation pass, JS-disabled pass (everything visible?)
