---
name: what-next
description: >-
  Read-only orientation: status counts plus top-3 next picks with one
  Recommended. Applies story-loop fog gate as tags; does not interview.
  Use when the user asks what to work on next, what's done, or says
  /what-next. Does not write files or implement code.
---

# What next

Orient before execute. This skill **classifies every story** (internally), reports **counts only**, then suggests up to **three** next picks with links. **#1 is always Recommended** — the best next move for current progress. It does **not** implement, draft answer keys, write status files, or start a grill interview. Do **not** list in-flight, blocked, not-started, or done stories.

Apply the [story-loop fog gate](../story-loop/SKILL.md) as **tags and action type** (plan-gate vs code). Do **not** skip a foggy bottleneck. Do **not** name grill-me / grill-with-docs on pick lines.

For execution after a pick, use **story-loop**. For fog on a specific story, the user starts **grill-me** (no app code) or **grill-with-docs** (codebase exists) separately.

## Phrases

- `/what-next`
- "what should I work on next?"
- "what's done and what's left?"
- "suggest next story"

## Hard rules

- **Read-only** — never write `docs/stories/`, story status fields, `progress.md`, maps, or answer keys.
- Do not implement code unless the user asks separately.
- Do not invent stories or product behavior beyond `docs/mvp/` and `docs/stories/`.
- Do not start grill-me or grill-with-docs. Do not auto-suggest `/story-loop` or other handoff commands — list only.
- If stories or architecture docs are still stubs, say so; list doc/scaffold blockers instead of fake story ranks.

## Workflow

### 1. Read project context

1. Read `.cursor/CONTEXT.md` for **stories source** (`docs/stories/`), **app root**, and **domain triggers**.
2. Load stories from `docs/stories/` (`STORY-xx.md`). Do not fall back to `docs/mvp/` as the inventory.
3. If no real stories exist (index stub only, no `STORY-xx.md`), stop ranking and report blockers (grill MVP, persist stories). Skip the inventory of fake stories.

### 2. Scan signals (read-only)

| Signal | Where | Use |
|--------|-------|-----|
| Loop artifacts | `.cursor/loops/answer-keys/`, `.cursor/loops/maps/` | In-flight, plan-gate state, fog |
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

**Blocked** in the count means **story-level** deps (or coding blocked on app root / verify for that story). **Project blockers** (step 5) are not stories — they consume slots in the numbered 3 only. Do not invent an inventory group for them.

### 4. Fog tag

Same definition as story-loop’s fog gate. Tag is `fog`. It does **not** change which story is Recommended. It does **not** replace `finish in-flight` / `clear blocker` / `highest unlock`.

**Map exists** (`.cursor/loops/maps/STORY-xx.md`): tag `fog` if any of:

- More than **3** open decisions, **or**
- Story touches any item in the project’s **domain trigger list** (CONTEXT; empty until filled), **or**
- Likely product checks do not yet have obvious verifiers (test, command, or `human-only: …`)

**No map:** tag `fog` only if a **domain trigger** hits, or AC/checks have **no obvious verifier**. Do **not** invent a count of open decisions.

Append ` fog` after the title on numbered-3 lines that fail the gate. Project-blocker lines never get `fog`.

### 5. Blockers-first gate

Before ranking stories, check for project blockers. When any apply, they **consume suggestion slots** (up to 3), in this chain order:

1. No `STORY-xx.md` in `docs/stories/` (index stub only)
2. Architecture docs still stubs when stories need stack decisions
3. App root unset or placeholder
4. No local verify runner (tests, typecheck, lint) — same bar as [story-loop preconditions](.cursor/skills/story-loop/SKILL.md)

Describe each blocker in one line. Do not imply a coding loop is ready when verify is missing; note **plan-gate only** where relevant.

### 6. Rank unlock candidates (when blockers are clear)

Rank **not-started** and **blocked-by-dependency** stories by dependency unlock value. This list feeds slots 2–3 and the fallback Recommended pick — it is **not** the Recommended rule.

1. Explicit deps in story text (`depends on`, `blocked by`, ordered epic lists)
2. Inferred foundation flows (auth shell, core entity, shared layout/API conventions)
3. Stories that unblock the most downstream stories
4. Tie-break: lower story id / earlier epic order

### 7. Pick Recommended and build the 3

**Recommended is always slot 1.** It uses a **progress** rule, not unlock rank. Do not add a 4th item. Do not recommend work that cannot proceed. Do **not** skip a foggy bottleneck — fog changes action type (plan-gate vs code), not which story is #1.

Pick the first that applies:

1. **Unblocked in-flight** — can continue now (plan-gate if no verify runner; coding only if verify exists). Skip in-flight with unmet story deps, or that needs coding while app root / verify is missing.
2. Else the **earliest project blocker** from the chain in step 5 (skip entries that do not apply).
3. Else the **#1 unlock** story from step 6.

Several unblocked in-flight: **closest to done**, then recency, then lower id:

1. Approved answer key (coding-ready or verify in progress)
2. Draft answer key / open map
3. `story/*` branch with no key
4. Tie: most recently touched (git), then lower story id

Build the numbered 3 as:

1. The recommended pick (labeled)
2. Next-best unlock candidate or remaining blocker, excluding #1
3. Same, next after that

No duplicates **inside the 3**. If fewer than 3 exist, list fewer. When in-flight wins, it **enters** the numbered 3 — it is not only a footer.

Short reason in parens is exactly one of: `finish in-flight` · `clear blocker` · `highest unlock`.

### 8. Output (compact)

Status **counts only**, then max **3** numbered suggestions. Label **only** #1. Do **not** list story ids under done / in-flight / not started / blocked.

Each pick that is a story **links** to `docs/stories/STORY-xx.md`. Project-blocker lines have no story link.

```text
Status: X done · Y in-flight · Z not started · W blocked

1. [STORY-02](docs/stories/STORY-02.md) — <title> fog — Recommended (finish in-flight) — draft key ready to approve
2. [STORY-03](docs/stories/STORY-03.md) — <title> — unlocks auth for 4 downstream stories
3. [STORY-01](docs/stories/STORY-01.md) — <title> — core entity CRUD; no deps
```

Blocker with no story id:

```text
Status: 0 done · 0 in-flight · 0 not started · 0 blocked

1. No stories in docs/stories/ — Recommended (clear blocker) — grill MVP, persist STORY-xx
```

Rules:

- One line per suggestion: linked id (or blocker name), title, optional ` fog`, why.
- Slot 1: `— Recommended (<short reason>) —` then the why.
- Slots 2–3: unlabeled alternatives.
- If blockers fill all slots, list blockers instead of stories; #1 is still Recommended (earliest in the chain).
- If #1 needs coding but no verify runner, note **plan-gate only**.
- **No** trailing handoff command. **No** skill names on pick lines.

## Related

| Skill | Role |
|-------|------|
| [story-loop](../story-loop/SKILL.md) | Execute one approved story → PR; fog-gate definition reused here as tags |
| [custom-feature-skills](../custom-feature-skills/SKILL.md) | Implementation constraints during coding |
| [grill-me](../grill-me/SKILL.md) | Clarify fog (no app code; persist at end of topic) — user starts separately |
| [grill-with-docs](../grill-with-docs/SKILL.md) | Clarify fog against codebase; glossary/ADRs as they lock; product/stories end-batch — user starts separately |

Playbook: `.cursor/loops/PLAYBOOK.md`
