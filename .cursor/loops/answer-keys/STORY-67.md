# Answer key: STORY-67

> Epic 3: `/owner` is a Cal month navigator + selected-day list. No 15-minute board, no drag.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-67.md` (compiled). Locks: Q1–Q6 A, Q7–Q9 A, Q10 A.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-67 |
| Source | `docs/stories/STORY-67.md` — Zahtjevi month navigator and selected-day list |
| Goal (one sentence) | Owners run one salon-day from a month grid of occupying dots plus a selected-day list (pending till-pile, soon, rest) — not a 15-minute worker board and not drag-to-propose. |
| Branch name | `story/STORY-67-zahtjevi-month-list` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-17 |

## Pass/fail — product

- [ ] Helpers in `esyres_app/frontend/src/lib/owner.ts` (keep `formatOwnerDayHeading` / `shiftOwnerDate` / `queueChipInitial` / `occupyingBlock` / `isPreferredSoon` / `overlayQueueChrome` tests). Add: `WORKER_DOT_COLORS` = `bg-badge-orange`, `bg-badge-pink`, `bg-badge-violet`, `bg-badge-emerald`, `bg-brand-accent`, `bg-success`, `bg-warning`, `bg-error` (length 8). `workerDotColor(id)`: `n = 0`; for each index `i`, `n = (n + id.charCodeAt(i) * (i + 1)) % 8`; return that slot. `ownerMonthFromYmd('2026-09-17')` → `{ year: 2026, month: 9 }`. `ownerMonthRange(2026, 2)` → `{ from: '2026-02-01', to: '2026-02-28' }`. `shiftOwnerMonth(2026, 1, -1)` → `{ year: 2025, month: 12 }`. `ownerMonthContains(2026, 9, '2026-09-17')` true; `'2026-10-01'` false. `ownerMonthDays(2026, 9)` length 30, `[0]==='2026-09-01'`, last `'2026-09-30'`. `ownerMonthWeekdayOffset(2026, 9)` is Monday-first index of day 1 (`(utcDay + 6) % 7` at UTC noon) → `1` (1 Sep 2026 is Tuesday). `formatOwnerMonthTitle(2026, 9)` Intl `bs-BA` `{ month: 'long', year: 'numeric' }` UTC noon on the 1st, strip trailing `.`. `occupyingClockRange('11:00', 30)` → `11:00–11:30`. `ownerDetailMode('REQUESTED')` `'form'`; `'CONFIRMED'` / `'TIME_PROPOSED'` `'read'`; `'DECLINED'` / `'CANCELLED'` / other `'bounce'`. `occupyingSarajevoYmd(row)` uses proposed start when `TIME_PROPOSED` else `preferredStartsAt`, `en-CA` `Europe/Sarajevo`. `occupyingDotsForDay(rows, ymd, 3)`: `occupyingBlock` non-null, matching ymd, start-time order, max 3, each `{ workerId, color: workerDotColor(workerId) }` — verify: Vitest `owner.test.ts` (exact cases above; `workerDotColor('1')` is `WORKER_DOT_COLORS[(0 + 49) % 8]` = `bg-badge-pink`; dots ignore `requested` / null block)
- [ ] Dots / rest mix: `mixRestWithBreak(occupying, breakStartsAt, breakEndsAt)` inserts `{ kind: 'break', startsAt, endsAt }` at break start among rest occupying sorted by start minutes. `selectedDayOccupying(rows, now)` splits via `isPreferredSoon` on occupying start ISO (proposed or preferred). Unassigned pending never in dots — verify: Vitest (`mixRestWithBreak` with break `13:00`–`14:00` and occupying start `12:00` / `15:00` → occupying, break, occupying; no break → occupying only; soon vs rest using a fixed `now`)
- [ ] CSS tokens in `index.css` `@theme` (Design 1 hexes): `--color-badge-orange: #fb923c`; `--color-badge-pink: #ec4899`; `--color-badge-violet: #8b5cf6`; `--color-badge-emerald: #34d399`; `--color-brand-accent: #3b82f6`; `--color-success: #10b981`; `--color-error: #ef4444`. Keep existing `--color-warning`. Do **not** use `busy-*` or `cell-booked` as the worker mark — verify: Vitest `designPack.test.ts` those hexes; OwnerHome occupying mark classes are `WORKER_DOT_COLORS` items, no `bg-busy-` / `bg-cell-booked` on dots
- [ ] i18n: add **only** `owner.prevMonth` = `Prethodni mjesec` and `owner.nextMonth` = `Sljedeći mjesec`. Reuse `owner.title` / `owner.soon` / `owner.break` / `owner.empty` / `owner.closedDay` / `owner.noWorkers` / `weekday.*` / `bookings.status.TIME_PROPOSED`. Keep `owner.prevDay` / `nextDay` keys (unused on home). No `Danas` / `owner.today` — verify: Vitest (`owner.test.ts` those two new strings; `owner.empty` / `closedDay` / `noWorkers` / `soon` / `break` unchanged; `i18n.exists('owner.today')` false)
- [ ] GraphQL: `occupyingBookingsRange(salonId: ID!, from: String!, to: String!): [Booking!]!` in `esyres_app/graphql/schema.graphql`. Resolver `App\GraphQL\Queries\OccupyingBookingsRange`: same `OwnerAccess` + `WorkerOverlap::OCCUPYING` as `OccupyingBookings`; inclusive Sarajevo `Y-m-d` on occupying start; sort by start; `take(100)` after filter. `INVALID_DATE` if `from`/`to` fail the existing Y-m-d check **or** `from > to`. Do **not** change `occupyingBookings(salonId, date)` args or occupancy rules. Mutations unchanged — verify: Behat `features/owner/occupying_range.feature` (confirmed on `2026-08-29` + confirmed on `2026-08-30` both returned for from/to that month; `requested` omitted; per-day `occupyingBookings` for `2026-08-29` still only that day; `from > to` / `from=nope` → `INVALID_DATE`; guest → `UNAUTHENTICATED`; unverified → `EMAIL_UNVERIFIED`; other owner → `FORBIDDEN`). Existing occupying scenarios in `propose_time.feature` stay green
- [ ] PWA queries: `OCCUPYING_BOOKINGS_RANGE_QUERY` (`from`/`to`) same booking fields as today’s occupying query (id, status, preferredStartsAt, proposedStartsAt, durationMinutes, worker, proposedWorker, services.name). `PENDING_BOOKINGS_QUERY` adds `$limit: Int` and OwnerHome passes `limit: 50`. `OWNER_BOOKING_QUERY` adds `proposedStartsAt` and `proposedWorker { id name }`. Request Detail still uses per-day `occupyingBookings` for `proposeStartTimes` — verify: Vitest source (`pending.ts` has `occupyingBookingsRange` and `limit`; `OwnerHome.tsx` `limit: 50` and both occupying queries; `OwnerRequestDetail.tsx` still `OCCUPYING_BOOKINGS_QUERY` with `date`, no range query)
- [ ] `/owner` chrome: after `h1` / switcher / `OwnerNav`, **one** card `rounded-lg border border-hairline bg-canvas` + padding spanning owner `main` (not `max-w-md` on the card). Inner: `md:grid md:grid-cols-2` (navigator left, selected-day list right); phone stacked (navigator first). No `shadow-` on the card. No `WorkerPanel`. No `@dnd-kit` import. No `useDraggable` / `DndContext` / `onDragEnd`. No `type="date"`. No `formatOwnerDayHeading` / `shiftOwnerDate` / `owner.prevDay` / `owner.nextDay` / `Danas` / now-line. No `bg-cell-free` / board `<table>`. Aside + OwnerNav unchanged. Auth / unverified / not-owner shells unchanged — verify: Vitest `ownerPanel.source.test.ts` + `designPack.test.ts` reading `OwnerHome.tsx` (card classes; `md:grid-cols-2`; `occupyingBookingsRange`; no `WorkerPanel` / `@dnd-kit` / `useDraggable` / `type="date"` / `formatOwnerDayHeading`; `OwnerNav` still before the card)
- [ ] Month navigator (Q1 A / Q2 A / Q5 A): title `formatOwnerMonthTitle`. Chevrons `‹` `›` `type="button"` `aria-label={t('owner.prevMonth')}` / `nextMonth`; click `shiftOwnerMonth` only (does **not** call `onDate`). Local visible month inits from selected `date`. `useEffect`: if `!ownerMonthContains(visible, date)` set visible to `ownerMonthFromYmd(date)`. Weekday header row: `weekday.MONDAY` … `SUNDAY`. `ownerMonthWeekdayOffset` blank non-button spacers, then one button per `ownerMonthDays` (day number). Tap sets `onDate(ymd)` (`?date=` via existing `ownerSearchParams`). Closed weekdays still tappable. Selected ymd: `bg-ink text-canvas` (not `bg-brand-accent` / blue). Dots under the number: up to three `rounded-full` from `occupyingDotsForDay` on the **range** payload. No adjacent-month dates — verify: Vitest source (`OwnerHome.tsx`: `owner.prevMonth` / `nextMonth`; `formatOwnerMonthTitle`; `shiftOwnerMonth`; `ownerMonthDays`; `weekday.MONDAY`; `bg-ink text-canvas`; `occupyingDotsForDay`; no `shiftOwnerDate` / pad ymd from another month)
- [ ] Selected-day list (Q4 A / Q8 A / Q9 A): heading `t('weekday.' + sarajevoWeekday(date))` + `, ` + `formatPickerDayNumeric(date)`. Pending: same chip fields/actions/tags/mutations as today (`Prihvati` / `Odbi` / `Predloži` → `/owner/requests/:id`; reschedule `Prihvati` / `Zadrži stari`; `Uskoro` / `Premještaj` / `Asistent`); **no** `useDraggable`. Count `> 2`: `<details>` default closed (no `open`), `<summary>` text is `t('owner.title') + ' (' + n + ')'`. Count `0–2`: no `<details>`. Count `0`: no till-pile chrome. Then: if `workers.length === 0` → `owner.noWorkers` (skip occupying/pauza/empty/closed). Else if closed weekday → `owner.closedDay` (no fake occupying). Else: `owner.soon` heading only when soon occupying non-empty; then rest+pauza (`owner.break` + ` · ` + `breakEndsAt`). Open + no pending + no occupying + no break → `owner.empty`. Occupying row: `Link` to `/owner/requests/${id}`, hairline, color mark `workerDotColor`, `currentJobLabel`, `occupyingClockRange`, worker name, `bookings.status.TIME_PROPOSED` if `TIME_PROPOSED` — verify: Vitest source (`OwnerHome.tsx`: `formatPickerDayNumeric`; `weekday.${`; `<details>`; `owner.title`; `limit: 50`; no `useDraggable`; occupying `Link` `/owner/requests/`; `owner.soon` / `owner.break` / `owner.empty` / `owner.closedDay` / `owner.noWorkers`; `bookings.status.TIME_PROPOSED`)
- [ ] Subscriptions refetch pending + per-day occupying + range (same three: `bookingCustomerResponded`, `bookingRescheduled`, `bookingCancelled`). No `pollInterval`. `?salon=` unchanged. `onAccept` / decline / dismiss `refetchQueries` include all three documents — verify: Vitest source (`OwnerHome.tsx` those subscription names + `refetch` of range; no `pollInterval`)
- [ ] Request Detail (Q10 A): `ownerDetailMode(booking.status)==='form'` keeps today’s propose form + Prihvati/Odbi. `'read'`: same customer / services / duration header; clock from `occupyingBlock` (proposed vs preferred); worker name; **no** `<form>` / `owner.propose` / `owner.accept` / `owner.decline`. `'bounce'` / missing: `owner.acceptError.NOT_REQUESTED`. No `WorkerPanel`. Delete `esyres_app/frontend/src/components/WorkerPanel.tsx`. Remove `@dnd-kit/core` from `esyres_app/frontend/package.json` + lockfile — verify: Vitest (`owner.test.ts` `ownerDetailMode`; source `OwnerRequestDetail.tsx`: `ownerDetailMode`; `proposedStartsAt`; form branch still `PROPOSE_TIME_MUTATION`; read branch has no `owner.propose`; bounce still `NOT_REQUESTED`; no `WorkerPanel` file; `package.json` has no `@dnd-kit`)
- [ ] Phone/`md+` card: month left + list right on `md+`; stacked on phone; selected day ink; occupying dots visible — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md` (Epic 3 Zahtjevi month + list; `proposeTime` from Request Detail), `04-Frontend.md` (month navigator + selected-day list; no drag), `05-Data-Model.md` (occupying = confirmed + time_proposed), `08-Decisions.md` #10 #12 #15 #19 #29 #30 #32 #33 #42, `docs/adr/0035-zahtjevi-month-and-selected-day-list.md`, `docs/mvp/04-UI-Design-Goals.md`, `refs/design-1/DESIGN.md`.

- [ ] One React PWA. New query only: `occupyingBookingsRange`. No new mutations. No `esyres_app/marketing`. No Pest / Playwright / GraphQL codegen. Remove `@dnd-kit/core` (do not add other npm) — verify: schema + `OccupyingBookingsRange.php`; `test ! -d esyres_app/marketing`; `esyres_app/frontend/package.json` deps have no `@dnd-kit` and no extra new packages
- [ ] i18next `bs` only. New keys only `owner.prevMonth` / `owner.nextMonth`. Lists: OwnerHome pending `limit: 50` within `ListPage::MAX_LIMIT`. Occupying range `take(100)` like per-day occupying — verify: i18n tests; pending query `limit: 50`; PHP `take(100)`
- [ ] Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. This PR adds PHP + schema + Behat → **Behat runs**. Do not change `behat.yml` — verify: CONTEXT classifier at verify time; Behat command below exits 0

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story adds GraphQL + PHP + `features/`. Expected: **Behat runs**.

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

- Cal week / day / agenda; dual-mode 15-minute board
- Empty-cell create; owner-created appointments
- Per-worker calendar filter or shift editor
- Changing accept / propose / decline / reschedule mutation contracts
- Raising `ListPage::MAX_LIMIT`
- Screenshot Past Event column, pagination, Cal.com blue selected day
- Worker login (Phase 2)
- Customer slot grid
- In-flight chat tab (STORY-26)
- STORY-64 (no story file)
- Playwright, RTL, Pest, GraphQL codegen, new npm other than removing `@dnd-kit/core`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-67.md`, `docs/architecture/04-Frontend.md`, `docs/adr/0035-zahtjevi-month-and-selected-day-list.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-67-zahtjevi-month-list` from current `master`.
3. **PHP:** `OccupyingBookingsRange` + schema field. Behat `features/owner/occupying_range.feature` + OwnerSteps query helper. Copy occupancy filter from `OccupyingBookings`; do not change that resolver’s `date` contract.
4. **Helpers + tokens:** `owner.ts` / `owner.test.ts` as named above. Add the seven missing color tokens in `index.css` (warning already exists).
5. **Home:** replace STORY-61 day card + `WorkerPanel` + drag with month navigator + selected-day list. Pending `limit: 50`. Range query for dots; per-day occupying for the list. Delete `WorkerPanel.tsx`. Remove `@dnd-kit/core`.
6. **Request Detail:** `ownerDetailMode` form vs read vs bounce. Select proposed fields. Keep propose `<select>`s for `REQUESTED` only.
7. **Tests:** rewrite `ownerPanel.source.test.ts` and the `designPack.test.ts` WorkerPanel block. Keep Request Detail free of `WorkerPanel`.
8. **Index:** set `docs/stories/index.md` and `docs/stories/STORY-67.md` Loop to `STORY-67`.
9. Loop: implement → classifier → matching verify (Behat + frontend) → fix. Cap 8. Same failure twice → escalate.
10. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
