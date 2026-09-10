# Answer key: STORY-30

> Epic 5: customer cancel of a confirmed booking from My Bookings. Late is a warning, not a hard block. Fifth status `cancelled`. Snapshot late on the row.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-30.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-30 |
| Source | `docs/stories/STORY-30.md` — Cancel with late warning |
| Goal (one sentence) | A verified customer can cancel a confirmed booking from `/bookings`; if now is inside the salon’s notice window the UI warns and cancel still succeeds; late is snapshotted; the slot is freed. |
| Branch name | `story/STORY-30-cancel-late-warning` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [ ] `cancelBooking(bookingId)` on own `confirmed` booking whose start is still ahead → status `CANCELLED`; `cancelledAt` set; overlay cleared; not occupying; not in `pendingBookings` on original or overlay day; busy-level percent on original day drops vs pre-cancel (no longer counts as confirmed); `owner_responded_at` unchanged; `preferredDate` / `preferredStartsAt` / worker / services unchanged — verify: Behat
- [ ] On-time cancel (`now < preferred_starts_at - cancellation_notice_hours`) → `lateCancel` false; `lateToCancel` was false on `myBookings` before the mutate — verify: Behat
- [ ] Late cancel (`preferred_starts_at - notice hours <= now < preferred_starts_at`) → mutation still succeeds; `lateCancel` true; `lateToCancel` was true on `myBookings` before the mutate — verify: Behat
- [ ] After cancel, `lateToCancel` is false (no longer confirmed); `lateCancel` stays the snapshot even if the salon’s notice hours later change — verify: Behat
- [ ] Overlay row: cancel uses original `preferred_starts_at` for late/past; overlay cleared; occupying original range released; pending on overlay day omits it — verify: Behat
- [ ] `now >= preferred_starts_at` → `PAST_START`; no write; still `CONFIRMED`; overlay unchanged if present — verify: Behat
- [ ] Guest → `UNAUTHENTICATED`; unverified email → `EMAIL_UNVERIFIED`; unverified phone → `PHONE_UNVERIFIED`; other customer / missing id → `FORBIDDEN`; `requested` / `time_proposed` / `declined` / already `cancelled` → `NOT_CONFIRMED` — verify: Behat
- [ ] `myBookings` includes the cancelled row (newest-updated first) with status `CANCELLED`; guest still cannot select salon `cancellationNoticeHours` (`UNAUTHENTICATED`) — verify: Behat
- [ ] Guest `bookingCancelled(salonId)` → `UNAUTHENTICATED`; non-owner / wrong salon / unverified-email owner → `FORBIDDEN` / `EMAIL_UNVERIFIED`; verified owner handshake 200 — verify: Behat
- [ ] After cancel, re-query occupying + pending matches the rules above (do not require a live Reverb process in Behat) — verify: Behat
- [ ] Helper: `bookingStatusKey('CANCELLED')` → `'CANCELLED'` — verify: Vitest
- [ ] Helper: `cancelChrome({ confirmed, startsAt, now })` → `'show'` when confirmed and `now < startsAt`, `'hidden'` otherwise (including cancelled / requested / past start) — verify: Vitest
- [ ] Helper: `cancelErrorKey` maps `NOT_CONFIRMED` / `PAST_START` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` / `FORBIDDEN`; unknown → `fallback` — verify: Vitest
- [ ] i18n: `Otkaži` / `Potvrdi` / `Kasniš s otkazivanjem. Termin se ipak može otkazati.` / `Otkazano`; `bookings.cancel` remains `Odustani` — verify: Vitest (i18n keys)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #5 #27 #38, `docs/adr/0011-customer-respond-same-verify-gates.md`, `docs/adr/0016-cancel-fifth-status.md`.

- [ ] Fifth status `cancelled` on `bookings.status`; columns `cancelled_at` (nullable datetime) and `late_cancel` (boolean, default false). Occupying stays `confirmed` + `time_proposed` only (`WorkerOverlap::OCCUPYING` unchanged). Busy-level still `requested` + `time_proposed` + `confirmed` on `preferred_date`. No REST, no salon/user counter increment this PR — verify: schema + migration; Occupancy / WorkerOverlap unchanged occupying sets
- [ ] GraphQL: `BookingStatus.CANCELLED`; `Booking.lateToCancel: Boolean!` (computed; true iff confirmed and now inside notice window before original start); `Booking.cancelledAt: String` (ISO or null); `Booking.lateCancel: Boolean!` (snapshot); `cancelBooking(bookingId: ID!): Booking!`; `bookingCancelled(salonId: ID!): Booking`. Do not add `cancellationNoticeHours` to the customer `myBookings` salon selection. Do not reuse `declineBooking` / `rejectProposedTime` — verify: schema
- [ ] `/bookings` confirmed cancel chrome (two-step; late copy when `lateToCancel`; hide Otkaži when start has arrived); cancelled rows listed `Otkazano` with no cancel/reschedule chrome; `/owner` subscribes to `bookingCancelled` and refetches queue + occupying; no `pollInterval`; no `/booking/:id`; no VAPID/SMS/email job — verify: `App.tsx` + pages + schema
- [ ] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Hard-block late cancel
- Owner decline of a requested row (STORY-17)
- Trust badge display (Phase 2)
- Owner Basic Stats / cancellation rate UI (STORY-36)
- Salon/customer aggregate cancel counters (STORY-35)
- Owner settings UI to edit `cancellation_notice_hours`
- Owner web push / SMS / reminder email (Epic 6)
- New-request live update (STORY-20)
- `/booking/:id`
- Changing picker / assistant `createBooking`
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**Cancel**, **Late cancel**, **Cancelled booking**, **Cancellation notice window**), `docs/adr/0016-cancel-fifth-status.md`, `docs/stories/STORY-30.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2; guest calm. Bosnian-first.
2. Branch: `story/STORY-30-cancel-late-warning`.
3. **Schema:** `bookings.status` may be `cancelled`. Add `cancelled_at` nullable datetime and `late_cancel` boolean default false. Do not change `WorkerOverlap::OCCUPYING`. Do not change Occupancy’s status set. Do not add salon/user counter columns.
4. **GraphQL Booking:** `lateToCancel: Boolean!` — true iff `status === confirmed` and `preferred_starts_at - salon.cancellation_notice_hours <= now < preferred_starts_at` (original clock; ignore overlay). `cancelledAt: String` ISO or null. `lateCancel: Boolean!` — stored snapshot (false until a successful cancel). Mutation `cancelBooking(bookingId: ID!): Booking!`. Subscription `bookingCancelled(salonId: ID!): Booking` — copy authorize/topic pattern from `BookingRescheduled` (`OwnerAccess`). Broadcast after successful cancel. `LIGHTHOUSE_QUEUE_BROADCASTS=false`.
5. **cancelBooking:** `CustomerAccess::verified` then `lockedConfirmed`. If `now >= preferred_starts_at` → `PAST_START` (no write). Compute late from original start + current `cancellation_notice_hours` (late iff inside `[start - notice, start)`). Set status `cancelled`; set `cancelled_at` = now; set `late_cancel`; clear `reschedule_date` / `reschedule_starts_at`. Do not stamp `owner_responded_at`. Do not write `decline_reason`. Already cancelled / not confirmed → `NOT_CONFIRMED`.
6. **myBookings:** no status filter (cancelled stays on the list). Select `lateToCancel` / `cancelledAt` / `lateCancel` from `/bookings`. Guest/public salon query still must not read `cancellationNoticeHours`.
7. **Behat:** guest + owner coverage for every GraphQL product check. Use existing Carbon test now (`2026-08-29 09:00` Sarajevo) and fixture start times inside vs outside the default 24h window vs already started. Subscription handshake like `reschedule.feature` (`LIGHTHOUSE_BROADCASTER=log`). Existing pending / occupy / my-bookings / reschedule / time-proposed features stay green. English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. No Mink. Full `vendor/bin/behat --format=progress --stop-on-failure` must stay green.
8. **PWA `/bookings`:** `CONFIRMED` and `cancelChrome === 'show'`: `Otkaži` expands to optional late copy (`lateToCancel`) + `Potvrdi` / `Odustani`. One expand at a time (with reject / ask / reschedule). After start, hide Otkaži (client `startsAt` vs `now`). `CANCELLED`: label `Otkazano`; no Otkaži, no Promijeni termin. Stay on `/bookings`. Map errors via `cancelErrorKey`. Keep `bookings.cancel` = Odustani.
9. **PWA `/owner`:** `useSubscription` `bookingCancelled` in addition to existing two; all three call `refetchBoard`. No `pollInterval`. No owner cancel chrome. Request Detail unchanged (still requested-only).
10. **Helpers / i18n:** as in Vitest product checks. Keys: `bookings.cancelBooking` `Otkaži`, `bookings.cancelConfirm` `Potvrdi`, `bookings.cancelLate` `Kasniš s otkazivanjem. Termin se ipak može otkazati.`, `bookings.status.CANCELLED` `Otkazano`. No English keys.
11. Grill already drafted ADR 0016, glossary terms, architecture 03/04/05/06/08 #38, and CONTEXT cancel clause — keep them on this PR. Patch `.cursor/rules/backend/booking-lifecycle.mdc` (`confirmed → cancelled`; late snapshot; does not occupy). Do not add VAPID. Do not rewrite `docs/stories/STORY-30.md`.
12. Do not add Pest, Playwright, codegen, Redis, push, email, salon/user counters, or a hard block.
13. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
14. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
15. On escalate: draft/blocked PR with failing checks and the human decision needed.
16. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
