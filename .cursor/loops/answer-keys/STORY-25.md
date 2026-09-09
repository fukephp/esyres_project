# Answer key: STORY-25

> Epic 10 slice: assistant-originated requests in the same pending queue, tagged, with a collapsed transcript on Request Detail.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-25.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-25 |
| Source | `docs/stories/STORY-25.md` — Assistant requests in queue |
| Goal (one sentence) | Chat-sent `requested` rows show in the same pending queue as picker rows, tagged `Asistent`, with a collapsed labeled transcript on Request Detail; accept / counter-propose / decline stay the existing mutations. |
| Branch name | `story/STORY-25-assistant-queue` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [x] Chat `createBooking` with a valid in-flight `intakeToken` → that salon-day `pendingBookings` includes the row with non-null `intake` (snapshot `serviceIds` / `workerId` / `preferredDate` / `preferredTime`); picker `createBooking` (no token) on the same salon-day has `intake` null — verify: Behat (`features/owner/assistant_origin.feature` or extend pending queue)
- [x] `ownerBooking` on the chat booking returns the same nested snapshot; `ownerBooking` on the picker booking returns `intake` null — verify: Behat
- [x] Guest `myBookings` on a chat-originated booking returns `intake` null; guest `assistantIntake(token)` after convert stays null — verify: Behat (`features/guest/my_bookings.feature` or assistant intake + this owner feature)
- [x] Helper: tag visible iff `intake != null`; labeled lines are services (joined names), worker name or no-preference, date, `HH:mm` — verify: Vitest
- [x] Queue and Request Detail query `intake`; chip copy `Asistent`; Request Detail `<details>` summary `Zašto ovo vrijeme`, default closed, step labels `owner.chatStep`; Prihvati / Predloži / Odbi unchanged — verify: Vitest (helpers + i18n keys used by those helpers) + typecheck; existing owner Behat stay green

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #10 #35.

- [x] `Booking.intake: AssistantIntake` nullable; resolver returns the converted row only when the session owns that salon, else null; no `bookings.origin` / `fromAssistant` field; no new mutation; status machine unchanged — verify: schema + Behat
- [x] Converted intake stays a snapshot (not a message log); no new intake columns; guest token read unchanged — verify: schema + migration unchanged for origin/transcript storage; Behat guest token null after convert
- [x] `/owner` stays queue + panel; `/owner/requests/:id` stays Request Detail; no second booking inbox; no new Reverb channel — verify: routes; no new `Subscription`
- [x] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

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

- A second owner inbox for chat
- Take over while chatting (STORY-27)
- Changing the `createBooking` status machine
- In-flight chat tab / badge (STORY-26)
- Unknown → say so / ping owner (STORY-28)
- Weakening picker gates (STORY-24)
- Storing busy-level, suggestion vs other-time, or chat bubbles
- LLM / free-form NLU; Viber / WhatsApp / Instagram DM (Phase 2)
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**assistant-originated**, **request transcript**, **pending queue**, **Request Detail**), `docs/stories/STORY-25.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; Bosnian-first.
2. Branch: `story/STORY-25-assistant-queue`.
3. **GraphQL:** `Booking.intake: AssistantIntake` (nullable). Field resolver: converted `AssistantIntake` where `booking_id` matches, **only** if `context` user owns `booking.salon`; else `null`. No `fromAssistant`. No `bookings.origin`. No new mutations. Eager-load intake on `pendingBookings` and `ownerBooking`. Guest `assistantIntake(token)` stays in-flight-only (null after convert).
4. **Behat:** owner suite covering chat vs picker `pendingBookings` + `ownerBooking` intake; guest `myBookings` requests `intake` and gets null on a converted chat booking; keep existing “Valid intake token on createBooking drops the row”. Full `vendor/bin/behat --format=progress --stop-on-failure` must stay green. No Mink.
5. **PWA:** `PENDING_BOOKINGS_QUERY` and `OWNER_BOOKING_QUERY` select `intake { id serviceIds workerId preferredDate preferredTime }`. Queue row: `Asistent` chip when intake present (same row as `Uskoro`, not a second list). Request Detail: same chip, then `<details>` (no `open`) with summary `Zašto ovo vrijeme` and labeled lines from the Vitest helper; `owner.chatStep` for labels; worker value = booking worker name or `salon.noPreference`. Prihvati / Predloži / Odbi / drag unchanged. Nav `Chat` unchanged.
6. **Helpers:** e.g. `assistantOriginVisible(intake)` and `assistantTranscriptLines({ services, workerName, preferredDate, preferredTime })` in `frontend/src/lib/owner.ts` (or adjacent). i18n: `owner.assistant` = `Asistent`, `owner.transcript` = `Zašto ovo vrijeme`. No English keys. No bot name.
7. **Vitest:** cover every Vitest product check. Keep existing owner/assistant tests green.
8. Patch `docs/architecture/04-Frontend.md` (queue `Asistent` chip; Request Detail collapsed transcript) and `docs/architecture/05-Data-Model.md` (converted intake is the origin signal; Request Detail transcript = labeled snapshot, not a message log). Do not rewrite decision 35.
9. Do not add Pest, Playwright, codegen, Redis, Take over, origin column, or LLM.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
