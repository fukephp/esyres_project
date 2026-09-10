# Story map: STORY-35

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-35 |
| Source | `docs/stories/STORY-35.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-35.md` |

## Destination

Response-time, no-show, and cancellation data exist as events happen so later badges and owner stats have no backfill gap. Verification timestamps stay the verification record. No badge chips on profiles or discovery.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (01, 03, 05, 06, 07, 08 Trust & Badges), `docs/architecture/` (03 Epic 8, 05, 08 #5 #6 #39 #40), `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0016-cancel-fifth-status.md`, `docs/adr/0021-owner-marks-no-show-after-start.md`, `docs/adr/0022-trust-counters-increment-on-event.md`, `docs/stories/STORY-35.md` plus STORY-14 / 30 / 34 / 36, `docs/glossary.md` (**Late cancel**, **Cancelled booking**, **No-show**, **Owner response time**, **Verified phone**)
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Code today (`esyres_app/`):
  - `bookings.owner_responded_at` stamps once on first successful `acceptPreferredTime` / `proposeTime` / `declineBooking` (ADR 0007). Failed overlap / not-requested does not write it. GraphQL Booking type does **not** expose it (Behat reads the column).
  - Cancel (`cancelBooking`) snapshots `cancelled_at` + `late_cancel` on the booking. STORY-30 explicitly did **not** increment salon/user counters. `now >= preferred_starts_at` → `PAST_START`; STORY-30 map: after start is this story’s no-show.
  - `users.email_verified_at` / `phone_verified_at` already exist. GraphQL `emailVerified` / `phoneVerified` are booleans (`hasVerifiedEmail` / `hasVerifiedPhone`; local env can be true with null timestamps, ADR 0013).
  - No `no_show` column, no salon/user counter columns, no Customer History screen, no badge chips in the PWA.
  - Customer History (booking history, no-show tracking, notes, QR visited) is a Key Feature; **no story** owns that UI. STORY-34 owns QR visit markers. STORY-36 owns cancellation-rate **display**.
- Standing preferences:
  - Do not change accept / propose / decline behavior (story OOS)
  - Do not ship Fast Responder / Regular / Founding chips (Phase 2)
  - Do not invent revocation rules (open in mvp 08)
  - Do not ship owner Basic Stats UI (STORY-36)
  - Do not redo QR reconnect (STORY-34)
  - Do not add a sixth booking status
  - Behat GraphQL-over-HTTP; no Playwright, Pest, codegen this PR

## Decisions so far

- STORY-35 is **capture**, not badge display. Destination is persistence so Phase 2 badges and STORY-36 rates are not a backfill.
- `owner_responded_at` already matches the first-action AC. This PR must not change when it stamps (story OOS: changing accept/propose/decline). Leave it off GraphQL this PR (Behat already reads the column).
- Cancel already snapshots per-booking `cancelled_at` + `late_cancel`. This story owns **aggregate** no-show and cancellation counters on customer/salon (STORY-30 OOS).
- Late cancel is not a no-show (glossary). Cancelled booking is not a no-show.
- `email_verified_at` / `phone_verified_at` remain the verification record. Do not add a second verification signal or treat local skip-gates as timestamps.
- Badge chips stay off profiles and discovery (guest `/` and salon profile).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat + Vitest/typecheck/build. No Pest, Playwright, codegen.
- **No-show trigger (2026-09-10):** owner mutation after `preferred_starts_at` on a **confirmed** booking. Not a scheduled auto-mark. Not from cancel. ADR 0019. Before start / not confirmed / already cancelled → no write.
- **Counter write (2026-09-10):** increment integers on both `users` and `salons` in the same transaction as the event. Booking row is the idempotency stamp. No backfill of rows that already cancelled before this PR. ADR 0020.
- **Cancel increment (2026-09-10):** every successful `cancelBooking` → `cancel_count++` on that customer and that salon. If `late_cancel`, also `late_cancel_count++`. Never `no_show_count` from cancel.
- **Capture surface (2026-09-10):** owner-gated GraphQL only. No PWA chrome, no Customer History screen, no chips. Failed mark/cancel does not increment.
- **End-state (2026-09-10):** stay `confirmed` + `no_show_at`. Still occupying. Clear overlay. No sixth status. `WorkerOverlap::OCCUPYING` unchanged.
- **Second mark (2026-09-10):** success, no second increment (same `no_show_at`).
- **GraphQL (2026-09-10):** `markNoShow(bookingId): Booking!`. Owner-gated `Salon.noShowCount` / `cancelCount` / `lateCancelCount`. Owner-only `Booking.noShowAt`. User integers are not on `me` (Behat reads Eloquent). Guest/public salon cannot read the counts. `User` GraphQL type unchanged.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Fast Responder / Regular / Founding badge UI (Phase 2)
- Badge revocation / Founding cutoff (open in mvp 08)
- Changing accept / propose / decline behavior
- Owner Basic Stats / cancellation-rate screen (STORY-36)
- QR reconnect / visited markers (STORY-34)
- Customer History screen / mark-no-show UI (no story; capture-only this PR)
- Customer History notes
- Scheduled auto no-show
- Hard-block late cancel
- Auto-expire command
- Exposing `owner_responded_at` on GraphQL
- Trust counters on `me`
- Playwright, Pest, GraphQL codegen
