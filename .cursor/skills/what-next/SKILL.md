---
name: what-next
description: >-
  Read-only orientation: scan MVP stories, loop artifacts, and the codebase
  to report status and top-3 next picks with one Recommended (best for
  current progress). Use when the user asks what to work on next, what's
  done, or says /what-next. Does not write files or implement code.
---

# What next

Orient before execute. This skill reports **what is done, in-flight, blocked, and not started**, then suggests up to **three** next picks. **#1 is always Recommended** — the best next move for current progress. It does **not** implement, draft answer keys, or write status files.

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

Before ranking stories, check for project blockers. When any apply, they **consume suggestion slots** (up to 3), in this chain order:

1. Stories source unset or empty
2. Architecture docs still stubs when stories need stack decisions
3. App root unset or placeholder
4. No local verify runner (tests, typecheck, lint) — same bar as [story-loop preconditions](.cursor/skills/story-loop/SKILL.md)

Describe each blocker in one line. Do not imply a coding loop is ready when verify is missing; note **plan-gate only** where relevant.

### 5. Rank unlock candidates (when blockers are clear)

Rank **not-started** and **blocked-by-dependency** stories by dependency unlock value. This list feeds slots 2–3 and the fallback Recommended pick — it is **not** the Recommended rule.

1. Explicit deps in story text (`depends on`, `blocked by`, ordered epic lists)
2. Inferred foundation flows (auth shell, core entity, shared layout/API conventions)
3. Stories that unblock the most downstream stories
4. Tie-break: lower story id / earlier epic order

### 6. Pick Recommended and build the 3

**Recommended is always slot 1.** It uses a **progress** rule, not unlock rank. Do not add a 4th item. Do not recommend work that cannot proceed.

Pick the first that applies:

1. **Unblocked in-flight** — can continue now (plan-gate if no verify runner; coding only if verify exists). Skip in-flight with unmet story deps, or that needs coding while app root / verify is missing.
2. Else the **earliest project blocker** from the chain in step 4 (skip entries that do not apply).
3. Else the **#1 unlock** story from step 5.

Several unblocked in-flight: **closest to done**, then recency, then lower id:

1. Approved answer key (coding-ready or verify in progress)
2. Draft answer key / open map
3. `story/*` branch with no key
4. Tie: most recently touched (git), then lower story id

Build the numbered 3 as:

1. The recommended pick (labeled)
2. Next-best unlock candidate or remaining blocker, excluding #1
3. Same, next after that

No duplicates. If fewer than 3 exist, list fewer. When in-flight wins, it **enters** the numbered 3 — it is not only a footer.

Short reason in parens is exactly one of: `finish in-flight` · `clear blocker` · `highest unlock`.

### 7. Output (compact)

Use this shape. Max **3** numbered suggestions. Label **only** #1.

```text
Status: X done · Y in-flight · Z not started · W blocked

1. STORY-02 — <title> — Recommended (finish in-flight) — draft key ready to approve
2. STORY-03 — <title> — unlocks auth for 4 downstream stories
3. STORY-01 — <title> — core entity CRUD; no deps
```

Blocker with no story id:

```text
1. Stories source unset — Recommended (clear blocker) — fill CONTEXT / docs/mvp
```

Rules:

- One line per suggestion: id (or blocker name), title, why.
- Slot 1: `— Recommended (<short reason>) —` then the why.
- Slots 2–3: unlabeled alternatives.
- Optional one-line in-flight note **only** for other WIP not already in the 3. Omit if the only in-flight is #1.
- If blockers fill all slots, list blockers instead of stories; #1 is still Recommended (earliest in the chain).
- If #1 has high fog or no verify runner, note **plan-gate only**.
- **No** trailing handoff command.

## Related

| Skill | Role |
|-------|------|
| [story-loop](../story-loop/SKILL.md) | Execute one approved story → PR |
| [custom-feature-skills](../custom-feature-skills/SKILL.md) | Implementation constraints during coding |
| [grill-me](../grill-me/SKILL.md) | Clarify fog (no app code; writes nothing) |
| [grill-with-docs](../grill-with-docs/SKILL.md) | Clarify fog against codebase; writes glossary + ADRs |

Playbook: `.cursor/loops/PLAYBOOK.md`
