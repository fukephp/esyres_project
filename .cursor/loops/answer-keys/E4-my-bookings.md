# Answer key: E4-my-bookings

> Epic 4: customer My Bookings status list on `/bookings`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E4-my-bookings.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E4-my-bookings |
| Source | `docs/mvp/07-Stories.md` Epic 4 — “As a customer, I want to see all my requests (Pending / Time Proposed / Confirmed / Declined) in one place, so that I can track their status.” |
| Goal (one sentence) | A logged-in customer sees their own bookings on `/bookings` as a flat newest-first list labeled by status; auth chrome stays; no respond or cancel this PR. |
| Branch name | `story/E4-my-bookings` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-01 |

## Pass/fail — product

- [ ] Session customer `myBookings` returns only their rows, all four statuses, ordered `updated_at DESC` then `id DESC`; each row has `salon { id name }`, `status`, preferred date/time, duration, `worker`, `proposedStartsAt` / `proposedWorker`, `declineReason`, `services` — verify: Behat
- [ ] Empty → `[]`; another customer’s booking omitted; guest → `UNAUTHENTICATED`; unverified email or phone still lists (not `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED`); bad `limit`/`offset` → `INVALID_PAGE` — verify: Behat
- [ ] Helper: `TIME_PROPOSED` clock = `proposedStartsAt` + `proposedWorker`; else `preferredStartsAt` + `worker`. Helper: status → the four Bosnian label keys — verify: Vitest
- [ ] Logged-in `/bookings`: flat list (status label, salon name, Sarajevo date+time, services, duration, worker or Nema preference, decline reason when present); empty “Nema zahtjeva.”; verify panels above the list; rows not tappable — verify: human-only: PR review desktop + phone

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`.

- [ ] Lighthouse `/graphql` only; `myBookings(limit: Int = 20, offset: Int = 0): [Booking!]!` is top-level (not nested on `me`); `ListPage` cap 20 / max 50; `Booking.salon: Salon!` — verify: schema; Behat hits `/graphql`; no new REST routes
- [ ] Sanctum cookies, not Bearer; list does not require `email_verified_at` or `phone_verified_at`; `createBooking` gates unchanged — verify: Behat; no `actingAs` / magic token
- [ ] No customer respond/cancel mutations; no Reverb/subscription; no `pollInterval`; no `/booking/:id` — verify: schema; `esyres_app/frontend` routes
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; guest Behat feature exists
- [ ] No GraphQL codegen, `vite-plugin-pwa`, Playwright this PR — verify: `esyres_app/frontend/package.json`

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). MySQL must be up. Every command must exit 0.

```text
docker compose up -d mysql
docker compose run --rm php php artisan --version
docker compose run --rm php vendor/bin/behat
docker compose run --rm --workdir /app/frontend node npm run typecheck
docker compose run --rm --workdir /app/frontend node npm run test
docker compose run --rm --workdir /app/frontend node npm run build
docker compose run --rm --workdir /app/marketing node npm run build
```

## Out of scope

- Time Proposed Approve / Reject / Ask for a different day or time (sibling Epic 4)
- Cancel / reschedule confirmed bookings (Epic 5)
- Owner pending queue / Worker Availability Panel / Request Detail
- Status notifications (push / SMS / email) — Epic 6
- Favorites, Customer Profile
- `/booking/:id`, `/login`, `/register`
- Load-more / infinite scroll / `status` filter argument
- Reverb, nginx, redis, mailpit
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Native apps, payments, worker logins
- Public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first. Do not apply marketing IA.
2. Branch: `story/E4-my-bookings`.
3. **GraphQL:** `myBookings(limit: Int = 20, offset: Int = 0): [Booking!]!`. Session user or `UNAUTHENTICATED`. Filter `customer_id = me`. All four statuses. Order `updated_at DESC`, `id DESC`. Reuse `ListPage`. Eager-load `salon`, `worker`, `proposedWorker`, `services`. Add `salon: Salon!` on `Booking` (PWA/Behat request `{ id name }` only). Do not add a `status` argument, computed display-time field, or `salonName` scalar. Do not require email/phone verify. Do not nest the list on `me`.
4. **Behat:** guest suite, English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Eloquent fixtures are fine for confirmed / time_proposed / declined (do not send those through `createBooking`). Cover every product GraphQL check: four statuses, sort, other customer omitted, empty `[]`, guest error, unverified user can list, `INVALID_PAGE`, `salon { id name }`, proposed fields on `TIME_PROPOSED`, `declineReason` on declined. Existing guest + owner features must still pass. No Mink.
5. **PWA:** keep `/bookings` auth chrome (AuthShell, verify banners, email/phone panels, logout). When `me` is set, query `myBookings` (default page; `skip` when logged out). No `pollInterval`. Replace the always-on empty stub: show rows when the list is non-empty; “Nema zahtjeva.” only when empty. Flat list; each row is display-only (`<li>`, not a link/button): Bosnian status (`Na čekanju` / `Predloženo vrijeme` / `Potvrđeno` / `Odbijeno`), salon name, Sarajevo date+time of the clock helper (proposed time may be a different day than `preferredDate`), service names, duration, worker or “Nema preference.”, `declineReason` when declined and non-null. No KM, no `customerName`. Panels stay above the list. No load-more. Handwritten operation (no codegen).
6. **Vitest:** `bookingClock` (`TIME_PROPOSED` → proposed start + proposed worker; else preferred start + worker) and status → i18n key for the four labels. Move or copy `formatSarajevoTime` into `lib/format.ts` if the list needs it; do not import `lib/owner.ts` from customer pages. Keep existing tests passing.
7. Patch `docs/architecture/04-Frontend.md` UX constraints with one line: `/bookings` lists the session customer’s bookings (flat status labels; no respond/cancel this slice). Do not expand Epic 5/6/10.
8. Do not add Pest, Redis, codegen, Playwright, Reverb, respond/cancel mutations, or a booking detail route.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. Do **not** capture or attach screenshots. Human-only check is for the human at PR review.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
