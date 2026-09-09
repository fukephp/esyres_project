# Story map: STORY-23

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-23 |
| Source | `docs/stories/STORY-23.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-23.md` |

## Destination

On `/salon/:id` chat, copy is Bosnian and speaks as this salon (no named platform bot). Facts the guest can hear about services, KM prices, durations, hours, address, workers, and busy-level come from that salon’s live GraphQL data. Chat does not invent cancellation policy, prices, or hours.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (01, 02, 03, 04, 06, 08), `docs/architecture/` (03, 04, 05, 08 #15 #20 #35), `docs/stories/STORY-23.md` plus STORY-21 / 22 / 24–28, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): STORY-21+22 chat on `/salon/:id` — scripted chips, no free-text. Prompts are generic Bosnian in `i18n.ts` (`Koje usluge želiš?`, first-person `nam` on time, no salon name, no bot name, no “Esyres”). Service chips already show live `name` + `formatFeninga(priceFeninga)` (no duration). Workers from live `workers`. Hours drive suggestions; chosen-day `chatBusyLevel` already shown. Public `Salon` has `name`, `hours`, `services`, `workers`, `busyLevel(date)` — **no `address` column or GraphQL field**. `lat`/`lng` exist for discovery only. `cancellationNoticeHours` is owner-only (STORY-07). No Playwright. Vitest covers lib helpers. Behat is GraphQL-over-HTTP.
- STORY-21 deferred here: salon-branded Q&A from live data beyond intake prompts; address/photos stayed off public `salon`.
- Sibling walls: STORY-22 time chips (done); STORY-24 send-gate polish; STORY-25 origin/transcript; STORY-26 owner tab; STORY-27 take-over; STORY-28 unknown → say so / ping owner.
- Standing preferences:
  - Do not invent a second API (not REST, not a knowledge microservice, not an LLM)
  - Do not add a free-text box or NLU (STORY-21 lock; Phase 2)
  - Do not leak owner-only `cancellationNoticeHours` to guests
  - Do not expand `createBooking` or add Conversation tables
  - Photos, maps SDK, geocode UI stay out (STORY-07 leftover)

## Decisions so far

- STORY-23 only: salon voice + live-data facts in guest chat. Not unknown/ping, not send-gate polish, not owner tab.
- Knowledge = live salon data only (mvp 08). Allowed topics: services, KM prices, durations, hours, address, workers, busy-level.
- Guest still cannot read `cancellationNoticeHours` (STORY-07). This PR does not invent cancel-policy copy and does not expose that field.
- No free-text, no LLM, no named bot (“Cora”). Esyres stays plumbing. Bosnian-only (`bs`, no switcher).
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. Assistant v1 adds no stack component (architecture decision 35).
- Prices stay integer feninga in the model; guest-facing KM via existing `formatFeninga`.
- Picker UI unchanged except it may keep reading the same public salon query.
- **Interaction (2026-09-09):** enrich the existing scripted intake only. No topic-chip row. No free-text Q&A.
- **Address field (2026-09-09):** add nullable public `Salon.address: String` (migration + GraphQL). Chat may read it. No owner editor, no maps/geocode, no profile-page address block. Do not derive a street from `lat`/`lng`.
- **Voice (2026-09-09):** interpolate `salon.name` in the opening line only (`{{name}} ovdje.`). Other prompts stay generic first-person in `i18n.ts`. No bot name. No “Esyres”.
- No extra copy when there are zero workers (STORY-21 already skips the worker step).
- **Address in chat (2026-09-09):** under the opening line when trimmed non-empty; null/blank → omit the line (no invented street, no “ne znam”).
- **Hours in chat (2026-09-09):** chosen-day hours on the date step (after a date is set), same shape as the profile hours line (`HH:mm–HH:mm · pauza …` or `Zatvoreno`) from that day’s `hours` row, next to existing busy / `SALON_CLOSED`. No weekly dump in chat. Keep STORY-22 chips/gates.
- **Service chips (2026-09-09):** `name` + duration (`salon.duration`) + KM (`formatFeninga`). Live catalog only.
- **Verifiers (2026-09-09):** Vitest on voice/address/hours/chip helpers. Behat: guest public salon returns `address` (null default; set string when present); existing guest-cannot-read-`cancellationNoticeHours`. No Playwright. No screenshot human-only (UI ready = machine gates).

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Unknown → say so / ping owner (STORY-28)
- LLM paraphrasing outside live data (Phase 2)
- English language switcher
- Chat-specific send-gate polish (STORY-24)
- Assistant-origin tag and transcript (STORY-25)
- Owner in-flight chat tab (STORY-26)
- Take over / after hours / DND (STORY-27)
- Free-text box / NLU
- Topic-chip / FAQ ask row (enrich intake only)
- Photos, maps SDK, geocode UI, maps link-out (STORY-07 leftover)
- Owner editor for address / profile
- Address block on the salon profile page
- Exposing `cancellationNoticeHours` to guests
- Changing picker native date+time, busy-level thresholds, or `createBooking`
- Playwright, Pest, codegen, `vite-plugin-pwa`
