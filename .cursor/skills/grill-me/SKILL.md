---
name: grill-me
description: >-
  User-invoked grilling session; persist decided docs at end of topic. Use
  when the user says "grill me" or /grill-me. Interview engine is grilling.
  When a codebase exists to align against, use grill-with-docs instead.
  Opt-in no-human-grilling / no-human-review on product persist only.
disable-model-invocation: true
---

# Grill me

Read and follow [grilling](../grilling/SKILL.md). Then persist per the table below.

If application code exists, prefer **grill-with-docs** (same interview via grilling; glossary + ADRs as they lock via domain-modeling; same product/stories end-batch).

### Phrases

- `/grill-me` — default: wait for answers; persist after confirm
- `/grill-me no-human-grilling` · `no-human-review` · both — opt-in tokens (order-independent; same phrases in chat). Semantics: [grilling](../grilling/SKILL.md)

Missing subject: still ask what to grill.

### Flags (product persist only)

Classify first. Default is human.

- **Process / stack:** flags are **no-ops**. Human grill as today. Never write `STORY-xx` from flags.
- **Product MVP breakdown** (full split or vague whole-MVP): **refuse the flags**. Tell the user to run a human grill. Do not persist an inventory. Do not honor the tokens and continue.
- **Incremental new feature** not already a `STORY-xx`: honor flags. **Never** run [diverge](../diverge/SKILL.md). Persist at most **one** `STORY-xx` with the same refuse rules as [new-story](../new-story/SKILL.md) (existing epic, not already a story, not process/stack). Never auto-split.

### Before the first round (diverge prefix)

Classify the topic, then maybe widen options. **You** invoke this, not the grilling engine.

Never run diverge when flags are **honored** (incremental under flags) or **refused** (MVP under flags). Diverge stays for human product / new-feature grills only.

1. **Run [diverge](../diverge/SKILL.md)** if this is a product MVP breakdown, or a new story/feature that is not already a `STORY-xx` in `docs/stories/` — and flags are not in play (not honored, not refused).
2. **Skip** if the topic is closed (one AC, stack trivia, a process lock with a canonical answer) or you are unsure.
3. If diverge ran: wait for its critic shortlist, then grilling **round 1** is cluster-pick (see grilling). Later rounds lock as usual.
4. If skipped: start grilling rounds as usual.

Never load diverge from story-loop, what-next, custom-feature-skills, or `/new-story`.

Do **not** write after every answer. Do **not** auto-implement after persist.

## Persist (end of topic)

When that grill topic reaches shared understanding — or **`no-human-review`** and the frontier is empty — write whatever was decided — one batch, then stop.

When flags were **honored**, persist per [new-story persist](../new-story/SKILL.md) (one `STORY-xx`). Do not use the product-breakdown row.

| Topic | Write |
|-------|--------|
| Product breakdown (scope locked **and** split into one-PR stories) | `docs/mvp/` (narrative, epics, non-goals) + `docs/stories/STORY-xx.md` + refresh `docs/stories/index.md` |
| Stack | `docs/architecture/` |
| Process / framework | `.cursor/CONTEXT.md` and skills as decided — **no** `STORY-xx` |

`STORY-xx` files only on product breakdown. Naming: `STORY-01.md`, `STORY-02.md`, … (scan highest existing, increment). One file = one PR; split before persist if it would not fit. Format: `docs/stories/index.md`. Acceptance criteria live **only** on the story file.

Only a product grill or `/new-story` **creates** new `STORY-xx`. `/generate-docs` may update existing files only.
