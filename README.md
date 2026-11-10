# Marigold Edition — design demo

A one-page design demo for Daud's portfolio, built with Astro. It's a separate project from the live portfolio in `../frontend`.

## Commands

Run from `demo/` (Node >= 22):

```sh
npm install
npm run dev       # http://localhost:4322 (the main site uses 4321, so both can run at once)
npm run build     # static build to dist/
npm run preview   # serve dist/
```

## What's where

- `src/pages/index.astro` — the whole page: markup, styles (`<style is:global>`) and inline scripts.
- `src/data/profile.ts` — name, email and links. Copied from `../frontend/src/data/content.ts`; keep them in sync by hand.
- `public/flowers/` — the Redouté rose and the three white leaves (CC0, Cleveland Museum of Art).
- `public/photos/` — the oval and inline photos (CC0, Cleveland Museum of Art).
- `docs/DESIGN.md` — the "Marigold Edition" design doc.
- `scripts/cutout-flower.mjs` — cuts a botanical print off its paper background:
  `npm run cutout -- <input.jpg> <output.webp> [x,y,w,h|-] [maxSize]`

## Sections

1. Hero (marigold): the name, the asterisk mark, and the nav.
2. About intro: "about (daud)" with the rose hanging into the next screen. Reached with the chevron wipe.
3. About main: the oval photo and the sentence with inline photos.
4. Caption: falling white leaves (a small physics loop) and the roaming asterisk.
5. Stat: "02" sinks into the GitHub line, which behaves like water (a real-time wave simulation).
6. Hello (marigold): contact. Reached with the marigold chevron wipe.

Everything respects `prefers-reduced-motion`.
