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
| Status | draft |
| Answer key path | `.cursor/loops/answer-keys/STORY-35.md` (after compile) |

## Destination

Response-time, no-show, and cancellation data exist as events happen so later badges and owner stats have no backfill gap. Verification timestamps stay the verification record. No badge chips on profiles or discovery.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (01, 03, 05, 06, 07, 08 Trust & Badges), `docs/architecture/` (03 Epic 8, 05 trust counters line, 08 #5 #6), `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0016-cancel-fifth-status.md`, `docs/stories/STORY-35.md` plus STORY-14 / 30 / 34 / 36, `docs/glossary.md` (**Late cancel**, **Cancelled booking**, **Owner response time**, **Verified phone**)
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
  - Do not add a sixth booking status unless a locked decision requires it
  - Behat GraphQL-over-HTTP; no Playwright, Pest, codegen this PR

## Decisions so far

- STORY-35 is **capture**, not badge display. Destination is persistence so Phase 2 badges and STORY-36 rates are not a backfill.
- `owner_responded_at` already matches the first-action AC. This PR must not change when it stamps (story OOS: changing accept/propose/decline).
- Cancel already snapshots per-booking `cancelled_at` + `late_cancel`. This story owns **aggregate** no-show and cancellation counters on customer/salon (STORY-30 OOS).
- Late cancel is not a no-show (glossary). Cancelled booking is not a no-show.
- `email_verified_at` / `phone_verified_at` remain the verification record. Do not add a second verification signal or treat local skip-gates as timestamps.
- Badge chips stay off profiles and discovery (guest `/` and salon profile).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat + Vitest/typecheck/build. No Pest, Playwright, codegen.

## Open decisions

- **No-show trigger:** who writes the no-show event, and when? Owner mutation after start vs scheduled auto-mark of past confirmed vs both.
- **Counter write model:** increment integer counters on `users` and `salons` as events happen vs booking-row flags only (count later in STORY-36).
- **Cancel increment:** every successful cancel vs late-only vs two counters (`cancel_count` + `late_cancel_count`).
- **Capture surface this PR:** owner-gated GraphQL (fields and/or a mark mutation) with no PWA chrome vs also ship Customer History / mark-no-show UI.

## Not yet specified

- No-show booking end-state (stay `confirmed` + timestamp vs new status) — depends on trigger.
- Occupancy after a no-show (past start already; whether the row stays occupying).
- Idempotency of a second no-show mark on the same booking.
- Whether counters are owner-readable on `Salon` / customer-on-salon history vs Behat-only via GraphQL that the PWA never queries.
- Whether `owner_responded_at` should be added to GraphQL this PR (today Behat reads SQL).

## Out of scope

- Fast Responder / Regular / Founding badge UI (Phase 2)
- Badge revocation / Founding cutoff (open in mvp 08)
- Changing accept / propose / decline behavior
- Owner Basic Stats / cancellation-rate screen (STORY-36)
- QR reconnect / visited markers (STORY-34)
- Customer History notes
- Hard-block late cancel
- Auto-expire command
- Playwright, Pest, GraphQL codegen
