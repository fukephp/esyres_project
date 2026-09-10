# Answer key: STORY-29

> Epic 5: reschedule a confirmed booking. Overlay on the same row; original slot stays occupied until owner accept. Pending queue tags it.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-29.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-29 |
| Source | `docs/stories/STORY-29.md` — Reschedule confirmed |
| Goal (one sentence) | A verified customer can ask to move a confirmed booking to a new day+time without losing the original occupied range; the owner pending queue tags that overlay; the owner can accept (clock moves) or dismiss (original stays). |
| Branch name | `story/STORY-29-reschedule-confirmed` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [ ] `requestReschedule(bookingId, preferredDate, preferredTime)` on own `confirmed` booking → status stays `CONFIRMED`; `preferredDate` / `preferredStartsAt` / worker / services unchanged; `reschedulePending` true; overlay date/time set; original worker-range still occupying; not occupying the new range; `pendingBookings` on the **new** date includes it; original date’s pending omits it unless same calendar day; busy-level percent on original day unchanged vs pre-ask; new day busy-level unchanged; `owner_responded_at` unchanged — verify: Behat
- [ ] Second `requestReschedule` on the same booking **replaces** the overlay (still one pending new time); occupying original unchanged — verify: Behat
- [ ] Salon `reschedule_cap = 0` → `RESCHEDULE_DISABLED`; no overlay written — verify: Behat
- [ ] Guest → `UNAUTHENTICATED`; unverified email → `EMAIL_UNVERIFIED`; unverified phone → `PHONE_UNVERIFIED`; other customer / missing id → `FORBIDDEN`; `requested` / `time_proposed` / `declined` → `NOT_CONFIRMED`; bad date/time/past/closed weekday → `INVALID_DATE` / `INVALID_TIME` / `PAST_TIME` / `SALON_CLOSED` and overlay unchanged — verify: Behat
- [ ] Same date+time as the original preferred is allowed — verify: Behat
- [ ] `acceptReschedule(bookingId)` by verified salon owner on an overlay → still `CONFIRMED`; preferred clock = former overlay (Sarajevo day); overlay cleared; occupying the **new** range, not the old; not in pending; worker/services unchanged; `owner_responded_at` unchanged — verify: Behat
- [ ] Accept when the new range overlaps another occupying booking (not self) → `SLOT_TAKEN`; overlay and original occupy stay — verify: Behat
- [ ] Accept overlapping this booking’s own original range succeeds (self excluded) — verify: Behat
- [ ] `dismissReschedule(bookingId)` → overlay cleared; preferred/occupy unchanged; not in pending; still `CONFIRMED` — verify: Behat
- [ ] Owner accept/dismiss without overlay, or not confirmed, or other salon / guest / unverified-email owner → `NOT_RESCHEDULE` / `FORBIDDEN` / `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` as today for owner mutations — verify: Behat
- [ ] `acceptPreferredTime` / `proposeTime` / `declineBooking` on an overlay row still fail as not-requested (`NOT_REQUESTED`); overlay unchanged — verify: Behat
- [ ] Guest `bookingRescheduled(salonId)` → `UNAUTHENTICATED`; non-owner / wrong salon / unverified-email owner → `FORBIDDEN` / `EMAIL_UNVERIFIED`; verified owner handshake 200 — verify: Behat
- [ ] After ask / replace / accept / dismiss, re-query pending + occupying matches the rules above (do not require a live Reverb process in Behat) — verify: Behat
- [ ] Helper: `bookingClock` still uses preferred+worker while `CONFIRMED` with overlay; overlay time is not the main clock — verify: Vitest
- [ ] Helper: `rescheduleChrome({ confirmed, pending })` → `'ask'` when confirmed and not pending, `'pending'` when overlay, `'hidden'` otherwise — verify: Vitest
- [ ] Helper: queue tag on iff overlay; overlay queue clock is reschedule start; overlay rows are not draggable and have no propose/decline; accept-reschedule + dismiss chrome on overlay rows; `canAcceptPreferredTime` unused for overlay — verify: Vitest
- [ ] i18n: `Promijeni termin` / `Premještaj u toku. Hvala na strpljenju.` / `Premještaj` / `Zadrži stari` — verify: Vitest (i18n keys)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #5 #24 #33, `docs/adr/0011-customer-respond-same-verify-gates.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0015-reschedule-same-row-overlay.md`.

- [ ] Overlay columns on `bookings` (`reschedule_date`, `reschedule_starts_at`); salon `reschedule_cap` default 1. Status enum unchanged. Occupying stays `confirmed` + `time_proposed` on **preferred** clock only. No REST, no child booking row, no fifth status — verify: schema + migration; `WorkerOverlap` unchanged occupying set
- [ ] GraphQL: `Booking.rescheduleDate` / `rescheduleStartsAt` (nullable) / `reschedulePending: Boolean!`; `requestReschedule(bookingId: ID!, preferredDate: String!, preferredTime: String!): Booking!`; `acceptReschedule(bookingId: ID!): Booking!`; `dismissReschedule(bookingId: ID!): Booking!`; `bookingRescheduled(salonId: ID!): Booking`. Do not add `rescheduleCap` to `updateSalonHours`. Do not reuse `askOtherTime` / `acceptPreferredTime` / `bookingCustomerResponded` for this flow — verify: schema
- [ ] `/bookings` confirmed reschedule chrome; `/owner` queue tag + accept/dismiss; no `/booking/:id`; `/owner` subscribes to `bookingRescheduled` and refetches queue + occupying; no `pollInterval`; no VAPID/SMS/email job — verify: `App.tsx` + pages + schema
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

- Ask other time on a time-proposed row (STORY-19)
- Cancel (STORY-30)
- Counter-propose / drag of an in-progress reschedule
- Customer withdraw of an overlay
- Auto-expire / auto-dismiss when original start arrives
- Owner settings UI to edit `reschedule_cap` (STORY-01)
- Owner web push / SMS / reminder email (Epic 6)
- New-request live update on owner home
- `/booking/:id`
- Changing picker / assistant `createBooking`
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**Reschedule**, **In-progress reschedule**, **Accept reschedule**, **Dismiss reschedule**, **Reschedule preferred time**, **Reschedule cap**), `docs/adr/0015-reschedule-same-row-overlay.md`, `docs/stories/STORY-29.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2; guest calm; owner dense. Bosnian-first.
2. Branch: `story/STORY-29-reschedule-confirmed`.
3. **Schema:** `salons.reschedule_cap` unsigned integer default 1. `bookings.reschedule_date` nullable date; `bookings.reschedule_starts_at` nullable datetime. Overlay present iff `reschedule_starts_at` is set. Do not change `BookingStatus`. Do not add `rescheduleCap` to `UpdateSalonHoursInput`.
4. **GraphQL Booking:** `rescheduleDate: String` (Y-m-d or null), `rescheduleStartsAt: String` (ISO or null), `reschedulePending: Boolean!` (true iff overlay set). Mutations as in architecture checks. Subscription `bookingRescheduled(salonId: ID!): Booking` — copy authorize/topic pattern from `BookingCustomerResponded` (`OwnerAccess`). Broadcast after successful ask, replace, accept, and dismiss. Do not broadcast reschedule on `bookingCustomerResponded`. `LIGHTHOUSE_QUEUE_BROADCASTS=false`.
5. **requestReschedule:** `CustomerAccess::verified` (do **not** reuse `lockedMine` — that requires `time_proposed`). Lock own booking. Status must be `confirmed` else `NOT_CONFIRMED`. If salon `reschedule_cap < 1` → `RESCHEDULE_DISABLED`. Parse date/time like `askOtherTime` (`INVALID_DATE` / `INVALID_TIME` / `PAST_TIME` / `SALON_CLOSED`). Set overlay only; do not write `preferred_*`, worker, services, status. Replace if overlay already set. Same original date+time allowed. Cap `>1` has no extra effect.
6. **acceptReschedule:** `OwnerAccess` like `acceptPreferredTime`. Must be this salon’s `confirmed` with overlay else `NOT_RESCHEDULE`. Lock overlapping rows for the **confirmed worker**. `WorkerOverlap::taken` on **overlay** start + duration, exclude self → `SLOT_TAKEN` (do not write). Copy overlay → `preferred_date` / `preferred_starts_at`; clear overlay; status stays `confirmed`. Do not stamp `owner_responded_at`. Do not validate hours on accept (parity with STORY-14). Past overlay clock at accept time is allowed.
7. **dismissReschedule:** owner of salon; `confirmed` + overlay else `NOT_RESCHEDULE`. Clear overlay only.
8. **pendingBookings:** `requested` on `preferred_date = date` **or** `confirmed` with overlay on `reschedule_date = date`. Order by displayed clock (`COALESCE(reschedule_starts_at, preferred_starts_at)`), then `created_at`. Occupying query unchanged (preferred clock). Busy-level `Occupancy` unchanged (still `preferred_date` only).
9. **Behat:** guest + owner coverage for every GraphQL product check. Subscription handshake like `customer_responded.feature` (`LIGHTHOUSE_BROADCASTER=log`). Existing pending / accept / occupy / my-bookings / time-proposed features stay green. English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. No Mink. Full `vendor/bin/behat --format=progress --stop-on-failure` must stay green.
10. **PWA `/bookings`:** `CONFIRMED` with no overlay: `Promijeni termin` expands date+time + Pošalji / Odustani (same as Drugo vrijeme). Overlay: show original clock via `bookingClock`, asked new time, `Premještaj u toku. Hvala na strpljenju.`; hide `Promijeni termin`; asked-time control expands the same form to replace. One expand at a time. Stay on `/bookings`. Select overlay fields on `myBookings`. Error map via a small `rescheduleErrorKey` (include `NOT_CONFIRMED` / `RESCHEDULE_DISABLED` + existing date/auth codes).
11. **PWA `/owner`:** select overlay fields on pending rows. Overlay: tag `Premještaj`; clock = overlay start; soon uses overlay start; `Prihvati` → `acceptReschedule`; `Zadrži stari` two-step (Potvrdi / Odustani, no reason) → `dismissReschedule`; no Odbi, no Predloži, not draggable. Requested rows unchanged. `useSubscription` `bookingRescheduled` in addition to `bookingCustomerResponded`; both call `refetchBoard`. No `pollInterval`. No `/owner/chats` change. Request Detail still bounces if not `REQUESTED`.
12. **Helpers / i18n:** as in Vitest product checks. Keys: `bookings.reschedule` `Promijeni termin`, `bookings.reschedulePending` `Premještaj u toku. Hvala na strpljenju.`, `owner.reschedule` `Premještaj`, `owner.keepOriginal` `Zadrži stari`. No English keys.
13. Patch `docs/architecture/04-Frontend.md` (`/bookings` reschedule chrome; `/owner` tag + accept/dismiss; `bookingRescheduled` refetch), `05-Data-Model.md` (overlay columns; cap default 1; original occupies until accept; overlay does not occupy), `06-Auth-Notifications-Realtime.md` (name `bookingRescheduled`), `08-Decisions.md` add #37 pointing at ADR 0015, `.cursor/CONTEXT.md` one clause (confirmed overlay; original slot held until accept), `.cursor/rules/backend/booking-lifecycle.mdc`. Do not add VAPID.
14. Do not add Pest, Playwright, codegen, Redis, push, email, a fifth status, or a child booking table.
15. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
16. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
17. On escalate: draft/blocked PR with failing checks and the human decision needed.
18. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
