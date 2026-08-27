# Answer key: MKT-homepage-layout-refine

> Marketing visual polish only. Not an MVP story from `docs/mvp/07-Stories.md`.
> Do not implement (Local or Cloud) until a human has approved this file.

## Meta

| Field | Value |
|-------|--------|
| Story ID | MKT-homepage-layout-refine |
| Source | Chat: Design 1 marketing homepage — remove icon strip, enlarge Zašto type, page-wide white shell on lavender body per `refs/design-1/layout-ref.jpg`. Code: `esyres_app/marketing/`. Spec: `refs/design-1/DESIGN.md`. |
| Goal (one sentence) | Match layout-ref structure: lavender body, one white page shell, no icon-strip slider, larger Zašto Esyres typography. |
| Branch name | `marketing/homepage-layout-refine` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-27 |

## Pass/fail — product

- [ ] Icon-strip section (Makaze / Stolica / Ogledalo / Dan tiles + prev/next + strip JS) is fully removed from the homepage — verify: `index.html` has no `.icon-strip`; `src/main.js` has no strip handlers; `npm run build` in `esyres_app/marketing` exits 0
- [ ] Body keeps the lavender gradient; `.page` (nav + main) is one white rounded main container (`--radius-xl`, light outline) with inner padding — verify: human-only: PR screenshots desktop+mobile vs `layout-ref.jpg` + user shots
- [ ] Zašto Esyres heading is clearly larger than current (`clamp` max ≥ `2.75rem`); feature card titles ≥ `1.35rem`; nested shells (features / uskoro / footer) stay bordered panels inside the white page — verify: human-only: PR screenshots desktop+mobile of `#features` vs user Zašto shot / `layout-ref.jpg` “Our Class” scale

## Pass/fail — architecture

- [ ] Change only `esyres_app/marketing/` (plus this key). Do not touch product PWA, Laravel, or Design 2 — verify: git diff paths
- [ ] Stay static HTML/CSS/JS; no new deps — verify: `package.json` still Vite-only; `npm run build` in `esyres_app/marketing` exits 0

## Verify commands

Run from `esyres_app/marketing/`:

```text
npm run build
```

## Out of scope

- Product Epic 1 search, Laravel scaffold, forms, clickable owner CTA
- GSAP / Awwwards polish
- Rewriting marketing copy or Design 1 color tokens
- Replacing the removed strip with another motif row
- Hosting

## Implementer instructions

1. Delete `.icon-strip` markup from `index.html`. Remove icon-strip CSS from `style.css`. Remove strip prev/next / track JS from `main.js`.
2. Body: keep existing gradient. Make `.page` the white main container: `background: var(--color-surface)`, `border-radius: var(--radius-xl)`, light border (and optional soft shadow matching existing `.shell` language). Add internal padding so nav/hero/sections sit inside the white shell with body gradient visible around it.
3. Nested `.shell` (features, uskoro, footer): keep as bordered panels inside `.page` (white-on-white OK — rely on border, not a second heavy fill that fights the outer shell). Do not put hero in an extra nested shell.
4. Type: bump `.features__header h2` so desktop max is ≥ `2.75rem` (Design 1 h2 was `2rem` — this story intentionally goes larger for layout-ref parity). Bump `.feature-card h3` to ≥ `1.35rem`. Keep Satoshi.
5. Mobile: page shell may use smaller pad; features grid may stack. No icon strip.
6. Loop: implement → `npm run build` → fix. Stop at cap / twice-same-fail.
7. On success: PR with desktop + mobile screenshots in the description (do not commit shot files). Draft/blocked if shots cannot attach.
8. After PR: Bugbot; nits on same PR.
