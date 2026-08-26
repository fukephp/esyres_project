# Agent instructions

This git root is the Cursor/docs workspace. Application code lives in `esyres_app/`.

## Layout

- `esyres_app/` — Laravel + PWA (all app commands run here)
- `docs/` — product (`docs/mvp/`) and architecture (`docs/architecture/`); lazy `docs/glossary.md` and `docs/adr/` from grill-with-docs
- `.cursor/` — rules, skills, commands, hooks
- `AGENTS.md` — this file

Do not put application code in the git root. Do not put docs, rules, or skills inside `esyres_app/`.

## Working directory

- Application commands (`composer`, `php artisan`, `npm`, `docker compose`, tests): run from `esyres_app/`.
- Git, and edits to `docs/` / `.cursor/` / this file: run from the git root.

## Product and architecture

Read `.cursor/CONTEXT.md`. Prefer `docs/mvp/` and `docs/architecture/` over inventing behavior or stack.

## Plans and designs

- **grill-me** — until `esyres_app/` has real code, or a throwaway interview; writes nothing
- **grill-with-docs** (`/grill-with-docs`) — once application code exists; writes `docs/glossary.md` and `docs/adr/`. Do not treat `.cursor/CONTEXT.md` as a glossary. If an ADR changes a locked stack choice, also update `docs/architecture/08-Decisions.md`.
