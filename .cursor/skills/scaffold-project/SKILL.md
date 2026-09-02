---
name: scaffold-project
description: >-
  Scaffold a new Cursor/docs project by copying the esy_framework layout into a
  sibling folder under Projects. Use when the user says scaffold project, new
  project from framework, bootstrap from esy_framework, or /scaffold-project.
  Does not generate application or stack code.
---

# Scaffold project

Copy the canonical Cursor AI framework layout into a new sibling project. Stop before inventing product or stack. Hand off to **grilling** / `/grill-me` after the user opens the new workspace.

## Canonical template

Always use the **esy_framework** repo as the template source (this git root when you are working inside it).

Do **not** use a previously scaffolded project as the template source (even if this skill was copied there). If you cannot locate the framework repo, stop and ask.

## Inputs

1. Require **one** project folder name (e.g. `my_app`, `esyres_v2`).
2. If the user did not give a name, ask for it before copying.
3. Validate: non-empty; only letters, numbers, `_`, `-`. Reject path separators and `..`.
4. Target path: a **sibling** folder next to the framework repo (`../<name>`).

## Conflicts

- If the target exists and is non-empty, or already has `.cursor/`, **refuse**.
- Overwrite only if the user **explicitly** says overwrite in chat. Otherwise stop.

## Copy set

Copy the full framework tree into the target **except**:

- `.git/` (do not copy history)
- `.cursor/plans/` (local noise)

Keep: skills (including grilling, grill-me, grill-with-docs, domain-modeling, story-loop, scaffold-project, sync-framework), `.cursor/loops/`, hooks, commands, rules, docs stubs, `refs/.gitkeep`, `AGENTS.md`, `DESIGN.md`, `README.md`, `.gitignore`, and this skill/command.

## Steps (agent executes — no committed script)

1. Confirm template path exists.
2. Validate name; compute target path.
3. Refuse on conflict unless explicit overwrite.
4. Copy tree (e.g. PowerShell `Copy-Item -Recurse`, or robocopy), excluding `.git` and `.cursor/plans`.
5. In the target: `git init` (new history only).
6. Tweak target `README.md` title/first heading to the new project name. Leave `.cursor/CONTEXT.md` as the fill-in template — do not invent product/architecture docs.
7. Verify:
   - Root files present (`AGENTS.md`, `DESIGN.md`, `README.md`, `.gitignore`, `.cursor/CONTEXT.md`)
   - `.git` exists and is new
   - `.cursor/plans` was not copied (or is absent/empty)
8. Reply with the new path and: open that folder as the Cursor workspace, then run **grilling** / `/grill-me` (a finished product grill persists `docs/mvp/` and `docs/stories/STORY-xx.md`).
9. Do **not** start grilling automatically while still in `esy_framework`.
10. Do not scaffold application code unless the user asks in a later step. To update an **existing** sibling later, use **sync-framework** / `/sync-framework <name>` — not this skill.

## Out of scope (v1)

- App/stack generators (Laravel, React, Docker, etc.)
- Auto-filling `docs/mvp/`, `docs/stories/`, or `docs/architecture/`
- Propagating into existing projects (use **sync-framework** instead)
- A committed `scripts/scaffold-project.ps1`
