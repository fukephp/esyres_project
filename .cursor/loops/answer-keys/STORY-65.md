# Answer key: STORY-65

> Epic 1: `Pošalji zahtjev` sits under the selected hours row; picker modal names that day.
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-65.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-65 |
| Source | `docs/stories/STORY-65.md` — Send under selected hours row; modal names the day |
| Goal (one sentence) | Move the idle `Pošalji zahtjev` pill under the selected open weekday row and name that Sarajevo day under the picker title, without changing send gates or chat overlay chrome. |
| Branch name | `story/STORY-65-send-under-hours-row` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-17 |

## Pass/fail — product

- [x] Hours catalog order (Q1 A): `t('salon.hours')` then `t('salon.sendHint')` then the seven-row `<ul>`, then the Pitaj salon card (`SALON_CHAT_CARD_CLASS`). **No** `showSendPill` / `SALON_SEND_CLASS` slot between `</ul>` and the chat card. When `showDaySendPill` and `hoursRowSelected` are both true, render the page send button **inside that weekday’s `<li>`** under the row `<button>` (later `<li>`s push down). Same `SALON_SEND_CLASS` + `t('salon.send')` + `openIntake('picker')`. Full width of the hours column (`w-full` on the pill; **no** wrapping `max-w-md`). Not a second `<li>`, not a send-icon, not a smaller second control — verify: Vitest reading `SalonProfile.tsx` (catalog: `salon.hours` then `salon.sendHint` then `hours.map`; `SALON_SEND_CLASS` appears inside the `hours.map` callback; catalog slice after `</ul>` has `SALON_CHAT_CARD_CLASS` and no `SALON_SEND_CLASS` / `showSendPill`; page still has `type="button"` + `SALON_SEND_CLASS` + `openIntake('picker')`; no `max-w-md` around that page send)
- [x] `showDaySendPill` (Q3 A) gains `tappable: boolean`. True only when `preferredDate !== ''` && `hasServices` && `!chatting` && `!sent` && `tappable`. Closed weekday via the date input: matching row is not tappable / not selected → pill hidden. Date `onChange` stays `setPreferredDate` only (picker `<dialog>` stays open; do not `setMode('idle')` there). Hours tap / `applyHoursRowTap` unchanged (no `openIntake('picker')` on row tap) — verify: Vitest `salonHours.test.ts` (existing cases pass `tappable: true`; extra case `tappable: false` → false even with a date); `SalonProfile.tsx` date input `onChange` is still `setPreferredDate` and that handler has no `setMode`; `onHoursTap` still has no `openIntake('picker')`
- [x] Picker day line (Q2 A): keep picker `<h2>` as `{salon.name}`. Directly under it (same left stack as the title; close button stays top-right), when `preferredDate !== ''`, a `text-sm text-muted` line: `t(\`weekday.${sarajevoWeekdayFromYmd(preferredDate)}\`)` + `', '` + `formatPickerDayNumeric(preferredDate)`. Empty `preferredDate`: no line. Do **not** call `formatOwnerDayHeading`. Native `type="date"` stays. Chat dialog still has no title / no this subtitle — verify: Vitest (`salonHours.ts` exports `formatPickerDayNumeric`; `formatPickerDayNumeric('2026-09-17') === '17. 9. 2026'`; file does not import `./owner`; picker dialog slice has `{salon.name}` then `weekday.` and `formatPickerDayNumeric`; no `formatOwnerDayHeading` in `SalonProfile.tsx`; chat dialog slice still has `salon.close` and no `{salon.name}` / no `formatPickerDayNumeric`)
- [x] `formatPickerDayNumeric(ymd)` lives in `esyres_app/frontend/src/lib/salonHours.ts`. Parse `YYYY-MM-DD`, format `${day}. ${month}. ${year}` with **no** zero-pad and **no** trailing period (story example `17. 9. 2026`). Do **not** use `Intl` `bs-BA` (that yields `17.9.2026.`). Do not add an i18n sentence key. `weekday.*` keys stay as they are (`Srijeda`, …) — verify: Vitest `salonHours.test.ts` equality on `2026-09-17` → `17. 9. 2026` and `2026-09-07` → `7. 9. 2026`; `i18n.ts` has no new `salon.*` key for this line; `weekday.WEDNESDAY` stays `Srijeda`
- [x] Copy, send path, and pill count unchanged: three `Pošalji zahtjev` still `SALON_SEND_CLASS` + `t('salon.send')` (page idle pill, picker submit, chat submit). `createBooking` / `CREATE_BOOKING_MUTATION` still the send path. Empty aside, two dialogs, chat overlay classes, `SALON_SEND_CLASS` string unchanged — verify: Vitest (`salonSend.test.ts` still two `SALON_SEND_CLASS` in `SalonProfile.tsx` and one in `AssistantIntake.tsx`; `CREATE_BOOKING_MUTATION` still in `SalonProfile.tsx`; aside slice has no `SALON_SEND_CLASS`; two `<dialog` + both `SALON_PICKER_DIALOG_CLASS`; `SALON_SEND_CLASS` equality unchanged)
- [ ] Phone: pill sits under the selected hours row and later weekdays push down; picker shows muted weekday+date under the salon name — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/salon/:id` pill under selected hours row; muted weekday+date under salon name), `08-Decisions.md` #12 #15 #48, `docs/mvp/04-UI-Design-Goals.md` (day-gated send), `docs/adr/0034-day-first-salon-booking-chrome.md` (STORY-65 supersedes STORY-62 pill-after-list and modal title-only).

- [x] One React PWA. CSS/Tailwind only (no GSAP, no Three.js, no new npm). No new GraphQL, REST, or booking mutations. No sibling `marketing/` — verify: `esyres_app/frontend/package.json` unchanged deps; `test ! -d esyres_app/marketing`; no new schema/feature/PHP files this PR
- [x] i18next `bs` only. No new copy keys. No Playwright, RTL, Pest, GraphQL codegen — verify: `i18n.ts` has no new salon/assistant keys this PR; `package.json` unchanged deps
- [x] Lighthouse `/graphql` only. Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Do not change `behat.yml` — verify: CONTEXT classifier at verify time; no `features/` or `behat.yml` edits this PR

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + loop docs. Expected skip: no PHP / `features/` / `graphql/` schema edits.

**This PR (2026-09-17):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Vite container already up.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

184 tests passed.

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

From **git root**:

```text
test ! -d esyres_app/marketing
```

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`. Cloud Agent: if Docker is missing or dockerd is nested, use host PHP + host MySQL (STORY-36), still `.env.behat` / `esyres_test` only. Do not apt-install dockerd. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`. Behat flags stay CLI-only.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Chat overlay weekday subtitle
- Send-icon, smaller second send, instant modal on first day tap
- Day-only skip of services / worker / time
- Filling the empty aside
- Changing `createBooking` or send gates
- Changing chat overlay chrome (STORY-63)
- Slot grid, sticky TopNav, phone dock, GSAP / Awwwards / Three.js
- Public pricing page
- Playwright, RTL, Pest, GraphQL codegen, new npm
- New i18n keys

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-65.md`, `docs/architecture/04-Frontend.md`, `docs/mvp/04-UI-Design-Goals.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-65-send-under-hours-row` from current `master`.
3. **`salonHours.ts`:** add `formatPickerDayNumeric` (Q2 A). Extend `showDaySendPill` with `tappable` (Q3 A). Do not import `owner.ts`.
4. **`SalonProfile.tsx`:** move the page send button into the selected hours `<li>` (Q1 A); delete the after-`</ul>` slot. Picker header: muted day line under `{salon.name}`. Date `onChange` stays `setPreferredDate` only. Do not change `SALON_SEND_CLASS`, dialogs, chat card, or `CREATE_BOOKING_MUTATION`.
5. **Vitest:** update `salonHours.test.ts` and `salonProfile.source.test.ts` / `salonSend.test.ts` so they assert in-`<li>` send and the picker subtitle, not the old after-list slot.
6. **Docs:** set `docs/stories/index.md` and `docs/stories/STORY-65.md` Loop to `STORY-65`. ADR 0034 already states the supersede — do not rewrite it unless a sentence still says pill-after-list as current UI.
7. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
9. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
