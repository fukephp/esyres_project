# Story map: STORY-104

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-104 |
| Source | `docs/stories/STORY-104.md` — Salon rating |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-104.md` |

## Destination

One 1–5 per customer per salon from `/salon/:id` after Usluge, with an optional comment. Guests see the mean. Logged-in customers see rows. `/my-profile` lists Moje ocjene.

## Decisions so far

- Q: block order is mean, count, and stars, then the form when this customer may rate, then the rows. A guest sees only the mean line
- Replace, no delete. Comment max 500. Empty comment leaves replies. Gates match cancel. Owner cannot rate their own salon
- Stars fill to the nearest integer. No ratings: block absent
- assumed: empty Moje ocjene copy is `Nema ocjena.`

## Open decisions

- (none)

## Not yet specified

- (none)

## Out of scope

- Replies, owner Ocjene, a worker score, stars on discovery or `/`, a rate control on Moji zahtjevi
