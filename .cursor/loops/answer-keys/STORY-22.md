# Answer key: STORY-22

> Epic 10 slice: 1–3 preferred-time suggestions in salon-profile chat from hours + day busy-level. No live slots, no hold.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-22.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-22 |
| Source | `docs/stories/STORY-22.md` — Assistant time suggestions |
| Goal (one sentence) | After service, worker, and day in chat, show that day’s busy-level and 1–3 preferred-time chips (hours + busy enum only); guest taps one or **Drugo vrijeme** before send; never a slot grid or held cell. |
| Branch name | `story/STORY-22-assistant-time-suggestions` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-02 |

## Pass/fail — product

- [ ] Helper: closed weekday (from hours, even if busy enum is `LOW`) → `[]` suggestions and other-time **off**; stay unable to send until another open day + a time — verify: Vitest
- [ ] Helper: open day, no past filter → `LOW` 3 clocks, `MEDIUM` 2, `HIGH` 1 before dedupe; after snap/dedupe length is 1..N; clocks are `HH:mm` on `:00` or `:30` — verify: Vitest
- [ ] Helper: break is a hole — no returned clock lies in `[breakStartsAt, breakEndsAt)` — verify: Vitest
- [ ] Helper: placement is percent along concatenated open spans (3 → 25/50/75, 2 → ⅓/⅔, 1 → 50), snap nearest `:00`/`:30` still in an open span, equal distance → later; short window may return fewer than N — verify: Vitest
- [ ] Helper: ignores service duration and worker id (same clocks with or without those) — verify: Vitest
- [ ] Helper: chosen date is Sarajevo today → drop clocks strictly before `now`; a clock equal to now stays; open today with 0 left → `[]` chips and other-time **on** — verify: Vitest
- [ ] Helper: changing date clears preferred time and other-time mode — verify: Vitest
- [ ] Helper: `canSend` still requires ≥1 service + date + non-empty `preferredTime` (chip or other-time native); no slot list on `CreateBookingInput` — verify: Vitest
- [ ] Existing `createBooking` unchanged (closed weekday `SALON_CLOSED`; time in break / outside hours still accepted; no origin; `requested` does not occupy) — verify: Behat

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #16 #35.

- [ ] No new GraphQL field/mutation; busy-level stays server-computed `busyLevel(date)`; chat uses an alias on the existing public salon query (header = today, chat = chosen date or today) — verify: `esyres_app/graphql/schema.graphql` unchanged for suggestions; frontend query aliases only
- [ ] Guest chat does not query `occupyingBookings` or reuse owner panel cells — verify: no such import/query from `AssistantIntake` / `SalonProfile`
- [ ] Same `createBooking` / `CreateBookingInput`; no origin; no Conversation table; chat stays on `/salon/:id` — verify: schema + migrations; frontend routes
- [ ] No LLM vendor, no Playwright, no Pest, no GraphQL codegen, no `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

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

- Owner Worker Availability Panel as a guest view
- Auto-confirm
- Changing busy-level thresholds (mvp 08 placeholders)
- Salon-branded Q&A from live data beyond this intake step (STORY-23)
- Chat-specific send-gate polish (STORY-24)
- Assistant-origin tag and transcript (STORY-25)
- Owner in-flight chat tab (STORY-26)
- Take over / after hours / DND (STORY-27)
- Unknown → say so / ping owner (STORY-28)
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
- Changing picker native date+time
- Guest use of `occupyingBookings`
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (**preferred-time suggestion**), `docs/stories/STORY-22.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (03, 04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 customer sparse; Bosnian-first.
2. Branch: `story/STORY-22-assistant-time-suggestions`.
3. **No backend schema this PR.** Do not add a suggestions field, origin, transcript, or occupancy query. Do not change `createBooking` or busy-level thresholds.
4. **Helper** (e.g. `frontend/src/lib/assistant.ts` or a sibling): `suggestPreferredTimes({ hoursForDay, busyLevel, date, nowMinutes })` → `HH:mm[]`. Closed or missing open/close → `[]`. Count from enum: `LOW` 3, `MEDIUM` 2, `HIGH` 1. Concatenate open spans; break `[breakStartsAt, breakEndsAt)` is a hole. Fractions along total open minutes: 3 → 0.25/0.5/0.75, 2 → 1/3 / 2/3, 1 → 0.5. Snap each to nearest 30-minute mark that still lies in an open span (`>= opens`, `< closes`, not in break); equal distance → later. Dedupe order-preserving. If `date` is Sarajevo today, drop clocks whose minutes are **strictly less** than `nowMinutes` (inject `nowMinutes` in tests). Do not take duration or worker. `assistantShowOtherTime(closed)` is false iff closed. Date-change helper clears time + other-time flag. Keep existing `assistantCanSend` / `assistantBookingInput`.
5. **PWA chat only:** after date is set, show that day’s busy enum via existing `salon.busy.*`, then chips for the helper’s clocks (not a grid). **Drugo vrijeme** (text-style) only when the day is open; reveals native `type="time" step={900}`. Closed day: no chips, no other-time, stay on date. Open today with 0 chips: other-time only. Changing date clears time and other-time. Picker stays native date+time. Same send / gates / `createBooking` as STORY-21. No free-text. No slot copy.
6. **Query:** keep header `busyLevel(date: $date)` with `$date` = today. Alias `busyLevel(date: $chosenDate)` for chat (`$chosenDate` = chat date or today). Do not query `occupyingBookings` from guest profile.
7. **i18n:** Bosnian in `i18n.ts`; new keys for suggestion prompt and `Drugo vrijeme`; reuse `salon.busy.LOW|MEDIUM|HIGH`. No bot name.
8. **Vitest:** cover every Vitest product check. Keep STORY-21 assistant tests green.
9. **Behat:** no new feature required. Full `vendor/bin/behat` must stay green.
10. Patch one line on `docs/architecture/04-Frontend.md` UX: chat time step is 1–3 preferred-time suggestions + optional native other-time; picker stays native. Do not rewrite decision 35.
11. Do not add Pest, Playwright, codegen, Redis, owner chat tab, or LLM.
12. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
13. On success: ready PR linking this key; list commands run. UI ready = machine gates. Do **not** embed screenshots. Do not draft/block for missing shots.
14. On escalate: draft/blocked PR with failing checks and the human decision needed.
15. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
