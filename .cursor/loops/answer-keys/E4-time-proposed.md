# Answer key: E4-time-proposed

> Epic 4: customer Approve / Reject / Ask other time on a counter-proposal.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E4-time-proposed.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E4-time-proposed |
| Source | `docs/mvp/07-Stories.md` Epic 4 — “As a customer, I want to approve, reject, or ask for a different day or time once a counter-proposed time is offered, so that I stay in control of the final appointment. Asking for a different day or time updates the same request (new preferred date/time, back to pending), not a duplicate.” |
| Goal (one sentence) | On `/bookings`, a verified customer confirms, rejects, or asks other time on a time-proposed row (same booking id); that closes request → propose → respond. |
| Branch name | `story/E4-time-proposed` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-01 |

## Pass/fail — product

- [ ] Session customer `confirmProposedTime(bookingId)` on `time_proposed` → `CONFIRMED`; `worker` = former proposed worker; `preferredStartsAt` / `preferredDate` = proposed clock (Sarajevo day); GraphQL `proposedStartsAt` / `proposedWorker` null; same id; `owner_responded_at` unchanged; occupying that worker-range as confirmed; not in `pendingBookings` — verify: Behat
- [ ] `rejectProposedTime(bookingId)` → `DECLINED`; `declineReason` null; proposed fields cleared/hidden; same id; not occupying; `owner_responded_at` unchanged — verify: Behat
- [ ] `askOtherTime(bookingId, preferredDate, preferredTime)` → `REQUESTED`; new preferred date/time; guest `worker_id` unchanged (not copied from proposed); proposed fields cleared; same id; not occupying; `pendingBookings` on the new date includes it; services/duration unchanged; same date+time as old preferred is allowed — verify: Behat
- [ ] Guest → `UNAUTHENTICATED`; unverified email → `EMAIL_UNVERIFIED`; unverified phone → `PHONE_UNVERIFIED`; other customer’s booking or missing id → `FORBIDDEN`; `requested` / `confirmed` / `declined` → `NOT_TIME_PROPOSED`; `askOtherTime` bad date/time/past/closed weekday → `INVALID_DATE` / `INVALID_TIME` / `PAST_TIME` / `SALON_CLOSED` and status stays `time_proposed` — verify: Behat
- [ ] Helper: `respondErrorKey` maps `NOT_TIME_PROPOSED` / `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` / `SALON_CLOSED` / `PAST_TIME` / `INVALID_DATE` / `INVALID_TIME` / `FORBIDDEN` / `SLOT_TAKEN` / fallback — verify: Vitest
- [ ] `/bookings` `TIME_PROPOSED` rows: Prihvati one-tap; Odbi two-step (Potvrdi / Odustani, no reason); Drugo vrijeme expands date+time + Pošalji / Odustani; one expand at a time; other statuses have no actions; stay on `/bookings` — verify: human-only: PR review desktop + phone

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #24 #33, `docs/adr/0007-owner-responded-at-on-first-action.md`, `docs/adr/0011-customer-respond-same-verify-gates.md`.

- [ ] Lighthouse `/graphql` only; `confirmProposedTime(bookingId: ID!): Booking!`, `rejectProposedTime(bookingId: ID!): Booking!`, `askOtherTime(bookingId: ID!, preferredDate: String!, preferredTime: String!): Booking!` — verify: schema; Behat hits `/graphql`; no new REST routes
- [ ] Sanctum cookies, not Bearer; respond requires `email_verified_at` + `phone_verified_at` (ADR 0011); `myBookings` still lists without verify; no `actingAs` / magic token — verify: Behat
- [ ] Ask other time is the same row (08 #24); `requested` does not occupy; confirm occupies via `worker_id` + `preferred_starts_at` after copy; no Reverb/subscription; no notify job; no `/booking/:id` — verify: Behat occupying/pending; schema; `esyres_app/frontend` routes
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

- Owner pending queue / Worker Availability Panel / Request Detail UI
- Owner notified on customer response (Epic 6)
- Cancel / reschedule confirmed bookings (Epic 5)
- Request auto-expire job / TTL
- Customer reject reason field
- `/booking/:id`, `/login`, `/register`
- Load-more / `status` filter on `myBookings`
- In-flight chat / Epic 10 assistant
- Reverb, nginx, redis, mailpit
- GraphQL codegen, `vite-plugin-pwa`, Playwright, Pest
- Native apps, payments, worker logins
- Public owner registration
- Trust badge **display** (Phase 2)

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0011-customer-respond-same-verify-gates.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first. Do not apply marketing IA.
2. Branch: `story/E4-time-proposed`.
3. **GraphQL:** three mutations as in architecture checks. Session customer only (`customer_id = me`). Guest → `UNAUTHENTICATED`. Missing email/phone verify → `EMAIL_UNVERIFIED` / `PHONE_UNVERIFIED` (same order as `createBooking`). Missing booking or not owner of the row → `FORBIDDEN`. Status not `time_proposed` → `NOT_TIME_PROPOSED`. Transaction + `lockForUpdate` (include this id and the proposed worker’s occupying rows, same idea as `proposeTime`). Do not stamp `owner_responded_at`. Do not add a `status` argument or a detail query.
4. **confirmProposedTime:** copy `proposed_worker_id` → `worker_id`, `proposed_starts_at` → `preferred_starts_at`, Sarajevo calendar day of that instant → `preferred_date`; `status = confirmed`; null `proposed_starts_at` and `proposed_worker_id`. Overlap check excluding self → `SLOT_TAKEN` (do not write). Confirmed always has a worker.
5. **rejectProposedTime:** `status = declined`; `decline_reason` stays null (do not overwrite an existing value with a customer reason — there is none); clear `proposed_*`. No overlap check.
6. **askOtherTime:** parse `preferredDate` + `preferredTime` like `createBooking` (`INVALID_DATE` / `INVALID_TIME` / `PAST_TIME` / `SALON_CLOSED`). Not `INVALID_TIME_STEP`. Set `preferred_date` / `preferred_starts_at`; `status = requested`; clear `proposed_*`; leave `worker_id` (guest preference, may be null), services, duration. Same id. Allowed even if date/time equal the old preferred.
7. **Behat:** guest suite, English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Cover every product GraphQL check (confirm materialize + occupying confirmed + not pending; reject declined + null reason + not occupying; ask-other-time same id + new preferred + worker preference preserved + pending on new date + occupying empty; auth/verify; `NOT_TIME_PROPOSED`; ask validation leaves `time_proposed`). Owner login in the same feature is fine for pending/occupying asserts. Existing guest + owner features must still pass. No Mink.
8. **PWA:** only `TIME_PROPOSED` rows get actions. Prihvati → `confirmProposedTime` immediately. Odbi expands that row: Potvrdi / Odustani, no reason field. Drugo vrijeme expands: `type=date` + `type=time` (reuse salon Datum/Vrijeme labels) + Pošalji / Odustani. One expanded row at a time; switching action collapses the other. Odustani collapses, no mutation. Disable while in flight. `useMutation` + refetch `MyBookings`. Under-row Bosnian via `respondErrorKey`. Copy keys under `bookings` (do not import `owner.*`): Prihvati / Odbi / Drugo vrijeme / Potvrdi / Odustani / Pošalji. No modal, no toast library, no optimistic cache, no `/booking/:id`, no salon-profile navigation. Auth chrome + verify panels stay above the list. Rows for other statuses stay display-only `<li>`.
9. **Vitest:** `respondErrorKey` as in the product check. Keep `bookingClock` / status-label tests passing (confirmed uses preferred+worker after copy).
10. Patch `docs/architecture/04-Frontend.md` UX constraints: `/bookings` `TIME_PROPOSED` rows expose confirm / reject / ask-other-time; still no cancel and no `/booking/:id`. Patch `.cursor/rules/backend/booking-lifecycle.mdc` with the three customer mutations if the status-flow bullet is still owner-only. Do not expand Epic 5/6/10.
11. Do not add Pest, Redis, codegen, Playwright, Reverb, notify jobs, or expire/reschedule schema.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: PR linking this key; list commands run. Do **not** capture or attach screenshots. Human-only check is for the human at PR review.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
