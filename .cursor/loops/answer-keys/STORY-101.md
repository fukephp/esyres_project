# Answer key: STORY-101

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-101 |
| Source | `docs/stories/STORY-101.md` — Saved place and name |
| Goal (one sentence) | Settings save the person name and an optional Sarajevo municipality, and Nearby uses that point instead of the browser. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (empty choice; centroids assumed) |

## Pass/fail — product

- [ ] Guest `/my-profile/settings` is the Rezervacije AuthShell — verify: Vitest `customerSettings.source.test.ts`
- [ ] The form has Ime i prezime, a municipality select whose first option is empty, and one **Sačuvaj**. Options are Centar, Stari Grad, Novo Sarajevo, Novi Grad, Ilidža, Vogošća — verify: Vitest `customerSettings.source.test.ts`
- [ ] `updateCustomerSettings` with a blank name returns the existing invalid-name error and writes nothing — verify: Behat `features/guest/customer_settings.feature`
- [ ] A saved municipality stores that fixed point; an empty choice clears it. `me` then exposes the place name or null — verify: Behat `customer_settings.feature`
- [ ] After save, the greeting uses the new name — verify: Vitest `customerSettings.source.test.ts` (cache write of `me.name`)
- [ ] When `me` has a place, `/salons` does not call `navigator.geolocation` and sends that lat/lng. When the place is null, the browser prompt remains — verify: Vitest `customerSettings.source.test.ts`
- [ ] No email or phone gate on the mutation — verify: Behat (unverified customer can save)

## Pass/fail — architecture

- [ ] No geocoder and no map SDK. Points are constants in PHP — verify: diff has no HTTP geocode client
- [ ] GraphQL adds `savedPlace` on `me` and `updateCustomerSettings(name, savedPlace)` only — verify: Behat

## Verify commands

Classifier fails (PHP). From `esyres_app/`: compose up, artisan version, full Behat, then vite typecheck, test, build.

## Out of scope

- Free-text address, email or password, salon coordinates

## Implementer instructions

1. Read this key. One users column for the municipality key. Map keys to the assumed centroids.
2. Loop: implement → classifier → Behat verify. Cap 8. Same failure twice ends this story.
3. Commit on the batch branch when verify exits 0. Message: `STORY-101 — Saved place and name`. On the cap, stop and leave the PR to the batch skill.
