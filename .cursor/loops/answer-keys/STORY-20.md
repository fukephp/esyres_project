# Answer key: STORY-20

> Epic 4 leftover: owner home reflects customer confirm / reject / ask-other-time without polling.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-20.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-20 |
| Source | `docs/stories/STORY-20.md` — Owner sees customer respond |
| Goal (one sentence) | A verified owner on `/owner` sees confirm / reject / ask-other-time land on the pending queue and Worker Availability Panel via a Lighthouse subscription, without polling; guests never receive that signal. |
| Branch name | `story/STORY-20-owner-sees-respond` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-02 |

## Pass/fail — product

- [ ] Guest `bookingCustomerResponded(salonId)` → `UNAUTHENTICATED` — verify: Behat
- [ ] Session customer who does not own that salon → `FORBIDDEN`; unverified-email owner → `EMAIL_UNVERIFIED`; owner of a different salon / missing salon → `FORBIDDEN` — verify: Behat
- [ ] Verified owner of `salonId` can subscribe: GraphQL HTTP 200, subscription channel in `extensions`, no error — verify: Behat
- [ ] After `confirmProposedTime` / `rejectProposedTime` / `askOtherTime`, pending + occupying on re-query still match STORY-19 (confirm occupies, not pending; reject gone and not occupying; ask-other-time same id pending on the new date, not occupying) — verify: Behat (existing `time_proposed.feature` stays green)
- [ ] `/owner` uses `useSubscription` for `bookingCustomerResponded`; `pendingBookings` / `occupyingBookings` have no `pollInterval`; `/`, `/salon/:id`, `/bookings`, `/owner/requests/:id` do not subscribe — verify: `esyres_app/frontend` OwnerHome + routes
- [ ] `/owner` happy path looks right on desktop and mobile (queue + panel; no toast) — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/01-Overview-and-Stack.md`, `03-Backend.md`, `04-Frontend.md`, `06-Auth-Notifications-Realtime.md`, `07-Docker-and-Local-Dev.md`, `08-Decisions.md` #10 #26 #36, `docs/adr/0012-long-lived-slim-compose.md`.

- [ ] Lighthouse `/graphql` only; `bookingCustomerResponded(salonId: ID!): Booking` (nullable handshake; events carry Booking); broadcast from `confirmProposedTime` / `rejectProposedTime` / `askOtherTime` after commit; not from owner accept/propose/decline or `createBooking`; `LIGHTHOUSE_QUEUE_BROADCASTS=false`; no VAPID/SMS/email job — verify: schema; mutations; no new Jobs for notify; Behat hits `/graphql`
- [ ] Slim Compose adds `reverb` (same PHP image, port 8080); Vite proxies `/app`; no redis, nginx, or worker service; Lighthouse subscription storage is Laravel cache (not Redis); Behat uses `LIGHTHOUSE_BROADCASTER=log` — verify: `esyres_app/docker-compose.yml`; `.env.example`; `BehatRuntime.php`
- [ ] Sanctum cookies; subscribe `authorize` reuses `OwnerAccess` codes; no Bearer; Echo/`pusher-js` not statically imported from `apollo.ts` / `main.tsx` / customer pages (dynamic import from the lazy `/owner` chunk only) — verify: `esyres_app/frontend` imports; Behat still cookie+CSRF
- [ ] No Pest, Playwright, GraphQL codegen, `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

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

- VAPID web push (STORY-31)
- SMS fallback (STORY-32)
- Auto-expire of unanswered proposals
- Take over / chat (Epic 10)
- New-request live update on owner home
- Reschedule (Epic 5)
- Request Detail live update
- Toast/banner on `/owner`
- Auto-switching `?date=` on ask-other-time
- Changing confirm / reject / ask-other-time status rules
- Redis, nginx, mailpit, queue worker
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/stories/STORY-20.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (01, 03, 04, 06, 07, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; Bosnian-first. No new toast copy.
2. Branch: `story/STORY-20-owner-sees-respond`.
3. **GraphQL:** add `type Subscription { bookingCustomerResponded(salonId: ID!): Booking! }`. Class `App\GraphQL\Subscriptions\BookingCustomerResponded`: `authorize` via `OwnerAccess::user` + `OwnerAccess::salon` (same codes as `pendingBookings`); `encodeTopic` / `decodeTopic` per `salonId` / `$root->salon_id`. Register Lighthouse `SubscriptionServiceProvider`. After successful commit in `confirmProposedTime`, `rejectProposedTime`, and `askOtherTime`, `Subscription::broadcast('bookingCustomerResponded', $booking)`. Do not broadcast from owner mutations or `createBooking`. `LIGHTHOUSE_QUEUE_BROADCASTS=false`. Optional `LIGHTHOUSE_SUBSCRIPTION_STORAGE_TTL=3600`.
4. **Behat:** owner suite (or guest suite with owner login): subscribe handshake for guest / unverified / non-owner / wrong salon / happy owner channel in `extensions`. Set `LIGHTHOUSE_BROADCASTER=log` and `LIGHTHOUSE_SUBSCRIPTION_STORAGE` to a cache store that exists (`array`). Do not require a live Reverb process in the gate. Keep `features/guest/time_proposed.feature` green. English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. No Mink.
5. **Compose:** `reverb` service from the existing php image, `php artisan reverb:start --host=0.0.0.0 --port=8080`, publish 8080, bind-mount the app like `php`. Add `laravel/reverb` (and pusher PHP client if Reverb broadcasting needs it). `.env.example`: `BROADCAST_CONNECTION=reverb`, `LIGHTHOUSE_BROADCASTER=reverb`, `LIGHTHOUSE_QUEUE_BROADCASTS=false`, `LIGHTHOUSE_SUBSCRIPTION_STORAGE=database` (local `CACHE_STORE` is already database). Vite: proxy `/app` to the reverb service. Do not add redis, nginx, or a worker. Dockerfile: add PHP extensions Reverb requires if install fails (`pcntl` is already there).
6. **PWA `/owner`:** when `ownerReady`, `useSubscription` on `bookingCustomerResponded` with the selected `salonId`. On payload, refetch `PENDING_BOOKINGS_QUERY` + `OCCUPYING_BOOKINGS_QUERY` for current salon+date (`refetchBoard`). Do not `setParams` / change date. No `pollInterval`. No toast. `/owner/requests/:id` unchanged. Dynamic-import Echo/`pusher-js` from the owner chunk only — customer first paint must not include them.
7. **Docs (same PR):** slim Compose is now php + vite + mysql + **reverb**. Patch `docs/adr/0012-long-lived-slim-compose.md`, `docs/architecture/07-Docker-and-Local-Dev.md`, `docs/architecture/08-Decisions.md` #36 (remaining: nginx, redis, worker, mailpit), `.cursor/CONTEXT.md`, `esyres_app/README.md`. Add `docs/adr/0014-reverb-in-slim-compose.md`. One line on `docs/architecture/04-Frontend.md`: `/owner` subscribes to `bookingCustomerResponded` and refetches queue+occupying; no poll. Do not add VAPID.
8. Do not add Pest, Playwright, codegen, Redis, toast UI, or new-request/reschedule subscriptions.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of `/owner` (queue + panel, no toast) in the PR description (not committed). If capture/attach fails, open a **draft/blocked** PR.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
