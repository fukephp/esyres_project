# Story map: E4-my-bookings

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E4-my-bookings |
| Source | `docs/mvp/07-Stories.md` Epic 4 — “As a customer, I want to see all my requests (Pending / Time Proposed / Confirmed / Declined) in one place, so that I can track their status.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E4-my-bookings.md` |

## Destination

A logged-in customer can see their own bookings on `/bookings` as one flat list, each row labeled by status (Pending / Time Proposed / Confirmed / Declined). Existing auth chrome stays. This list is the customer shell for later respond (sibling Epic 4) and cancel (Epic 5); this PR does not add those actions.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md` (My Bookings), `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 4, `docs/architecture/` (03, 04, 05, 06, 08), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- User paste: “/bookings is auth chrome only; status list is the customer shell for respond/cancel”
- Code today (`esyres_app/`): `/bookings` is AuthShell + verify banners/panels + stub “Nema zahtjeva.” No customer bookings query. GraphQL `Booking` already has `status`, preferred date/time, duration, `customerName`, nullable `worker`, `proposedStartsAt` / `proposedWorker`, `declineReason`, service snapshots — **no salon**. Owner `pendingBookings` / `occupyingBookings` exist. `createBooking` still requires session + verified email + phone OTP.
- Architecture 06: “Customer may refetch; owner should not poll.” Slim Compose has no Reverb.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not ship Time Proposed Approve / Reject / Ask (sibling Epic 4) or cancel/reschedule (Epic 5) in this PR
  - Sparse customer surface (Design 2); Bosnian-first
  - Keep existing `/bookings` auth chrome (login\|register, verify banners, email/phone panels, logout)

## Decisions so far

- **Slice (2026-08-31):** GraphQL customer-bookings query **and** replace the logged-in `/bookings` stub with a status list. No respond mutations, no cancel/reschedule, no new route. Domain: **My Bookings** (not pending queue, not Time Proposed screen, not Request Detail).
- This story is the **status list**, not “approve / reject / ask for a different day or time” (sibling Epic 4) and not cancel/reschedule of confirmed (Epic 5).
- Four statuses already exist: `requested` / `time_proposed` / `confirmed` / `declined` (`BookingStatus` in schema; glossary Request / Time-proposed booking / Confirmed booking / Declined booking). Product copy “Pending” = `requested`.
- Route stays `/bookings`. Logged-out AuthShell, `?verified=` / `?verify=` banners, email + phone panels, logout stay. “Moji zahtjevi” link already on `/` and `/salon/:id`.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA: React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 customer sparse.
- Lists use limit/offset with a capped `perPage` (`docs/architecture/03-Backend.md`, 08 #30). Reuse `ListPage` (default 20, max 50).
- `requested` still does not occupy a clock slot. This PR does not change occupancy or status transitions.
- Architecture 03 maps Epic 4 to customer respond + same-row ask-other-time; those mutations stay out of this PR. Architecture 06: customer may refetch; no Reverb/subscription this PR.
- **Query + auth (2026-08-31):** top-level `myBookings(limit: Int = 20, offset: Int = 0): [Booking!]!`. Reuse `ListPage`. Session required; guest → `UNAUTHENTICATED`. Filter `customer_id = me`. All four statuses; no `status` argument this PR. Empty → `[]`. Bad page → `INVALID_PAGE`. Not nested on `me`. Email/phone verify **not** required to list (those gates stay on `createBooking`).
- **Sort (2026-08-31):** `updated_at DESC`, then `id DESC`. Server-ordered. Newest status change first.
- **Row payload (2026-08-31):** Booking adds `salon: Salon!` (`id` + `name` only in PWA/Behat). Keep existing status, preferred*, duration, worker, proposed*, declineReason, services. No computed display-time field. Row clock: `TIME_PROPOSED` → `proposedStartsAt` + `proposedWorker`; else `preferredStartsAt` + `worker` (null = “Nema preference”). Vitest helper. Show `declineReason` on declined when non-null. No `customerName` or KM on the customer row.
- **List chrome (2026-08-31):** one flat list, newest first. Bosnian status label on each row: Na čekanju / Predloženo vrijeme / Potvrđeno / Odbijeno. Empty → existing “Nema zahtjeva.” No tabs, no four sections.
- **Verify panels vs list (2026-08-31):** stack existing email/phone panels above the list. Do not hide the list until verified (follows query+auth: list does not require verify).
- **Row interaction (2026-08-31):** display only. Not a link or button. No `/booking/:id`. Salon name is text, not a profile link. Sibling stories add respond/cancel on these rows.
- **Pagination chrome (2026-08-31):** first page only. PWA calls default `limit` 20, `offset` 0. No load-more, no infinite scroll. GraphQL still accepts `limit`/`offset` for Behat.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Time Proposed actions: Approve / Reject / Ask for a different day or time (sibling Epic 4)
- Cancel / reschedule confirmed bookings (Epic 5)
- Owner pending queue / Worker Availability Panel / Request Detail
- Notifications / Reverb / SMS (Epic 6)
- Favorites, Customer Profile (open question in `docs/mvp/08`)
- New `/login` `/register` `/booking/:id` routes unless Destination is redrawn
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Pest, Redis, nginx, mailpit
- Native apps, payments, worker logins
