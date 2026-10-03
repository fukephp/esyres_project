# Story map: STORY-100

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-100 |
| Source | `docs/stories/STORY-100.md` — My profile |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-100.md` |

## Destination

Logged-in `/my-profile` shows the person name and the newest booking, with Vidi sve to `/bookings`. Profil sits before Moje rezervacije. A guest sees the Rezervacije AuthShell.

## Notes

- Reuse `myBookings`. No new GraphQL

## Decisions so far

- Newest booking is the first row of the existing list order when that list is newest-first; otherwise sort by created time descending on the client — assumed: the API list is already newest first, so the first row is the one
- Empty line copy is the existing `Nema zahtjeva.` — assumed
- Postavke links to `/my-profile/settings` even before that page exists in this story
- Nav slots as in the story AC

## Open decisions

- (none)

## Not yet specified

- (none)

## Out of scope

- Settings form, favorites, suggestions, Moje ocjene, a rate control on Moji zahtjevi
