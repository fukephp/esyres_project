# Story map: STORY-20

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-20 |
| Source | `docs/stories/STORY-20.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-20.md` |

## Destination

A verified owner on `/owner` sees confirm / reject / ask-other-time land on the pending queue and Worker Availability Panel without refreshing or polling the queue. Guest customers never receive that owner signal.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 04, 07 Epic 4), `docs/architecture/` (01, 03, 04, 06, 07, 08), `docs/stories/STORY-20.md` plus STORY-19 / STORY-31 / STORY-32, `docs/glossary.md`, `docs/adr/0012-long-lived-slim-compose.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): customer `confirmProposedTime` / `rejectProposedTime` / `askOtherTime` ship (STORY-19). Behat already re-queries occupancy/pending after those mutations. Owner `/owner` loads `pendingBookings` + `occupyingBookings` on mount and when `?date=` / `?salon=` change; no `pollInterval`, no `useSubscription`, Apollo HTTP-only (`apollo.ts`). Mutations do not broadcast. Schema has no `type Subscription`. Slim Compose is php + vite + mysql (ADR 0012). `BROADCAST_CONNECTION=log`. Lighthouse subscriptions default to redis storage + pusher broadcaster — unused. No `laravel/reverb` in composer. No Playwright. No GraphQL codegen. Handwritten operations.
- Standing preferences:
  - Do not invent a second API (not REST)
  - Do not invent a different realtime stack than architecture 06 (Reverb + Lighthouse subscriptions; owner should not poll)
  - Do not absorb VAPID / SMS (STORY-31 / STORY-32)
  - Bosnian-first; Design 2 owner dense; lazy `/owner` chunk

## Decisions so far

- This story is **in-app owner home freshness** when a customer responds to a counter-proposal. Not VAPID push (STORY-31), not SMS (STORY-32). STORY-31 AC names this story as the in-app path.
- Customer respond already ships (STORY-19). Status/occupancy rules stay: confirm → not pending, occupies agreed worker-range; reject → gone from pending, not occupying; ask other time → same id `requested` on the new preferred date, not occupying. Do not re-open the status machine.
- Events: confirm, reject, ask other time only. Not new `createBooking` (architecture 06 lists “new request” as a later owner-panel event). Not reschedule (Epic 5). Not owner accept/propose/decline (already refetchQueries on the acting owner’s client).
- Surface: `/owner` pending queue + Worker Availability Panel for the **currently selected** salon and date. Salon switcher stays as-is; viewing salon A does not live-update from salon B.
- Guest customers do not receive this owner signal (story AC). Customer routes (`/`, `/salon/:id`, `/bookings`) do not subscribe to it.
- Owner access unchanged: verified email + owns the salon. Customer respond gates unchanged (ADR 0011 / 0013).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, MySQL, React + Apollo cookie client, handwritten operations, i18next `bs`. Not Pest. Not a second SPA.
- Notifications stay queued and never inline for push/SMS/email (architecture 03). This PR must not add VAPID jobs or SMS.
- Auto-expire of unanswered proposals, Take over / chat (Epic 10) stay out.
- **Transport (2026-09-02):** Laravel Reverb + Lighthouse subscription this PR. Not `pollInterval`. Not refetch-on-focus as the freshness mechanism. Not subscription-schema-without-WS.
- **Chrome (2026-09-02):** silent queue + panel update. No toast/banner.
- **Ask-other-time day (2026-09-02):** stay on current `?date=`. Old day: row gone, occupancy released. New day’s pending is visible only after the owner changes the date field.
- **Request Detail (2026-09-02):** `/owner` only. `/owner/requests/:id` stays load-time query.
- Echo / `pusher-js` only from the lazy `/owner` chunk (architecture 08 #10). Customer first paint does not ship them. Customer routes never call `useSubscription`.
- **Contract (2026-09-02):** `bookingCustomerResponded(salonId: ID!): Booking` (nullable on HTTP handshake; events carry Booking). Topic per salon. `can` / `authorize` same codes as `pendingBookings` (`UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `FORBIDDEN`). On event, `/owner` refetches `pendingBookings` + `occupyingBookings` for current salon+date (`refetchBoard`). Do not patch cache. Do not change `?date=`.
- **Compose (2026-09-02):** `reverb` service in slim Compose (same PHP image, `php artisan reverb:start` on 8080). Vite proxies `/app`. No Redis, no nginx, no worker. `LIGHTHOUSE_BROADCASTER=reverb` locally; Behat `log` + existing `CACHE_STORE=array`. Subscription storage = Laravel cache (`database` local, `array` Behat). Patch ADR 0012, architecture 07 / 08 #36, CONTEXT, app README.
- **Broadcast (2026-09-02):** inline after the three respond mutations commit (`LIGHTHOUSE_QUEUE_BROADCASTS=false`). Not a notify job. Not a worker container.
- **Verifiers (2026-09-02):** Behat subscribe handshake + auth; existing time-proposed occupancy/pending re-query stays green. Frontend: `useSubscription` on `/owner` only; no `pollInterval`. No extra Vitest (refetch, no helper). One human-only: PR screenshots desktop+mobile of `/owner`. No Playwright. Live two-tab WS is human review, not the machine gate.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- VAPID web push payloads (STORY-31)
- SMS fallback (STORY-32)
- Auto-expire of unanswered proposals
- Take over / chat (Epic 10)
- New-request live update on owner home
- Reschedule (Epic 5)
- Changing confirm / reject / ask-other-time status rules
- Customer My Bookings list / respond actions
- GraphQL codegen, `vite-plugin-pwa`, Playwright unless a check cannot name another verifier
- Pest, nginx, mailpit, Redis (Reverb this PR does not add them)
- Public owner registration, worker logins, payments, trust badge display
