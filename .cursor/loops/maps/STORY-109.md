# Story map: STORY-109

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-109 |
| Source | `docs/stories/STORY-109.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-109.md` |

## Destination

A `requested` booking stays actionable through its preferred day in Europe/Sarajevo, then becomes `declined` with reason `expired` and reads **Nije odgovoreno** on owner boards and Moji zahtjevi. The owner cannot act after that midnight. `time_proposed`, reschedule overlays, confirmed rows, and phone bookings do not age out.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/adr/0050-unanswered-request-ends-with-the-day.md`, `docs/stories/STORY-109.md`
- Behat clock is frozen at `2026-08-29 09:00` Europe/Sarajevo
- Standing preferences for this effort: smallest change; no fifth status; no guest warning

## Decisions so far

- End of preferred day, not the preferred start. Timed and day-only share midnight. (story)
- Stored status `declined`, reason `expired`, `owner_responded_at` stays empty. Display does not wait for the scheduled flip. (story)
- Tag **Ističe danas** on the Kalendar pending card, the Kanban Zahtjevi card, and Request Detail while the row is still `requested` on that day. **Uskoro** stays the occupying tag. (story)
- **Na čekanju · {n}** counts the row until midnight and skips a day whose only rows are **Nije odgovoreno**. Reschedule overlays stay, including past days. (story)
- After midnight: Kanban **Završeno i otkazano** on Zahtjevi and Zapisi; not on the week grid; under the live pending pile on the selected day of both boards, outside any till-pile collapse. Timed soonest, then day-only oldest sent. Pink count is live pending only. Hiding the done column hides that column only. (story)
- Request Detail for this row is read-only meta plus **Nije odgovoreno**. Assistant origin keeps **Asistent** and the transcript. Owner decline and cancel keep the bounce `Zahtjev više nije na čekanju.` (story)
- Guest: no tag, no push, no SMS, no email. Leaves **Na čekanju**. Label **Nije odgovoreno** in **Zadnje odbijeno** or **Historija**, and on the profile newest row. Reason `expired` is not a sentence. Owner decline stays **Odbijeno**. (story)
- Statistika unchanged. (story)
- assumed: command `bookings:expire-unanswered` every minute. Mutations throw `EXPIRED` and do not write. Query `unansweredBookings` feeds the under-pile. Client treats a still-`requested` past day as unanswered.

## Open decisions

## Not yet specified

## Out of scope

- Aging out `time_proposed`
- In-progress reschedule and phone bookings
- Push, SMS, or email
- Stamping `owner_responded_at`
- A new booking status
- Week-grid cards for these rows
