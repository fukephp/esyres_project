# Answer key: STORY-28

> Epic 10 slice: assistant unknown → say so; optional guest ping is an in-app mark on `/owner/chats`. Guest does not wait and can still send `requested`.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-28.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-28 |
| Source | `docs/stories/STORY-28.md` — Assistant unknown and ping |
| Goal (one sentence) | Guest chat can say it does not know via `Nešto drugo?`, optionally ping with `Obavijesti salon` (in-app `Pitanje` on `/owner/chats`), and still finish to `requested` without waiting. |
| Branch name | `story/STORY-28-unknown-ping` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-10 |

## Pass/fail — product

- [ ] Guest `pingAssistantIntake(salonId, token)` with no valid in-flight token creates a row (UUID token, empty snapshot allowed, `Gost` or session name); `pinged` true; `updated_at` touched; cookie/token returned; DND on or after hours still succeeds — verify: Behat (`features/guest/assistant_intake.feature` or sibling ping feature)
- [ ] Same in-flight token updates that row (does not wipe snapshot); second ping is idempotent success (`pinged` stays true); stale/converted/unknown token mints a new row like upsert — verify: Behat
- [ ] Guest `assistantIntake(token)` includes `pinged`; stale/converted/unknown still null — verify: Behat
- [ ] Owner `inFlightIntakes` includes `pinged`; ping on an existing in-flight row does not change `inFlightIntakeCount`; a ping that creates a new row increases count by one; converted pinged row drops off list + count — verify: Behat (`features/owner/in_flight_intakes.feature` or sibling)
- [ ] Take-over in effect: `pingAssistantIntake` fails `INTAKE_TAKEN_OVER`; guest upsert and chat `createBooking` with that token still fail as today; picker without `intakeToken` unchanged — verify: Behat
- [ ] Chat `createBooking` with a pinged in-flight token still converts; guest keeps stepping after ping (no wait chrome from ping alone) — verify: Behat
- [ ] Helper: escape chip chrome is shown when chat is open and not waiting and not sent; hidden when waiting or sent — verify: Vitest
- [ ] Helper: ping chrome is `cta` when unknown shown and not pinged and not waiting, `done` when pinged and not waiting (including restore), `hidden` when waiting or unknown not shown and not pinged — verify: Vitest
- [ ] Helper: `shouldUpsertIntake` stays false for unknown (snapshot unchanged / empty); `shouldRestoreIntake` is true when `pinged` even if snapshot is empty; owner ping mark is on iff `pinged` — verify: Vitest
- [ ] i18n: `Nešto drugo?` / `Ne znam. To nemam u podacima.` / `Obavijesti salon` / `Javili smo salonu. Možeš nastaviti.` / `Pitanje` — verify: Vitest (i18n keys)

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #10 #17 #30 #35.

- [ ] `pinged_at` is a nullable timestamp on `assistant_intakes`. GraphQL: `AssistantIntake.pinged: Boolean!` (`pinged_at` set). Guest mutation `pingAssistantIntake(salonId: ID!, token: String): AssistantIntake!`. No unknown column, no REST, no LLM, no WhatsApp, no email, no web push, no new `Subscription`, no `pollInterval` — verify: schema + migration; no new `Subscription` field
- [ ] `pinged` is not gated by hours or DND (unlike `takenOver`). Booking status machine unchanged. Guest handle stays the UUID token — verify: schema + Behat
- [ ] `/owner` stays queue + panel; `/owner/chats` stays the list (no `:id`); row may show `Pitanje`; badge helper unchanged; `?salon=` kept — verify: `App.tsx` + owner pages
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

- LLM answers outside live data (Phase 2)
- Guest wait-for-owner as default (Take over, STORY-27)
- WhatsApp / Viber / email / web push as the ping channel
- Free-text box / NLU / live-data FAQ topic chips (STORY-23)
- Auto-page on every chat
- Owner composer / message log / live owner bubbles
- Owner dismiss / answer the ping
- Ping on Request Detail or My Bookings
- Changing the `createBooking` status machine
- `/owner/chats/:id`
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**Unknown**, **Ping**, **Take over**, **Salon Booking Assistant**, **scripted intake**), `docs/stories/STORY-28.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2; guest chat salon-voice; owner dense. Bosnian-first.
2. Branch: `story/STORY-28-unknown-ping`.
3. **Schema:** `assistant_intakes.pinged_at` nullable timestamp. In-flight rule unchanged (`booking_id` null AND `updated_at` within 24h). First ping sets `pinged_at` and **touches** `updated_at`. Retry when already pinged: success, leave `pinged_at` set (touch `updated_at` or not; do not error). Do not add an unknown column.
4. **GraphQL:** `AssistantIntake.pinged: Boolean!` (true iff `pinged_at` is set — not hours/DND gated). Guest/public `pingAssistantIntake(salonId: ID!, token: String): AssistantIntake!` — same salon + in-flight token rules as `upsertAssistantIntake` (stale/converted/bad token → new row; attach `customer_id` if sessioned). Creating a row on ping may use an empty snapshot. Updating must not wipe existing snapshot fields. Codes: `INVALID_SALON`; `INTAKE_TAKEN_OVER` while take-over is in effect. No new subscription. No owner ping mutation.
5. **Guest PWA:** `Nešto drugo?` on every step while chat is open and not waiting and not sent. Tap → local unknown copy; do **not** upsert. Then `Obavijesti salon` until pinged. That tap calls `pingAssistantIntake` (salonId + cookie token if any), writes cookie, sets local pinged. Confirmation copy; ping CTA gone. Re-tap escape: unknown line, no ping CTA. Script chips and send stay. Select `pinged` on `assistantIntake`. Hydrate: if pinged, expand chat even when snapshot is empty; show unknown + confirmation; no ping CTA. Wait chrome still hides escape/unknown/ping. On ping `INTAKE_TAKEN_OVER`, switch to wait chrome. No `pollInterval`.
6. **Owner PWA:** `/owner/chats` only. Select `pinged` on list rows. Show `Pitanje` when pinged. Badge stays `inFlightIntakeCount`. Refetch list/count on mount (already). No `:id`. No owner messages. `/owner` home unchanged.
7. **Helpers:** e.g. `unknownChipChrome({ waiting, sent })`; `pingChrome({ waiting, unknownShown, pinged })` → `'hidden' | 'cta' | 'done'`; `intakePingMark(pinged)`; extend `shouldRestoreIntake` so pinged empty rows restore. Do not upsert on unknown. i18n: `assistant.other` `Nešto drugo?`, `assistant.unknown` `Ne znam. To nemam u podacima.`, `assistant.ping` `Obavijesti salon`, `assistant.pinged` `Javili smo salonu. Možeš nastaviti.`, `owner.ping` `Pitanje`. No English keys. No bot name.
8. **Behat:** guest ping create/update/idempotent/empty snapshot/stale mint/`pinged` on read/DND/after hours success/taken-over reject/convert still works. Owner list `pinged`; count unchanged on ping-existing; count +1 on ping-create. Full `vendor/bin/behat --format=progress --stop-on-failure` must stay green. No Mink.
9. **Vitest:** cover every Vitest product check. Keep existing owner/assistant tests green.
10. Patch `docs/architecture/04-Frontend.md` (guest escape/unknown/ping chrome; owner `Pitanje` mark; no new subscription) and `docs/architecture/05-Data-Model.md` (`pinged_at`; `pinged` is timestamp-set). Do not rewrite decision 35.
11. Do not add Pest, Playwright, codegen, Redis, push, email, a composer, or LLM.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
