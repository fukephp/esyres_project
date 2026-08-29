# Answer key: SCAFFOLD-app-root

> App-root blocker (not an MVP story from `docs/mvp/07-Stories.md`).
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/SCAFFOLD-app-root.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | SCAFFOLD-app-root |
| Source | `/what-next` / `/story-loop` chat: app root placeholder. Layout: `.cursor/CONTEXT.md`, `AGENTS.md`. Stack: `docs/architecture/`. |
| Goal (one sentence) | Put a Laravel 13 + React TS PWA skeleton under `esyres_app/` with slim Docker Compose so later story-loops have a real verify runner. |
| Branch name | `story/SCAFFOLD-app-root` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-28 |

## Pass/fail — product

- [ ] Laravel lives at `esyres_app/` (`artisan`, `composer.json`); PHP `^8.3`; Laravel 13.x — verify: `docker compose run --rm php php artisan --version` (from `esyres_app/`) exits 0; `composer.json` `require.php` / `laravel/framework` 13.x
- [ ] PWA at `esyres_app/frontend/` is Vite + React + TypeScript + Tailwind; `engines.node` is 22; one throwaway screen only — verify: `package.json`; compose `npm run typecheck`, `npm run test`, `npm run build` in `/app/frontend`
- [ ] PWA has no React Router `/` `/owner` shells, no Apollo, no `vite-plugin-pwa` — verify: `esyres_app/frontend/package.json` and app entry (no those deps / route shells)
- [ ] `esyres_app/marketing/` remains a sibling (not under `public/`, not in the PWA bundle) and still builds — verify: `docker compose run --rm --workdir /app/marketing node npm run build` exits 0; marketing files still at `esyres_app/marketing/`
- [ ] No `backend/` or `frontend/` directories at the git root — verify: those paths absent at repo root
- [ ] Behat is installed; suite runs with zero GraphQL features — verify: `docker compose run --rm php vendor/bin/behat` exits 0; no GraphQL feature scenarios added
- [ ] Docs match the layout: CONTEXT no longer calls `esyres_app/` an empty placeholder; architecture 01 layout is `esyres_app/` (Laravel) + `esyres_app/frontend/` + `esyres_app/marketing/` + compose in `esyres_app/`; architecture 07 documents slim php+node now and the full service list as later; Cursor rule globs include `esyres_app/frontend/**` and Laravel paths under `esyres_app/` (not git-root `backend/` / `frontend/`) — verify: those files; grep leftover “empty placeholder until scaffolded” / git-root `backend/` layout in `docs/architecture/01-Overview-and-Stack.md`
- [ ] PWA placeholder is clearly throwaway, not Design 2 product chrome — verify: human-only: glance at the placeholder (no playbook desktop+mobile product shots required)

## Pass/fail — architecture

Cite `docs/architecture/01-Overview-and-Stack.md`, `03-Backend.md`, `04-Frontend.md`, `07-Docker-and-Local-Dev.md`, `08-Decisions.md`.

- [ ] Product SPA is `esyres_app/frontend/`, not Laravel `resources/js` / Inertia — verify: `esyres_app/frontend/package.json`; no Inertia package; `resources/js` is not the PWA
- [ ] Behat is the only backend gate; no Pest; stock PHPUnit example tests removed; do not document `php artisan test` or `composer test` as the gate — verify: no `pestphp`; no `tests/Feature/ExampleTest.php` / `tests/Unit/ExampleTest.php`; CONTEXT / `esyres_app` README verify list is the compose commands in this key
- [ ] Slim compose only: services `php` + `node`; no Sail; no nginx, mysql, redis, worker, reverb, mailpit this PR — verify: `esyres_app/docker-compose.yml`
- [ ] No Lighthouse, Sanctum, Reverb, Apollo, GraphQL codegen, or domain migrations/schema this PR — verify: `composer.json` / frontend `package.json`; no new GraphQL schema
- [ ] Stack not invented: not Next.js, two SPAs, or a git-root app — verify: git paths; packages

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Compose must mount this folder at `/app`. Every command must exit 0.

```text
docker compose run --rm php php artisan --version
docker compose run --rm php vendor/bin/behat
docker compose run --rm --workdir /app/frontend node npm run typecheck
docker compose run --rm --workdir /app/frontend node npm run test
docker compose run --rm --workdir /app/frontend node npm run build
docker compose run --rm --workdir /app/marketing node npm run build
```

## Out of scope

- Any MVP product story (discovery, booking, owner panel, chat, auth UX)
- Lighthouse, Sanctum, Reverb, Apollo, codegen, domain schema/migrations
- Full architecture-07 compose list (nginx, mysql, redis, worker, reverb, vite, mailpit); Laravel Sail
- React Router customer/owner shells, `vite-plugin-pwa`, product PWA screens, i18next
- Playwright
- Native apps, payments, worker logins, Pest, Inertia, Next.js, Storybook, map SDKs
- Staging host, secrets, `deploy-staging`
- Moving marketing into `public/` or the SPA bundle

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `AGENTS.md`, and `docs/architecture/` (01, 03, 04, 07, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. This is turn-by-turn **scaffold** (creates the verify runner); do not expand into product stories.
2. Branch: `story/SCAFFOLD-app-root`.
3. **Preserve `esyres_app/marketing/`.** `composer create-project` / `laravel new` into a folder that already has `marketing/` will fight you — scaffold Laravel in a temp dir (or equivalent) and merge into `esyres_app/` without deleting or relocating marketing. Keep marketing out of `public/` and out of the PWA.
4. Laravel 13 at `esyres_app/` (`artisan`, `app/`, `composer.json`). PHP `^8.3`. `APP_TIMEZONE=Europe/Sarajevo` in `.env.example`. Product PWA is **not** `resources/js`.
5. Add `esyres_app/frontend/`: Vite + React + TypeScript + Tailwind. `engines.node`: `"22"`. Scripts: `typecheck`, `test` (Vitest, one trivial placeholder), `build`. One throwaway screen. No React Router shells, Apollo, or `vite-plugin-pwa`.
6. Install Behat (`vendor/bin/behat` from `esyres_app/`). English Gherkin later; this PR: configured suite, **zero GraphQL features**. Remove Laravel stock PHPUnit example tests. Do not add Pest. Do not tell agents to run `php artisan test`.
7. Slim `esyres_app/docker-compose.yml` (+ Dockerfiles as needed): service `php` (PHP 8.3, composer, extensions Laravel needs to boot `artisan`) and `node` (Node 22). Volume: `esyres_app` → `/app`. Not Sail. Not the full 07 service list. Document that nginx/mysql/redis/reverb/mailpit come later.
8. Gitignore: merge Laravel’s ignore with the repo so `vendor/` and `node_modules/` stay untracked; do not ignore `esyres_app/marketing/` source. Do not commit `.env` or secrets.
9. Docs (git root): update `.cursor/CONTEXT.md` (app root is scaffolded; name these verify commands; compose is slim, full list later). Patch `docs/architecture/01-Overview-and-Stack.md` planned layout (no git-root `backend/`/`frontend/`). Patch `07-Docker-and-Local-Dev.md` (slim compose exists; full list still the target). Add a short bullet on `08-Decisions.md` for `esyres_app/` layout if 01’s old layout was treated as locked. Update `.cursor/rules/frontend/` globs to `esyres_app/frontend/**` and `.cursor/rules/backend/` globs to Laravel under `esyres_app/` (exclude `marketing/` and `frontend/`). Short `esyres_app` README: how to run the six verify commands.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate. If Docker Desktop is missing, draft/blocked PR — do not switch to host PHP.
11. On success: PR linking this key; list commands run. **Not a product UI story** — skip playbook desktop+mobile screenshots. Do not commit shot files.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
