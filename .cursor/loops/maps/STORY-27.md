# Story map: STORY-27

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-27 |
| Source | `docs/stories/STORY-27.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-27.md` |

## Destination

Owner can optionally Take over one in-flight assistant intake. Until that tap the assistant keeps going and can still send `requested`. After the tap the guest waits. After hours or DND, take-over is off and the assistant always finishes to a request.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (02, 03, 06, 08), `docs/architecture/` (03, 04, 05, 08 #35), `docs/stories/STORY-27.md` plus STORY-26 / 28 / 21, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): `AssistantIntake` is a salon-scoped **snapshot** (chips), not a message log. `/owner/chats` is **list only** — no `:id`, no owner messages, no Take over control. Guest `upsertAssistantIntake` + `createBooking(intakeToken)` still work whenever the row is in-flight. No DND field. Salon `hours` weekly template exists (`updateSalonHours`); no owner hours/settings UI in the PWA. `OpenWindow` checks a preferred start against that day. Reverb: `bookingCustomerResponded` only. Behat GraphQL-over-HTTP; Vitest helpers; no Playwright.
- STORY-26 lock: list + badge; no owner messages this (that) PR. Chrome may grow here if Take over needs a control or a detail.
- STORY-28: unknown → say so / optional ping; guest does **not** wait on a ping. Do not absorb ping.
- Backend rule “no chat in MVP” = WhatsApp-style messaging; the in-flight tab is already a snapshot list, not a composer.
- Story out of scope: auto-page on every chat; worker take-over; after-hours as a live owner shift calendar (Phase 2).
- Standing preferences:
  - Do not invent a second API (not REST, not a chat microservice, not an LLM)
  - Do not expand the `createBooking` status machine
  - Do not auto-page the owner on every chat
  - Do not add worker-facing chat
  - Do not replace `/owner` home with chat

## Decisions so far

- STORY-27 only: optional Take over + after hours / DND off switch. Not ping (STORY-28). Not a second booking inbox. Not origin/transcript (STORY-25).
- Take over is optional and owner-only. Workers are not users.
- Guest waits **only** after the owner taps Take over.
- Until that tap, the assistant continues and can still send a `requested` booking.
- After hours or DND: take-over is off; the assistant always finishes to a request.
- No auto-page on every chat.
- After-hours is **not** a live owner shift calendar this story (story out of scope / Phase 2).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. Assistant v1 still adds no LLM / WhatsApp stack piece (architecture decision 35).
- Bosnian-first (`bs`, no switcher). Design 2 owner dense; guest chat stays salon-voice on `/salon/:id`.
- **Take-over meaning (2026-09-10):** pause only. Guest chips freeze; guest cannot keep stepping or send on that intake. Owner sees the existing snapshot. No owner composer, no message log, owner does not finish the script or send for the guest.
- **After hours (2026-09-10):** `now()` in `Europe/Sarajevo` vs that weekday’s weekly hours. Closed day, before open, at/after close, or inside the break → after hours. Same `hours` JSON. Point-in-time open, not booking start+duration.
- **DND (2026-09-10):** per-salon boolean. Owner toggles it on `/owner/chats`. While on, take-over is off for that salon; assistant still finishes. No settings/stats screen this PR. Not a user-global flag.
- **Chrome (2026-09-10):** Take over (and release) on each `/owner/chats` row. No `/owner/chats/:id`. Snapshot stays on the list. Each in-flight row is independent (not a global pause-all).
- **Enforcement (2026-09-10):** Pause is persisted on the intake row. While taken over **and** the salon is open and DND off: `upsertAssistantIntake` and `createBooking` with that `intakeToken` fail. Guest UI hides chips and shows wait copy. Picker without `intakeToken` still works. Guest cannot take over.
- **Hand back (2026-09-10):** Owner can release on the same row. Clears the pause; guest can step and send again.
- **Pause vs after hours / DND (2026-09-10):** After hours or DND, take-over has no effect even if the flag was set. Guest can finish. Owner cannot take over. Gate on `now()` + DND; no closing-time job.
- **Live (2026-09-10):** `assistantIntake.takenOver` is pause **in effect** (flag set AND salon open AND DND off). Refetch on salon-profile mount and window focus. Failed upsert/send → wait copy. No `pollInterval`. No new Reverb. Idle guest may still see chips until tap or refocus.
- **Controls after hours / DND (2026-09-10):** Hide Take over and Release. Mutations still reject. DND toggle stays visible.
- **Copy (2026-09-10):** Take over `Preuzmi`. Release `Vrati asistentu`. DND `Ne uznemiravaj`. Guest wait `Sačekaj, javit ćemo ti se.`
- **Stale (2026-09-10):** Same 24h in-flight window. Take over and release bump `updated_at`. No exemption. Aged-out token → `assistantIntake` null; next chip starts a new row; wait UI clears.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Auto-page on every chat
- Worker take-over
- After-hours as a live owner shift calendar (Phase 2)
- Unknown → say so / ping owner (STORY-28)
- A second pending queue for chat-originated bookings
- Changing the `createBooking` status machine
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
- Settings / stats owner screens as a general destination (unless DND needs a tiny control)
- Playwright, Pest, codegen, `vite-plugin-pwa`
