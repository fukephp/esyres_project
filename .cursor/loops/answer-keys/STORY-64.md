# Answer key: STORY-64

> Epic 10: native date/time in the picker or Pitaj salon overlay must not dismiss that dialog or leave Pitaj salon untappable.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-64.md` (compiled). Grill 2026-09-19 Q1 A / Q2 A / Q3 A.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-64 |
| Source | `docs/stories/index.md` STORY-64; `docs/mvp/07-Stories.md` Epic 10 native date/time overlay story (no `STORY-64.md`) |
| Goal (one sentence) | Using native date or time in the picker or Pitaj salon overlay keeps that overlay open; a real close leaves Pitaj salon tappable. |
| Branch name | `story/STORY-64-native-datetime-overlay` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-19 |

## Pass/fail — product

- [x] Helper `dialogCancelShouldClose(activeInputType: string | null): boolean` in `esyres_app/frontend/src/lib/salonDialog.ts`: `false` when `activeInputType` is `'date'` or `'time'`; `true` for `null`, `''`, `'text'`, and other types. Native `type="date"` / `type="time"` stay in the picker dialog and in `AssistantIntake` (date step + other-time). Do **not** replace them with text/`select` or a custom calendar — verify: Vitest `salonDialog.test.ts` (date/time → false; null / text → true); `SalonProfile.tsx` still has picker `type="date"` and `type="time"`; `AssistantIntake.tsx` still has `type="date"` and other-time `type="time"`
- [x] Both salon `<dialog>`s wire `onCancel` (Q1 A): read `document.activeElement` (`HTMLInputElement.type` or `null`); if `!dialogCancelShouldClose(...)`, `event.preventDefault()` and set a per-dialog keep-open ref. If `cancel` still closed the dialog while `mode` is `picker` (picker dialog) or `chat` (chat dialog), `showModal()` again and do **not** `setMode('idle')`. Do not `preventDefault` every `cancel` (Q1 B) — verify: Vitest reading `SalonProfile.tsx` (both dialog slices have `onCancel`; `dialogCancelShouldClose`; `preventDefault`; `showModal`; picker dialog `onCancel`/`onClose` do not call `preventDefault()` unconditionally with no `dialogCancelShouldClose`)
- [x] Real close still idles (Q2 A / STORY-63): X (`salon.close`), backdrop click on the dialog element, and Escape when `dialogCancelShouldClose` is true → `setMode('idle')` (card unselected). `onClose` without the keep-open ref → `setMode('idle')` when that overlay’s mode is active. Never leave `mode` as `chat`/`picker` with that dialog not open (Pitaj salon must not stay a `pointer-events-none` non-button with no overlay) — verify: Vitest reading `SalonProfile.tsx` (both dialogs keep `salon.close` → `setMode('idle')`; backdrop `event.target === …DialogRef.current` → `setMode('idle')`; `onClose` still has `setMode('idle')`; chatting card still `pointer-events-none` only while an overlay is meant to be open)
- [x] Copy, send path, chrome unchanged: two dialogs, `SALON_PICKER_DIALOG_CLASS`, Pitaj salon card, `CREATE_BOOKING_MUTATION`, three `Pošalji zahtjev` pills, hours helpers — verify: Vitest (`salonProfile.source.test.ts` / `salonSend.test.ts` existing two-dialog, card, send, mutation asserts still pass)
- [ ] Phone: native date/time in either overlay does not dismiss it; after X, Pitaj salon is tappable — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/salon/:id` native date/time must not dismiss overlay or leave Pitaj salon untappable), `08-Decisions.md` #12 #15 #35 #48 #49, `docs/mvp/04-UI-Design-Goals.md`, `docs/adr/0034-day-first-salon-booking-chrome.md`, `docs/adr/0036-native-date-time-must-not-dismiss-salon-overlay.md`.

- [x] One React PWA. CSS/Tailwind only (no GSAP, no Three.js, no new npm). No new GraphQL, REST, or booking mutations. No sibling `marketing/` — verify: `esyres_app/frontend/package.json` unchanged deps; `test ! -d esyres_app/marketing`; no new schema/feature/PHP files this PR
- [x] i18next `bs` only. No new copy keys. No Playwright, RTL, Pest, GraphQL codegen — verify: `i18n.ts` unchanged this PR; `package.json` unchanged deps
- [x] Lighthouse `/graphql` only. Classifier: skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Do not change `behat.yml` — verify: CONTEXT classifier at verify time; no `features/` or `behat.yml` edits this PR
- [x] Do not write `docs/stories/STORY-64.md`. Set `docs/stories/index.md` STORY-64 Loop to `STORY-64` — verify: no new `docs/stories/STORY-64.md`; index Loop cell is `STORY-64`

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; if `main` is missing, `origin/main` / this repo’s `master`). Do not skip Behat from a story label. Every command in the matching set must exit 0 before the loop may open a ready PR.

This story is PWA + loop/docs. Expected skip: no PHP / `features/` / `graphql/` schema edits. (`docs/` + `.cursor/` do not trigger Behat.)

**This PR (2026-09-19):** Classifier skipped Behat (every `esyres_app/` path under `esyres_app/frontend/`). Vite container already up. Host `npm run test` failed (rolldown native binding); used compose exec.

Passed:

```text
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

190 tests passed.

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

- LLM / free-text NLU
- Replacing Pitaj salon overlay chrome (STORY-63)
- Filling the empty aside; slot grid; GSAP / Awwwards
- `createBooking` or send gates
- Owner `/owner/chats`, Zahtjevi, salon edit `type="time"`
- My Bookings native date/time
- Playwright, RTL, Pest, GraphQL codegen, new npm
- Writing `docs/stories/STORY-64.md`
- Replacing native date/time with text/`select` or a custom calendar
- `preventDefault` on every dialog `cancel`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `.cursor/loops/maps/STORY-64.md`, `docs/adr/0036-native-date-time-must-not-dismiss-salon-overlay.md`, `docs/architecture/04-Frontend.md`, `docs/mvp/04-UI-Design-Goals.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills. Do **not** create `docs/stories/STORY-64.md`.
2. Branch: `story/STORY-64-native-datetime-overlay` from current `master`.
3. **`salonDialog.ts`:** add `dialogCancelShouldClose` (Q3 A / Q1 A). Vitest `salonDialog.test.ts`.
4. **`SalonProfile.tsx`:** both dialogs `onCancel` + keep-open ref + re-`showModal` (Q1 A). `onClose` without keep-open → idle (Q2 A). Keep X, backdrop, existing `showModal`/`close` by `mode`. Do not change `SALON_SEND_CLASS`, chat card chrome, picker form fields, or `CREATE_BOOKING_MUTATION`.
5. **Vitest:** extend `salonProfile.source.test.ts` for `onCancel` / `dialogCancelShouldClose` / `preventDefault` on both dialog slices. Keep existing two-dialog asserts green.
6. **Docs:** `docs/stories/index.md` STORY-64 Loop → `STORY-64`. ADR 0036 and architecture #49 already landed with this key — do not rewrite them.
7. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
8. On success: ready PR linking this key; list commands run. Do **not** embed screenshots. Do not draft/block for missing shots. Do not type credentials into the IDE browser.
9. On escalate: draft/blocked PR with failing checks and the human decision needed.
