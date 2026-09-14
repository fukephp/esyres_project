---
name: new-story
description: >-
  Grill one incremental product story and always persist new STORY-xx
  file(s). Use when the user says "new-story" or /new-story. Interview
  engine is grilling; never diverge. Existing epic only. Opt-in
  no-human-grilling / no-human-review.
disable-model-invocation: true
---

# New story

Incremental story path. `/grill-me` and `/grill-with-docs` stay the full-MVP / general interview wrappers.

Read and follow [grilling](../grilling/SKILL.md). Then persist per the table below.

If application code exists, also follow [domain-modeling](../domain-modeling/SKILL.md) ([grill-with-docs](../grill-with-docs/SKILL.md) interview rules: read the codebase; glossary + ADRs as they lock). If there is no application code, use the grill-me interview (no glossary/ADRs during the session). Persist still **always** writes `STORY-xx`.

### Phrases

- `/new-story` — default: wait for answers; persist after confirm
- `/new-story no-human-grilling` · `no-human-review` · both — opt-in tokens (order-independent; same phrases in chat). Semantics: [grilling](../grilling/SKILL.md)

### Before the first round

**Never** run [diverge](../diverge/SKILL.md). Never run diverge under flags.

If the user named a feature or change after the command, use that as the subject. Otherwise ask what to grill (flags do not invent a subject).

Classify the topic. **You** invoke this, not the grilling engine.

1. **Process / stack / docs-only** (no product AC) → **refuse** a `STORY-xx`. Tell them to use `/grill-me` or `/grill-with-docs`.
2. **Already a `STORY-xx`** (or only an AC tweak to one) → **refuse** a new file. Point at the existing story.
3. **No existing epic fits** (`docs/mvp/06-Epics.md`) → **refuse**. They pick an existing epic, or run a product grill (`/grill-me` / `/grill-with-docs`) to add an epic. Do **not** invent an epic.
4. Else: start grilling rounds as usual (no cluster-pick). Lock which **existing** epic the story attaches to. Honor flags on this path only (at most **one** `STORY-xx`; never auto-split). Process/stack still **refuse** a file — flags do not override.

Do **not** write after every answer. Do **not** auto-implement after persist.

## Persist (end of topic)

When that grill topic reaches shared understanding — or **`no-human-review`** and the frontier is empty — one batch, then **stop**. Do not implement, draft an answer key, or start `/story-loop`.

| Write | Notes |
|-------|--------|
| `docs/stories/STORY-xx.md` | Scan highest existing id, increment. One file = one PR. If it would not fit one PR, **split** into `STORY-n`, `n+1`, … — except **under flags**: write **one** file only; if it would not fit, override `no-human-grilling` and ask (do not split). Format: `docs/stories/index.md`. Acceptance criteria live **only** on the story file. Loop `—` until story-loop. |
| `docs/stories/index.md` | Refresh the catalog. |
| `docs/mvp/` | Patch narrative (`07-Stories.md`; `03-Key-Features.md` if needed). **Do not add an epic.** Attach to an existing epic from `06-Epics.md`. |
| `.cursor/CONTEXT.md` | Product blurb **if** this grill locked product behavior. |

Glossary + ADRs already land via domain-modeling when app code exists. If an ADR changes a locked stack choice, also update `docs/architecture/08-Decisions.md`.

A product grill **or** `/new-story` creates new `STORY-xx`. `/generate-docs` may update existing files only.
