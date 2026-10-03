# STORY-106 — Owner Ocjene

| Field | Value |
|-------|--------|
| ID | STORY-106 |
| Epic | 11 — Visit ratings |
| Loop | — |
| Depends on | STORY-104 |

## User story

As an owner, I want every rating of my salon on salon edit, so that I can read them without a reviews screen.

## Acceptance criteria

- Salon edit Informacije ends with a read-only **Ocjene** list. Same rows as the logged-in salon page: person name, score, comment, the Sarajevo day, and replies. Newest rating first.
- Empty copy when there are none. No new owner nav item. Not Request Detail. Not Statistika.
- The owner cannot edit, hide, delete, or reply. No rate form for a salon they own.
- Backend files change, so verify is full Behat.

## Out of scope

- A Recenzije nav item
- Hiding or deleting a rating
- An owner reply
