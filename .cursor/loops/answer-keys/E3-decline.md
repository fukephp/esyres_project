# Answer key: E3-decline

> Epic 3: owner decline of a request (`requested → declined`) with optional reason.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E3-decline.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E3-decline |
| Source | `docs/mvp/07-Stories.md` Epic 3 — “As an owner, I want to decline a request with an optional reason, so that the customer understands why without me needing to propose a time first.” |
| Goal (one sentence) | A verified owner two-step declines a pending request (optional reason); it becomes `declined`, leaves the queue, and does not occupy a slot. |
| Branch name | `story/E3-decline` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-31 |

## Pass/fail — product

- [ ] Verified owner `declineBooking(bookingId)` on `requested` (named worker or no preference) → `status` `DECLINED`; `declineReason` null; `owner_responded_at` set once; that id gone from `pendingBookings` and from `occupyingBookings` — verify: Behat
- [ ] Optional `reason` stored trimmed; omit / blank / whitespace → `declineReason` null; 255 chars OK; 256 → `REASON_TOO_LONG` and status stays `requested`; failed decline does not set `owner_responded_at` — verify: Behat
- [ ] Guest → `UNAUTHENTICATED`; unverified owner → `EMAIL_UNVERIFIED`; missing booking or other salon’s owner → `FORBIDDEN`; already `confirmed` / `time_proposed` / `declined` → `NOT_REQUESTED` — verify: Behat
- [ ] Helpers: trim reason (blank → null); `declineErrorKey` maps `NOT_REQUESTED` / `REASON_TOO_LONG` / fallback — verify: Vitest
- [ ] `/owner` every pending row has Odbi (including no preference); expand → optional reason + Potvrdi / Odustani; Potvrdi removes the row; Odustani keeps it; error copy under the row — verify: human-only: PR review desktop + phone

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0010-owner-decline-from-requested.md`.

- [ ] Lighthouse `/graphql` only; `declineBooking(bookingId: ID!, reason: String): Booking!`; `BookingStatus` adds `DECLINED`; `declineReason: String` nullable — verify: schema; Behat hits `/graphql`; no new REST routes
- [ ] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass; owner mutation requires `email_verified_at` + owns the salon, not phone OTP — verify: Behat login steps; no `actingAs` / magic token
- [ ] `requested → declined` without `time_proposed`; declined does not occupy; `WorkerOverlap` / `occupyingBookings` still only `confirmed` \| `time_proposed`; `BusyLevel\Occupancy` still omits declined — verify: no overlap check on decline; Behat pending + occupying; Occupancy statuses unchanged
- [ ] No Request Detail route; Prihvati + drag/`proposeTime` unchanged; no Reverb/subscription; no status notification job; `ownerRespondedAt` still not on GraphQL `Booking` — verify: schema; `esyres_app/frontend` routes; no new Jobs for notify
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

- Request Detail tap/form fallback (sibling Epic 3)
- Customer Time Proposed / My Bookings status list / customer confirm-decline (Epic 4)
- `/bookings` listing declined rows (persist only)
- Status notifications (push / SMS / email) — Epic 6
- Request auto-expire job / TTL (same column, sentinel `expired` later)
- In-flight chat tab, Take over, assistant origin (Epic 10)
- Salon switcher chrome (Epic 7)
- Cancel / reschedule (Epic 5)
- Changing `acceptPreferredTime` / `proposeTime` hours or overlap behavior
- Reverb, nginx, redis, mailpit
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Trust badge **display** (Phase 2)
- Public owner registration; worker logins; payments

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0010-owner-decline-from-requested.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; Bosnian-first. Do not apply marketing IA.
2. Branch: `story/E3-decline` from a HEAD that already has `/owner` queue + panel + `acceptPreferredTime` + `proposeTime`.
3. **Schema:** nullable `bookings.decline_reason` (string 255). GraphQL `BookingStatus` add `DECLINED`. Booking: `declineReason: String` (null unless set). Do not expose `ownerRespondedAt`.
4. **GraphQL:** `declineBooking(bookingId: ID!, reason: String): Booking!`. `OwnerAccess::user` then load booking; missing or `salon.owner_id !== user` → `FORBIDDEN`. Status not `requested` → `NOT_REQUESTED`. Trim `reason`; empty after trim → null; mb length > 255 → `REASON_TOO_LONG` (do not write status). Else set `status = declined`, `decline_reason`, `owner_responded_at` if null. No worker required. No overlap / hours check. Do not change preferred or proposed fields. Transaction + `lockForUpdate` so decline cannot race accept/propose. Guest → `UNAUTHENTICATED`; unverified → `EMAIL_UNVERIFIED`.
5. **Behat:** owner suite, English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Cover every product GraphQL check above (happy named + no-preference, reason trim/null/255/256, auth errors, `NOT_REQUESTED` for confirmed/time_proposed/declined, `owner_responded_at` on success only, pending + occupying omit declined). Existing guest + owner features must still pass. No Mink.
6. **PWA:** Odbi on every `/owner` pending row (including no preference). Tap expands that row only: optional reason textarea (`maxLength` 255) + Potvrdi + Odustani. Potvrdi → `declineBooking` with trimmed reason or omit. Odustani collapses, no mutation. `useMutation` + refetch `pendingBookings` + `occupyingBookings`. Disable while in flight. Under-row Bosnian: `NOT_REQUESTED` → “Zahtjev više nije na čekanju.”; `REASON_TOO_LONG` → “Razlog je predug.”; fallback → “Zahtjev nije odbijen.” Reuse `graphqlErrorCode`. Copy: Odbi / Potvrdi / Odustani / “Razlog (opcionalno)”. No modal, no toast library, no optimistic cache, no Request Detail route, no `/bookings` list, no `/owner` link on customer pages. Prihvati + drag unchanged.
7. **Vitest:** `trimDeclineReason` (omit/blank/whitespace → null; trim) and `declineErrorKey` (`NOT_REQUESTED` / `REASON_TOO_LONG` / fallback). Keep existing tests passing.
8. Patch `docs/architecture/04-Frontend.md` UX constraints: `/owner` queue rows have Odbi (two-step) via `declineBooking`; still no Request Detail. Do not expand Epic 4/5/6/10.
9. Do not add Pest, Redis, codegen, Playwright, Reverb, notify jobs, or expire/reschedule schema.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: PR linking this key; list commands run. Do **not** capture or attach screenshots. Human-only check is for the human at PR review.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
