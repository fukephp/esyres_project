# Answer key: STORY-35

> Epic 8: capture no-show and cancellation counters (and keep existing response-time + verification timestamps) so later badges/stats have no backfill gap.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-35.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-35 |
| Source | `docs/stories/STORY-35.md` — Trust data capture |
| Goal (one sentence) | Owner can mark a past confirmed booking as a no-show; cancel and no-show increment salon + customer counters; `owner_responded_at` and verify timestamps stay as they are; no badge chips. |
| Branch name | `cursor/story-35-trust-data-capture-1169` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

Behat now starts at `2026-08-29 09:00` Europe/Sarajevo. User counters are asserted via Eloquent (same as `owner_responded_at`). Salon counters via owner-gated GraphQL.

- [ ] On-time `cancelBooking` (`now < preferred_starts_at - notice hours`) → status `CANCELLED`; that customer and that salon `cancel_count` 1; `late_cancel_count` 0; `no_show_count` 0; `owner_responded_at` unchanged; `email_verified_at` / `phone_verified_at` unchanged — verify: Behat
- [ ] Late `cancelBooking` → `lateCancel` true; customer and salon `cancel_count` 1 and `late_cancel_count` 1; `no_show_count` 0 — verify: Behat
- [ ] Second salon owned by the same owner is unchanged (all three counters stay 0) after a cancel on the first salon — verify: Behat
- [ ] `PAST_START` / `NOT_CONFIRMED` cancel → no counter increment — verify: Behat
- [ ] Owner `markNoShow` on own confirmed booking with `preferred_starts_at` in the past (`2026-08-28 11:00`) → status still `CONFIRMED`; `noShowAt` set; overlay null; still in `occupyingBookings` for that date; customer and salon `no_show_count` 1; cancel counters 0; `owner_responded_at` unchanged — verify: Behat
- [ ] Same `markNoShow` again → 200; same `noShowAt`; still `no_show_count` 1 — verify: Behat
- [ ] Overlay row, original start past: `markNoShow` clears overlay; still occupying original range; pending on overlay day omits it — verify: Behat
- [ ] `markNoShow` when `now < preferred_starts_at` → `NOT_STARTED`; no write; counters 0 — verify: Behat
- [ ] `requested` / `time_proposed` / `declined` / `cancelled` → `NOT_CONFIRMED`; counters unchanged — verify: Behat
- [ ] Guest `markNoShow` → `UNAUTHENTICATED`; verified customer on own booking → `FORBIDDEN`; unverified-email owner → `EMAIL_UNVERIFIED`; other salon / missing id → `FORBIDDEN` — verify: Behat
- [ ] Guest `salon { noShowCount cancelCount lateCancelCount }` → `UNAUTHENTICATED`; non-owner logged in → `FORBIDDEN`; verified owner reads zeros then the incremented values after cancel / mark — verify: Behat
- [ ] `me` has no `noShowCount` / `cancelCount` / `lateCancelCount` fields (schema reject or field missing) — verify: Behat
- [ ] Existing accept / propose / decline still stamp `owner_responded_at` once; failed accept still does not — verify: Behat (existing owner features stay green)
- [ ] PWA GraphQL documents do not call `markNoShow` and do not select `noShowCount` / `cancelCount` / `lateCancelCount` / `noShowAt` on discovery or salon profile — verify: Vitest (or a small helper test that the public/owner operation strings omit those names)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #5 #6 #38 #39 #40, `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0019-owner-marks-no-show-after-start.md`, `docs/adr/0020-trust-counters-increment-on-event.md`.

- [ ] Columns: `users` and `salons` `cancel_count` / `late_cancel_count` / `no_show_count` unsigned int default 0; `bookings.no_show_at` nullable datetime. No sixth booking status. `WorkerOverlap::OCCUPYING` still `confirmed` + `time_proposed`. Occupying/busy-level status sets unchanged — verify: migration + `WorkerOverlap`; Occupancy unchanged
- [ ] GraphQL: `markNoShow(bookingId: ID!): Booking!`; `Booking.noShowAt: String` (ISO or null) owner-only resolver (same gate idea as `SalonOwnerField`: session + verified email + owns the booking’s salon); `Salon.noShowCount` / `cancelCount` / `lateCancelCount` via `SalonOwnerField`. Do not add those three to `User`. Do not expose `ownerRespondedAt`. Do not add a no-show subscription — verify: schema
- [ ] `markNoShow` uses `OwnerAccess::user` (not phone OTP). Increment customer + salon in the same DB transaction as the stamp (lock booking + those rows). No VAPID/SMS/email job. No PWA chrome, no chips on `/` or salon profile — verify: mutation + `esyres_app/frontend/src` has no `markNoShow` / trust-counter selections
- [ ] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` change this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

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

- Fast Responder / Regular / Founding badge UI (Phase 2)
- Badge revocation / Founding cutoff (open in mvp 08)
- Changing accept / propose / decline behavior
- Owner Basic Stats / cancellation-rate screen (STORY-36)
- QR reconnect / visited markers (STORY-34)
- Customer History screen / mark-no-show UI
- Customer History notes
- Scheduled auto no-show
- Hard-block late cancel
- Auto-expire command
- `owner_responded_at` on GraphQL
- Trust counters on `me`
- Playwright, Pest, GraphQL codegen

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-35.md`, `docs/glossary.md` (**No-show**, **Late cancel**, **Cancelled booking**, **Owner response time**), `docs/adr/0019-owner-marks-no-show-after-start.md`, `docs/adr/0020-trust-counters-increment-on-event.md`, and `docs/architecture/` (03, 04, 05, 06, 08 #39 #40). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. No PWA UI this story.
2. Stay on branch `cursor/story-35-trust-data-capture-1169`.
3. **Schema:** unsigned integer `cancel_count` / `late_cancel_count` / `no_show_count` default 0 on `users` and `salons`. Nullable datetime `no_show_at` on `bookings`. Cast. Do not put counters on model `Fillable`. Do not add a `no_show` status.
4. **GraphQL:** `markNoShow(bookingId: ID!): Booking!`. `Booking.noShowAt` ISO or null; resolver throws `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `FORBIDDEN` unless the session owns the salon (customer `myBookings` must not select this field). Salon counters on `SalonOwnerField` like `cancellationNoticeHours`. `User` type unchanged.
5. **markNoShow:** `OwnerAccess::user`, then transaction: lock the booking (and customer + salon rows). Missing / other salon → `FORBIDDEN`. Status not `confirmed` → `NOT_CONFIRMED`. `now < preferred_starts_at` → `NOT_STARTED` (no write). If `no_show_at` already set → return the booking (do not increment). Else set `no_show_at` = now, clear `reschedule_date` / `reschedule_starts_at`, increment `no_show_count` on that customer and that salon. Do not change status. Do not stamp `owner_responded_at`. Do not write verify timestamps. Do not notify.
6. **cancelBooking:** after a successful cancel write, increment `cancel_count` on that customer and that salon; if `late_cancel`, also `late_cancel_count`. Do not increment `no_show_count`. Failed cancel (including `PAST_START`) does not increment. No backfill of existing cancelled rows.
7. **Behat:** `features/owner/no_show.feature` for mark + occupancy + overlay + second mark + auth errors + owner salon counter reads. Guest: cancel increment cases (on-time, late, other salon unchanged, failed cancel) + guest cannot read salon counters + `me` has no counter fields. English Gherkin. Existing cancel / accept / propose / decline / verify features stay green. Full `vendor/bin/behat --format=progress --stop-on-failure`.
8. **PWA:** do not add operations, i18n, or chips. Discovery and salon profile stay as they are. Vitest: assert public/owner GraphQL document strings in `esyres_app/frontend/src/graphql` omit `markNoShow`, `noShowCount`, `cancelCount`, `lateCancelCount`, `noShowAt`.
9. Patch `.cursor/rules/backend/booking-lifecycle.mdc`: no-show is owner mark after start; stay confirmed; still occupying; overlay cleared; counters increment per ADR 0020. Grill already drafted ADR 0019/0020, glossary **No-show**, architecture 05/08 #39 #40, CONTEXT capture clause — keep them on this PR. Do not rewrite `docs/stories/STORY-35.md` beyond the Loop field already set.
10. Do not add Pest, Playwright, codegen, Redis, push, a sixth status, or Customer History UI.
11. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
12. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots.
13. On escalate: draft/blocked PR with failing checks and the human decision needed.
14. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
