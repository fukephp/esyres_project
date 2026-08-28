---
name: what-next
description: >-
  Read-only orientation: scan MVP stories, loop artifacts, and the codebase
  to report status and top-3 ranked next-work suggestions. Use when the user
  asks what to work on next, what's done, or says /what-next. Does not write
  files or implement code.
---

# What next

Orient before execute. This skill reports **what is done, in-flight, blocked, and not started**, then suggests up to **three** next picks. It does **not** implement, draft answer keys, or write status files.

For execution after a pick, use **story-loop**. For fog on a specific story, use **grill-me** (no app code) or **grill-with-docs** (codebase exists).

## Phrases

- `/what-next`
- "what should I work on next?"
- "what's done and what's left?"
- "suggest next story"

## Hard rules

- **Read-only** — never write `docs/tasks/`, story status fields, `progress.md`, maps, or answer keys.
- Do not implement code unless the user asks separately.
- Do not invent stories or product behavior beyond `docs/mvp/` and `docs/stories/`.
- Do not auto-suggest `/story-loop` or other handoff commands — list only.
- If stories or architecture docs are still stubs, say so; list doc/scaffold blockers instead of fake story ranks.

## Workflow

### 1. Read project context

1. Read `.cursor/CONTEXT.md` for **stories source**, **app root**, and **domain triggers**.
2. Load stories from the stories source in CONTEXT. If unset, fall back to `docs/mvp/` and `docs/stories/`.
3. If no real stories exist (index stubs only), stop ranking and report blockers (fill docs, break down epics into stories).

### 2. Scan signals (read-only)

| Signal | Where | Use |
|--------|-------|-----|
| Loop artifacts | `.cursor/loops/answer-keys/`, `.cursor/loops/maps/` | In-flight, plan-gate state |
| Git | `story/*` branches, recent merged PR titles mentioning `STORY-xx` | In-flight, done |
| App codebase | App root from CONTEXT (when set) | Implementation vs story AC |
| Verify runner | `package.json`, `composer.json`, `Makefile`, CI scripts in app root | Blocker detection |

Explore the codebase when classification depends on what is actually shipped — do not guess from story titles alone.

### 3. Classify each story

| State | Signals |
|-------|---------|
| **Done** | Merged PR or shipped code matches story acceptance criteria; or approved answer key + verify passed + merged |
| **In-flight** | Draft or approved answer key, open map, or `story/*` branch without merge |
| **Blocked** | Explicit dependency unmet; or missing app root / verify runner when coding would be required |
| **Not started** | No artifacts and no matching implementation |

When evidence is ambiguous, say so briefly — do not mark done without support.

### 4. Blockers-first gate

Before ranking stories, check for project blockers. When any apply, they **consume top suggestion slots** (up to 3):

- Stories source unset or empty
- App root unset or placeholder
- No local verify runner (tests, typecheck, lint) — same bar as [story-loop preconditions](.cursor/skills/story-loop/SKILL.md)
- Architecture docs still stubs when stories need stack decisions

Describe each blocker in one line. Do not imply a coding loop is ready when verify is missing; note **plan-gate only** where relevant.

### 5. Rank stories (when blockers are clear)

Rank **not-started** and **blocked-by-dependency** stories by dependency unlock value:

1. Explicit deps in story text (`depends on`, `blocked by`, ordered epic lists)
2. Inferred foundation flows (auth shell, core entity, shared layout/API conventions)
3. Stories that unblock the most downstream stories
4. Tie-break: lower story id / earlier epic order

**In-flight** stories appear in the status summary and optional in-flight note. They do **not** auto-outrank unlock candidates — mention WIP without forcing "finish first."

### 6. Output (compact)

Use this shape. Max **3** numbered suggestions.

```text
Status: X done · Y in-flight · Z not started · W blocked

1. STORY-03 — <title> — unlocks auth for 4 downstream stories
2. STORY-01 — <title> — core entity CRUD; no deps
3. STORY-07 — <title> — thin vertical slice after STORY-03

In-flight: STORY-02 (draft answer key)
```

Rules:

- One line per suggestion: id, title, why ranked here.
- Optional one-line in-flight note after the list.
- If blockers fill all slots, list blockers instead of stories.
- If top pick has high fog or no verify runner, note **plan-gate only**.
- **No** trailing handoff command.

## Related

| Skill | Role |
|-------|------|
| [story-loop](../story-loop/SKILL.md) | Execute one approved story → PR |
| [custom-feature-skills](../custom-feature-skills/SKILL.md) | Implementation constraints during coding |
| [grill-me](../grill-me/SKILL.md) | Clarify fog (no app code; writes nothing) |
| [grill-with-docs](../grill-with-docs/SKILL.md) | Clarify fog against codebase; writes glossary + ADRs |

Playbook: `.cursor/loops/PLAYBOOK.md`
