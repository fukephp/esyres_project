---
name: grill-with-docs
description: >-
  User-invoked grilling session against a codebase; glossary and ADRs as they
  lock; product/stories persist at end of topic. Use when the user says
  "grill-with-docs", "grill with docs", or /grill-with-docs.
disable-model-invocation: true
---

# Grill with docs

Adapted from [mattpocock/skills grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) (MIT, Copyright (c) 2026 Matt Pocock).

Read and follow [grilling](../grilling/SKILL.md) and [domain-modeling](../domain-modeling/SKILL.md).

`.cursor/CONTEXT.md` is agent OS in this framework — **not** the glossary. Do not turn it into a ubiquitous-language file.

### Before the first round (diverge prefix)

Classify the topic, then maybe widen options. **You** invoke this, not the grilling engine.

1. **Run [diverge](../diverge/SKILL.md)** if this is a product MVP breakdown, or a new story/feature that is not already a `STORY-xx` in `docs/stories/`.
2. **Skip** if the topic is closed (one AC, stack trivia, a process lock with a canonical answer) or you are unsure.
3. If diverge ran: wait for its critic shortlist, then grilling **round 1** is cluster-pick (see grilling). Later rounds lock as usual.
4. If skipped: start grilling rounds as usual.

Never load diverge from story-loop, what-next, custom-feature-skills, or `/new-story`. Story-loop may tell you to use this skill for glossary/ADRs on an **existing** story — that is a subroutine: skip diverge.

## vs grill-me

| | grill-me (productivity) | grill-with-docs (engineering) |
|---|---|---|
| When | No app code, or a throwaway interview | App code exists, or the user invoked this skill |
| Writes | End-of-topic batch (mvp, stories, architecture, CONTEXT) | Glossary + ADRs as they lock; same product/stories end-batch |
| Check | Ask, or explore if easy | Must read the codebase and surface contradictions |

If there is no application code yet, use **grill-me** unless the user explicitly asked for this skill (early shared language is allowed).

Do **not** create `STORY-xx` files while interviewing. Product/stories wait for end-of-topic persist.

## Persist (end of topic)

Same routing as **grill-me**. When that grill topic reaches shared understanding, one batch, then stop. Do not auto-implement.

| Topic | Write |
|-------|--------|
| Product breakdown (scope locked **and** split into one-PR stories) | `docs/mvp/` + `docs/stories/STORY-xx.md` + refresh `docs/stories/index.md` |
| Stack | `docs/architecture/` (if not already updated with an ADR) |
| Process / framework | `.cursor/CONTEXT.md` and skills as decided — **no** `STORY-xx` |

Only a product grill or `/new-story` **creates** new `STORY-xx`. Format: `docs/stories/index.md`. One file = one PR.

## Done

Frontier empty: every branch visited, nothing silently assumed. Confirm shared understanding. Persist the end-of-topic batch. Then stop — do not auto-implement, auto-compile an answer key, or invent a spec.
