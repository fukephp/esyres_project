# Story map: STORY-64

> Wayfinder-lite planning artifact. Copy to `.cursor/loops/maps/STORY-xx.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-64 |
| Source | `docs/stories/index.md` (no `STORY-64.md`); `docs/mvp/07-Stories.md` Epic 10 native date/time overlay story |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-64.md` |

## Destination

On `/salon/:id`, using native date or time inside the picker overlay or Pitaj salon overlay keeps that overlay open so the guest can finish the request. After they close it for real, Reci nam što ti treba / Nisi sigurna? Pitaj salon is tappable again.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/03-Key-Features.md`, `docs/mvp/04-UI-Design-Goals.md`, `docs/mvp/07-Stories.md` Epic 10, `docs/architecture/04-Frontend.md`, `docs/architecture/08-Decisions.md` #12 #15 #35 #48 #49, `docs/adr/0034-day-first-salon-booking-chrome.md`, `docs/adr/0036-native-date-time-must-not-dismiss-salon-overlay.md`, `docs/stories/STORY-63.md`, `docs/stories/index.md` STORY-64
- Skills: `.cursor/skills/custom-feature-skills/SKILL.md`; grilling rounds; grill-with-docs when terms/ADRs lock
- Do **not** write `docs/stories/STORY-64.md` in this loop (`start-building-stories` / story-loop)
- Code today (`SalonProfile.tsx`): two native `<dialog>`s (`pickerDialogRef` / `chatDialogRef`), `mode` drives `showModal` / `close`. `onClose` → `setMode('idle')` when that overlay’s mode is active. Backdrop click on the dialog element → idle. Chat card while `picking \|\| chatting` is `pointer-events-none`; while `chatting` it is a non-button selected card. Picker has `type="date"` + `type="time"`. Chat date step has `type="date"`; other-time has `type="time"` (`AssistantIntake.tsx`). No `onCancel` on either dialog. Known browser leak: native date/time UI can fire dialog `cancel`/`close` (esp. iOS Safari). If the overlay vanishes while `mode` stays `chat`, Pitaj salon stays a `pointer-events-none` div.
- Standing preferences: smallest PWA change; keep native date+time and native dialogs; no new npm; no Playwright; no GraphQL; CSS/Tailwind only
- Grill 2026-09-19 round 1: Q1 A / Q2 A / Q3 A

## Decisions so far

- Keep native `type="date"` / `type="time"` (no slot grid, no custom calendar widget as the guest control). Locked: CONTEXT, `docs/mvp/03-Key-Features.md`, `04-UI-Design-Goals.md`, architecture 04.
- Both overlays: picker `<dialog>` and Pitaj salon `<dialog>`. Locked: `docs/mvp/07-Stories.md` Epic 10 (“Pitaj salon (or the picker overlay)”); UI goals + architecture 04.
- STORY-63 close paths stay: X (`salon.close`), Escape, backdrop → idle (card unselected). Overlay still mutually exclusive with the other dialog.
- After a real close, Pitaj salon is the hairline card button again (not left `pointer-events-none` / `aria-pressed` with no overlay). Locked: same Epic 10 sentence.
- No `createBooking` / send-gate / hours / chrome redesign. No Playwright as a verify gate. No new npm. No GSAP.
- Story file stays missing this loop: do not persist `docs/stories/STORY-64.md` from story-loop.
- **Q1 A** Keep both `<dialog>`s and native date/time. On `cancel`, `preventDefault` when a native date/time control is active (`input[type=date|time]` focused, or equivalent). If the dialog still closed while `mode` is `picker` or `chat`, `showModal()` again and do not idle. X, backdrop, and Escape still idle when date/time is not why `cancel` fired.
- **Q2 A** Safety net: if that overlay’s `open` becomes false and we are not keeping it open, `setMode('idle')` so Pitaj salon is a button again. Stay-open is the main fix; idle-on-real-close is the trap fix.
- **Q3 A** Helper `dialogCancelShouldClose` + Vitest; source tests that both dialogs wire `onCancel`. One human-only: phone date/time does not dismiss, then Pitaj salon is tappable after X.
- My Bookings / owner salon-edit `type="time"` stay out of scope.

## Open decisions

- (empty)

## Not yet specified

- (empty)

## Out of scope

- LLM / free-text NLU
- Replacing Pitaj salon overlay chrome (STORY-63)
- Filling the empty aside; slot grid; GSAP / Awwwards
- `createBooking` or send gates
- Owner `/owner/chats`, Zahtjevi, salon edit `type="time"`
- My Bookings native date/time
- Playwright, RTL, Pest, GraphQL codegen, new npm
- Writing `docs/stories/STORY-64.md` in this loop
- Replacing native date/time with text/`select` or a custom calendar
- `preventDefault` on every dialog `cancel` (Q1 B)
