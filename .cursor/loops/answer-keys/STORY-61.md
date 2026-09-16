# Answer key: STORY-61

> Epic 3: `/owner` home is one Cal day card (date header + queue chips, then hours-down × worker-columns board).
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-61.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-61 |
| Source | `docs/stories/STORY-61.md` — Owner day card (hours down, worker columns) |
| Goal (one sentence) | Owners read one salon-day as a full-width Cal card: pinned Bosnian date + worker columns, queue chips, hours down — not a labeled date field plus a one-line 15-minute strip. |
| Branch name | `story/STORY-61-owner-day-card` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-16 |

## Pass/fail — product

- [x] `esyres_app/frontend/src/lib/owner.ts` exports `formatOwnerDayHeading(ymd)`: parse `YYYY-MM-DD`, `Date.UTC(y, m - 1, d, 12)`, `Intl.DateTimeFormat('bs-BA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Sarajevo' })`, then strip a single trailing `.`. Do **not** use `weekday.*` i18n. `shiftOwnerDate(ymd, deltaDays)` adds calendar days via the same UTC-noon pattern (delta `-1` / `+1`). `queueChipInitial(name)` is the first trimmed character `toLocaleUpperCase('bs-BA')`; empty trim → `'?'` — verify: Vitest (`owner.test.ts`: `2026-09-16` → `srijeda, 16. septembar 2026`; no trailing `.`; `shiftOwnerDate('2026-09-16', -1)` → `2026-09-15`; `shiftOwnerDate('2026-09-30', 1)` → `2026-10-01`; `queueChipInitial(' Ana')` → `A`; empty → `?`)
- [x] Logged-in `/owner` with a salon: after phone `h1` / salon switcher / `OwnerNav` (unchanged), **one** day card wrapping date row + queue + `WorkerPanel`. Card classes include `rounded-lg border border-hairline bg-canvas` and padding. Spans owner `main` (not `max-w-md` / `max-w-xl` / `max-w-sm` on the card). No `shadow-` on the card. No `bg-surface-soft` / `bg-surface-card` on the card box. Aside + `OwnerNav` stay outside the card. Logged-out / unverified / not-owner shells unchanged — verify: Vitest reading `OwnerHome.tsx` (one `rounded-lg border border-hairline bg-canvas` wrapping `formatOwnerDayHeading` and `<WorkerPanel`; no `shadow-` on that card; `OwnerNav` still before the card; `max-w-md` only on auth/not-owner shells)
- [x] Date row (Q1 A / Q2 A): heading is `formatOwnerDayHeading(date)` (visible text, not `weekday.${…}`). Prev/next are `type="button"` with `‹` / `›` (U+2039 / U+203A) and `aria-label={t('owner.prevDay')}` / `t('owner.nextDay')`; click calls `onDate(shiftOwnerDate(date, -1))` / `+1`. Compact visible `type="date"` in **that row** (`aria-label={t('owner.date')}`, `value={date}`, existing `onDate`). **No** wrapping `<label>` + `t('owner.date')` visible text. No `showPicker`. No calendar SVG. No `Danas` / `owner.today` / now-line / month `<table>` / `grid-cols-7` — verify: Vitest reading `OwnerHome.tsx` (`formatOwnerDayHeading`; `owner.prevDay` / `owner.nextDay`; `‹` `›`; `type="date"`; `shiftOwnerDate`; no `showPicker` / `Danas` / `owner.today` / `<svg`; no `mt-6 block max-w-xs` date label)
- [x] i18n: add **only** `owner.prevDay` = `Prethodni dan` and `owner.nextDay` = `Sljedeći dan`. Reuse `owner.empty` / `owner.closedDay` / `owner.noWorkers` / `owner.date` / action keys. No `Danas` key — verify: Vitest (`owner.test.ts`: those two strings; `owner.empty` still `Nema zahtjeva za ovaj dan.`; `owner.closedDay` / `owner.noWorkers` unchanged; `i18n.exists('owner.today')` false)
- [x] Pin + grow (Q3 A): date row `sticky top-0 z-20 bg-canvas`. Worker-name row (`thead`) `sticky top-12 z-10 bg-canvas`. Queue has **no** `sticky`. Day card and `WorkerPanel` have **no** `max-h-*` / `overflow-y-auto` / `overflow-y-hidden` / `h-[`. Horizontal pan: `overflow-x-auto` on the board wrapper only. Time gutter `sticky left-0 bg-canvas`. `DndContext` does **not** set `autoScroll={false}` — verify: Vitest reading `OwnerHome.tsx` + `WorkerPanel.tsx` (those sticky classes; queue `ul` / empty `p` has no `sticky`; no `max-h-` / `overflow-y-` on card or panel; `overflow-x-auto` in `WorkerPanel`; `autoScroll={false}` absent)
- [x] Queue inside the card, then the board. Empty queue: `t('owner.empty')` inside the card, then `WorkerPanel` still mounts. Closed / no workers stay `WorkerPanel` copy (`owner.closedDay` / `owner.noWorkers`) — not a grid. Drop `max-w-xl` on the queue list. `OwnerRequestDetail.tsx` stays a tap/form helper: **no** `WorkerPanel`, **no** `formatOwnerDayHeading`, **no** day-card sticky header — verify: Vitest (`ownerPanel.source.test.ts`: queue marker before `<WorkerPanel`; Request Detail has no `WorkerPanel` / `formatOwnerDayHeading`; `OwnerHome` queue has no `max-w-xl`; `WorkerPanel` still returns `owner.noWorkers` / `owner.closedDay` before any `<table`)
- [x] Queue chips: `bg-surface-soft` (not `bg-canvas` on the `li`). Initial circle: `rounded-full` + `text-ink` + `queueChipInitial(row.customerName)`; circle fill `bg-canvas` (or hairline); **not** `bg-cell-free` / `bg-busy-free` / orange / `bg-cell-pending` on the circle (Uskoro tag may keep `bg-cell-pending`). Visible line 1: `customerName` + ` · ` + service names join (same `', '` join as today). Muted line (`text-muted`): `salon.duration` · `formatSarajevoTime(clock)` · worker name or `salon.noPreference`. Tags + `Prihvati` / `Odbi` / `Predloži` / `Zadrži stari` + error / decline / dismiss chrome **unchanged** (same mutations, same `overlayQueueChrome`, `Predloži` still `/owner/requests/:id`). Whole `li` stays `useDraggable` — verify: Vitest reading `OwnerHome.tsx` (`bg-surface-soft` on `li`; `queueChipInitial`; `text-muted`; ` · `; `owner.accept` / `owner.decline` / `owner.propose` / `owner.keepOriginal`; `useDraggable`; no `bg-cell-free` on the circle span)
- [x] Board transpose (Q3 A): `<table>` hours **down**, workers **columns**. `thead`: one `th` per `worker.name` (not a time-across header of `cells.map`). `tbody`: one `tr` per `panelCells` time; first cell is `cell.time` (`HH:MM` every 15 minutes) `sticky left-0`. Occupying start cell uses **`rowSpan`** = `occupyingColSpan(durationMinutes, remainingCells)` (keep that helper name + math; do not add `occupyingRowSpan`). Covered cells in that column are not rendered. Label wraps (`break-words` or `whitespace-normal`; **no** `truncate` on the occupying cell). `title={label}` stays. Free/off cells stay `h-8` + `bg-cell-free` / `bg-cell-off` / `bg-cell-booked` / `bg-cell-proposed` + droppable `cell:${workerId}:${time}` on free starts. No `colSpan` on occupying cells. No worker `role="tab"` / tablist. Phone: same table + `overflow-x-auto` (not worker tabs) — verify: Vitest reading `WorkerPanel.tsx` (`rowSpan`; `break-words` or `whitespace-normal`; `title={label}`; `h-8`; cell tokens; `cell:${workerId}:${time}`; no `colSpan`; no `truncate`; no `role="tab"`; workers mapped as `th`, `cells` as `tr`)
- [x] Mutations, occupancy, tap fallback unchanged: `acceptPreferredTime` / `proposeTime` / decline / reschedule accept/dismiss still from `OwnerHome`. `occupyingBlock` / `cellKind` / `canDropOnStart` / `requested` does not occupy. `PointerSensor` `distance: 8` stays. Catalog / salon edit / chats / stats files untouched except a shared-helper import if `owner.ts` exports force a one-line compile fix (must not restyle those pages) — verify: Vitest (`owner.test.ts` occupying / droppable cases still pass); `OwnerRequestDetail.tsx` still has propose-time `<select>` / no `WorkerPanel`; grep/source: `ACCEPT_PREFERRED_TIME_MUTATION` still in `OwnerHome.tsx`
- [ ] One idle human visual: full-width day card; hours down × worker columns; queue chips; date+names pin while the afternoon page-scrolls — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/owner` lazy day card: date header + queue chips, then hours-down × worker-columns 15-minute board), `08-Decisions.md` #10 #12 #15 #19 #29 #32 #33 #42, `docs/mvp/04-UI-Design-Goals.md` (owner day card), `refs/design-1/DESIGN.md` (owner main = one canvas hairline day card), `docs/glossary.md` (Worker Availability Panel, Current job).

- [x] One React PWA. No new GraphQL / PHP / Behat / booking mutations. No sibling `marketing/` — verify: this PR does not add `esyres_app/marketing` or files under `esyres_app/graphql/` / `esyres_app/app/` / `esyres_app/features/`
- [x] i18next `bs` only. New keys only `owner.prevDay` / `owner.nextDay`. No Playwright, RTL, Pest, GraphQL codegen, new npm (`@dnd-kit` stays) — verify: `esyres_app/frontend/package.json` unchanged deps; `owner.test.ts` i18n asserts above
- [x] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR is PWA + loop docs. Expected: **skip Behat**. Do not change `behat.yml` — verify: CONTEXT classifier at verify time

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

**This PR (2026-09-16):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Vite container already up.

Passed:

```text
test ! -d esyres_app/marketing
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

181 tests passed.

## Out of scope

- Guest Cal.com widget (month grid + time pills)
- Now-line, `Danas` badge, sticky queue, worker tabs, KPI cards
- Changing accept / drag / tap-fallback / decline / reschedule API
- Restyling `OwnerRequestDetail` as a day card
- Worker login (Phase 2)
- Customer slot grid
- New GraphQL
- Playwright, RTL, Pest, GraphQL codegen, new npm

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-61.md`, `docs/architecture/04-Frontend.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-61-owner-day-card` from current `master`.
3. **Helpers** in `owner.ts` + `owner.test.ts`: `formatOwnerDayHeading`, `shiftOwnerDate`, `queueChipInitial`. Keep `occupyingColSpan` math; use it as `rowSpan`.
4. **Home:** one day card on `OwnerHome.tsx` (date row + chips + `WorkerPanel`). Transpose `WorkerPanel.tsx` (hours down, workers as columns, wrap occupying labels). Update `ownerPanel.source.test.ts` and `designPack.test.ts` so they assert `rowSpan` / wrap / card, not `colSpan` / `truncate` / `max-w-xl` queue.
5. **Copy:** only `owner.prevDay` / `owner.nextDay`. Aside, OwnerNav, Request Detail, catalog, chats, stats: no restyle.
6. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-61.md` Loop to `STORY-61`.
7. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
9. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
