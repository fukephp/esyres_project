# Answer key: STORY-63

> Epic 10: Pitaj salon opens a picker-like native `<dialog>` overlay (not an on-page thread).
> Do not implement (Local or Cloud) until a human has approved this file.
> Sharp path: no map. Locks from `docs/stories/STORY-63.md` and the story-loop grill (Q1 A / Q2 A / Q3 A).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-63 |
| Source | `docs/stories/STORY-63.md` — Salon chat overlay chrome |
| Goal (one sentence) | Pitaj salon opens a second native dialog (same shell as the picker): empty Cal greeting, unbubbled salon lines, light-gray guest pills, dummy composer, chips above it — not an on-page `min-h-[70dvh]` thread. |
| Branch name | `story/STORY-63-salon-chat-overlay` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-17 |

## Pass/fail — product

- [x] Two `<dialog>`s in `SalonProfile.tsx` (Q1 A): keep `pickerDialogRef`; add `chatDialogRef`. Both use `className={SALON_PICKER_DIALOG_CLASS}` (do not duplicate the string; an alias export equal to that constant is optional). Chat dialog header is only `t('salon.close')` top-right — **no** salon-name `<h2>` / title. Picker dialog title + form **unchanged**. `mode === 'chat'` → `chatDialog.showModal()`; else close it. `mode === 'picker'` still drives the picker dialog. Opening chat hides the day pill (`showDaySendPill` already false when `chatting`) and closes the picker via exclusive `mode`. Overlay / Escape / backdrop / X on the chat dialog → `setMode('idle')` (card unselected) — verify: Vitest reading `SalonProfile.tsx` (`chatDialogRef`; two `<dialog`; both `SALON_PICKER_DIALOG_CLASS`; chat header has `salon.close` and no `{salon.name}` inside that dialog; `showModal` still present; picker `h2` + form stay in the picker dialog)
- [x] Pitaj salon card stays under Radno vrijeme after the pill slot (`SALON_CHAT_CARD_CLASS`). Tap → `openIntake('chat')`. While `chatting`, render the **selected** card (`aria-pressed="true"`, not a button) — not `SALON_SEND_CLASS`. When `picking \|\| chatting`, the card has `pointer-events-none` (blocks the card while either dialog is open). No `AssistantIntake` in the hours catalog / under the card — verify: Vitest reading `SalonProfile.tsx` (catalog still has `SALON_CHAT_CARD_CLASS` + `openIntake('chat')`; `aria-pressed`; `pointer-events-none`; catalog slice has no `<AssistantIntake`; `AssistantIntake` appears only inside the chat `<dialog>`)
- [x] In-flight cookie restore still `setMode('chat')` (existing `shouldRestoreIntake` path). That opens this overlay, not an on-page thread. Hours tap while chatting stays STORY-62: `setMode('idle')`, seed that weekday, show the pill, **no** `openIntake('picker')` — verify: Vitest (`setMode('chat')` still in the restore effect; `onHoursTap` still `if (chatting)` + `setMode('idle')` + `setPreferredDate`; no `openIntake('picker')` in `onHoursTap`)
- [x] `esyres_app/frontend/src/lib/salonSend.ts` adds (or keeps) exact strings: `ASSISTANT_SALON_LINE_CLASS` = `max-w-[85%] text-sm leading-relaxed text-ink` (no `rounded-3xl`, no `bg-surface-soft`); `ASSISTANT_GUEST_PILL_CLASS` = `ml-auto max-w-[85%] rounded-3xl bg-surface-soft px-4 py-3 text-sm leading-relaxed text-ink` (Q2 A). Do **not** change `SALON_SEND_CLASS`, `SALON_PICKER_DIALOG_CLASS`, `SALON_CHAT_CARD_CLASS`, `ASSISTANT_COMPOSER_CLASS` — verify: Vitest (`salonSend.test.ts` equality on the two new exports; guest class has `bg-surface-soft` and `text-ink`, not `bg-ink` / `text-canvas`; salon line has no `rounded-3xl` / `bg-`)
- [x] `AssistantIntake` layout (Q3 A): root `<form>` is `flex h-full min-h-0 w-full flex-col` — **no** `min-h-[70dvh]`. Empty (`selected.length === 0 && !waiting`): `flex-1` centered Cal display greeting `t('assistant.hello')` + muted address when set; **no** logo/mark; **no** chips in that hero. Thread (any chip/answer or waiting): `flex-1 overflow-y-auto` unbubbled `ASSISTANT_SALON_LINE_CLASS` for hello / worker / date / time / send / wait / unknown; guest answers `ASSISTANT_GUEST_PILL_CLASS`. Suggestion **row** (`flex flex-wrap`) **above** the composer holds: service chips, worker chips, date/time inputs, other/unknown/ping, send pill, auth gates — not in the hero, not in the scroll thread. Composer stays `ASSISTANT_COMPOSER_CLASS` dummy `+` (`aria-hidden`) + `t('assistant.prompt')`. Not a textarea. No mic / model picker / attachments — verify: Vitest reading `AssistantIntake.tsx` (those class constants; `flex-wrap` suggestion region; `assistant.hello` / `assistant.prompt`; no `min-h-[70dvh]`; no `bg-ink` on guest pills; no `<textarea`; no `esyres-mark` in this file)
- [x] Copy, send path, and pill count unchanged: no new i18n keys (`assistant.hello` / `assistant.prompt` / `assistant.ask` / `assistant.nudge` stay). Three `Pošalji zahtjev` still `SALON_SEND_CLASS` + `t('salon.send')` (idle pill, picker submit, chat submit). `createBooking` / `CREATE_BOOKING_MUTATION` still the send path. `showChatCta` / scripted `assistantStep` unchanged — verify: Vitest (`salonSend.test.ts` still counts two `SALON_SEND_CLASS` in `SalonProfile.tsx` and one in `AssistantIntake.tsx`; `i18n.ts` hello/prompt/ask/nudge unchanged; `CREATE_BOOKING_MUTATION` still in `SalonProfile.tsx`; `assistant.test.ts` step/send helpers still pass)
- [ ] Phone: chat overlay is a full-viewport canvas sheet; `md+`: centered `max-w-md` card (same `SALON_PICKER_DIALOG_CLASS`). Empty greeting can sit centered (no title). Guest pills light gray; salon lines unbubbled — verify: human-only: visual at merge (not a PR screenshot gate)

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md` (`/salon/:id` Pitaj salon → picker-like overlay), `08-Decisions.md` #12 #15 #35 #42 #48, `docs/mvp/04-UI-Design-Goals.md` (chat overlay chrome), `docs/adr/0034-day-first-salon-booking-chrome.md` (supersede on-page messenger thread).

- [x] One React PWA. CSS/Tailwind only (no GSAP, no Three.js, no new npm). No new GraphQL, REST, or booking mutations. No sibling `marketing/` — verify: `esyres_app/frontend/package.json` unchanged deps; `test ! -d esyres_app/marketing`; no new schema/feature/PHP files this PR
- [x] i18next `bs` only. No new copy keys. No Playwright, RTL, Pest, GraphQL codegen — verify: `i18n.ts` assistant hello/prompt/ask/nudge unchanged; `package.json` unchanged deps
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

183 tests passed.

From **git root**:

```text
test ! -d esyres_app/marketing
```

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
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
- Mic, attachments, model picker, hamburger / upgrade / share top bar, logo/mark
- Owner `/owner/chats` chrome
- Filling the empty aside
- Changing the picker form
- Changing `createBooking` or send gates
- Public pricing page, GSAP / Awwwards / Three.js
- Playwright, RTL, Pest, GraphQL codegen, new npm
- New i18n keys

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-63.md`, `docs/architecture/04-Frontend.md`, `docs/mvp/04-UI-Design-Goals.md`, `DESIGN.md`, `refs/design-1/DESIGN.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI ready = machine gates; do not embed screenshots. Do not run landing-page / Awwwards skills.
2. Branch: `story/STORY-63-salon-chat-overlay` from current `master`.
3. **Classes:** add `ASSISTANT_SALON_LINE_CLASS` and `ASSISTANT_GUEST_PILL_CLASS` in `salonSend.ts` as in the product checks. Do not change `SALON_SEND_CLASS` / `SALON_PICKER_DIALOG_CLASS` / `SALON_CHAT_CARD_CLASS` / `ASSISTANT_COMPOSER_CLASS`.
4. **SalonProfile:** second `<dialog>` + `chatDialogRef` (mirror the picker `showModal` / backdrop / `onClose` pattern). Move `<AssistantIntake>` into that dialog. Card stays in the hours block; selected + `pointer-events-none` while `picking \|\| chatting`. Hours tap / restore / `createBooking` stay.
5. **AssistantIntake:** drop on-page `min-h-[70dvh]` and ink guest bubbles. Empty centered greeting; thread = unbubbled salon lines + `surface-soft` guest pills; wrapping suggestion row above the dummy composer (Q3 A). Reuse existing `assistant.*` keys.
6. **Vitest:** equality on the new class strings; rewrite `salonProfile.source.test.ts` / `salonSend.test.ts` assertions that require `min-h-[70dvh]`, `rounded-3xl bg-ink`, or `AssistantIntake` under the card. Keep jump-list, hours helpers, address omit, picker dialog, `assistant.test.ts` green.
7. **Docs:** set `docs/stories/index.md` and `docs/stories/STORY-63.md` Loop to `STORY-63`. One-line patch `docs/adr/0034-day-first-salon-booking-chrome.md` so Pitaj salon is this overlay (not on-page bubbles).
8. Loop: implement → classifier → matching verify → fix. Cap 8. Same failure twice → escalate. Expected: frontend-only (host npm from `esyres_app/frontend/`).
9. On success: ready PR linking this key; list commands run. Do **not** embed screenshots.
10. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
