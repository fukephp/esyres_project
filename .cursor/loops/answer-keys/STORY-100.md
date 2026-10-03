# Answer key: STORY-100

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-100 |
| Source | `docs/stories/STORY-100.md` — My profile |
| Goal (one sentence) | `/my-profile` shows the newest booking and a link to Moji zahtjevi, and Profil sits before that link in the nav. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (empty copy assumed) |

## Pass/fail — product

- [ ] Guest `/my-profile` renders Rezervacije AuthShell and no booking row — verify: Vitest `myProfile.source.test.ts`
- [ ] Logged-in page shows the person name when set, the first `myBookings` row (same fields as a Moji zahtjevi row), and **Vidi sve** to `/bookings` — verify: Vitest `myProfile.source.test.ts`
- [ ] No bookings renders `Nema zahtjeva.` and **Vidi sve** — verify: Vitest `myProfile.source.test.ts`
- [ ] **Postavke** href is `/my-profile/settings` — verify: Vitest `myProfile.source.test.ts`
- [ ] Logged-in nav on `/`, `/salons`, `/salon/:id`, `/bookings`, `/my-profile` places **Profil** immediately before Moje rezervacije. Homepage order is greeting, Profil, Moje rezervacije, Odjava, Panel. Discovery and salon have no Odjava. `/create-salon` and owner nav do not gain Profil — verify: Vitest `homepage.test.ts` and `myProfile.source.test.ts`
- [ ] Moji zahtjevi has no rate control — verify: Vitest `myProfile.source.test.ts` (bookings page source has no Ocijeni)
- [ ] Profile layout — verify: human-only: merge visual review (UI ready rule)

## Pass/fail — architecture

- [ ] No new booking query. The page reads the existing `myBookings` list — verify: `git diff` has no new booking field on the schema

## Verify commands

Classifier first. Frontend-only unless PHP changes.

**If skipped** — from `esyres_app/frontend/`: `npm run typecheck`, `npm run test`, `npm run build`.

**If Behat runs** — from `esyres_app/`: compose up, artisan version, behat, then vite typecheck, test, build.

## Out of scope

- Settings form, Omiljeni saloni, Predloženi saloni, Moje ocjene

## Implementer instructions

1. Read this key and CONTEXT. Card pack from STORY-99.
2. Add the route and the nav link. Do not add the settings form.
3. Loop: implement → classifier → verify. Cap 8. Same failure twice ends this story.
4. Commit on the batch branch when verify exits 0. Message: `STORY-100 — My profile`. On the cap, stop and leave the PR to the batch skill.
