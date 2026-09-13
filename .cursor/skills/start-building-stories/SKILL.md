---
name: start-building-stories
description: >-
  Attended sequential drain: print what-next, then immediately run Local
  story-loop for Recommended. One PR at a time; wait for merge + continue.
  Not an unattended gauntlet. Use when the user says /start-building-stories
  or start building stories.
---

# Start building stories

Thin wrapper. **Classify** with [what-next](../what-next/SKILL.md), **execute** with [story-loop](../story-loop/SKILL.md) for Recommended only. Sequences N single loops in this chat. Does **not** turn story-loop into a multi-story gauntlet.

Playbook: `.cursor/loops/PLAYBOOK.md`.

## Phrases

- `/start-building-stories`
- “start building stories”

Continue (same chat, after a PR): `continue` · `merged` · `next`

Stop: `stop` (or equivalent). Also stop when the unblocked queue is empty, only blocked remain, or Recommended is a project blocker.

## Hard rules

- **Local only** in this chat. Refuse `unattended` / Cloud Agent / Task fan-out inside the drain. Named `story-loop STORY-xx unattended` stays available **outside** this skill.
- **One story → one PR.** Re-rank on continue. Do **not** skip in-flight. Do **not** start blocked stories. Do **not** skip a foggy Recommended.
- Do **not** invent stories. Do **not** write `docs/stories/`. Do **not** write `progress.md` or a drain session file. State is git + answer keys + inventory.
- Print **what-next output unchanged**. Do not add a handoff command or skill name on pick / in-flight lines.
- Do **not** poll GitHub for merge. Do **not** auto-approve answer keys. Do **not** start the next story until the user continues.
- Named `/story-loop STORY-xx` is unchanged.

what-next’s “do not implement” applies only to the classify+print subroutine. This wrapper owns execution via story-loop.

## Workflow

1. Read `.cursor/CONTEXT.md`.
2. Run **what-next** classification and print its compact output **unchanged**.
3. If slot 1 is a **project blocker** (no stories, architecture stubs, no app root, no verify) → stop. Keep what-next’s plan-gate-only note when that is the line.
4. Else resolve Recommended to a `STORY-xx`. If none (empty queue, or only blocked remain) → Status already printed; stop.
5. Immediately follow **story-loop** for that id (fog gate → map or sharp key → user approves key → **Local** implement → PR). No extra Go. The user may say stop. Refuse `unattended` here. Do not skip fog.
6. After that loop would exit (ready PR or escalate PR): remind Bugbot + human merge; **wait**. Do not start another story.
7. On `continue` / `merged` / `next`: go to step 1. If the last PR is still open, what-next’s in-flight rule wins (finish that story). Do not poll GitHub.

## Related

- [what-next](../what-next/SKILL.md) — ranking and compact output (read-only)
- [story-loop](../story-loop/SKILL.md) — one story → one PR
- Playbook: `.cursor/loops/PLAYBOOK.md`
- [custom-feature-skills](../custom-feature-skills/SKILL.md) — while implementing
