# Answer key: E3-pending-queue

> Epic 3 pending queue for a day. First `/owner` surface.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E3-pending-queue.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-pending-queue |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to see all pending requests for a day in one queue, sorted so urgent ones aren't buried, so that nothing slips through.” |
| Goal (one sentence) | A verified owner can list that salon’s `requested` bookings for one Sarajevo day, soonest preferred time first, on lazy `/owner`. |
| Branch name | `story/E3-pending-queue` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-31 |

## Pass/fail — product

- [ ] Verified owner of the salon queries `pendingBookings(salonId, date)` and gets only `requested` rows for that `preferred_date`, ordered `preferred_starts_at` ASC then `created_at` ASC — verify: Behat
- [ ] Empty day → `[]`; a booking on another date or another salon is omitted; guest → `UNAUTHENTICATED`; unverified owner → `EMAIL_UNVERIFIED`; other user → `FORBIDDEN`; bad date → `INVALID_DATE`; bad `limit`/`offset` → `INVALID_PAGE` — verify: Behat
- [ ] Each row exposes `customerName`, nullable `worker { id name }`, `preferredDate`, `preferredStartsAt`, `durationMinutes`, `services { name durationMinutes }`; `me.salons { id name }` is the owned list (empty if none) — verify: Behat
- [ ] Helper: `preferredStartsAt` in the past or within 2h → soon; later than 2h → not soon. Helper: omit/invalid `?date=` → Sarajevo today (`YYYY-MM-DD`) — verify: Vitest
- [ ] `/owner` happy path (login → first salon’s queue: time, name, services, duration, worker or Nema preference, Uskoro when soon, empty-day copy, phone stacked layout) — verify: human-only: PR review desktop + phone

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`.

- [ ] Lighthouse `/graphql` only; `pendingBookings` is top-level (not nested on public `salon`); `ListPage` cap 20 / max 50 — verify: schema; Behat hits `/graphql`; no new REST routes
- [ ] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass; `/owner` requires `email_verified_at`, not phone OTP — verify: Behat login steps; no `actingAs` / magic token
- [ ] Owner chunk is lazy; no `@dnd-kit`; no accept/propose/decline mutations; no Reverb/subscription; no pollInterval — verify: `esyres_app/frontend` routes + package.json; schema
- [ ] `requested` still does not occupy a clock slot; no expire job / reschedule column — verify: no new occupancy or expire code; schema
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; owner Behat feature exists
- [ ] No GraphQL codegen, `vite-plugin-pwa`, Playwright this PR — verify: `esyres_app/frontend/package.json`

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

- `acceptPreferredTime`, `proposeTime`, `declineBooking`
- Worker Availability Panel, `@dnd-kit`, 15-minute grid, empty panel placeholder
- Request Detail (tap → accept / decline / form propose)
- In-flight chat tab, Take over, assistant origin tag + transcript (Epic 10)
- Salon switcher chrome (Epic 7)
- Customer My Bookings list (Epic 4)
- Request auto-expire job / TTL
- Reverb, nginx, redis, mailpit
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Public owner registration; `/owner` link on customer pages; register toggle on `/owner`
- Native apps, payments, worker logins

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense (dark nav + queue); Bosnian-first. Do not apply marketing IA.
2. Branch: `story/E3-pending-queue`.
3. **GraphQL:** `pendingBookings(salonId: ID!, date: String!, limit: Int = 20, offset: Int = 0): [Booking!]!`. `OwnerAccess::user` + `OwnerAccess::salon`. Filter `status = requested` and `preferred_date = date`. Order `preferred_starts_at` ASC, `created_at` ASC. Reuse `ListPage`. Validate date like busy-level (`YYYY-MM-DD` + `checkdate`) → `INVALID_DATE`. Booking: add `customerName` (user `name`) and nullable `worker { id name }`. `me.salons { id name }` = owned salons, `id` ASC. Do not nest full `User` on Booking. Do not add accept/propose/decline.
4. **Behat:** owner suite, English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Fixture `requested` bookings (Eloquent is fine; owner does not call `createBooking`). Cover product GraphQL checks: sort, other date/salon omitted, empty `[]`, auth errors, `customerName` / worker null vs named, `me.salons`. Existing guest + owner features must still pass. No Mink.
5. **PWA:** `React.lazy` route `/owner`. Logged out: login only (reuse `login` mutation; no register). Unverified: existing `EmailVerifyPanel`. Verified + no salons: Bosnian not-an-owner. Verified + salons: first salon by `id`. Native date input; `?date=` via existing `sarajevoToday()` when omit/invalid. Query `pendingBookings` on load and when date changes (no poll). Rows display-only (not link/button): preferred time, `customerName`, service names, duration, worker or “Nema preference.” “Uskoro” when the Vitest helper says soon. Empty: “Nema zahtjeva za ovaj dan.” Desktop: dark left nav (`surface-dark`) with salon name + one queue item; main = date + list. Phone: no sidebar — title, date, list. Add Design 2 tokens needed (`surface-dark`, `warning` / `cell-pending`). No `/owner` link on `/`, `/salon/:id`, `/bookings`. No `@dnd-kit`.
6. **Vitest:** soon-helper (`preferredStartsAt` ISO, now) and `?date=` parse (omit/invalid → `sarajevoToday()`). Keep existing tests passing.
7. Patch `docs/architecture/04-Frontend.md` UX constraints with one line: `/owner` is a lazy pending queue for one salon-day (login only; no panel/mutations this slice). Do not expand Epic 10 or Epic 5.
8. Do not add Pest, Redis, codegen, Playwright, Reverb, or expire/reschedule schema.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. Do **not** capture or attach screenshots. Human-only check is for the human at PR review.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
