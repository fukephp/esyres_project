# Answer key: STORY-94

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-94 |
| Source | `docs/stories/STORY-94.md` — Hide Chat |
| Goal (one sentence) | A Postavke Chat switch, default off, hides the Chat tab until the owner turns it on. |
| Branch name | `batch/STORY-90-91-92-93-94` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] `users.chat_enabled` is a non-null boolean, default false, including existing rows. `User.chatEnabled` and `updateChatEnabled(enabled: Boolean!)` persist it. A guest is `UNAUTHENTICATED`. A customer with no salon may set it — verify: Behat `features/owner/chat_enabled.feature`
- [ ] Postavke Prikaz card has a `Chat` switch under the radios. It saves on change. A failed save keeps the previous checked state and shows `Chat nije sačuvan. Pokušaj ponovo.` — verify: Vitest `ownerPanel.source.test.ts` or `settings` source test
- [ ] `OwnerNav` omits the chats item when `chatEnabled` is false. Other items keep their order. Phone tabs use the remaining count, not a fixed 5. The loading ghost always renders 5 rail icons and 4 phone icons (Chat omitted) — verify: Vitest `skeleton.source.test.ts` and a nav source test
- [ ] `/owner/chats` while the flag is off redirects to Zahtjevi for the salon already in context (`ownerQueuePath`). On matches today’s chats page. Stored threads are untouched — verify: Vitest source assert on `OwnerChats.tsx` and Behat does not delete intakes
- [ ] Request Detail still renders the transcript block. Salon profile still has no Pitaj salon — verify: existing `salonProfile.source.test.ts` stays green; detail source test still matches `owner.transcript`

## Pass/fail — architecture

Cite `docs/architecture/05-Data-Model.md`. The flag is on the person, not the salon.

- [ ] Column on `users`. No new npm package. No chat deletion — verify: migration; no `delete` of intakes in the mutation
- [ ] Classifier fails (PHP), so Behat runs — verify: CONTEXT classifier at verify time

## Verify commands

Same classifier and command sets as STORY-90. Expected: **Behat runs.**

## Out of scope

- Deleting chats or the assistant API
- Take-over, DND, or after-hours rules
- A per-salon switch

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, and `docs/stories/STORY-94.md`.
2. Stay on `batch/STORY-90-91-92-93-94`.
3. Add the column and mutation the same way as `updateOwnerView`. Pass `chatEnabled` into `OwnerNav`. Ghost counts drop by one with no localStorage key.
4. Redirect in `OwnerChats` when `me.chatEnabled` is false. Update the User bullet in `docs/architecture/05-Data-Model.md`.
5. Behat plus Vitest. Set Loop to `STORY-94` on the story and the index.
6. On verify exit 0: commit. Message is the `# STORY-94 — …` line. Do not open a PR.
7. On the cap or a repeated failure: restore this branch to the last commit, including untracked files this story added.
