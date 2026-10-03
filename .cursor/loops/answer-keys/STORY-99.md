# Answer key: STORY-99

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-99 |
| Source | `docs/stories/STORY-99.md` — Customer card system |
| Goal (one sentence) | Customer routes `/`, `/salons`, `/salon/:id`, and `/bookings` use the card pack; owner routes and `/create-salon` stay Design 2. |
| Branch name | `batch/STORY-99-100-101-102-103-104-105-106` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-03 (grill; top-nav canvas assumed) |

## Pass/fail — product

- [ ] Customer page canvas is `#E8EEF3`, cards `#FFFFFF` with radius 20px and the named shadow, ink `#14181F`, muted `#5C6770`, line `#E3E7EB`, Inter on `/`, `/salons`, `/salon/:id`, `/bookings` — verify: Vitest `customerCard.source.test.ts`
- [ ] Primary pills on those routes stay black with a white label. Odjava stays `error-strong`, white label, `rounded-full` — verify: Vitest `customerCard.source.test.ts`
- [ ] Homepage still renders Kako radi, Za goste, Za salone, Popularno u Sarajevu, FAQ, and the dark footer — verify: existing homepage tests
- [ ] `/owner` and `/create-salon` still use Design 2 cream/owner shell classes, not the card canvas — verify: Vitest `customerCard.source.test.ts`
- [ ] AuthShell markup is unchanged — verify: existing `authBox.source.test.ts`
- [ ] No Profil link, no Sačuvaj, no rating block — verify: Vitest `customerCard.source.test.ts`
- [ ] Card chrome on a customer route — verify: human-only: merge visual review (UI ready rule)

## Pass/fail — architecture

- [ ] No new backend, no new route, no new npm package other than Inter if it is not already installed — verify: `git diff --name-only` has no `esyres_app/app` or `graphql` paths

## Verify commands

Classifier first. This story is frontend-only unless a non-frontend path appears.

**If skipped** — from `esyres_app/frontend/`:

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** — from `esyres_app/`:

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- `/my-profile`, favorites, suggestions, ratings, owner shell, AuthShell redesign

## Implementer instructions

1. Read this key and `.cursor/CONTEXT.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Implement only this key. Card tokens on the four customer routes. Owner and `/create-salon` stay Design 2.
3. Loop: implement → classifier → matching verify. Cap 8. The same failure twice ends this story.
4. Commit on `batch/STORY-99-100-101-102-103-104-105-106` when verify exits 0. Message: `STORY-99 — Customer card system`. On the cap, stop this story and leave the PR to the batch skill.
