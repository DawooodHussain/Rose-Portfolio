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

- `src/pages/index.astro` — the home page: composes the section components, nothing else.
- `src/pages/resume.astro` — the `/resume` page (scoped styles + print CSS).
- `src/layouts/BaseLayout.astro` — the shared `<html>`/`<head>` shell (meta, favicon, fonts, `base.css`).
- `src/components/` — shared pieces (`Fonts`, `StarSprite` + `Star`, `ArrowIcon`); `home/` holds one component per section (`Hero`, `Nav`, `MobileMenu`, `About`, `Facts`, `Interlude`, `StatStory`, `Hello`, `Wipes`) and `navLinks.ts`.
- `src/styles/base.css` — tokens, resets, `.btn`, `.micro`. `src/styles/home.css` imports one file per section from `src/styles/home/`, **in cascade order** (don't reorder).
- `src/scripts/home/` — the home page behaviour, one module per feature, wired up by `main.ts`: `transitions` (chevron wipes), `menu`, `nav-state`, `reveal`, `leaves`, `roam-mark`, `stat-story` (built on `water` and `spray`), `copy-email`. `src/scripts/print.ts` is the resume's Save as PDF button; `src/scripts/util.ts` has the shared helpers.
- `src/data/resume.ts` — resume content for the facts screen and `/resume`.
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
