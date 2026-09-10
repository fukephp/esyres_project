# Story map: STORY-28

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-28 |
| Source | `docs/stories/STORY-28.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-28.md` |

## Destination

On the salon-profile assistant, if the guest hits a question that is not in live salon data, chat says it does not know (no invented policy). Chat may ping the owner. The guest does not wait on that ping and can still finish to `requested` without the owner answering.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (03, 04, 06, 08), `docs/architecture/` (03, 04, 05, 06, 08 #17 #23 #35), `docs/stories/STORY-28.md` plus STORY-21 / 23 / 26 / 27, `docs/glossary.md` (**Salon Booking Assistant**, **scripted intake**, **Unknown**, **Ping**, **Take over**, **DND**, **After hours**), `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`):
  - Guest chat is chips + native controls only. No free-text. No FAQ/topic-chip row (STORY-21 / STORY-23). Live facts: salon name, optional address, service name+duration+KM, workers, chosen-day hours, busy-level. Null/blank address is omitted, not “ne znam”.
  - `cancellationNoticeHours` stays owner-only. Chat has no cancel-policy copy.
  - `AssistantIntake` is a salon-scoped snapshot (services/worker/date/time + `taken_over_at`). Not a message log. Guest `upsertAssistantIntake` + `createBooking(intakeToken)` still finish unless take-over is in effect. Opening chat does not upsert; empty snapshot does not upsert.
  - `/owner/chats` is list + Take over / Release / DND. Badge = 24h in-flight count. No `:id`, no owner composer, no ping marker. Reverb: `bookingCustomerResponded` only. No owner web push yet (STORY-31 / Epic 6).
- Sibling walls: STORY-23 live data (done; unknown deferred here). STORY-27 take-over is pause; guest waits only after that tap; ping is not take-over. STORY-31 owner push. No auto-page on every chat.
- Backend rule “no chat in MVP” = WhatsApp-style messaging; the in-flight tab is already a snapshot list.
- Story out of scope: LLM answers outside live data; guest wait-for-owner as default; WhatsApp / Viber delivery of the ping.
- Standing preferences:
  - Do not invent a second API (not REST, not a knowledge microservice, not an LLM)
  - Do not add a free-text box or NLU (STORY-21 lock; Phase 2)
  - Do not expand the `createBooking` status machine
  - Do not auto-page the owner on every chat
  - Do not treat ping as Take over (guest must not wait on ping)
  - Do not replace `/owner` home with chat

## Decisions so far

- STORY-28 only: unknown → say so + optional ping. Not take-over (STORY-27). Not live-data Q&A (STORY-23). Not owner push (STORY-31). Not a second booking inbox.
- Guest does **not** wait on a ping. Intake can still finish to `requested` without the owner answering.
- Knowledge = live salon data only (services, KM prices, durations, hours, address, busy-level, workers). No invented cancel policy, prices, or hours.
- No free-text, no LLM, no named bot. Bosnian-only (`bs`, no switcher).
- No WhatsApp / Viber delivery of the ping (story out of scope). Instagram DM still Phase 2.
- No auto-page on every chat (mvp 08 / STORY-26–27).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. Assistant v1 still adds no LLM / WhatsApp stack piece (architecture decision 35).
- Design 2: guest chat stays salon-voice on `/salon/:id`; owner dense on `/owner/chats`.
- **Unknown trigger (2026-09-10):** one escape chip always on the intake. Tap → “don’t know.” No topic catalog, no free-text, no live-data FAQ row.
- **May ping (2026-09-10):** after unknown, guest may tap `Obavijesti salon`. No tap → no ping. Guest keeps stepping either way.
- **Ping delivery (2026-09-10):** in-app mark on that `/owner/chats` row. No email, no web push, no new Reverb. Owner sees it on open/refetch. Mark lives on the intake row.
- **Escape chip placement (2026-09-10):** every step while chat is open and not waiting / not already sent. Unknown does not skip the script.
- **Ping vs take-over (2026-09-10):** unknown + ping hide with wait chrome. Take over is wait; ping is the assistant path.
- **DND / after hours (2026-09-10):** do not suppress ping. Guest can ping while the assistant is running, including after hours or DND. Mark sits on the row.
- **Badge (2026-09-10):** `inFlightIntakeCount` unchanged. Ping is a mark on the list row. No second badge.
- **Ping lifecycle (2026-09-10):** unknown is local (no upsert). `Obavijesti salon` stays after unknown until they ping. That tap creates/updates the in-flight row with the mark (even with empty picks). Then confirmation copy; ping CTA goes away. Guest keeps stepping.
- **Copy (2026-09-10):** escape `Nešto drugo?`; unknown `Ne znam. To nemam u podacima.`; ping CTA `Obavijesti salon`; after ping `Javili smo salonu. Možeš nastaviti.`; owner row mark `Pitanje`.
- **Repeat ping (2026-09-10):** one ping per intake. Re-tap unknown shows the same don’t-know line, no ping CTA. Mutation retry is idempotent success.
- **After send / stale (2026-09-10):** ping is in-flight only. Mark dies with the chats list. No ping on Request Detail or My Bookings. Ping touches `updated_at` (newest-first, same 24h window as take-over).
- **Unknown vs server (2026-09-10):** no unknown column. Refresh loses the unknown line unless they already pinged (`pinged` hydrates confirmation + unknown line, no ping CTA). Empty ping-only row still restores/expands chat.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- LLM answers outside live data (Phase 2)
- Guest wait-for-owner as default (that is Take over, STORY-27)
- WhatsApp / Viber delivery of the ping
- Free-text box / NLU
- Live-data Q&A / topic-chip FAQ for services, prices, hours, address (STORY-23)
- Auto-page on every chat
- Owner composer / message log / live owner bubbles
- Owner web push / email as the ping channel (STORY-31 / Epic 6)
- Owner dismiss / answer the ping
- Ping on Request Detail or My Bookings
- Changing the `createBooking` status machine
- Playwright, Pest, codegen, `vite-plugin-pwa`
