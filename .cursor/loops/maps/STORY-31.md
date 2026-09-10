# Story map: STORY-31

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-31 |
| Source | `docs/stories/STORY-31.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-31.md` |

## Destination

An owner gets a VAPID web push for a new requested booking and when a customer confirms, rejects, or asks other time. Payload includes `salonId` for switcher context. Closed tab still delivers (service worker). No SMS, no reminder email, no in-app queue live-update for new requests.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 06, 07), `docs/architecture/` (02, 03, 04, 05, 06, 08 #18 #23 #36), `docs/stories/STORY-31.md` plus STORY-12 / 13 / 19 / 20 / 29 / 32 / 33, `docs/glossary.md` (**Ping** ≠ this notify)
- Skills: grill-with-docs (app code exists); custom-feature-skills
- Code today (`esyres_app/`): no `PushSubscription` table, no VAPID package, no `vite-plugin-pwa`. Only queued side effect is `SendPhoneOtp` + `SmsGateway` (fake in Behat, log locally). `createBooking` does not broadcast. Customer confirm/reject/ask-other-time broadcast `bookingCustomerResponded` (STORY-20). `requestReschedule` broadcasts `bookingRescheduled`. Slim Compose has no worker; Behat `QUEUE_CONNECTION=sync` + fakes. Owner home has no Notification permission UI.
- Standing preferences:
  - One GraphQL endpoint; no OneSignal
  - Queue the send; never inline on the mutation (Behat stays sync)
  - Do not add redis / nginx / mailpit / worker this PR
  - Do not ship customer SMS fallback (STORY-32) or reminder email (STORY-33)
  - Do not ship new-request Reverb (STORY-20 leftover; this story is push)
  - Do not treat assistant **Ping** as this notify
  - Playwright / Pest / codegen still not this PR unless a check cannot name another verifier

## Decisions so far

- STORY-31 is **owner** web push only. Customer push-then-SMS is STORY-32. Owner SMS is not MVP (STORY-32 OOS).
- VAPID, not OneSignal (architecture 08 #23). Payload **must** include `salonId`.
- `PushSubscription` entity exists in the data-model sketch: endpoint + keys **per user** (many devices = many rows).
- Sends are queued jobs, never inline. Behat: sync queue + fake/log push (architecture 03). No worker container this PR (same as OTP).
- In-app queue update without push stays STORY-20. This PR does not add a new-request subscription.
- Reminder email is STORY-33. Marketing / re-engagement is Phase 2.
- Stack: Lighthouse `/graphql`, Sanctum cookies, Behat GraphQL-over-HTTP, Vitest/typecheck/build. Bosnian-first. Design 2 owner surface.
- Closed-tab delivery is the service worker + VAPID path (`vite-plugin-pwa` is the locked PWA piece). Machine verifier cannot fire a real OS notification: Behat asserts a fake `PushGateway` received the payload after the mutation; no Playwright.
- **Event set (2026-09-10):** new `requested` (`createBooking`) + customer `confirmProposedTime` / `rejectProposedTime` / `askOtherTime` + `requestReschedule`. Not cancel, ping, take-over, or owner accept/propose/decline/acceptReschedule/dismissReschedule.
- **Opt-in (2026-09-10):** on `/owner` after owner-ready, if the browser supports push: `Notification.requestPermission` once, then `subscribePush`. No settings page, no install-wall. Denied or unsupported: silent. Mutations still succeed.
- **Click + payload (2026-09-10):** JSON `{ salonId, type, bookingId }`. `type` = `requested` | `confirmed` | `rejected` | `ask_other_time` | `reschedule`. Click opens `/owner?salon={salonId}` (omit `salon` when they own only one — same as `ownerQueuePath`). No Request Detail deep-link.
- **No row / dead endpoint (2026-09-10):** no-op send. Mutation still 200. Fake gateway records nothing. No “uključi obavijesti” chrome.
- **Copy (2026-09-10):** title = event, body = salon name. `requested` `Novi zahtjev`; `confirmed` `Gost je prihvatio`; `rejected` `Gost je odbio`; `ask_other_time` `Gost traži drugo vrijeme`; `reschedule` `Gost traži premještaj`.
- **Logout (2026-09-10):** leave the subscription. Do not call unsubscribe from `logout`.
- **Subscribe (2026-09-10):** `subscribePush(endpoint, p256dh, auth)` for any Sanctum session (guest → `UNAUTHENTICATED`). Upsert by endpoint. This PR sends only to `salon.owner_id`.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- In-app queue update without push (STORY-20)
- Customer SMS fallback (STORY-32)
- Reminder email (STORY-33)
- Marketing / re-engagement messages (Phase 2)
- Owner SMS
- Assistant ping / take-over as a push (Epic 10)
- Real SMS/push vendor, worker container, redis, nginx, mailpit
- Playwright, Pest, GraphQL codegen
