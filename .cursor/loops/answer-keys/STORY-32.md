# Answer key: STORY-32

> Epic 6: customer VAPID web push for owner propose/accept/decline, then SMS fallback on push miss.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-32.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-32 |
| Source | `docs/stories/STORY-32.md` — Customer SMS fallback |
| Goal (one sentence) | On owner `proposeTime` / `acceptPreferredTime` / `declineBooking`, the customer gets a queued VAPID web push first; SMS to `phone` + `phone_verified_at` only if that push misses (no subscription or every send fails). |
| Branch name | `story/STORY-32-customer-sms-fallback` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [ ] Customer has a `PushSubscription` row: owner `proposeTime` → fake customer push `type=time_proposed`, `title=Predloženo vrijeme`, `body` = salon name, `url=/bookings`, `salonId` + `bookingId`, user = booking customer; no status SMS — verify: Behat
- [ ] Same customer subscribed: `acceptPreferredTime` → `type=confirmed`, `title=Potvrđeno`; `declineBooking` → `type=declined`, `title=Odbijeno`; each `body` = salon name, `url=/bookings`; no status SMS — verify: Behat
- [ ] Customer with no subscription and verified phone: those three mutations succeed; no customer push send; status SMS to that E.164, body `{title}. {salon}.` (e.g. `Predloženo vrijeme. Kosa Studio.`); decline with a reason still uses that body (no reason text) — verify: Behat
- [ ] Customer subscribed but fake push send fails: mutation succeeds; status SMS as above — verify: Behat
- [ ] Customer with no subscription and `phone_verified_at` null (phone may be set): those three mutations succeed; no status SMS — verify: Behat
- [ ] `createBooking` / `confirmProposedTime` / `rejectProposedTime` / `askOtherTime` / `cancelBooking` / `requestReschedule`: no customer push, no status SMS (owner push from STORY-31 unchanged) — verify: Behat
- [ ] Existing owner-push scenarios stay green (`no owner push` still means no send to the salon owner when only the customer is notified) — verify: Behat
- [ ] Helper: `customerPushClickPath()` → `/bookings` — verify: Vitest
- [ ] i18n: `bookings.push.timeProposed` / `confirmed` / `declined` match the three titles above — verify: Vitest (i18n keys)

## Pass/fail — architecture

Cite `docs/architecture/02-System-Context.md`, `03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md` #18 #23 #36, `docs/adr/0017-customer-sms-fallback-on-push-miss.md`.

- [ ] Queued `SendCustomerStatus` (or equivalent) + existing `PushGateway` / `SmsGateway`. Dispatch **after** successful commit from `proposeTime`, `acceptPreferredTime`, `declineBooking` only. Never inline. No OneSignal. No worker/redis/nginx/mailpit this PR — verify: mutations; `esyres_app/docker-compose.yml` still has no worker/redis; Behat `QUEUE_CONNECTION=sync`
- [ ] `PushGateway::send` returns success/failure. Miss = no customer rows or every send fails → `SmsGateway` status method (not OTP `send($phone, $code)`). SMS only if `phone` set and `phone_verified_at` not null (not `hasVerifiedPhone()`). Fake push: default success, fail-next for Behat; record sends so owner vs customer lasts stay distinct. Fake SMS: last status phone+body, OTP `lastCode` unchanged — verify: Behat; OTP feature still reads `lastCode`
- [ ] PWA: silent subscribe on `/bookings` when sessioned (`me` loaded), same `subscribePush` as owner. Denied/unsupported: silent. SW still shows payload `title`/`body` and opens `payload.url`. No settings chrome. No Playwright, Pest, GraphQL codegen — verify: `MyBookings` hook; `sw.js`; no `pestphp` require

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

- Owner SMS
- Reminder email (STORY-33)
- OTP send (STORY-12)
- Viber / WhatsApp (Phase 2)
- Marketing / re-engagement SMS
- Owner push events / chrome (STORY-31)
- In-app queue live-update (STORY-20)
- Settings page / install-wall / “uključi obavijesti” chrome
- Customer notify for cancel, reschedule, expire, or the customer’s own respond
- `unsubscribePush`
- Real SMS/push vendor, worker container, redis, nginx, mailpit
- Playwright, Pest, GraphQL codegen

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-32.md`, `docs/glossary.md` (**SMS fallback**, **Time-critical status change**; **Ping** is not this notify), `docs/adr/0017-customer-sms-fallback-on-push-miss.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (02, 03, 04, 05, 06, 08 #18 #23 #36). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer `/bookings`; Bosnian-first. No new persistent chrome.
2. Branch: `story/STORY-32-customer-sms-fallback`.
3. **Gateway:** `PushGateway::send` → `bool` (true = hit). `LogPushGateway`: false on exception or unsuccessful web-push report (do not swallow as success). `FakePushGateway`: default true; `failNext`; store a **list** of sends (`userId` + payload). Existing Behat `the last owner push type` / `no owner push was sent` must mean last/any send **to the salon owner**, so a customer send does not fail those steps. `SmsGateway`: keep OTP `send($phone, $code)`; add `notify(string $phone, string $body): void` (name may match). `FakeSmsGateway`: `lastStatusPhone` / `lastStatusBody`; `reset` clears them; do not write `lastCode` from `notify`. `LogSmsGateway`: log status separately from OTP. Reset fakes in `BehatRuntime` as today.
4. **Job:** `CustomerStatus` helper + `SendCustomerStatus implements ShouldQueue`. After commit from `proposeTime` (`time_proposed`), `acceptPreferredTime` (`confirmed`), `declineBooking` (`declined`) only. Load booking customer. Push payload `{ salonId, type, bookingId, title, body, url }` with `url=/bookings`, titles as product checks, `body` = salon name. If the customer has subscriptions, `send` each; if **at least one** returns true, stop (no SMS). If no rows or every send fails: SMS only when `phone` is non-empty and `phone_verified_at` is not null; body `{title}. {salon}.` Do not use `hasVerifiedPhone()`. Do not include decline reason. Do not dispatch from customer respond, `createBooking`, cancel, reschedule, ping, take-over, expire. `QUEUE_CONNECTION=sync` in Behat already. Do not add a worker service.
5. **PWA:** On `MyBookings` when `me` is loaded, reuse the STORY-31 subscribe path (extract shared helper if that is smaller than duplicating `useOwnerPush`). Click helper `customerPushClickPath()` → `/bookings`. SW already opens `payload.url`; do not change the owner default except if a one-line fallback is required. No settings UI. Do not type credentials in the IDE browser.
6. **Vitest:** `customerPushClickPath` + the three `bookings.push.*` i18n keys. Keep existing `pushClickPath` / `owner.push.*` tests.
7. **Behat:** English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF. Guest and/or owner suite. Reset fakes per scenario. Cover hit (subscribed), miss (no sub → SMS), fail-next → SMS, unverified phone → no SMS, and the non-event mutations. Keep `features/guest/phone_otp.feature` and `features/*/owner_push.feature` green. Do not require a live browser, Reverb, or worker.
8. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
9. On success: PR linking this key; list commands run. UI story — same ready rule as non-UI (machine gates). Do not embed screenshots. Do not draft because shots are missing.
10. On escalate: draft/blocked PR with failing checks and the human decision needed.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
