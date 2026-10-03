# Answer key: STORY-103

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-103 |
| Source | `docs/stories/STORY-103.md` — Suggested salons |
| Goal (one sentence) | `/my-profile` shows up to three listed salons that share a migrate-only chip with the customer’s bookings. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (discovery row) |

## Pass/fail — product

- [ ] `suggestedSalons` returns at most 3 listed salons, name A–Z, whose service category legacy key is `HAIR`, `MAKE_UP`, or `MASSAGE` and matches a service on any of the customer’s bookings — verify: Behat `features/guest/suggested_salons.feature`
- [ ] A favorited salon and a salon with a live booking (`requested`, `time_proposed`, `confirmed`) are omitted. An owner-typed category with a null legacy key adds nothing. Zero matches returns an empty list — verify: Behat
- [ ] The profile renders **Predloženi saloni** only when the list is non-empty. Each row shows name, today’s busy, category names, and address when set, and the name links to `/salon/:id` — verify: Vitest `suggestedSalons.source.test.ts`
- [ ] `/salons` and `/` do not render that heading — verify: Vitest `suggestedSalons.source.test.ts`

## Pass/fail — architecture

- [ ] Match is the legacy key only. No new taxonomy table — verify: diff review

## Verify commands

Classifier fails (PHP). Full Behat from `esyres_app/`, then vite typecheck, test, build.

## Out of scope

- A recommendation model, name-matching categories, an empty heading

## Implementer instructions

1. Read this key. Query listed salons only.
2. Loop: implement → classifier → Behat verify. Cap 8. Same failure twice ends this story.
3. Commit on the batch branch when verify exits 0. Message: `STORY-103 — Suggested salons`. On the cap, stop and leave the PR to the batch skill.
