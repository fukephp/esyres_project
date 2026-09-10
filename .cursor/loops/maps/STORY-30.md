# Story map: STORY-30

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-30 |
| Source | `docs/stories/STORY-30.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-30.md` |

## Destination

A customer can cancel a booking from My Bookings. If now is inside the salon’s `cancellation_notice_hours`, the UI warns and cancel still succeeds. Late cancel is captured for later owner stats. The notice window stays the STORY-01 salon field.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 04, 06, 07, 08), `docs/architecture/` (03, 04, 05, 06, 08 #5 #24 #27 #37 #38), `docs/adr/0016-cancel-fifth-status.md`, `docs/stories/STORY-30.md` plus STORY-01 / 07 / 17 / 18 / 19 / 29 / 31 / 35 / 36, `docs/glossary.md` (**Cancel**, **Late cancel**, **Cancelled booking**, **Cancellation notice window**), `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Code today (`esyres_app/`): four statuses only (`requested` / `confirmed` / `time_proposed` / `declined`). No cancel mutation. `cancellation_notice_hours` on salon (default 24). Guest cannot read `cancellationNoticeHours` (STORY-07 / `SalonOwnerField`). Occupying is `confirmed` + `time_proposed` on the preferred/proposed clock. Overlay on confirmed does not occupy. `/bookings` has reschedule chrome; `bookings.cancel` is Odustani (dismiss expand), not cancel-booking. STORY-35 owns salon/customer cancel *counters*; STORY-36 owns cancellation-rate *display*.
- Standing preferences:
  - Do not invent a second API
  - Do not add a second notice-window setting (STORY-01 field only)
  - Do not hard-block late cancel
  - Do not ship owner stats UI (STORY-36) or badge chips (Phase 2)
  - Do not owner-decline a requested row (STORY-17)
  - Do not add `/booking/:id`
  - Do not ship owner web push (STORY-31)
  - Do not add Playwright, Pest, codegen, `vite-plugin-pwa`

## Decisions so far

- STORY-30 only: customer cancel from `/bookings` with a late **warning**, not a hard block. Notice hours = existing `salons.cancellation_notice_hours` (STORY-01). No second setting.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. Bosnian-first. Design 2: guest calm on `/bookings`.
- Guest still cannot read salon `cancellationNoticeHours` on public/owner-gated salon fields (STORY-07). Warning must not leak that number through the public salon query.
- Badge **display** is Phase 2. Owner stats screen is STORY-36. Salon/customer **counters** as aggregates are STORY-35. This story still must **capture** late cancel so those later stories are not a backfill gap (AC).
- `bookings.cancel` i18n key today is Odustani (dismiss an expand). Cancel-booking needs a distinct key/copy.
- **Eligible (2026-09-10):** confirmed only, including an in-progress reschedule overlay. Requested stays owner decline (STORY-17). Time-proposed stays Prihvati / Odbi / Drugo vrijeme.
- **Gates (2026-09-10):** `CustomerAccess::verified` (session + email + phone; `APP_ENV=local` skipped). `myBookings` stays session-only.
- **Chrome (2026-09-10):** two-step on the confirmed row. Otkaži expands; late copy on that expand when late; second tap still cancels. On-time: same two-step, no warning. One mutate. Do not reuse Odustani for the booking action.
- Overlay cancel frees the original occupied range, clears the overlay, and leaves the pending queue (consequence of confirmed-only).
- **End state (2026-09-10):** fifth status `cancelled`. Does not occupy. Not `declined` + reason. ADR 0016. Expire stays #27.
- **Late clock (2026-09-10):** original `preferred_starts_at` even when an overlay exists.
- **Past start (2026-09-10):** `now >= preferred_starts_at` → `PAST_START`; no write. Hide Otkaži once start has arrived. After start is STORY-35 no-show.
- **Capture (2026-09-10):** snapshot `cancelled_at` + late boolean on the booking at cancel time. No salon/user counter increment (STORY-35). Do not recompute late from later notice-hours edits.
- **Late read (2026-09-10):** `Booking.lateToCancel: Boolean!` on `myBookings` (true iff confirmed and now is inside the notice window before start). Do not expose `cancellationNoticeHours` to the customer.
- **Owner live (2026-09-10):** `bookingCancelled(salonId)` subscription. `/owner` refetches occupying + pending. No push. Behat handshake; no live Reverb required.
- **List (2026-09-10):** cancelled rows stay on `myBookings` with status `Otkazano`. No Otkaži / Promijeni termin on that row.
- **Copy (2026-09-10):** CTA `Otkaži`; confirm `Potvrdi`; warning `Kasniš s otkazivanjem. Termin se ipak može otkazati.`; status `Otkazano`. `bookings.cancel` stays Odustani.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Hard-block late cancel
- Owner decline of a requested row (STORY-17)
- Trust badge display (Phase 2)
- Owner Basic Stats UI / cancellation rate screen (STORY-36)
- Salon/customer aggregate counters as the STORY-35 story (this PR only captures enough for later count)
- Owner settings UI to edit `cancellation_notice_hours` (already STORY-01 backend; settings screen later)
- Owner web push / SMS / reminder email (Epic 6)
- New-request live update as STORY-20’s job (cancel uses its own `bookingCancelled` subscription; no push)
- `/booking/:id`
- Changing picker / assistant `createBooking`
- Playwright, Pest, codegen, `vite-plugin-pwa`
