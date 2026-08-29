# Story map: SCAFFOLD-app-root

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.

## Meta

| Field | Value |
|-------|--------|
| Story ID | SCAFFOLD-app-root |
| Source | `/what-next` blocker + `/story-loop` chat: app root placeholder. Not an MVP story from `docs/mvp/07-Stories.md`. Product/layout: `.cursor/CONTEXT.md`, `AGENTS.md`. Stack: `docs/architecture/`. Stale layout in `docs/architecture/01-Overview-and-Stack.md` (`backend/` + `frontend/` at git root). |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/SCAFFOLD-app-root.md` |

## Destination

Laravel + one React TypeScript PWA live under `esyres_app/` (not git-root `backend/` / `frontend/`). Existing `esyres_app/marketing/` stays a sibling under that Laravel root. Architecture docs match the new paths. A local verify runner exists so later story-loops can code.

## Notes

- Consult: `.cursor/CONTEXT.md`, `AGENTS.md`, `docs/architecture/`, `docs/mvp/` (scope only — this is not a product epic)
- Skills: grill-me (no app code yet); playbook: scaffolding is turn-by-turn, not a coding loop until verify exists
- Coding story-loops stay blocked until this lands + named verify commands exit 0
- Standing preferences for this effort:
  - Do not invent a second stack
  - Preserve Design 1 marketing; keep it out of `public/` and the PWA bundle
  - Patch stale `backend/`/`frontend/` at git root in architecture when layout locks

## Decisions so far

- Application code lives in `esyres_app/`, not at the git root. No `backend/` or `frontend/` at repo root.
- `esyres_app/marketing/` stays Design 1 (Vite + HTML/CSS); sibling under the Laravel root; not under `public/`; not in the PWA bundle.
- Locked stack (target; later PRs): Laravel + Lighthouse GraphQL + MySQL + Redis + Reverb; one React TypeScript PWA (Vite); Sanctum cookies; same origin via Nginx. This PR’s compose is slim only (see Docker).
- Not Inertia, not Next.js, not two SPAs, not Pest / parallel PHPUnit. Behat is the backend gate once Laravel exists (`vendor/bin/behat` from `esyres_app/`).
- Docs, `.cursor/`, and `AGENTS.md` stay at the git root. Do not put docs/rules/skills inside `esyres_app/`.
- **In-folder layout:** Laravel *is* `esyres_app/` (`composer.json`, `artisan`, `app/` there). PWA at `esyres_app/frontend/`. Marketing stays `esyres_app/marketing/`. Patch `docs/architecture/01-Overview-and-Stack.md` (and other stale git-root `backend/` / `frontend/` paths) to match. Cursor rule globs: frontend rules → `esyres_app/frontend/**`; backend rules → Laravel paths under `esyres_app/` excluding `marketing/` and `frontend/`.
- **Slice of this PR:** skeleton — Laravel + Vite React TS PWA + Behat + slim Compose (`php` + `node`) + path docs. Defer Lighthouse, Sanctum, Reverb, Apollo, codegen, domain schema, product screens, full architecture-07 service list.
- Laravel’s bundled `resources/js` / default Vite is **not** the product PWA. SPA lives only in `esyres_app/frontend/`.
- **PWA emptiness:** Vite + React + TypeScript + Tailwind placeholder only. One throwaway screen so build/typecheck can fail. No React Router `/` `/owner` shells, no Apollo, no `vite-plugin-pwa` this PR.
- **Versions:** Laravel 13 (`laravel/laravel` current 13.x), PHP `^8.3`, PWA Node **22** (`engines`). Do not pin patch versions in the key.
- **Docker this PR:** `esyres_app/docker-compose.yml`. Slim services: `php` (8.3, composer, artisan, Behat) + `node` (22, frontend + marketing). Verify via `docker compose run` from `esyres_app/`. Not Sail. Not host-only PHP. Patch `docs/architecture/07-Docker-and-Local-Dev.md`: skeleton compose exists (php+node); full list (nginx, mysql, redis, worker, reverb, vite, mailpit) is still the target, not this PR.
- **First verify commands:** from `esyres_app/`: `docker compose run --rm php php artisan --version`; `docker compose run --rm php vendor/bin/behat`; `docker compose run --rm --workdir /app/frontend node npm run typecheck|test|build`; `docker compose run --rm --workdir /app/marketing node npm run build`. Compose mount `esyres_app` at `/app`. Empty Behat (no GraphQL features). Delete stock PHPUnit examples. No Playwright. Lint only if the Vite template already ships it.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Any MVP product story (discovery, booking, owner panel, chat, auth UX)
- Lighthouse, Sanctum, Reverb, Apollo, codegen, domain schema/migrations
- Full architecture-07 compose list (nginx, mysql, redis, worker, reverb, vite, mailpit); Laravel Sail
- React Router customer/owner shells, `vite-plugin-pwa`, product PWA screens
- Native apps, payments, worker logins, Pest, Inertia, Next.js, Storybook, map SDKs
- Staging host, secrets, `deploy-staging` pipeline
- Moving marketing into `public/` or the SPA bundle
- Unattended whole-MVP gauntlet
