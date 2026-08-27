# Answer key: MKT-homepage-type-align

> Marketing visual polish only. Not an MVP story from `docs/mvp/07-Stories.md`.
> Do not implement (Local or Cloud) until a human has approved this file.

## Meta

| Field | Value |
|-------|--------|
| Story ID | MKT-homepage-type-align |
| Source | Chat: Design 1 marketing homepage — match `refs/design-1/layout-ref.jpg` type + section alignment. Code: `esyres_app/marketing/`. Spec: `refs/design-1/DESIGN.md`. |
| Goal (one sentence) | Use Design 1’s Satoshi (Fontshare) and put all homepage sections on one shared content column. |
| Branch name | `marketing/homepage` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-27 |

## Pass/fail — product

- [x] Body and headings use **Satoshi** (Fontshare CSS), not Plus Jakarta Sans — verify: `esyres_app/marketing/index.html` loads Fontshare Satoshi; `src/style.css` `--font` is `"Satoshi"`; `npm run build` in `esyres_app/marketing` exits 0
- [ ] Nav, hero, icon strip, features, Uskoro, and footer share the **same left/right edges** on desktop (Uskoro shell is full column width; icon-strip arrows overlay and do not inset the four tiles) — verify: human-only: PR screenshots desktop+mobile vs user shots / `layout-ref.jpg` alignment

## Pass/fail — architecture

- [x] Change only `esyres_app/marketing/` (plus this key). Do not touch product PWA, Laravel, or Design 2 — verify: git diff paths
- [x] Stay static HTML/CSS/JS; no backend, no new deps beyond the font stylesheet — verify: `package.json` still Vite-only; `npm run build` in `esyres_app/marketing` exits 0

## Verify commands

Run from `esyres_app/marketing/`:

```text
npm run build
```

## Out of scope

- Product Epic 1 search, Laravel scaffold, forms, clickable owner CTA
- GSAP / Awwwards polish
- Changing Design 1 colors or copy
- Hosting

## Implementer instructions

1. Load Satoshi from Fontshare (`https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,800&display=swap`). Set `--font: "Satoshi", …`. Remove Plus Jakarta Sans Google Fonts link.
2. One content column: `.page` max-width is the grid. All `.shell` (features, uskoro, footer) are 100% of that width. Do not shrink Uskoro with `max-width: 40rem` on the shell — center copy *inside* the shell.
3. Icon strip: four tiles span the same width as hero; prev/next sit overlayed on the row (or in the gap without shrinking the tile row below the hero edges).
4. Desktop only needs shared edges; mobile may stack.
5. Loop: implement → `npm run build` → fix. Stop at cap / twice-same-fail.
6. On success: PR with desktop + mobile screenshots in the description (do not commit shot files). Draft/blocked if shots cannot attach.
7. After PR: Bugbot; nits on same PR.
