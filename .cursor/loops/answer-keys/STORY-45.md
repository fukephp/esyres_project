# Answer key: STORY-45

> Epic 1: guest routes share one ~1200px inner column so top-nav and main align. Owner bar inner stays unconstrained.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-45.md` and the `/new-story` grill in this chat.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-45 |
| Source | `docs/stories/STORY-45.md` — Guest column: nav and main align |
| Goal (one sentence) | Guest `/`, `/salons`, `/salon/:id`, `/create-salon`, and `/bookings` share one ~1200px inner column so the logo and `main` line up; owner overlay inner stays unconstrained. |
| Branch name | `story/STORY-45-guest-column` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-12 |

## Pass/fail — product

- [ ] `GUEST_COLUMN_CLASS` (in `esyres_app/frontend/src/lib/homepage.ts`) is exactly `mx-auto w-full max-w-[1200px] px-5 md:px-16` — verify: Vitest (`homepage.test.ts`)
- [ ] `TopNav` header stays `w-full` + hairline, not sticky/fixed. Guest paths: inner row uses `GUEST_COLUMN_CLASS` plus existing flex/min-h-16 wrap. `isOwnerPath` inner row keeps `px-5 md:px-16` only — no `max-w-[1200px]` / `mx-auto` on that inner — verify: Vitest reading `TopNav.tsx` (`topNav.source.test.ts`)
- [ ] `Homepage.tsx`: `.homepage` stays on `/` only. Content wrapper (hero + footer) uses `GUEST_COLUMN_CLASS` (plus existing flex/py). No page-level `max-w-3xl`. h1 has no extra max-width. Support + how-it-works stay `max-w-xl`. AuthShell wrapper stays `max-w-sm` (no `mx-auto` on that wrapper). Pronađi salon stays `w-fit`. Footer stays in the wrapper — verify: Vitest reading `Homepage.tsx`
- [ ] `DiscoveryHome.tsx` `<main>` uses `GUEST_COLUMN_CLASS` (plus `py-8`). No page-level `max-w-md`. Still 1-col (`space-y-3` cards, `divide-hairline` rows; no `md:grid` / 3-up). STORY-44 keys/classes unchanged — verify: Vitest reading `DiscoveryHome.tsx`; `designPack.test.ts` updated off `max-w-md` page measure
- [ ] `SalonProfile.tsx` every `<main>` (loading / missing / profile) uses `GUEST_COLUMN_CLASS`. Name, busy, hours, services stay in `main` without a nested page `max-w-md`. Picker `<form>`, chat block, and `w-full` CTAs (`salon.send`, `assistant.ask`) sit in a left-aligned `max-w-md` (no `mx-auto` on that measure). No `md:grid-cols-2` / right rail — verify: Vitest reading `SalonProfile.tsx`
- [ ] `CreateSalon.tsx` every `<main>` uses `GUEST_COLUMN_CLASS`. AuthShell, `EmailVerifyPanel`, and the name `<form>` sit in left-aligned `max-w-md` (no `mx-auto` on that measure). Empty slot / no OwnerNav / no homepage hero-footer unchanged — verify: Vitest reading `CreateSalon.tsx`
- [ ] `MyBookings.tsx` every `<main>` uses `GUEST_COLUMN_CLASS`. h1 / list span the column. Logged-out `AuthShell` (and verify panels that already use a local max-width) stay left-aligned `max-w-md` without `mx-auto` as the page measure — verify: Vitest reading `MyBookings.tsx`
- [ ] Guest page files do not use nested `mx-auto max-w-md` or `mx-auto max-w-3xl` as the **page** measure. Owner pages keep today’s overlay; their TopNav inner is unconstrained; do not add `GUEST_COLUMN_CLASS` to owner `TopNav` inner or to `OwnerNav` / `WorkerPanel` — verify: Vitest (`topNav.source.test.ts` + owner files still have `OwnerNav` / `WorkerPanel`; owner TopNav inner assertion)
- [ ] `refs/design-1/DESIGN.md` Layout notes: guest nav inner + main share ~1200px; owner nav inner unconstrained; sparse = no homepage hero/footer on other routes, not a 448px page — verify: git-root file contains `~1200px guest column`, `Owner overlay nav inner is unconstrained`, and `sparse is not a 448px page` (vite container cannot see `refs/`)
- [ ] Logo left edge and main left edge read as one column on a wide guest page; owner bar still full-bleed inner — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (one PWA, shared top-nav, homepage IA on `/` only), `08-Decisions.md` #41 #42 #44, `docs/adr/0029-shared-top-nav.md`, `docs/adr/0026-one-design-1-pack.md`.

- [ ] One React PWA in `esyres_app/frontend/`. No sibling marketing site. No new GraphQL, REST, or booking mutations. `GET /qr/{id}` still Laravel 302 to `/salon/:id` — verify: no new schema/feature files this PR; `test ! -d esyres_app/marketing`; Behat per CONTEXT frontend-only classifier (skip if the union stays under `esyres_app/frontend/`)
- [ ] i18next `bs` only. No Playwright, RTL, Pest, new npm, or copy keys this PR. Owner chunks stay lazy in `App.tsx` — verify: `esyres_app/frontend/package.json` unchanged deps; `App.tsx` still `lazy()` for owner pages
- [ ] Do not replace `OwnerNav`, restyle discovery/salon as homepage hero/footer, add sticky chrome, or add a 3-up discovery grid — verify: product checks above + `OwnerNav.tsx` / `WorkerPanel.tsx` unchanged aside from this PR not touching them

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`). Do not skip Behat because this story is UI. Every command in the matching set must exit 0 before the loop may open a ready PR.

From **git root**:

```text
test ! -d esyres_app/marketing
```

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up`, start php/mysql, or run `php artisan --version`.

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

- Owner panel / aside layout, OwnerNav, constraining the owner bar inner
- Sticky top-nav
- Discovery 3-up card grid
- Two-column salon or a right schedule rail
- New Bosnian copy
- Changing STORY-44 filter, teaser counts, or result facts
- Public pricing page
- Awwwards / GSAP / Three.js
- Playwright, RTL, Pest, GraphQL codegen, new npm
- Changing `GET /qr/{id}` 302

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-45.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/architecture/04-Frontend.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run `landing-page` / Awwwards skills.
2. Branch: `story/STORY-45-guest-column` from current `master`.
3. **Token:** export `GUEST_COLUMN_CLASS` from `esyres_app/frontend/src/lib/homepage.ts` as specified. Add a Vitest assertion in `homepage.test.ts`.
4. **`TopNav`:** keep the header full-bleed. Compose inner: if `isOwnerPath(pathname)` then padding-only row; else `GUEST_COLUMN_CLASS` + existing flex/wrap/`min-h-16`. Do not make the bar sticky.
5. **Homepage:** swap the content wrapper `max-w-3xl` for `GUEST_COLUMN_CLASS` (keep flex + vertical padding). Do not put `.homepage` on other routes. Keep `max-w-xl` / `max-w-sm` / `w-fit` as specified. Drop `mx-auto` from the AuthShell wrapper if it would re-center.
6. **Guest `main`s:** `DiscoveryHome`, all `SalonProfile` mains, all `CreateSalon` mains, all `MyBookings` mains use `GUEST_COLUMN_CLASS` (+ existing `py-8` / `text-body` / `min-h-svh flex` as needed). Remove page-level `max-w-md` / `max-w-3xl`.
7. **Form measures (left, not centered):** salon picker form + chat + `salon.send` / `assistant.ask` wrap in `max-w-md`. Create-salon AuthShell / verify / name form wrap in `max-w-md`. Bookings AuthShell wrap in `max-w-md`. No `mx-auto` on those inner measures.
8. **Do not** change owner aside, `OwnerNav`, `WorkerPanel`, queue, or owner early-return page `max-w-md` (those are not the guest column). Do not add a discovery grid.
9. **Design 1:** patch Layout in `refs/design-1/DESIGN.md` per the product check. Update `designPack.test.ts` and `topNav.source.test.ts` so they assert the guest column instead of `max-w-md` / `max-w-3xl` page measures.
10. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-45.md` Loop to `STORY-45`.
11. Loop: implement → run the CONTEXT frontend-only classifier → matching verify commands → fix. Cap 8. Same failure twice → escalate.
12. On success: ready PR linking this key; list commands run. Do **not** embed screenshots. Do not draft/block for missing shots.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
