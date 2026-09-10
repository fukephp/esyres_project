# Answer key: STORY-31

> Epic 6: owner VAPID web push for new requests, customer confirm/reject/ask-other-time, and reschedule requests.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-31.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-31 |
| Source | `docs/stories/STORY-31.md` — Owner push notifications |
| Goal (one sentence) | A subscribed owner gets a queued VAPID web push (payload `salonId` + `type` + `bookingId`) for `createBooking`, customer confirm/reject/ask-other-time, and `requestReschedule`; closed-tab is the service worker; no SMS and no new-request Reverb. |
| Branch name | `story/STORY-31-owner-push` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [ ] Guest `subscribePush` → `UNAUTHENTICATED`; sessioned user upserts by `endpoint` (second call same endpoint does not duplicate the row) — verify: Behat
- [ ] `vapidPublicKey` query returns the configured public key (no auth) — verify: Behat
- [ ] Owner has a `PushSubscription` row: `createBooking` → fake `PushGateway` last send `type=requested`, `salonId` = that salon, `bookingId` = new id, `title=Novi zahtjev`, `body` = salon name — verify: Behat
- [ ] Same owner subscribed: `confirmProposedTime` → `type=confirmed`, `title=Gost je prihvatio`; `rejectProposedTime` → `rejected` / `Gost je odbio`; `askOtherTime` → `ask_other_time` / `Gost traži drugo vrijeme`; `requestReschedule` → `reschedule` / `Gost traži premještaj`; each `body` is salon name — verify: Behat
- [ ] Owner with no subscription: those mutations still succeed; fake gateway has no send — verify: Behat
- [ ] Customer (not the salon owner) may `subscribePush`; `createBooking` still sends only to the salon owner’s subscription, not the customer’s — verify: Behat
- [ ] `acceptPreferredTime` / `proposeTime` / `declineBooking` / `cancelBooking` / `pingAssistantIntake` do not send owner push — verify: Behat
- [ ] Helper: `pushClickPath(salonId)` → `/owner?salon={salonId}` — verify: Vitest
- [ ] i18n: `owner.push.requested` / `confirmed` / `rejected` / `askOtherTime` / `reschedule` match the five titles above — verify: Vitest (i18n keys)

## Pass/fail — architecture

Cite `docs/architecture/02-System-Context.md`, `03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #18 #23 #36.

- [ ] `push_subscriptions` table: `user_id`, unique `endpoint`, `p256dh`, `auth`. GraphQL: `subscribePush(endpoint: String!, p256dh: String!, auth: String!): Boolean!`; `vapidPublicKey: String!`. Queued `SendOwnerPush` job + `PushGateway` (Behat fake records last payload; local log). Never inline on the mutation. No OneSignal. No worker/redis/nginx/mailpit this PR — verify: schema + migration; `esyres_app/docker-compose.yml` still has no worker/redis; Behat `QUEUE_CONNECTION=sync`
- [ ] `vite-plugin-pwa` + Workbox: custom SW `push` → `showNotification` from payload; `notificationclick` → `/owner?salon={salonId}`. Do not cache GraphQL POST. No Playwright, Pest, GraphQL codegen — verify: `esyres_app/frontend/package.json`; SW file; no `pestphp` require
- [ ] Sends from `createBooking` / `confirmProposedTime` / `rejectProposedTime` / `askOtherTime` / `requestReschedule` only (after commit). Existing Reverb broadcasts unchanged. No new-request subscription. `logout` does not drop rows — verify: mutations; schema Subscription unchanged

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- In-app queue update without push (STORY-20); no new-request Reverb
- Customer SMS fallback / customer status push send (STORY-32)
- Reminder email (STORY-33)
- Marketing / re-engagement (Phase 2)
- Owner SMS
- Assistant ping / take-over as a push
- Cancel / owner accept-propose-decline / acceptReschedule / dismissReschedule push
- `unsubscribePush`; logout does not drop subscriptions
- Settings page / install-wall / “uključi obavijesti” chrome
- Request Detail deep-link
- Real push vendor, worker container, redis, nginx, mailpit
- Playwright, Pest, GraphQL codegen

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-31.md`, `docs/glossary.md` (**Ping** is not this notify), `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (02, 03, 04, 05, 06, 08 #18 #23 #36). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner; Bosnian-first. No new persistent chrome.
2. Branch: `story/STORY-31-owner-push`.
3. **Schema:** `push_subscriptions`: `id`, `user_id` FK cascade, unique `endpoint` (text), `p256dh`, `auth`, timestamps. Model `PushSubscription`. `User::pushSubscriptions()`.
4. **GraphQL:** `vapidPublicKey: String!` (public). `subscribePush(endpoint, p256dh, auth): Boolean!` — Sanctum session; guest `UNAUTHENTICATED`; upsert on `endpoint` (reassign `user_id` if the same browser later logs in as someone else). No `unsubscribePush`. No codegen.
5. **Gateway + job:** `PushGateway` interface; Behat/`testing` fake (last payload + reset in `BehatRuntime`, same pattern as `SmsGateway`); otherwise log. `SendOwnerPush implements ShouldQueue`: load salon owner’s subscriptions; no rows → return; else `send` each with JSON `{ salonId, type, bookingId, title, body, url }` where `url` is `/owner?salon={salonId}`. Titles/body per product checks. Dispatch **after** successful commit from `createBooking`, `confirmProposedTime`, `rejectProposedTime`, `askOtherTime`, `requestReschedule` only. Do not send from owner mutations, cancel, ping, take-over. `QUEUE_CONNECTION=sync` in Behat already. Do not add a worker service. Add `minishlink/web-push` for the log/real driver; fake does not need a live VAPID round-trip. `.env.example`: `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT=mailto:hello@example.com`. Behat `putEnv` dummy keys if the query is under test.
6. **PWA:** add `vite-plugin-pwa` only on the product frontend (not marketing). `injectManifest` (or equivalent) custom SW: `push` shows `title`/`body` from the payload; `notificationclick` opens `payload.url` or `/owner?salon={salonId}`. Do not intercept/cache `/graphql`. Dev: skip subscribe when `serviceWorker` / PushManager is missing (`devOptions.enabled` false is OK). Hook: when owner-ready on `/owner`, `/owner/chats`, and `/owner/requests/:id`, if `Notification` + `PushManager` exist, `requestPermission` then `subscribe` + `subscribePush`. Denied/unsupported: silent. No settings UI. Do not type credentials in the IDE browser.
7. **Vitest:** `pushClickPath` + the five `owner.push.*` i18n keys. Reuse `ownerQueuePath` only if it matches `/owner?salon=`; click always includes `salon` (SW has no first-owned id).
8. **Behat:** English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Owner and/or guest suite. Reset fake push per scenario. Do not require a live browser, Reverb, or worker. Keep existing features green.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. UI story — same ready rule as non-UI (machine gates). Do not embed screenshots. Do not draft because shots are missing.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
