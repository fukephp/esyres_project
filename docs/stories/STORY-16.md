# STORY-16 — Tap fallback

| Field | Value |
|-------|--------|
| ID | STORY-16 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | `E3-tap-fallback` |
| Depends on | STORY-15 |

## User story

As an owner, I want a tap-based fallback to the drag interaction, so that I can still manage requests from my phone.

## Acceptance criteria

- Verified owner can open Request Detail for a booking at their salon (requested, confirmed, time_proposed, or declined) with the same booking fields as the queue; other salon / guest / unverified rejected.
- Counter-propose from the form uses the same same-day propose as drag; accept and decline reuse existing actions.
- `/owner` every pending row has Predloži to Request Detail; that screen shows preferred date/time, worker + time selects, submit, Prihvati if named worker, Odbi two-step, back. Not requested → bounce copy + back only.

## Out of scope

- New propose/accept/decline mutations
- Reverb / status notification jobs
- Assistant origin tag + transcript (STORY-25)
- Changing drag behavior
