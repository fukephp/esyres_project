# Answer key: STORY-27

> Epic 10 slice: optional owner Take over (pause one in-flight intake). Guest waits only after that tap. After hours / DND: take-over off; assistant always finishes.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-27.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-27 |
| Source | `docs/stories/STORY-27.md` — Take over |
| Goal (one sentence) | Owner can pause one in-flight intake from `/owner/chats` (`Preuzmi` / `Vrati asistentu`); the guest waits and cannot upsert or chat-send until release; after hours or DND, take-over is off and the assistant still finishes to `requested`. |
| Branch name | `story/STORY-27-take-over` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [ ] Owner `takeOverAssistantIntake(id)` on an in-flight row they own, while the salon is open and DND off, sets pause in effect (`takenOver` true); guest `upsertAssistantIntake` with that token and `createBooking` with that `intakeToken` fail with `INTAKE_TAKEN_OVER`; picker-style `createBooking` without `intakeToken` still succeeds; row stays in `inFlightIntakes` / count — verify: Behat (`features/owner/take_over.feature` + guest intake/createBooking)
- [ ] Owner `releaseAssistantIntake(id)` clears the pause (`takenOver` false); guest upsert and chat `createBooking` with that token work again; take-over and release bump `updated_at` (same 24h stale rule, no exemption) — verify: Behat
- [ ] After hours (closed weekday, before open, at/after close, or inside the break) or DND on: `takeOverAssistantIntake` fails `TAKEOVER_UNAVAILABLE`; `takenOver` is false even if the pause flag was set while open; guest upsert and chat send succeed — verify: Behat (Behat `setTestNow` is Saturday 09:00 Sarajevo; open/closed/break fixtures)
- [ ] `updateSalonDnd(salonId, dnd)` is owner-only (same `OwnerAccess` codes as `pendingBookings`); default DND is false; guest cannot take over, release, or set DND — verify: Behat
- [ ] Guest `assistantIntake(token)` includes `takenOver` (pause **in effect**, not the raw flag); stale/converted/unknown still null — verify: Behat
- [ ] Helper: row chrome is `takeover` when `takeoverAllowed && !takenOver`, `release` when `takeoverAllowed && takenOver`, `hidden` when `!takeoverAllowed`; badge helper unchanged — verify: Vitest
- [ ] Helper: guest wait chrome when `takenOver` (hide chips/send, show wait copy); `shouldUpsertIntake` is false while waiting; i18n `Preuzmi` / `Vrati asistentu` / `Ne uznemiravaj` / `Sačekaj, javit ćemo ti se.` — verify: Vitest (helpers + i18n keys)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #10 #17 #30 #35.

- [ ] Pause is a nullable timestamp on `assistant_intakes`; DND is a boolean on `salons` (default false). GraphQL: `AssistantIntake.takenOver`, owner-only `Salon.dnd` + `Salon.takeoverAllowed`, mutations `takeOverAssistantIntake` / `releaseAssistantIntake` / `updateSalonDnd`. No REST, no composer, no message log, no LLM, no WhatsApp, no new `Subscription`, no `pollInterval` — verify: schema + migration; no new `Subscription` field
- [ ] `takenOver` / `takeoverAllowed` are computed on the server (`now()` in `Europe/Sarajevo` vs weekly hours + DND). Point-in-time open (not booking start+duration). Booking status machine unchanged. Guest handle stays the UUID token; owner mutations use internal `id` — verify: schema + Behat
- [ ] `/owner` stays queue + panel; `/owner/chats` stays the list (no `:id`); row buttons + DND toggle only; `?salon=` kept; no settings/stats links — verify: `App.tsx` + owner pages
- [ ] No Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

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

- Auto-page on every chat
- Worker take-over
- After-hours as a live owner shift calendar (Phase 2)
- Owner composer / message log / live owner bubbles
- Owner finishes the script or sends `createBooking` for the guest
- Unknown → say so / ping owner (STORY-28)
- A second pending queue for chat-originated bookings
- Changing the `createBooking` status machine
- `/owner/chats/:id`
- Settings / stats owner screens
- LLM / free-form NLU; Viber / WhatsApp / Instagram DM (Phase 2)
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**Take over**, **After hours**, **DND**, **Salon Booking Assistant**, **scripted intake**), `docs/stories/STORY-27.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; guest chat stays salon-voice. Bosnian-first.
2. Branch: `story/STORY-27-take-over`.
3. **Schema:** `assistant_intakes.taken_over_at` nullable timestamp. `salons.dnd` boolean default false. In-flight rule unchanged (`booking_id` null AND `updated_at` within 24h). Take over / release set or clear `taken_over_at` and **touch** `updated_at`. Do not auto-clear the timestamp at closing time.
4. **Hours gate:** point-in-time helper (not `OpenWindow::contains`). After hours = that weekday closed, now before `opens_at`, now at/after `closes_at` (exclusive close), or now inside the break. Timezone `Europe/Sarajevo`. Pause **in effect** = `taken_over_at` set AND not after hours AND not DND. `takeoverAllowed` = not after hours AND not DND.
5. **GraphQL:** `AssistantIntake.takenOver: Boolean!` (in effect). Owner-only `Salon.dnd` and `Salon.takeoverAllowed` (same `OwnerAccess` as `cancellationNoticeHours`). `takeOverAssistantIntake(id: ID!): AssistantIntake!` and `releaseAssistantIntake(id: ID!): AssistantIntake!` via `OwnerAccess` on that row’s salon; in-flight only. `updateSalonDnd(salonId: ID!, dnd: Boolean!): Salon`. Guest/public must not read `dnd` / `takeoverAllowed`. No new subscription. Codes: `INTAKE_TAKEN_OVER` (guest upsert or `createBooking` **with** that in-flight token while in effect); `TAKEOVER_UNAVAILABLE` (take over while not `takeoverAllowed`); existing `UNAUTHENTICATED` / `EMAIL_UNVERIFIED` / `FORBIDDEN` for auth and other-salon / not-in-flight. Take over when already in effect and release when not paused: idempotent success. `createBooking` without `intakeToken` unchanged (including when a taken-over cookie exists).
6. **Guest PWA:** Select `takenOver` on `assistantIntake`. If in effect: keep past answers visible; hide chips and send; show `assistant.wait` (`Sačekaj, javit ćemo ti se.`). Do not upsert while waiting. Refetch `assistantIntake` on `/salon/:id` mount (already) **and** on `window` focus/visibility. On upsert/send `INTAKE_TAKEN_OVER`, switch to wait chrome. Picker still omits `intakeToken` and stays available (mutually exclusive CTAs unchanged). No `pollInterval`.
7. **Owner PWA:** `/owner/chats` only. Query `dnd` + `takeoverAllowed` on the owner salon. Toggle `Ne uznemiravaj` (sets `updateSalonDnd`). Each row: `Preuzmi` or `Vrati asistentu` from the Vitest helper; hide both when `takeoverAllowed` is false. No `/owner/chats/:id`. No owner messages. Refetch list/count/salon on mount and after take over / release / DND. `/owner` home unchanged. Badge unchanged.
8. **Helpers:** e.g. `takeoverRowChrome({ takeoverAllowed, takenOver })` → `'takeover' | 'release' | 'hidden'`; `intakeWaiting(takenOver)`; do not upsert while waiting. i18n: `owner.takeOver` `Preuzmi`, `owner.releaseTakeOver` `Vrati asistentu`, `owner.dnd` `Ne uznemiravaj`, `assistant.wait` `Sačekaj, javit ćemo ti se.` No English keys. No bot name.
9. **Behat:** owner feature covering take over / release / DND / after hours (closed, before open, after close, break) / auth / list still in-flight / `takenOver` false when DND or after hours with flag set. Guest: upsert + chat send rejected while in effect; picker without token ok; `assistantIntake.takenOver`; after hours/DND guest can finish. Full `vendor/bin/behat --format=progress --stop-on-failure` must stay green. No Mink.
10. **Vitest:** cover every Vitest product check. Keep existing owner/assistant tests green.
11. Patch `docs/architecture/04-Frontend.md` (`/owner/chats` row Take over/Release + DND toggle; guest wait chrome; refetch on focus; no `:id`; no new subscription) and `docs/architecture/05-Data-Model.md` (`taken_over_at`, `salons.dnd`; `takenOver` is in-effect). Do not rewrite decision 35.
12. Do not add Pest, Playwright, codegen, Redis, ping (STORY-28), a composer, or LLM.
13. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
14. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
15. On escalate: draft/blocked PR with failing checks and the human decision needed.
16. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
