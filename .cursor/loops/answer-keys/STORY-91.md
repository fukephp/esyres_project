# Answer key: STORY-91

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-91 |
| Source | `docs/stories/STORY-91.md` — Assign worker |
| Goal (one sentence) | Tapping a free worker confirms a no-preference request that already has a time, and the guest is not asked. |
| Branch name | `batch/STORY-90-91-92-93-94` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] `assignWorker(bookingId, workerId)` on a `requested` row with a preferred start and no worker sets `confirmed`, that `worker_id`, and `owner_responded_at` when it was null. It does not set `time_proposed`. A second action does not restamp — verify: Behat `features/owner/assign_worker.feature`
- [ ] A worker who overlaps a `confirmed` or `time_proposed` range is rejected `SLOT_TAKEN`, status stays `requested`, and `owner_responded_at` stays null. Hours and breaks are not checked. A past preferred time can still be assigned — verify: Behat `features/owner/assign_worker.feature`
- [ ] Already confirmed, not `requested`, another salon, a guest, or an unverified owner is rejected. A named-worker row is not assignable (`WORKER_NAMED` or the existing accept path only) — verify: Behat `features/owner/assign_worker.feature`
- [ ] Zahtjevi pending card (both Prikaz) and Request Detail form render a button per free worker name, before Predloži, calling `assignWorker`. No buttons when the start is missing, the worker is already named, or none are free. Zapisi `BookingCard` has no assign buttons — verify: Vitest `owner.test.ts` (`freeWorkers`) and `ownerPanel.source.test.ts`
- [ ] A successful assign in the open modal refetches and does not navigate. `SLOT_TAKEN` uses `owner.acceptError.SLOT_TAKEN` and leaves the card in place — verify: Vitest `ownerPanel.source.test.ts`

## Pass/fail — architecture

Cite `docs/adr/0044-assign-worker-confirms.md` and `docs/architecture/08-Decisions.md` #53. Overlap stays `WorkerOverlap`.

- [ ] One GraphQL mutation. No new npm package. No REST — verify: `graphql/schema.graphql` has `assignWorker`; `package.json` deps unchanged
- [ ] Classifier fails (PHP), so Behat runs — verify: CONTEXT classifier at verify time

## Verify commands

Same classifier and command sets as STORY-90. Expected: **Behat runs.**

## Out of scope

- Day-only requests
- Hours or break checks
- Push, SMS, or email beyond the existing confirmed push
- Worker logins
- Changing Predloži

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-91.md`, and `docs/adr/0044-assign-worker-confirms.md`.
2. Stay on `batch/STORY-90-91-92-93-94`.
3. Add `AssignWorker` by copying the accept transaction. Require `worker_id` null and `preferred_starts_at` not null. Set the chosen worker, then the same overlap check and confirm stamp. Reuse `CustomerStatus::send(..., 'confirmed')`.
4. `freeWorkers` in `owner.ts` uses the same overlap as `occupyingBlock` (confirmed worker or proposed worker, range overlap, past allowed, hours ignored). Wire taps on the pending card and the detail form only.
5. Behat feature plus the Vitest checks above. Set Loop to `STORY-91` on the story and the index.
6. On verify exit 0: commit. Message is the `# STORY-91 — …` line. Do not open a PR.
7. On the cap or a repeated failure: restore this branch to the last commit, including untracked files this story added.
