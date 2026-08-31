# Answer key: E3-one-tap-accept

> Epic 3: one-tap accept preferred time (`requested → confirmed`). Closes the happy path.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E3-one-tap-accept.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-one-tap-accept |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to accept a guest's preferred time in one tap when it works, so that simple requests don't need an extra back-and-forth.” |
| Goal (one sentence) | A verified owner one-taps Prihvati on a named-worker request; it becomes `confirmed` at the preferred time, occupies that worker’s range, and leaves the pending queue. |
| Branch name | `story/E3-one-tap-accept` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-31 |

## Pass/fail — product

- [ ] Verified owner `acceptPreferredTime(bookingId)` on a `requested` row with a worker → `status` `CONFIRMED`; `owner_responded_at` set once; that id is gone from `pendingBookings` for that salon-day — verify: Behat
- [ ] Null worker → `WORKER_REQUIRED`; already `confirmed` or other non-`requested` → `NOT_REQUESTED`; missing booking or other salon’s owner → `FORBIDDEN`; guest → `UNAUTHENTICATED`; unverified owner → `EMAIL_UNVERIFIED`; failed accept does not set `owner_responded_at` — verify: Behat
- [ ] Same worker overlapping `[preferred_starts_at, preferred_starts_at + duration)` with `confirmed` or `time_proposed` → `SLOT_TAKEN`; adjacent (end = next start) succeeds; different workers at the same time both succeed; another `requested` on the same worker/time does not occupy until accepted — verify: Behat
- [ ] Helper: named worker → show Prihvati; null worker → hide. Helper: `SLOT_TAKEN` / `NOT_REQUESTED` / unknown → those three copy keys — verify: Vitest
- [ ] `/owner` named-worker row has Prihvati; tap removes the row; no-preference row has no button; overlap error copy under the row — verify: human-only: PR review desktop + phone

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`.

- [ ] Lighthouse `/graphql` only; `acceptPreferredTime(bookingId: ID!): Booking!`; `BookingStatus` is `REQUESTED` \| `CONFIRMED` (no `TIME_PROPOSED` / `DECLINED` this PR) — verify: schema; Behat hits `/graphql`; no new REST routes
- [ ] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass; owner mutation requires `email_verified_at` + owns the salon, not phone OTP — verify: Behat login steps; no `actingAs` / magic token
- [ ] `requested` still does not occupy a clock slot; confirmed-via-accept occupies `preferred_starts_at` (no new `starts_at` / `proposed_starts_at`); overlap helper treats `confirmed` and `time_proposed` as occupying — verify: no new occupancy datetime columns; Behat overlap; no hours/break check on accept
- [ ] No `proposeTime` / `declineBooking`; no `@dnd-kit`; no Reverb/subscription; no status notification job; `owner_responded_at` is DB-only (not on GraphQL `Booking`) — verify: schema; `esyres_app/frontend` package.json; no new Jobs for notify
- [ ] No Pest; backend gate remains `vendor/bin/behat` — verify: no `pestphp` require; owner Behat feature exists
- [ ] No GraphQL codegen, `vite-plugin-pwa`, Playwright this PR; owner chunk stays lazy — verify: `esyres_app/frontend/package.json` + routes

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

- `proposeTime`, `declineBooking`
- Worker Availability Panel, `@dnd-kit`, 15-minute grid
- Request Detail (row is not a link)
- In-flight chat tab, Take over, assistant origin tag + transcript (Epic 10)
- Salon switcher chrome (Epic 7)
- Customer My Bookings / Time Proposed / confirmed UI (Epic 4)
- Status notifications (push / SMS / email) — Epic 6
- Hours/break validation on accept
- `starts_at` / `proposed_starts_at` columns
- GraphQL `TIME_PROPOSED` / `DECLINED`; GraphQL `ownerRespondedAt`
- Request auto-expire job / TTL
- Reverb, nginx, redis, mailpit
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Trust badge **display** (Phase 2)
- Public owner registration; worker logins; payments

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; Bosnian-first. Do not apply marketing IA.
2. Branch: `story/E3-one-tap-accept` from a HEAD that already has the pending-queue `/owner` + `pendingBookings`.
3. **GraphQL:** `acceptPreferredTime(bookingId: ID!): Booking!`. `OwnerAccess::user` then load booking; missing or `salon.owner_id !== user` → `FORBIDDEN`. Status not `requested` → `NOT_REQUESTED`. `worker_id` null → `WORKER_REQUIRED`. Overlap on that worker with `confirmed` or `time_proposed` on `[preferred_starts_at, preferred_starts_at + duration)` (half-open) → `SLOT_TAKEN`. Else set `status = confirmed`, `owner_responded_at = now` (only if still null). Transaction + `lockForUpdate` so two taps cannot double-book. Do not check hours/breaks. Do not add `starts_at` / `proposed_starts_at`. Do not expose `ownerRespondedAt` on `Booking`. Enum: add `CONFIRMED` only. Do not add `proposeTime` / `declineBooking`.
4. **Overlap helper:** do not fold clock overlap into `BusyLevel\Occupancy` (that is day percent). Small dedicated helper. Include `time_proposed` even though this PR never writes it. Fixture a `time_proposed` row in Behat via Eloquent.
5. **Behat:** owner suite, English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Cover every product GraphQL check above (happy path, `WORKER_REQUIRED`, `NOT_REQUESTED`, `FORBIDDEN`, guest, unverified, `SLOT_TAKEN` vs adjacent vs other worker vs other `requested`, `owner_responded_at` on success only, pending list omits confirmed). Existing guest + owner features must still pass. No Mink.
6. **PWA:** Prihvati button on `/owner` rows with `worker != null` only. Rows stay not links. `useMutation` + refetch `pendingBookings` for current salon/date. Disable the tapped button while in flight. Under-row Bosnian: `SLOT_TAKEN` → “Taj termin je zauzet.”; `NOT_REQUESTED` → “Zahtjev više nije na čekanju.”; fallback → “Zahtjev nije prihvaćen.” Reuse `graphqlErrorCode`. No toast library, no optimistic cache, no `@dnd-kit`, no `/owner` link on customer pages.
7. **Vitest:** `canAcceptPreferredTime(worker)` (named vs null) and accept-error key (`SLOT_TAKEN` / `NOT_REQUESTED` / fallback). Keep existing tests passing.
8. Patch `docs/architecture/04-Frontend.md` UX constraints: `/owner` pending queue has Prihvati on named-worker rows via `acceptPreferredTime`; still no panel. Do not expand Epic 4/5/6/10.
9. Do not add Pest, Redis, codegen, Playwright, Reverb, notify jobs, or expire/reschedule schema.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: PR linking this key; list commands run. Do **not** capture or attach screenshots. Human-only check is for the human at PR review.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
