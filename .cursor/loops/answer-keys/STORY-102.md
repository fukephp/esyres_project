# Answer key: STORY-102

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-102 |
| Source | `docs/stories/STORY-102.md` — Favorite salon |
| Goal (one sentence) | A logged-in customer can bookmark a salon from its page and see that list on `/my-profile`. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (list order and empty copy assumed) |

## Pass/fail — product

- [ ] Logged-in `/salon/:id` shows **Sačuvaj** or **Sačuvano**. A guest does not — verify: Vitest `favoriteSalon.source.test.ts`
- [ ] `saveFavorite` inserts one `favorites` row. `unsaveFavorite` deletes that row and leaves `qr_scans` — verify: Behat `features/guest/favorite_salon.feature`
- [ ] Unverified customer can save (no email or phone gate) — verify: Behat
- [ ] QR reconnect still creates a favorite — verify: existing QR Behat still passes
- [ ] `/my-profile` lists **Omiljeni saloni** by salon name A–Z, each name links to `/salon/:id`, and Sačuvano unsaves. Empty copy `Nema omiljenih salona.` — verify: Vitest `favoriteSalon.source.test.ts` and Behat for order

## Pass/fail — architecture

- [ ] Reuse the `favorites` table. No worker or service bookmark table — verify: diff has no new favorites-like table

## Verify commands

Classifier fails (PHP). Full Behat from `esyres_app/`, then vite typecheck, test, build.

## Out of scope

- Discovery hearts, worker or service bookmarks, Predloženi saloni

## Implementer instructions

1. Read this key. Mutations toggle the existing pivot.
2. Loop: implement → classifier → Behat verify. Cap 8. Same failure twice ends this story.
3. Commit on the batch branch when verify exits 0. Message: `STORY-102 — Favorite salon`. On the cap, stop and leave the PR to the batch skill.
