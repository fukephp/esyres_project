# Agent instructions

This git root is the Cursor/docs workspace. Application code lives in `esyres_app/`.

## Layout

- `esyres_app/` — Laravel + PWA (all app commands run here)
- `esyres_app/frontend/` — product PWA (Vite + React + TypeScript). Company pitch on typed `/`, then discovery.
- `docs/` — product (`docs/mvp/`) and architecture (`docs/architecture/`); lazy `docs/glossary.md` and `docs/adr/` from domain-modeling (via grill-with-docs)
- `.cursor/` — rules, skills, commands, hooks
- `AGENTS.md` — this file

Do not put application code in the git root. Do not put docs, rules, or skills inside `esyres_app/`. Do not scaffold a sibling `marketing/` site.

## Working directory

- Application commands (`composer`, `php artisan`, `npm`, `docker compose`, Behat): run from `esyres_app/`.
- Product PWA (`npm run dev` / `build` / `test`): run from `esyres_app/frontend/` (or `docker compose exec -T vite …` after `up -d`). Frontend-only verify (CONTEXT classifier) is host npm here — no php/mysql.
- Git, and edits to `docs/` / `.cursor/` / this file: run from the git root.

## Product and architecture

Read `.cursor/CONTEXT.md`. Prefer `docs/mvp/` and `docs/architecture/` over inventing behavior or stack.

## Plans and designs

Before locking a plan or design, prefer **grilling** over guessing:

- **grilling** — default interview engine (rounds/frontier); auto before locking a plan
- **grill-me** (`/grill-me`) — user-invoked; persist at end of topic
- **grill-with-docs** (`/grill-with-docs`) — against the codebase; glossary + ADRs as they lock via domain-modeling; product/stories end-batch. Do not treat `.cursor/CONTEXT.md` as a glossary. If an ADR changes a locked stack choice, also update `docs/architecture/08-Decisions.md`.
- **new-story** (`/new-story`) — grill one incremental product story; persist always writes `STORY-xx` (no diverge; existing epic only)
