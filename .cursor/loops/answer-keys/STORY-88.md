# Answer key: STORY-88

> Epic 3: laptop OwnerShell rail can expand to labels and remembers that choice in this browser. Do not implement until this file is approved.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-88 |
| Source | `docs/stories/STORY-88.md` — Owner rail toggle |
| Goal (one sentence) | On every owner route, the `md+` rail stays the narrow icon rail until this browser’s toggle widens it in the layout and shows the existing nav labels. |
| Branch name | `story/STORY-88-owner-rail-toggle` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | user / 2026-10-01 |

## Pass/fail — product

- [ ] `ownerRailExpanded(stored)` is true only when `stored === 'expanded'`. `null`, `''`, and any other string are collapsed. Constant `OWNER_RAIL_STORAGE_KEY` is `esyres.ownerRail` — verify: Vitest `owner.test.ts`
- [ ] `md+` `OwnerShell` aside stays in the `md:flex` row (`md:shrink-0`, not `fixed`, not an overlay). Collapsed width class is `md:w-16`. Expanded width class is `md:w-60` (main is `flex-1`, so it shifts). Initial state is `ownerRailExpanded(localStorage.getItem(OWNER_RAIL_STORAGE_KEY))` (missing or unreadable storage is collapsed). A `type="button"` toggle sits in that aside above the icon Odjava. Collapsed accessible name is `t('owner.expandMenu')` (`Proširi izbornik`) and `aria-expanded={false}`. Expanded name is `t('owner.collapseMenu')` (`Sklopi izbornik`) and `aria-expanded={true}`. Click writes `expanded` or removes the key, then updates the rail. Odjava stays the icon button (`aria-label={t('home.logout')}`, svg only, no visible logout word). Phone header and `variant="tabs"` are unchanged and contain neither toggle key — verify: Vitest `topNav.source.test.ts` and `owner.test.ts` (i18n strings)
- [ ] `OwnerNav` `variant="sidebar"` keeps the six links, paths, `?salon=`, `?date=`, active canvas pill, and Chats count badge. Collapsed: icon-only (`h-10 w-10`, `aria-label` + `title`, no visible label node). Expanded: same icons plus a visible `{item.label}` (Zahtjevi, Zapisi, Chat, Statistika, Saloni, Postavke). `variant="tabs"` never shows those labels — verify: Vitest `topNav.source.test.ts`
- [ ] Ghost `OwnerShell` reads the same helper and key: `md:w-16` when collapsed, `md:w-60` when expanded. Still no `<Link`, `<a `, `<button`, or `<select`. Placeholders stay untappable until `me` lands — verify: Vitest `skeleton.source.test.ts`
- [ ] `refs/design-2/DESIGN.md` `OwnerShell` row describes the toggle, the two widths, remembered collapsed default, labels on expand, icon Odjava, and unchanged phone chrome. It does not say the rail does not expand — verify: that row in `refs/design-2/DESIGN.md`
- [ ] Expanded labels sit beside the icons, the chevron reads as expand or collapse, and the rail pushes main — verify: human-only: at merge

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (one React TypeScript PWA; no new UI library).

- [ ] One React PWA; no new npm dependency; no GraphQL, schema, or PHP change. Rail choice is `localStorage` only (`users.owner_view` stays Prikaz) — verify: `git diff --name-only master...HEAD` has no paths under `esyres_app/` outside `esyres_app/frontend/`, and `esyres_app/frontend/package.json` dependencies unchanged
- [ ] Classifier: frontend + `refs/` + `.cursor/` only → **Behat skipped**. Do not `compose up` or run `php artisan --version`. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; this repo's default branch is `master` — use `master...HEAD` when `main` is absent). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

Expected: **frontend-only**.

From **git root**:

```text
test ! -d esyres_app/marketing
```

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- A phone control that hides the bottom tabs
- A visible word on Odjava
- A rail that floats over the page
- New nav items, or a change to the Zahtjevi progress bar
- Saving the rail on the user account

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-88.md`, root `DESIGN.md`, `refs/design-2/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates. Do not embed screenshots.
2. Branch: `story/STORY-88-owner-rail-toggle` from current `master`.
3. Add `OWNER_RAIL_STORAGE_KEY` and `ownerRailExpanded` in `lib/owner.ts`. No `localStorage` inside the helper.
4. `OwnerShell`: one `useState` initialized from that helper. Toggle is the last control before icon Odjava (`mt-auto` on the pair, not on Odjava alone). Outline chevron svg, `aria-hidden`, points right when collapsed and left when expanded. Write or `removeItem` on click; if storage throws, still toggle the in-memory width. Pass expanded into sidebar `OwnerNav` only.
5. Expanded sidebar links: `h-10 w-full` row, icon + label, active pill unchanged. Collapsed links stay `h-10 w-10`. Tabs stay icon-only.
6. `OwnerShellGhost` uses the same helper for `md:w-16` vs `md:w-60`. No toggle button in the ghost.
7. i18n under `owner`: `expandMenu` / `collapseMenu` with the story’s Bosnian strings. Update the design-pack `OwnerShell` row. Do not add a GraphQL field.
8. Flip the STORY-85 assertions that forbid `md:w-60` so both widths are required, gated by the helper.
