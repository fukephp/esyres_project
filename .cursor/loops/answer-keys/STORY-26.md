# Answer key: STORY-26

> Epic 10 slice: owner chat tab + badge for in-flight assistant intakes (not yet requests). Home stays queue + panel.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-26.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-26 |
| Source | `docs/stories/STORY-26.md` — Owner chat tab |
| Goal (one sentence) | `/owner` stays pending queue + Worker Availability Panel; `/owner/chats` lists in-flight `AssistantIntake` rows for that salon with a nav badge of the 24h total; after chat send the row leaves the list and the booking is the object. |
| Branch name | `story/STORY-26-owner-chat-tab` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-09 |

## Pass/fail — product

- [x] Guest `upsertAssistantIntake` with no token creates a row (UUID token) for that salon; same token updates the same row until convert; stale/converted/unknown token on upsert creates a new row — verify: Behat (`features/guest/assistant_intake.feature`)
- [x] Guest `assistantIntake(token)` returns the snapshot when in-flight and fresh; null when missing, stale (>24h), or converted; guest cannot read `inFlightIntakes` / `inFlightIntakeCount` — verify: Behat
- [x] Anonymous row `customerName` is `Gost`; session user on upsert → `users.name` — verify: Behat
- [x] Owner `inFlightIntakes` is that salon’s in-flight rows, newest `updatedAt` first, `ListPage` limit/offset; other salon omitted; converted and stale omitted — verify: Behat (`features/owner/in_flight_intakes.feature`)
- [x] `inFlightIntakeCount` is the total in-flight count in the 24h window (not page length); guest / other user / unverified owner get the same auth errors as `pendingBookings` — verify: Behat
- [x] `createBooking` with a valid in-flight `intakeToken` for that salon sets `booking_id` and the row drops off list + count; missing/unknown/converted token still creates the booking with no extra error; picker-style input without `intakeToken` still works — verify: Behat
- [x] Helper: progress line is joined service names when any selected, otherwise the current step; badge count `n < 1` hides (null), else `n` — verify: Vitest
- [x] Helper: owner chat path is `/owner/chats` with `?salon=` only when not first owned; `/owner` path helpers unchanged (home is still queue+panel) — verify: Vitest
- [x] Chat send passes `intakeToken`; opening the chat CTA does not upsert; first snapshot change upserts; restore hydrates from `assistantIntake` when the cookie token is in-flight — verify: Vitest (when to upsert / restore) + chat `createBooking` variables include `intakeToken` when present

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #10 #17 #30 #35.

- [x] One Lighthouse `/graphql` type `AssistantIntake` + guest upsert/read + owner list/count; no REST, no chat microservice, no LLM, no WhatsApp, no new Reverb channel, no `pollInterval` — verify: `esyres_app/graphql/schema.graphql`; no new `Subscription` field; frontend owner pages
- [x] Bigint PK; guest handle is unguessable `token` (UUID), not the raw id; `CreateBookingInput.intakeToken` is optional; booking status machine unchanged; no origin/source field — verify: schema + migration + existing Behat booking suite
- [x] `/owner` stays lazy queue + panel (login lands there); `/owner/chats` is a separate lazy owner route (list only, no `:id`); nav `Chat` + badge on desktop aside and phone stack; `?salon=` kept; no settings/stats links — verify: `App.tsx` + owner pages
- [x] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

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

- Take over, after hours, DND (STORY-27)
- Auto-page on every chat
- Worker-facing chat
- Assistant-origin tag + collapsed transcript on Request Detail (STORY-25)
- A second pending queue for chat-originated bookings
- Changing the `createBooking` status machine; adding origin/source
- Picker send attaching `intakeToken` (picker omits it)
- LLM / free-form NLU; Viber / WhatsApp / Instagram DM (Phase 2)
- Settings / stats owner screens
- Scheduled stale-expire job
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**Salon Booking Assistant**, **scripted intake**, **pending queue**, **Worker Availability Panel**), `docs/stories/STORY-26.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense (dark left nav destinations); Bosnian-first.
2. Branch: `story/STORY-26-owner-chat-tab`.
3. **Table:** `assistant_intakes`: bigint PK, `salon_id`, nullable `customer_id`, UUID `token` unique, JSON snapshot columns (`service_ids`, nullable `worker_id`, `worker_confirmed`, nullable `preferred_date`, nullable `preferred_time`), nullable `booking_id`, timestamps. In-flight = `booking_id` null AND `updated_at` within 24h.
4. **GraphQL:** type `AssistantIntake` (`id`, `token`, `customerName`, `updatedAt`, `serviceIds`, `workerId`, `workerConfirmed`, `preferredDate`, `preferredTime`). `upsertAssistantIntake(input:)` public, scoped to existing `salonId`. `assistantIntake(token:)` public, returns the row or null. `inFlightIntakes(salonId, limit, offset)` + `inFlightIntakeCount(salonId)` via `OwnerAccess` (same codes as `pendingBookings`). List sort `updated_at` DESC. `ListPage` for limit/offset. `CreateBookingInput.intakeToken: String` optional; on success, if token matches in-flight for that salon, set `booking_id`. Do not error on bad token. Do not add origin. Do not add a subscription.
5. **Guest PWA:** cookie `esyres_intake_<salonId>` = token, Max-Age 24h, SameSite=Lax (SPA read/write). On `/salon/:id` mount, if cookie, query `assistantIntake` and hydrate; expand chat only when a snapshot exists. Call `upsertAssistantIntake` only when the snapshot changes (first chip/native control), not when the CTA opens. After login/register on the profile, upsert once so the name attaches. Chat `createBooking` sends `intakeToken` when present; on success clear cookie. Picker omits `intakeToken`. Keep existing mutually exclusive picker/chat and send-gate panels.
6. **Owner PWA:** lazy `/owner/chats`. Shared owner nav: `Zahtjevi` → `ownerQueuePath`, `Chat` → `ownerChatPath` (salon query only, no date). Badge from `inFlightIntakeCount`; hide when helper says null. `/owner` still queue + panel + date; refetch count on mount. `/owner/chats`: list rows (name, time, progress line), empty `Nema razgovora.`, salon switcher, no date picker, refetch list+count on mount. No row click, no `/owner/chats/:id`, no owner messages. No settings/stats links.
7. **Helpers:** `intakeProgressLine`, `chatBadgeCount`, `ownerChatPath` / cookie token helpers, `intakeSnapshotChanged` (or equivalent so CTA-open does not upsert). Reuse `assistantStep` for the no-services step. i18n: `owner.chat` (`Chat`), `owner.chatsEmpty`, step labels as needed. No English keys. No bot name.
8. **Behat:** new guest + owner features named above. Cover create/update/resume, stale/convert null, `Gost` vs name, list isolation/sort/page, count vs page, auth, `intakeToken` convert and no-error paths. Full `vendor/bin/behat` must stay green.
9. **Vitest:** cover every Vitest product check. Keep existing owner/assistant tests green.
10. Patch `docs/architecture/04-Frontend.md` (owner routes: `/owner/chats` list + badge, refetch on mount, no new subscription) and `docs/architecture/05-Data-Model.md` (`AssistantIntake` entity). Do not rewrite decision 35.
11. Do not add Pest, Playwright, codegen, Redis, Take over, origin/transcript, or LLM.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
