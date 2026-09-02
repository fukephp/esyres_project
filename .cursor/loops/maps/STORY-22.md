# Story map: STORY-22

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-22 |
| Source | `docs/stories/STORY-22.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-22.md` |

## Destination

After service, worker preference, and day in salon-profile chat, the guest sees 1–3 preferred-time chips derived from that salon’s hours, that day’s busy-level, and worker preference. They pick one (or an equivalent preference) before send. No live slots, no held cell, same `createBooking`.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (01, 03, 04, 06, 08), `docs/architecture/` (03, 04, 05, 08 #16 #35), `docs/stories/STORY-22.md` plus STORY-21 / STORY-23–28, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): STORY-21 chat on `/salon/:id` — chips for service/worker, then native date + native time `step=900`, then `createBooking`. Helper `frontend/src/lib/assistant.ts`. Public `salon` already has `hours` + `busyLevel(date)`. Profile query uses **today** for busy-level (header badge). Closed weekday → `SALON_CLOSED`. Time on an open day inside a break or outside hours is accepted (preference, not a hold). Occupancy percent on a **closed** day is `0` → enum `LOW` — so closed must be read from hours, not from the busy enum. Guest must not query `occupyingBookings` (owner panel). Workers inherit salon hours; no per-worker hours. No Playwright. Vitest covers lib helpers. Behat is GraphQL-over-HTTP.
- STORY-21 deferred to this slice: 1–3 suggestions; chosen-day `busyLevel(date:)`. Native time was an explicit placeholder.
- Sibling walls: STORY-23 live Q&A / salon voice beyond intake; STORY-24 send-gate polish; STORY-25 origin/transcript; STORY-26 owner tab; STORY-27 take-over; STORY-28 unknown/ping.
- Standing preferences:
  - Do not invent a second API (not REST, not a suggestions microservice)
  - Do not name live free slots or hold a clock cell
  - Do not change busy-level thresholds (mvp 08 placeholders)
  - Do not expand `createBooking` status machine
  - Picker stays native date+time; this slice is chat-only

## Decisions so far

- STORY-22 only: 1–3 preferred times in chat after service, worker, and day. Not owner panel as a guest view. Not auto-confirm. Not threshold changes.
- Suggestions may use salon hours, that day’s busy-level, and worker preference **only**. Not occupying ranges, not the Worker Availability Panel.
- Chat never names live free slots or holds a cell. `requested` still does not occupy a clock slot.
- Guest must have a preferred time on the request before send (same `CreateBookingInput.preferredTime` as the picker).
- Same `createBooking`; no origin field (STORY-25). Taps / native controls, no free-text NLU (STORY-28).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. Assistant v1 adds no stack component (architecture decision 35).
- Bosnian-first i18n. Design 2 customer sparse.
- Closed weekday still cannot send (`SALON_CLOSED`). Suggestion logic must treat closed from **hours**, because a closed day currently reports busy-level `LOW`.
- **Compute (2026-09-02):** Vitest-covered PWA helper from public `hours` + `busyLevel(date)`. No `suggestPreferredTimes` field, no REST, no occupancy query.
- **Count (2026-09-02):** `LOW` → 3, `MEDIUM` → 2, `HIGH` → 1. Closed weekday → 0 chips, no `Drugo vrijeme`; stay on the day step.
- **Worker (2026-09-02):** named worker and no preference produce the **same** clocks. Preference stays on the request; do not inspect occupying ranges.
- **Time UI (2026-09-02):** replace chat native-time step with suggestion chips. Text-style **Drugo vrijeme** reveals the same native time input (`step` 15 min). Picker stays native-only. `canSend` still needs a non-empty `preferredTime`.
- **Chosen-day busy (2026-09-02):** after a date is set, salon-voice line with that day’s busy enum, then chips. Header badge stays **today**. Same `PUBLIC_SALON_QUERY`: alias today for the header and `chosenDate || today` for chat; no new GraphQL field.
- **Copy (2026-09-02):** hardcoded Bosnian in `i18n.ts` (no bot name). Reuse existing `salon.busy.*` for the enum line. New keys for the suggestion prompt and `Drugo vrijeme`.
- **Placement (2026-09-02):** concatenate open spans (break is a hole). `LOW` 25/50/75%, `MEDIUM` ⅓/⅔, `HIGH` 50% of that timeline. Snap each to the nearest `:00`/`:30` still inside an open span; equal distance → later mark. Dedupe; short window may return fewer than N. No duration input. No worker input.
- **Past today (2026-09-02):** drop clocks strictly before now (Sarajevo). Equal-to-now stays (`createBooking` uses `lt`). Open today with 0 chips left: keep the day, show **Drugo vrijeme**, no chips. Closed: no chips, no other-time.
- **Date change (2026-09-02):** changing chat date clears `preferredTime` and other-time mode; re-show that day’s busy + chips.
- **Verifiers (2026-09-02):** Vitest on the time helper (closed, count, break, snap, past, duration ignored, other-time flag, date-change reset, `canSend`). Behat existing suite (no new GraphQL field). No Playwright. No screenshot human-only (UI ready = machine gates).

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Owner Worker Availability Panel as a guest view
- Auto-confirm
- Changing busy-level thresholds (still placeholders in mvp 08)
- Salon-branded Q&A from live data beyond this intake step (STORY-23)
- Chat-specific send-gate polish (STORY-24)
- Assistant-origin tag and transcript (STORY-25)
- Owner in-flight chat tab (STORY-26)
- Take over / after hours / DND (STORY-27)
- Unknown → say so / ping owner (STORY-28)
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
- Changing picker native date+time
- Guest use of `occupyingBookings` or owner panel cells
