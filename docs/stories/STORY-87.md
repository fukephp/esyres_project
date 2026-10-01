# STORY-87 — Pending jump

| Field | Value |
|-------|--------|
| ID | STORY-87 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-13, STORY-76, STORY-80 |

## User story

As an owner, I want one button with the count of pending reservations that jumps me to that day, so that I can accept or decline without hunting the week.

## Acceptance criteria

- One button on Zahtjevi only, both Prikaz, phone and laptop. It sits in the header action row, before Telefon. Not on Zapisi or Request Detail.
- Label **Na čekanju · {n}**. `n` is pending rows for this salon on any day: requests plus reschedule overlays, the same rows the pending pile already uses. Several rows on one day still add to `n`. Count `0` hides the button.
- Click sets `?date=` to the earliest pending day. Past days are included. If that day is already selected, the next click goes to the next pending day, then wraps. Several rows on one day are one stop. The week that contains the landed day follows.
- Accept, decline, and counter-propose stay the actions already on that day. The count refreshes with the queue.

## Out of scope

- A date on the button
- A new accept, decline, or counter-propose control
- Zapisi and Request Detail
- Showing the button when the count is 0
