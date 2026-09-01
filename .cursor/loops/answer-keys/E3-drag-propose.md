# Answer key: E3-drag-propose

> Epic 3: Worker Availability Panel + drag-to-counter-propose (`requested → time_proposed`).
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E3-drag-propose.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-drag-propose |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to drag a pending request onto an open slot on a worker's row to counter-propose a different time, so that I can adjust when the preferred time doesn't fit.” |
| Goal (one sentence) | A verified owner drags a pending request onto an open 15-minute cell; it becomes `time_proposed`, holds that worker’s range, and leaves the pending queue. |
| Branch name | `story/E3-drag-propose` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-31 |

## Pass/fail — product

- [ ] Verified owner `proposeTime(bookingId, workerId, proposedTime)` on `requested` → `status` `TIME_PROPOSED`; `proposedStartsAt` / `proposedWorker` set; preferred fields and original `worker` unchanged (null stays null); `owner_responded_at` set once; that id gone from `pendingBookings`; it appears in `occupyingBookings` for that salon-day — verify: Behat
- [ ] Guest → `UNAUTHENTICATED`; unverified owner → `EMAIL_UNVERIFIED`; missing booking or other salon’s owner → `FORBIDDEN`; not `requested` → `NOT_REQUESTED`; bad `HH:mm` → `INVALID_TIME`; not 15-min → `INVALID_TIME_STEP`; past Sarajevo now → `PAST_TIME`; worker missing/other salon → `INVALID_WORKER`; failed propose does not set `owner_responded_at` — verify: Behat
- [ ] Overlap on `proposed_worker_id` with `confirmed` (via `preferred_starts_at`) or `time_proposed` (via `proposed_starts_at`) on `[start, start + duration)` → `SLOT_TAKEN`; adjacent (end = next start) succeeds; other worker same time succeeds; other `requested` does not occupy — verify: Behat
- [ ] Range not fully inside that weekday’s open-minus-break (including duration past `closesAt` or into break) → `OUTSIDE_HOURS`; `acceptPreferredTime` still has no hours check — verify: Behat
- [ ] `occupyingBookings(salonId, date)` returns only `confirmed` + `time_proposed` whose occupy-start Sarajevo date is `date`; empty → `[]`; guest/unverified/other owner/bad date same codes as pending; public `salon` has no occupying field — verify: Behat
- [ ] Helpers: 15-min step; grid window from hours (closed → no cells; break/outside = off); start cell droppable iff free (not occupied, not off) — duration overflow is *not* a client no-drop — verify: Vitest
- [ ] `/owner` queue above workers × 15-min grid; drag pending onto a free start cell calls `proposeTime` (never `acceptPreferredTime`); Prihvati still on named-worker rows; no duration ghost — verify: human-only: PR review desktop drag + phone stacked layout

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0008-drag-always-proposetime.md`, `docs/adr/0009-proposetime-enforces-hours.md`.

- [ ] Lighthouse `/graphql` only; `proposeTime(bookingId: ID!, workerId: ID!, proposedTime: String!): Booking!`; `occupyingBookings(salonId: ID!, date: String!): [Booking!]!` owner-only (cap 100, no client page); `BookingStatus` adds `TIME_PROPOSED`; `proposedStartsAt` / `proposedWorker` nullable — verify: schema; Behat hits `/graphql`; no new REST routes
- [ ] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass; owner mutation/query requires `email_verified_at` + owns the salon, not phone OTP — verify: Behat login steps; no `actingAs` / magic token
- [ ] Columns `proposed_starts_at` + `proposed_worker_id`; overlap helper: confirmed → `preferred_starts_at` + `worker_id`; time-proposed → `proposed_starts_at` + `proposed_worker_id`; `requested` still does not occupy; existing accept `time proposed` fixture copies preferred → proposed so SLOT_TAKEN still holds — verify: migration; Behat overlap (accept + propose)
- [ ] `@dnd-kit` only in the lazy `/owner` chunk; drop always `proposeTime` (ADR 0008); tap/form Request Detail not this PR; no Reverb/subscription; no status notification job; `ownerRespondedAt` not on GraphQL `Booking` — verify: `esyres_app/frontend` package.json + routes; schema; no new Jobs for notify
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; owner Behat feature exists
- [ ] No GraphQL codegen, `vite-plugin-pwa`, Playwright this PR — verify: `esyres_app/frontend/package.json`

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Request Detail tap/form fallback; keyboard-dnd
- `declineBooking`
- Customer Time Proposed / My Bookings status / customer confirm (Epic 4)
- Duration ghost while dragging
- Name-in-cell on occupying blocks
- Holiday calendar
- In-flight chat tab, Take over, assistant origin (Epic 10)
- Salon switcher chrome (Epic 7)
- Status notifications (push / SMS / email) — Epic 6
- Changing `acceptPreferredTime` hours behavior
- Request auto-expire job / TTL
- Reverb, nginx, redis, mailpit
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Trust badge **display** (Phase 2)
- Public owner registration; worker logins; payments

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0008-drag-always-proposetime.md`, `docs/adr/0009-proposetime-enforces-hours.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; Bosnian-first. Do not apply marketing IA.
2. Branch: `story/E3-drag-propose` from a HEAD that already has `/owner` queue + `acceptPreferredTime`.
3. **Schema:** nullable `bookings.proposed_starts_at` (UTC) and `proposed_worker_id` (FK workers, nullOnDelete). GraphQL `BookingStatus` add `TIME_PROPOSED`. Booking: `proposedStartsAt` (ISO or null), `proposedWorker { id name }` (null unless time-proposed).
4. **WorkerOverlap:** occupying range is status-dependent: `confirmed` → `[preferred_starts_at, + duration)` on `worker_id`; `time_proposed` → `[proposed_starts_at, + duration)` on `proposed_worker_id`. Half-open. Update the Behat “that booking is time proposed” fixture to set `proposed_starts_at` = preferred and `proposed_worker_id` = `worker_id` so existing accept `SLOT_TAKEN` still passes.
5. **GraphQL:** `proposeTime(bookingId: ID!, workerId: ID!, proposedTime: String!): Booking!`. `OwnerAccess::user` then load booking; missing or `salon.owner_id !== user` → `FORBIDDEN`. Status not `requested` → `NOT_REQUESTED`. Resolve `workerId` on that salon else `INVALID_WORKER`. Parse `proposedTime` as `HH:mm` on `booking.preferred_date` (Europe/Sarajevo → UTC) — same date/time helpers as `createBooking`. Not `HH:mm` → `INVALID_TIME`. Minutes not `00/15/30/45` → `INVALID_TIME_STEP`. Local start `< now` Sarajevo → `PAST_TIME`. Hours: `[start, start+duration)` must lie fully inside that weekday’s open interval minus break (inherit salon hours) else `OUTSIDE_HOURS`. Closed weekday → `OUTSIDE_HOURS`. No holiday check. Overlap on the **proposed** worker/range → `SLOT_TAKEN`. Else set `status=time_proposed`, `proposed_starts_at`, `proposed_worker_id`, `owner_responded_at` if null. Do not change preferred fields or `worker_id`. Transaction + `lockForUpdate`. Do not add `declineBooking`. Do not change `acceptPreferredTime` hours behavior.
6. **occupyingBookings:** `occupyingBookings(salonId: ID!, date: String!): [Booking!]!`. `OwnerAccess` + salon. Date validate like pending (`INVALID_DATE`). Filter `confirmed` | `time_proposed` whose occupy-start in Europe/Sarajevo is that `YYYY-MM-DD`. Order start ASC. Cap 100; no `limit`/`offset` args. Guest → `UNAUTHENTICATED`; unverified → `EMAIL_UNVERIFIED`; not owner → `FORBIDDEN`. Do not nest on public `salon`.
7. **Behat:** owner suite, English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Cover every product GraphQL check above. Fixture hours for `OUTSIDE_HOURS` vs open-window success. Existing guest + owner features must still pass. No Mink.
8. **PWA:** `@dnd-kit` in the lazy `/owner` chunk only. Query `salon(id) { workers hours }` + `occupyingBookings` for the selected date. Grid: one row per worker, 15-min cells from `opensAt` to `closesAt`; break + outside = `cell-off` (not droppable). Confirmed blocks `cell-booked`; time-proposed `cell-proposed`; free `cell-free`. No name-in-cell. No duration ghost — highlight the hover/start cell only. Queue rows (including no-preference) are draggable; drop on a free start cell → `proposeTime` with that worker + cell `HH:mm`. Never call `acceptPreferredTime` from drop. Refetch `pendingBookings` + `occupyingBookings`. Disable while in flight. Errors on that queue row: reuse accept copy; add `OUTSIDE_HOURS` → “Van radnog vremena.”; `PAST_TIME` → “To vrijeme je već prošlo.”; `INVALID_WORKER` mapped; fallback “Zahtjev nije predložen.” Zero workers: “Nema radnika.” Closed day: “Zatvoreno ovaj dan.” Prihvati stays on named-worker rows. Add Design 2 tokens `cell-free` / `cell-off` / `cell-booked` / `cell-proposed`. Phone: queue stacked above grid. No optimistic cache, no toast kit, no `/owner` link on customer pages.
9. **Vitest:** 15-min step; hours → cell list (closed empty; break off); `canDropOnStart(cell)` free vs occupied vs off (overflow of duration is *not* part of this helper). Keep existing tests passing.
10. Patch `docs/architecture/04-Frontend.md` UX constraints: `/owner` is pending queue + Worker Availability Panel; drag calls `proposeTime`; Prihvati still `acceptPreferredTime`; still no Request Detail. Do not expand Epic 4/5/6/10.
11. Do not add Pest, Redis, codegen, Playwright, Reverb, notify jobs, or expire/reschedule schema.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: PR linking this key; list commands run. Do **not** capture or attach screenshots. Human-only check is for the human at PR review.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
