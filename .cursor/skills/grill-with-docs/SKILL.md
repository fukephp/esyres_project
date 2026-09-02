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

Only a product grill **creates** new `STORY-xx`. Format: `docs/stories/index.md`. One file = one PR.

## Done

Frontier empty: every branch visited, nothing silently assumed. Confirm shared understanding. Persist the end-of-topic batch. Then stop — do not auto-implement, auto-compile an answer key, or invent a spec.
