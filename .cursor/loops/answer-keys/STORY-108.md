# Answer key: STORY-108

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-108 |
| Source | `docs/stories/STORY-108.md` — Customer bounce from owner routes |
| Goal (one sentence) | A logged-in non-owner on any `/owner*` route is silently sent back (history back, else `/`) without ever seeing OwnerShell, its ghost, an owner skeleton, or a "not an owner" page. |
| Branch name | `story/STORY-108-customer-bounce` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-04 |

## Decisions (sharp-path grill)

1. **Seam:** one `OwnerGate` component wraps every owner route inside the existing `owner()` helper in `App.tsx` (outside the `Suspense`), so the gate runs before the lazy chunk and before any page or route-preset skeleton. Pages do not each re-implement the bounce.
2. **Gate reads `ME_QUERY`** through Apollo (same cache the pages use). States:
   - no `me` data yet (cold load): render only `<div className="min-h-svh bg-page" />`. No ghost OwnerShell, no skeleton.
   - `me === null` (logged out): render the page as today (Panel AuthShell). After auth the page's refetch updates the shared cache and the gate re-evaluates.
   - `me` set and `!isOwnerMe(me)`: bounce (verified or not), render the plain background meanwhile.
   - `me` set and owner: render `Suspense` + page exactly as today (ghost OwnerShell + per-route preset; unverified owner still gets the Panel email-verify panel).
   - Cached `me` (in-app navigation) decides on the first render with no blank frame.
3. **Bounce target:** pure helper `ownerBounce(historyIdx)` in `lib/` returns `back` when React Router's `window.history.state?.idx` is a number `> 0`, else `home`. `back` → `navigate(-1)`; `home` → `navigate('/', { replace: true })`. Run once per mount (guard against double effect in StrictMode).
4. **Removed branches:** each page's `notOwner` block (and any **Napravi salon** link inside it) is deleted. Where TypeScript still needs the `salon === null` / `firstOwnedId === ''` / `salons.length === 0` narrowing, that branch returns `null`. `owner.notOwner` is removed from `i18n.ts`.

## Pass/fail — product

- [ ] `ownerBounce` returns `back` for `idx` 1+ and `home` for `idx` 0, `undefined`, `null`, or a non-number — verify: vitest unit test
- [ ] Every `/owner*` route in `App.tsx` (`/owner`, `/owner/chats`, `/owner/stats`, `/owner/requests/:id`, `/owner/salons`, `/owner/salons/create`, `/owner/salons/:id`, `/owner/settings`, `/owner/zapisi`, `/owner/phone`) goes through `owner()`, and `owner()` wraps the `Suspense` in `OwnerGate` — verify: vitest source test on `App.tsx`
- [ ] `OwnerGate` renders only a `bg-page` div while `me` is unknown, bounces when `me` is set and `!isOwnerMe(me)` (no `emailVerified` check on that path), and renders children when `me` is null or an owner — verify: vitest source test on `OwnerGate`
- [ ] Bounce uses `navigate(-1)` for `back` and `navigate('/', { replace: true })` for `home`; no toast or message rendered — verify: vitest source test on `OwnerGate`
- [ ] No owner page and no `i18n.ts` contains `notOwner`; existing source tests that asserted `owner.notOwner` now assert its absence — verify: vitest source tests (`ownerSalons`, `ownerSettings`, `zapisi` + a repo-wide scan of `src/pages/Owner*.tsx` and `i18n.ts`)
- [ ] `/create-salon` route and the homepage Panel CTA (`ownerPanelCta`) are unchanged — verify: existing vitest (`homepage.test.ts`, `createSalon` tests) stay green
- [ ] Customer logs in via Panel AuthShell on an owner route and is bounced; owner logs in there and stays — verify: human-only: at merge, log in as a customer and as an owner on `/owner/stats`

## Pass/fail — architecture

- [ ] One React TypeScript PWA; no new routing or state library (`docs/architecture/04-Frontend.md`)
- [ ] No GraphQL schema, Laravel, or server-guard change; frontend-only diff (`docs/architecture/09-Api-Boundaries.md`)

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `main...HEAD`; repo default branch is `master` — use `master...HEAD` / `origin/master` when `main` is missing). Skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`. Do not skip Behat from a story label.

**If skipped** — from `esyres_app/frontend/` (host npm; `docker compose exec -T vite` only if that container is already up). Do not `compose up` or run `php artisan --version`.

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** (classifier fails, or the human asked for Behat / `--suite`) — from `esyres_app/`:

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Server-side route guards or GraphQL authorization changes
- Any customer-facing explanation of the owner panel
- Changes to the `/my-profile` owner redirect (STORY-107)
- Changing owner loading for owners (ghost OwnerShell + presets stay as-is once `me` is known)
- `/create-salon` and homepage Panel CTA behavior

## Implementer instructions

1. Read this answer key and `.cursor/CONTEXT.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md` for product constraints.
2. Implement **only** what this key requires. Do not expand scope or invent stack.
3. Loop: implement → run the CONTEXT frontend-only classifier → run the matching verify commands → fix failures. Count each full implement→verify as one cycle.
4. Stop when all named-verifier product checks, architecture checks, and verify commands pass, **or** when the iteration cap is hit, **or** when the same failure repeats twice with no progress. Human-only checks are for the human at PR review.
5. On success: open a PR whose body links this answer key and lists what was verified. Do not embed screenshots.
6. On escalate: open a draft/blocked PR with failing checks, last command output summary, and the decision needed from a human.
7. Do not mark the PR ready for merge solely because you believe the work is done — machine gates must pass.
8. After PR: trivial Bugbot nits on the same PR (do not burn the cap). If Bugbot contradicts this key, stop and ask.
