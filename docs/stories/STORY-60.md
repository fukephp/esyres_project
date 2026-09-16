# STORY-60 — Radno vrijeme exclusive accordion

| Field | Value |
|-------|--------|
| ID | STORY-60 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `—` |
| Depends on | STORY-53, STORY-56 |

## User story

As an owner, I want each weekday on Radno vrijeme collapsed until I open it, so that I can scan the week without scrolling through seven expanded editors.

## Acceptance criteria

- Radno vrijeme on `/owner/salons/:id` is **one column** of seven weekday headers (Mon–Sun). Not two columns of days. Not a week grid (STORY-56). Guest `/salon/:id` hours stay the left seven-row list (STORY-59).
- At most one weekday editor is open. Land, refresh, and leaving the Radno vrijeme chip → all collapsed. Open state is UI-only (not persisted). Header tap expands that day; opening another closes the first; tap the open header to close it.
- Collapsed row: weekday name + `HH:mm–HH:mm` (24h, same clocks as the guest hours line) or `Zatvoreno`. Closed summaries stay muted. **Pauza** is not on the summary.
- Header tap expands only. **Zatvoreno** and **Pauza** stay inside the open pane. Inner Od/Do/Pauza fields and the weekly template stay STORY-53 (Sarajevo local, 15-minute steps, closes exclusive, optional one break).
- Cancel notice stays under the day list. One save still writes the whole week + notice (`updateSalonHours`). `INVALID_HOURS` stays the form banner — no per-day auto-expand. No new GraphQL.

## Out of scope

- Two-column days; independent multi-open collapse
- Copy-week / apply Monday to all / Isti sati master
- Persist which weekday is open
- Sticky or separate cancel-notice card
- Holidays; per-worker hours; days-only editor
- Guest hours restyle
