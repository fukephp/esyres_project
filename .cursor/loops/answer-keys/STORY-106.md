# Answer key: STORY-106

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-106 |
| Source | `docs/stories/STORY-106.md` — Owner Ocjene |
| Goal (one sentence) | Salon edit Informacije ends with a read-only list of that salon’s ratings and replies. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (empty copy assumed) |

## Pass/fail — product

- [ ] The owner salon query used by Informacije returns ratings: person name, score, comment, Sarajevo day, replies (name and text), newest first — verify: Behat `features/owner/salon_ratings.feature`
- [ ] Another owner’s salon returns an auth error, not the list — verify: Behat
- [ ] Informacije renders **Ocjene** after the existing fields. Empty copy `Nema ocjena.` There is no edit, hide, delete, or reply control, and no rate form — verify: Vitest `ownerRatings.source.test.ts`
- [ ] Owner nav has no Recenzije item. Request Detail has no Ocjene block — verify: Vitest `ownerRatings.source.test.ts`

## Pass/fail — architecture

- [ ] Read-only field on the existing owner salon query. No new owner route — verify: diff has no `/owner/reviews` route

## Verify commands

Classifier fails (PHP). Full Behat from `esyres_app/`, then vite typecheck, test, build.

## Out of scope

- A Recenzije nav item, hiding or deleting a rating, an owner reply

## Implementer instructions

1. Read this key.
2. Loop: implement → classifier → Behat verify. Cap 8. Same failure twice ends this story.
3. Commit on the batch branch when verify exits 0. Message: `STORY-106 — Owner Ocjene`. On the cap, stop and leave the PR to the batch skill.
