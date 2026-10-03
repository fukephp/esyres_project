# Answer key: STORY-105

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-105 |
| Source | `docs/stories/STORY-105.md` — Rating replies |
| Goal (one sentence) | Another logged-in customer can leave one replaceable reply under a non-empty comment. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (name and text) |

## Pass/fail — product

- [ ] `replyToRating` inserts one reply per other customer under a rating that has a non-empty comment. Author and an owner of that salon are rejected. A rating with an empty comment is rejected — verify: Behat `features/guest/rating_reply.feature`
- [ ] A second call replaces the body. No delete. Body over 500 characters is rejected. Gates match cancel — verify: Behat
- [ ] Clearing the comment leaves the reply row — verify: Behat
- [ ] The salon row shows the replier’s person name and the text, and not the email — verify: Vitest `ratingReply.source.test.ts`
- [ ] Moji zahtjevi has no reply box — verify: Vitest `ratingReply.source.test.ts`

## Pass/fail — architecture

- [ ] Replies are a child of the rating, not a thread table of many rows per user — verify: unique (rating, user) on `rating_replies`

## Verify commands

Classifier fails (PHP). Full Behat from `esyres_app/`, then vite typecheck, test, build.

## Out of scope

- Threads, author replies, owner replies, owner Ocjene

## Implementer instructions

1. Read this key.
2. Loop: implement → classifier → Behat verify. Cap 8. Same failure twice ends this story.
3. Commit on the batch branch when verify exits 0. Message: `STORY-105 — Rating replies`. On the cap, stop and leave the PR to the batch skill.
