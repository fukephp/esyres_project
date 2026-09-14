# Answer key: STORY-49

> Epic 3: current-job labels on occupying Worker Availability Panel cells.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-49.md` and the story-loop grill (Q1 / Q2 / Q3 as recommended).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-49 |
| Source | `docs/stories/STORY-49.md` — Current job on occupying cells |
| Goal (one sentence) | Occupying blocks on `/owner` show that booking’s service snapshot names as one truncated label spanning the worker’s booked or proposed range. |
| Branch name | `story/STORY-49-current-job` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-14 |

## Pass/fail — product

- [x] `OCCUPYING_BOOKINGS_QUERY` adds existing `services { name }` (snapshot). No new GraphQL field, mutation, or PHP. `OccupyingBooking` includes `services: { name: string }[]` — verify: Vitest reading `esyres_app/frontend/src/graphql/pending.ts`
- [x] `currentJobLabel(services)` joins snapshot names with `', '` (same as pending queue / Request Detail / My Bookings). Empty list → `''`. `occupyingBlock` keeps today’s worker/start/duration/status rules and adds `label: currentJobLabel(row.services)`. `REQUESTED` (and any non-occupying status) still returns `null` — no current-job label — verify: Vitest (`owner.test.ts`: join two names; TIME_PROPOSED label; CONFIRMED label; REQUESTED still `null`)
- [x] Worker name stays the sticky first column. Occupying start cell uses `colSpan` = `durationMinutes / 15` clipped to remaining cells that day. Following cells in that span are not rendered. One truncated label inside the span (`truncate`, `h-8` unchanged, no wrap, no taller row). Not one name per 15-minute cell. Not first-cell-only overflow. `title` may repeat the full label — verify: Vitest reading `WorkerPanel.tsx` (`colSpan`, `truncate`, `h-8`; no `whitespace-pre-wrap` / `h-10` / now-strip)
- [x] Booked span keeps `bg-cell-booked` + light text (`text-canvas`). Proposed span keeps `bg-cell-proposed` + dark text (`text-ink`). No extra prefix, icon, or now-only strip. Free/off cells and droppable ids on free cells stay — verify: Vitest reading `WorkerPanel.tsx` (`bg-cell-booked` with `text-canvas`; `bg-cell-proposed` with `text-ink`; still `bg-cell-free` / `bg-cell-off`; `cell:` droppable id)
- [x] `OwnerHome.tsx` still passes `blocks` from `occupyingBlock` into `WorkerPanel`. Pending queue copy, chips, and `services.map` join on queue rows stay. No new route. `OwnerRequestDetail.tsx` stays a propose-time helper (no WorkerPanel, no current-job UI) — verify: Vitest reading `OwnerHome.tsx` + `OwnerRequestDetail.tsx` (no `WorkerPanel` in Request Detail; queue `<ul` still before `<WorkerPanel`)
- [x] Occupancy math unchanged: `cellKind` / `canDropOnStart` / 15-minute cells. Catalog / salon edit / add-salon files untouched — verify: Vitest (`owner.test.ts` droppable cases still pass); Request Detail / `OwnerSalons.tsx` / `OwnerSalonEdit.tsx` / `OwnerSalonCreate.tsx` not in the diff except if a shared type forces a one-line compile fix (must not add labels there)
- [ ] Occupying labels read as the current job on the block (not a now strip, not queue chrome) — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner` occupying cells show current job — service snapshot names), `03-Backend.md` (grid current job), `05-Data-Model.md` (`BookingService` snapshot at send), `08-Decisions.md` #12 #15 #32 #33, `docs/glossary.md` (Current job, Service snapshot), `refs/design-1/DESIGN.md` (booked cell light label).

- [x] One React PWA. No new GraphQL schema/PHP/Behat. Query existing `Booking.services`. No sibling `marketing/` — verify: no new files under `esyres_app/app`, `esyres_app/graphql`, `esyres_app/features`; this PR does not add `esyres_app/marketing`
- [x] i18next `bs` only. No new copy keys (names come from snapshots). No Playwright, RTL, Pest, GraphQL codegen, new npm — verify: `esyres_app/frontend/package.json` unchanged deps; `i18n.ts` unchanged this PR
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Expected skip. Do not change `behat.yml` — verify: CONTEXT classifier at verify time; no `features/` or `behat.yml` edits this PR

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + loop docs. Expected skip: no PHP / `features/` / `graphql/` schema edits.

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

**This PR (2026-09-14):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Vite container already up.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

171 tests passed.

## Out of scope

- Salon catalog / salon edit / add salon (STORY-50–55)
- Hours / services / workers editors on salon edit (STORY-53–55)
- Changing occupancy rules, `requested` occupying, or 15-minute cells
- Worker↔service assignment matrix; worker login
- Click-to-open booking from an occupying cell
- Now-only strip, extra owner route, pending-queue or Request Detail UI
- New GraphQL fields or snapshot table changes
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-49.md`, `docs/architecture/04-Frontend.md`, `docs/glossary.md` (Current job, Service snapshot), `DESIGN.md`, `refs/design-1/DESIGN.md` (booked = light label). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots.
2. Branch: `story/STORY-49-current-job` from current `master`.
3. **Query:** `OCCUPYING_BOOKINGS_QUERY` — add `services { name }` only. Update `OccupyingBooking`. Do not edit `esyres_app/graphql` or PHP.
4. **Helpers in `owner.ts`:** export `currentJobLabel`. Extend `OccupyingBlock` with `label: string`. `occupyingBlock` sets `label` from `row.services` (treat missing as `[]`). Keep TIME_PROPOSED vs CONFIRMED worker/start rules. `cellKind` ignores `label`. Update existing block fixtures in `owner.test.ts` with `label: ''` (or a dummy) so they typecheck.
5. **WorkerPanel:** only used on `/owner`. For each worker row, when `cells[i].time` equals a block’s `start` for that worker, render one occupying `<td colSpan={n}>` (`n = durationMinutes / 15`, clip to remaining cells). Skip the next `n - 1` cells. Inner div stays `h-8`; add `truncate` + `text-xs`; booked `text-canvas`, proposed `text-ink`; keep `KIND_CLASS` backgrounds. Free/off stay per-cell droppables. If `block.start` is not in `cells`, do not invent a now-strip; leftover occupied minutes may stay per-cell color without a label.
6. **Do not** change pending-queue markup, Request Detail, catalog/edit/create salon, i18n, occupancy mutations, or cell width tokens (`w-10`).
7. **Vitest:** helper + `occupyingBlock` cases above; source-read query, WorkerPanel colspan/truncate/contrast, OwnerHome queue-before-panel, Request Detail has no `WorkerPanel`. Keep `designPack.test.ts` cell-token assertions green.
8. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-49.md` Loop to `STORY-49`.
9. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
10. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
