---
name: sync-framework
description: >-
  Propagate allowlisted Cursor defaults from esy_framework into one sibling
  project under Projects. Use when the user says sync framework, propagate
  framework, or /sync-framework. Does not invent product or app code.
---

# Sync framework

Copy **allowlisted** Cursor/docs defaults from the canonical **esy_framework** repo into **one** already-scaffolded sibling project. This is not “improve framework” (edit `esy_framework` for that). Sync only **propagates** after those edits exist.

## Canonical source

Always use the **esy_framework** repo as the sync source (this git root when you are working inside it).

Do **not** sync from a previously scaffolded project. If you cannot locate the framework repo, stop and ask.

## Inputs

1. Require **exactly one** project folder name (e.g. `esyres_project`). No sync-all; no multi-name lists.
2. If the user did not give a name, ask for it before copying.
3. Validate: non-empty; only letters, numbers, `_`, `-`. Reject path separators and `..`.
4. Target path: sibling folder next to the framework repo (`../<name>`).

## Preconditions

1. Confirm you are operating from `esy_framework` (or can resolve its absolute path as the source).
2. Target must exist and look like a Cursor/docs project (at least `.cursor/` present). If missing → **refuse**.
3. Do not invent a different allowlist mid-run.

## Allowlist (overwrite from framework)

Copy these paths from source → target (create parents as needed; **overwrite** existing files):

| Source path | Notes |
|-------------|--------|
| `.cursor/skills/` | Entire tree (recursive) |
| `.cursor/commands/` | Entire tree (recursive) |
| `.cursor/rules/` | Entire tree (recursive) |
| `.cursor/hooks/` | Hook scripts |
| `.cursor/hooks.json` | Hooks wiring |
| `.cursor/loops/PLAYBOOK.md` | |
| `.cursor/loops/MAP_TEMPLATE.md` | |
| `.cursor/loops/ANSWER_KEY_TEMPLATE.md` | |
| `.cursor/loops/maps/README.md` | README only |
| `.cursor/loops/answer-keys/README.md` | README only |

## Never touch

Do **not** copy, overwrite, or delete:

- `.cursor/CONTEXT.md`
- `docs/mvp/`, `docs/architecture/`, `docs/stories/`, `docs/glossary.md`, `docs/adr/`, other product docs
- `.cursor/loops/maps/*` story maps (except the README above)
- `.cursor/loops/answer-keys/*` story keys (except the README above)
- `refs/`, application code, `.git/`
- Target root `AGENTS.md`, `README.md` (v1 omit — projects may customize)
- `.cursor/plans/`

## Behavior

1. Validate name; resolve source and target absolute paths.
2. Refuse if target missing or has no `.cursor/`.
3. Overwrite every allowlisted path from source → target **without** a second confirm (the named project is the confirm).
4. **Copy technique (critical):** for directories that already exist on the target, sync **contents into** the destination (e.g. `robocopy <srcDir> <dstDir> /E`, or copy `srcDir\*` into `dstDir`). Do **not** `Copy-Item` the source folder onto an existing same-named folder — that nests as `skills/skills`, `commands/commands`, etc.
5. **Do not delete** files that exist only on the target outside this copy set (additive + overwrite only).
6. Print a short **summary** of paths copied (list allowlist entries that were written).
7. Stop. Do not start grill-me, story-loop, or commits unless the user asks.

## Out of scope

- Full-tree overwrite of a project
- Syncing filled CONTEXT, product docs, or per-story maps/keys
- A committed `scripts/sync-framework.*`
- Syncing root `AGENTS.md` / `README.md` into the target (v1)
