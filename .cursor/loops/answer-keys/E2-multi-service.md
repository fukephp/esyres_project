# Answer key: E2-multi-service

> Epic 2 first booking slice: multi-select services on `/salon/:id` → one `requested` row.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E2-multi-service.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E2-multi-service |
| Source | `docs/mvp/07-Stories.md` Epic 2 — “As a customer, I want to select multiple services in one request, so that I don't need to submit separate requests for a haircut and a color.” |
| Goal (one sentence) | A customer on `/salon/:id` can multi-select services, pick a preferred day and time, and send one `createBooking` that becomes a `requested` row with service snapshots. |
| Branch name | `story/E2-multi-service` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-30 |

## Pass/fail — product

- [x] A verified customer (`email_verified_at` + `phone_verified_at`) can `createBooking` with **two** services on one salon and get `status: REQUESTED`, two snapshots (name, duration, price feninga), and `durationMinutes` = sum of those durations rounded **up** to 15 — verify: Behat
- [x] The same mutation with no session returns `UNAUTHENTICATED` — verify: Behat
- [x] Session with email unverified returns `EMAIL_UNVERIFIED`; email verified and phone not verified returns `PHONE_UNVERIFIED` — verify: Behat
- [x] Empty, duplicate, or foreign `serviceIds` returns `INVALID_SERVICES`; omitted `workerId` stores no preference (`worker_id` null); `workerId` for a worker not on that salon returns `INVALID_WORKER` — verify: Behat
- [x] Closed weekday returns `SALON_CLOSED`; past datetime (Sarajevo) returns `PAST_TIME`; malformed date/time returns `INVALID_DATE` / `INVALID_TIME`; a time on an **open** day inside a break or outside hours is **accepted** — verify: Behat
- [x] After a `requested` row, `busyLevel(date:)` for that salon-day uses occupancy (booked minutes that day / open minutes that weekday, cap 100 → existing `BusyLevel::fromPercent`), not the old always-`LOW` stub — verify: Behat
- [x] Stacked duration + KM total helper (sum feninga, sum minutes) — verify: Vitest
- [ ] Profile picker happy path looks right on desktop and mobile (`Pošalji zahtjev`, multi-select, native date+time, stacked total, success copy) — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`. ADR: `docs/adr/0002-createbooking-gates-without-otp-ui.md`.

- [x] Lighthouse `/graphql` is the API; `createBooking` is the only new mutation; no REST booking resource — verify: Behat hits `/graphql`; no new booking REST routes
- [x] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass; gates are session + `email_verified_at` + `phone_verified_at` (fixtures when OTP is not under test) — verify: Behat login steps; no `actingAs` / magic token / magic OTP in app code
- [x] Money stays integer feninga; `preferred_date` is Sarajevo `YYYY-MM-DD`; `preferred_starts_at` is UTC; `requested` does not occupy a clock slot — verify: schema/migrations + Behat (no slot-occupancy columns used for `REQUESTED`)
- [x] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; Behat feature covers the GraphQL checks
- [x] No Redis, OTP mutations, register, verify-mail, chat, `/owner`, My Bookings, GraphQL codegen, `vite-plugin-pwa`, or Playwright this PR — verify: `esyres_app/docker-compose.yml` still has no redis; `esyres_app/frontend/package.json` and app routes

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Public register, email-verify flow, phone OTP UI, Redis, SMS (sibling E2; ADR 0002)
- Worker pick UI and guest `salon.workers` (sibling E2)
- Designed picker / week busy strip (sibling E2-day-time-picker)
- Dedicated confirmation screen (sibling E2-request-sent)
- Salon Booking Assistant chat (Epic 10)
- Owner panel / accept / propose / decline (Epic 3)
- My Bookings / customer respond (Epic 4)
- Notifications / Reverb (Epic 6)
- Photos, address, slug, maps link
- QR hold cookie (Epic 8)
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest, `/owner`
- Nginx, redis, reverb, mailpit (unless already present)
- Native apps, payments, worker logins, Inertia
- Public owner registration

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0002-createbooking-gates-without-otp-ui.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/E2-multi-service`.
3. **Users:** nullable unique `phone` + `phone_verified_at` on `users`. No OTP send/verify mutations.
4. **Booking:** `bookings` + `booking_services`. Columns: `salon_id`, `customer_id`, nullable `worker_id`, `preferred_date`, `preferred_starts_at`, `status` (`requested` this PR). Snapshots: service name, `duration_minutes`, `price_feninga` at send. Duration on the booking = sum of snapshot durations, rounded up to 15. No expire job, no `proposed_starts_at` required this PR (nullable if the column exists for later).
5. **GraphQL:** `createBooking(input: CreateBookingInput!): Booking!`. Input: `salonId: ID!`, `serviceIds: [ID!]!`, `workerId: ID`, `preferredDate: String!`, `preferredTime: String!`. Type `Booking`: `id`, `status` (`REQUESTED`), `preferredDate`, `preferredStartsAt`, `durationMinutes`, `services { name durationMinutes priceFeninga }`. English GraphQL error codes as listed in product checks. No `me` query. No bookings list. Do not ungate `salon.workers`.
6. **Occupancy:** replace the hardcoded `0` in `SalonBusyLevel`. Booked minutes that calendar day = duration of bookings in `requested` + `time_proposed` + `confirmed` (not `declined`) for that salon+date. Open minutes = that weekday’s open interval minus break (0 if closed). Percent = booked/open capped at 100; closed or 0 open → `LOW`. Reuse `BusyLevel::fromPercent`.
7. **Behat:** English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF, migrate-fresh + per-scenario fixtures. Cover every GraphQL product check. Fixture a verified customer (both timestamps) when OTP is not under test. Existing discovery/profile/owner features must still pass. No Mink.
8. **PWA:** on `/salon/:id`, `Pošalji zahtjev` turns the service list into multi-select and reveals native date + time (`step` 15 minutes). Stack duration + KM total. Empty catalog: no or disabled CTA. No new route, no sheet, no worker picker, no week strip, no chat CTA. On `UNAUTHENTICATED`, inline email+password, existing `login`, retry `createBooking`. On `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED`, Bosnian error only. Success: same page, Bosnian “zahtjev poslan / salon će odgovoriti”. Handwritten mutation (no codegen). Skip `vite-plugin-pwa`, Playwright, `/owner`, My Bookings.
9. **Vitest:** stacked duration + KM total helper. Keep existing discovery/KM/busy tests passing.
10. Do not add Pest. Do not add Redis to slim Compose. Do not add OTP, register, or chat.
11. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
12. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of `/salon/:id` picker happy path in the PR description (not committed). If capture/attach fails, open a **draft/blocked** PR.
13. On escalate: draft/blocked PR with failing checks and the human decision needed.
14. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
