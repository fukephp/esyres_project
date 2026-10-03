# Answer key: STORY-104

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-104 |
| Source | `docs/stories/STORY-104.md` — Salon rating |
| Goal (one sentence) | One replaceable 1–5 and optional comment per customer per salon, shown as a mean to guests and as rows to logged-in customers. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (mean, form, rows) |

## Pass/fail — product

- [ ] `rateSalon` upserts one row per customer+salon. Score outside 1–5 is rejected. Comment over 500 characters is rejected. A second call replaces score and comment — verify: Behat `features/guest/salon_rating.feature`
- [ ] Unverified email or phone is rejected the same way cancel is. `APP_ENV=local` skips that gate. An owner of the salon is rejected — verify: Behat
- [ ] There is no delete mutation — verify: schema diff has no `deleteRating`
- [ ] Guest salon payload is mean to one decimal, count, and nothing else. Zero ratings omit the block — verify: Behat and Vitest `salonRating.source.test.ts`
- [ ] Logged-in payload adds rows: person name, score, comment, Sarajevo day, newest first, no email, worker, or service names. UI order is mean, then the form when they may rate, then the rows — verify: Vitest `salonRating.source.test.ts`
- [ ] The block is after Usluge. The `md+` aside stays empty. Stars use `#2F6FED` — verify: Vitest `salonRating.source.test.ts`
- [ ] `/my-profile` **Moje ocjene** lists salon name, score, comment, and a link. Empty copy `Nema ocjena.` — verify: Vitest `salonRating.source.test.ts`
- [ ] Moji zahtjevi, `/salons`, and `/` have no stars — verify: Vitest `salonRating.source.test.ts`

## Pass/fail — architecture

- [ ] One `salon_ratings` table (user, salon, score, comment, timestamps). Unique user+salon — verify: migration + Behat
- [ ] No push, SMS, or email on rate — verify: diff has no notification class for ratings

## Verify commands

Classifier fails (PHP). Full Behat from `esyres_app/`, then vite typecheck, test, build.

## Out of scope

- Replies, owner Ocjene, worker scores, discovery stars

## Implementer instructions

1. Read this key and ADR 0048.
2. Loop: implement → classifier → Behat verify. Cap 8. Same failure twice ends this story.
3. Commit on the batch branch when verify exits 0. Message: `STORY-104 — Salon rating`. On the cap, stop and leave the PR to the batch skill.
