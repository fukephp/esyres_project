# Story map: E3-pending-queue

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-pending-queue |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to see all pending requests for a day in one queue, sorted so urgent ones aren't buried, so that nothing slips through.” |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/E3-pending-queue.md` |

## Destination

A verified owner can see every `requested` booking for one salon and one Sarajevo calendar day in one queue, ordered so sooner preferred times are not buried, with each row showing the guest’s preferred date and time.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md` (Reservation Inbox / Pending Requests Queue), `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 3, `docs/architecture/` (03, 04, 05, 06, 08), `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Stories source has no `STORY-xx` ids; this id is the loop handle
- User paste: “first owner surface; unblocks accept/propose and E4”
- Code today (`esyres_app/`): `Booking` + `createBooking` (`requested` only); `OwnerAccess` (verified email + owns salon); PWA has `/`, `/salon/:id`, `/bookings` (AuthShell login\|register, `me` without salons). No `/owner`, no pending query, no Reverb in slim Compose, no Playwright, no GraphQL codegen. `User.name` exists (email local-part) but is not on GraphQL `User`. `Booking` GraphQL has status, preferred date/time, duration, service snapshots — not customer, not worker.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not ship accept / propose / decline or the Worker Availability Panel this PR
  - Invite-only: no public “Register salon”
  - Lazy `/owner` chunk (architecture 08 #10)

## Decisions so far

- **Slice (2026-08-31):** GraphQL pending-for-a-day query **and** first `/owner` UI that lists that day’s `requested` rows for one salon. No Worker Availability Panel, no accept/propose/decline. Domain: **Pending queue** (not My Bookings, not Request Detail).
- This story is the **pending queue for a day**, not one-tap accept, drag-to-propose, tap fallback, or decline (sibling Epic 3 stories).
- Queue items are `requested` only. `requested` does not occupy a clock slot (`docs/architecture/03-Backend.md`, `05-Data-Model.md`).
- Owner access = verified email + owns the salon (`docs/architecture/06-Auth-Notifications-Realtime.md`; existing `OwnerAccess`). `/owner` requires `email_verified_at`.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL. Not Pest. PWA already has React Router + Apollo cookie client + handwritten operations + i18next `bs` + Design 2 tokens.
- Product copy for the inbox (`docs/mvp/03-Key-Features.md`): shows each guest’s preferred date and time; sorted by upcoming/requested day, soonest first. Queue sits at the top of each day on the panel (panel itself is out of this PR).
- Home after login is pending queue + panel (`docs/mvp/04-UI-Design-Goals.md`). Chat tab, Request Detail, salon switcher, and assistant tags are other stories.
- Lists use limit/offset with a capped `perPage` (`docs/architecture/03-Backend.md`, 08 #30). Discovery already has `ListPage` (default 20, max 50).
- **Query (2026-08-31):** top-level `pendingBookings(salonId: ID!, date: String!, limit: Int = 20, offset: Int = 0): [Booking!]!`. Reuse `ListPage`. Empty day → `[]`. Guest → `UNAUTHENTICATED`; unverified email → `EMAIL_UNVERIFIED`; not owner of that salon → `FORBIDDEN`; bad date → `INVALID_DATE`; bad page → `INVALID_PAGE`. Not nested on public `salon`.
- **Salon context (2026-08-31):** `me { salons { id name } }` returns salons the user owns (empty list if none). `/owner` uses the first salon by `id` ASC. No switcher chrome this PR (Epic 7).
- **Queue row (2026-08-31):** Booking keeps status, preferredDate, preferredStartsAt, durationMinutes, services. Add `customerName: String!` (user `name`). Add nullable `worker { id name }` (`null` = no preference). UI shows time, name, service names, duration, worker or “Nema preference.” No email, phone, or KM on the row. Do not nest full `User` on Booking.
- **`/owner` auth (2026-08-31):** logged out → login only (no register). Unverified email → check-email + resend (same copy as `/bookings`). Verified + empty `me.salons` → Bosnian not-an-owner, no queue query. Verified + salons → queue. No `/owner` link on customer pages. Phone OTP not required for this route.
- **Freshness (2026-08-31):** Apollo fetch on load and when `date` changes. No poll. No Reverb/subscription this PR.
- **Day chrome (2026-08-31):** native date field. URL `/owner?date=YYYY-MM-DD`; omit or invalid param → Sarajevo today (not an error page). Empty list copy: “Nema zahtjeva za ovaj dan.” No mini-month calendar. No prev/next this PR.
- **Owner shell (2026-08-31):** lazy `/owner` chunk. Dark left nav: salon name + one queue item. Main = date field + list. Phone: no sidebar — title, date, list. No empty panel region.
- **Urgency visual (2026-08-31):** client helper; cue when `preferred_starts_at <= now + 2h` (includes past). Badge “Uskoro”. Sort unchanged. No GraphQL field. Design 2 `warning` / `cell-pending`, not customer busy tokens. Vitest on the helper. Not request auto-expire.
- **Reschedule tags (2026-08-31):** none this PR. No reschedule column. Epic 5.
- **Row tap (2026-08-31):** display only. Not a link or button. Request Detail is a sibling story.
- Dates: `preferred_date` is Sarajevo `YYYY-MM-DD`; `preferred_starts_at` is UTC (`docs/architecture/05-Data-Model.md`).
- **Day scope (2026-08-31):** query requires `date: "YYYY-MM-DD"` (Sarajevo calendar day). `/owner` sends **today** in Europe/Sarajevo by default. Only `requested` rows for that salon whose `preferred_date` is that day. Invalid date → `INVALID_DATE`. Not a multi-day grouped inbox.
- **Sort (2026-08-31):** within that day, `preferred_starts_at` ASC, then `created_at` ASC. Server-ordered. Not oldest-waiting-only, not newest-first.
- Bosnian-first UI. Design 2 owner composition (dense; dark nav + queue + panel). Phone stacks queue above availability. Mini-month calendar is not required chrome.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- `acceptPreferredTime`, `proposeTime`, `declineBooking`
- Worker Availability Panel, `@dnd-kit`, 15-minute grid
- Request Detail form (accept / decline / counter-propose via tap)
- In-flight chat tab, Take over, assistant origin tag + transcript (Epic 10)
- Salon switcher chrome (Epic 7); this PR only reads `me.salons` to pick the first salon
- Customer My Bookings list / status tabs (Epic 4)
- Request auto-expire job / TTL (placeholder); this PR’s “Uskoro” is preferred-time-soon only
- Reverb / nginx / redis / mailpit in slim Compose (unless already present)
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Public owner registration; worker logins; payments; Pest
