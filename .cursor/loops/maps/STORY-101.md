# Story map: STORY-101

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-101 |
| Source | `docs/stories/STORY-101.md` — Saved place and name |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-101.md` |

## Destination

`/my-profile/settings` saves Ime i prezime and one of six municipalities. A saved place is the Nearby point and the browser is not asked.

## Notes

- Backend: column on users, mutation, discovery already sorts by lat/lng

## Decisions so far

- Q: the municipality field has an empty first choice. Sačuvaj with that choice clears the point. One button
- Six names: Centar, Stari Grad, Novo Sarajevo, Novi Grad, Ilidža, Vogošća
- assumed: fixed points (lat, lng) Centar 43.8563, 18.4131; Stari Grad 43.8590, 18.4310; Novo Sarajevo 43.8510, 18.3980; Novi Grad 43.8700, 18.3700; Ilidža 43.8300, 18.3100; Vogošća 43.9020, 18.3440
- Blank name refused with the existing invalid-name error. No email or phone gate

## Open decisions

- (none)

## Not yet specified

- (none)

## Out of scope

- Free-text address, email or password change, moving salon coordinates
