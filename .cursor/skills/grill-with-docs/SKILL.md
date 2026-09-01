---
name: grill-with-docs
description: >-
  Relentless interview of a plan or design against a codebase, writing glossary
  terms and ADRs as they lock; product/stories persist at end of topic. Use
  when the user says "grill-with-docs", "grill with docs", or /grill-with-docs.
  Prefer this over grill-me when application code exists.
disable-model-invocation: true
---

# Grill with docs

Adapted from [mattpocock/skills grill-with-docs](https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md) (MIT, Copyright (c) 2026 Matt Pocock). This file inlines grilling + domain-modeling so the skill does not depend on loading two other skills.

`.cursor/CONTEXT.md` is agent OS in this framework — **not** the glossary. Do not turn it into a ubiquitous-language file.

## vs grill-me

| | grill-me (productivity) | grill-with-docs (engineering) |
|---|---|---|
| When | No app code, or a throwaway interview | App code exists, or the user invoked this skill |
| Writes | End-of-topic batch (mvp, stories, architecture, CONTEXT) | Glossary + ADRs as they lock; same product/stories end-batch |
| Check | Ask, or explore if easy | Must read the codebase and surface contradictions |

If there is no application code yet, use **grill-me** unless the user explicitly asked for this skill (early shared language is allowed).

## Interview

Same discipline as **grill-me**: walk the design tree, resolve dependencies one by one. Ask **one question at a time**. For each question, give your recommended answer. Wait for the user’s answer before the next question.

Finding facts is your job. Explore the codebase, `docs/mvp/`, `docs/architecture/`, `docs/stories/`, `docs/glossary.md`, and `docs/adr/` instead of asking. Do not implement the plan until the user confirms shared understanding.

## During the session

- **Challenge the glossary.** If the user uses a term that conflicts with `docs/glossary.md` or product language in `docs/mvp/`, call it out immediately.
- **Sharpen fuzzy language.** Propose a precise canonical term. "You're saying 'account': Customer or User?"
- **Concrete scenarios.** Stress-test domain relationships with edge cases that force boundaries.
- **Cross-reference code.** When the user states how something works, check the code. If they disagree, surface it: which is right?

## Write as you go

Capture the moment a term or a qualifying decision locks. Do not batch to the end. A session that sharpens the glossary and writes **zero** ADRs is working as designed.

Most answers live only in the conversation. Do not dump the whole grill into the glossary or an ADR.

**Glossary** — `docs/glossary.md`, create lazily. Format: [GLOSSARY-FORMAT.md](GLOSSARY-FORMAT.md). Domain terms only: what a thing **is**, not how it is implemented. Never write the glossary into `.cursor/CONTEXT.md`. If a locked term changes the product/architecture summary, patch `.cursor/CONTEXT.md` in place (one-paragraph truth only).

**ADRs** — only when **all three** are true:

1. **Hard to reverse** — changing your mind later is costly
2. **Surprising without context** — a future reader would wonder why
3. **A real trade-off** — genuine alternatives, picked for specific reasons

If any gate fails, skip the ADR. Format: [ADR-FORMAT.md](ADR-FORMAT.md).

- Create `docs/adr/` lazily: `NNNN-slug.md` (scan for the highest number, increment).
- If `docs/architecture/` already has a Decisions file and this ADR changes a locked stack choice, update that file too so architecture truth does not fork.

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
