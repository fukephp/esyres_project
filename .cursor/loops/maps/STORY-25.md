# Story map: STORY-25

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-25 |
| Source | `docs/stories/STORY-25.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-25.md` |

## Destination

A chat-sent request lands in the same pending queue as a picker request, tagged as assistant-originated. Request Detail shows a collapsed transcript that explains the preferred time. Accept, counter-propose, and decline stay the same actions.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 04, 06, 08), `docs/architecture/` (03, 04, 05, 08 #10 #35), `docs/stories/STORY-25.md` plus STORY-13 / 16 / 21 / 24 / 26, `docs/glossary.md` (**pending queue**, **Request Detail**, **assistant-originated**, **request transcript**, **Salon Booking Assistant**, **scripted intake**), `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`):
  - Chat `createBooking` already attaches a valid in-flight `intakeToken` (`booking_id`). Picker omits the token (STORY-26). Status machine unchanged.
  - `pendingBookings` lists all `requested` for that salon-day (soonest preferred time). Origin is not a filter; a converted chat booking already appears if the date matches. No Behat yet that an attached-intake booking is distinguishable.
  - `Booking` GraphQL has no origin field and no nested intake. Converted `assistantIntake(token)` is null for the guest. Owner in-flight list omits converted rows. The converted row stays in MySQL.
  - `AssistantIntake` is a snapshot (`serviceIds`, `workerId`, `workerConfirmed`, `preferredDate`, `preferredTime`). Not a message log (`docs/architecture/05-Data-Model.md`). Suggestions and busy-level are computed at chat time and are not stored.
  - `/owner` queue row: time, soon chip, name, services, duration, worker, Prihvati / Predloži / Odbi. No origin chip. `/owner/requests/:id` already has accept / form propose / decline.
- STORY-26 lock: no origin/source column; transcript on Request Detail is this story. After send, the object is the booking (not an open chat as home).
- Product: “Assistant-originated requests are tagged; a collapsed transcript is attached (why they asked for Saturday 14:00)” (`docs/mvp/03`). After send, “transcript on Request Detail” (`docs/mvp/08`).
- Sibling walls: STORY-26 owner tab (done); STORY-27 take-over; STORY-28 unknown/ping. No second booking inbox.
- Standing preferences:
  - Do not invent a second API or a chat-only booking mutation
  - Do not change the `createBooking` status machine
  - Do not add a second owner inbox for chat-originated **bookings**
  - Do not add a message log / LLM
  - Picker remains the fast path; chat stays the messy-intent alternate

## Decisions so far

- STORY-25 only: queue tag + Request Detail collapsed transcript for assistant-originated **requests**. Not take-over. Not a second inbox. Not in-flight chat tab (STORY-26).
- Same `requested` row and same owner actions (`acceptPreferredTime` / `proposeTime` / `declineBooking`). No new mutations.
- Origin is already implied by a converted `AssistantIntake` (`booking_id` set). Picker send does not attach a token.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. No LLM, no Playwright, no Pest, no codegen this PR.
- Bosnian-first (`bs`). Design 2 owner dense. Chat stays on `/salon/:id`; owner home stays queue + panel.
- **Origin GraphQL (2026-09-10):** nullable nested `intake` on `Booking` for owner `pendingBookings` and `ownerBooking`. Tag = `intake != null`. No `bookings.origin` column. No extra `fromAssistant` field. Guest `assistantIntake(token)` stays null after convert.
- **Transcript (2026-09-10):** collapsed labeled snapshot steps (services, worker / no preference, day, time). Not a stored why-line. Not bubbles / message log. No new intake columns (busy-level, suggestion vs other-time).
- **Tag copy (2026-09-10):** `Asistent` on the queue row and on Request Detail (above the collapsed block). Do not reuse nav `Chat`.
- **Intake visibility (2026-09-10):** `Booking.intake` returns the converted row only when the session owns that salon; otherwise `null`. Queue and Request Detail query `intake { … }`. Chip = intake present. Guest `myBookings` intake is null.
- **Collapsed copy (2026-09-10):** native `<details>` default closed. Summary `Zašto ovo vrijeme`. Step labels reuse `owner.chatStep`. Values: booking service names, worker name or Nema preference, intake date + `HH:mm`.
- **Verifiers (2026-09-10):** Behat on chat vs picker `intake` for `pendingBookings` / `ownerBooking`, plus guest `myBookings` null. Vitest: tag iff intake present; labeled lines. No human-only. No Playwright. UI ready = machine gates.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- A second owner inbox for chat
- Take over while chatting (STORY-27)
- Changing `createBooking` status machine
- In-flight chat tab / badge (STORY-26)
- Unknown → say so / ping owner (STORY-28)
- Weakening picker gates (STORY-24)
- LLM / free-form NLU; Viber / WhatsApp / Instagram DM (Phase 2)
- Playwright, Pest, codegen, `vite-plugin-pwa`
