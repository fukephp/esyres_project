# Story map: E4-time-proposed

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E4-time-proposed |
| Source | `docs/mvp/07-Stories.md` Epic 4 — “As a customer, I want to approve, reject, or ask for a different day or time once a counter-proposed time is offered, so that I stay in control of the final appointment. Asking for a different day or time updates the same request (new preferred date/time, back to pending), not a duplicate.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E4-time-proposed.md` |

## Destination

A logged-in customer can act on a time-proposed booking: approve the counter-proposal (`confirmed`), reject it (`declined`), or ask for a different day or time on the **same** booking row (`requested` + new preferred date/time). That closes the request → propose → respond loop. Owner notify on response is Epic 6, not this PR.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md` (Time Proposed screen, My Bookings), `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 4, `docs/architecture/` (03, 04, 05, 06, 08 #24/#33), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- User paste: “Approve / Reject / Ask other time — closes request/propose/respond; unblocks Epic 10”
- Sibling Epic 4 story already shipped: My Bookings list on `/bookings` (display-only rows). Sibling “owner notified immediately” is Epic 6.
- Code today (`esyres_app/`): `proposeTime` sets `time_proposed` + `proposed_starts_at` / `proposed_worker_id` (does **not** copy onto `worker_id` / `preferred_starts_at`). Occupancy for `confirmed` uses `worker_id` + `preferred_starts_at`; for `time_proposed` uses `proposed_*`. GraphQL hides `proposedStartsAt` / `proposedWorker` unless status is `TIME_PROPOSED`. PWA `bookingClock` same rule. `/bookings` rows are `<li>`, not links. No customer respond mutations. No `/booking/:id`. No Reverb.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not ship owner notifications (Epic 6) or cancel/reschedule (Epic 5)
  - Sparse customer surface (Design 2); Bosnian-first
  - Keep `/bookings` auth chrome (login\|register, verify banners, email/phone panels, logout)

## Decisions so far

- This story is **customer respond** to a counter-proposal. Not owner accept/propose/decline. Not My Bookings list (already shipped). Not owner push/SMS (Epic 6).
- Paths (product + architecture 05): `time_proposed → confirmed` (approve), `time_proposed → declined` (customer reject), `time_proposed → requested` with new preferred date/time (ask other time). Ask other time is the **same row** (architecture 08 #24); not a second `createBooking`.
- Ask other time also **clears proposal fields** and **keeps events** (architecture 05). Occupancy: `requested` does not hold a clock slot, so ask-other-time and reject **release** the held range. Approve **keeps** the held range as `confirmed`.
- Approve must **materialize** the counter-proposal onto occupancy/display fields: copy `proposed_worker_id` → `worker_id`, `proposed_starts_at` → `preferred_starts_at`, derived Sarajevo calendar day → `preferred_date`, then `confirmed`, then clear `proposed_*`. Required because `WorkerOverlap` + `bookingClock` + GraphQL all treat confirmed as preferred+worker, and a confirmed booking always has a worker (glossary).
- Ask other time does **not** change services or duration. Guest `worker_id` (preference, may be null) stays; do not copy the proposed worker onto the reopened request.
- `owner_responded_at` stays as-is (ADR 0007: first owner action only).
- Customer reject is **not** owner Decline (glossary). Reuse status `declined`. Expire/`expired` reason is not this PR.
- Wrong booking / not the session customer → `FORBIDDEN`. Guest → `UNAUTHENTICATED`. Not `time_proposed` → `NOT_TIME_PROPOSED` (same pattern as owner `NOT_REQUESTED`).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA: React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 customer sparse.
- Notifications stay queued and never inline; this PR does not dispatch (Epic 6). No Reverb/subscription. Customer may refetch the list after mutate (architecture 06).
- Trust **display** is Phase 2.
- **Surface (2026-09-01):** Approve / Reject / Ask other time on `TIME_PROPOSED` rows on `/bookings`. No `/booking/:id`. Product “Time Proposed screen” is that row’s action state, not a separate URL.
- **Mutations (2026-09-01):** three named: `confirmProposedTime(bookingId: ID!): Booking!`, `rejectProposedTime(bookingId: ID!): Booking!`, `askOtherTime(bookingId: ID!, preferredDate: String!, preferredTime: String!): Booking!`. Date/time strings match `createBooking` (`YYYY-MM-DD`, `HH:mm`). Not one enum mutation. “Confirm” ≠ owner accept; “Reject” ≠ owner decline.
- **Reject reason (2026-09-01):** none. `rejectProposedTime` takes only `bookingId`. `decline_reason` stays null. Do not add a customer-reason field.
- **Ask-other-time UI (2026-09-01):** expand the `TIME_PROPOSED` row with date + time inputs (no slot grid, no service/worker re-pick). Submit → `askOtherTime`. Stay on `/bookings`. Do not route to `/salon/:id`. Validation same as `createBooking`: `INVALID_DATE`, `INVALID_TIME`, `PAST_TIME`, `SALON_CLOSED`. Not owner `INVALID_TIME_STEP`.
- **Respond auth (2026-09-01):** same as `createBooking` — session + `email_verified_at` + `phone_verified_at`. Else `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED`. `myBookings` still lists without verify. Owner mutations unchanged. ADR 0011.
- **Destructive UX (2026-09-01):** Confirm = one tap. Reject = two-step expand (Potvrdi / Odustani, no reason). Ask other time = date+time expand + submit / Odustani. One expanded row at a time. Disable while in flight.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty — remaining items are sharp enough to grill -->

## Out of scope

- Owner pending queue / Worker Availability Panel / Request Detail
- Owner notified on customer response (Epic 6; sibling story in Epic 4 list)
- Cancel / reschedule confirmed bookings (Epic 5)
- Request auto-expire job / TTL
- In-flight chat / Epic 10 assistant
- `/login` `/register` new routes
- Load-more / status filter on `myBookings`
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Pest, Redis, nginx, mailpit, Reverb
- Native apps, payments, worker logins
- Public owner registration
- Trust badge **display** (Phase 2)
