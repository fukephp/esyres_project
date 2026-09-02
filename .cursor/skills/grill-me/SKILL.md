---
name: grill-me
description: >-
  User-invoked grilling session; persist decided docs at end of topic. Use
  when the user says "grill me" or /grill-me. Interview engine is grilling.
  When a codebase exists to align against, use grill-with-docs instead.
disable-model-invocation: true
---

# Grill me

Read and follow [grilling](../grilling/SKILL.md). Then persist per the table below.

If application code exists, prefer **grill-with-docs** (same interview via grilling; glossary + ADRs as they lock via domain-modeling; same product/stories end-batch).

Do **not** write after every answer. Do **not** auto-implement after persist.

## Persist (end of topic)

When that grill topic reaches shared understanding, write whatever was decided — one batch, then stop.

| Topic | Write |
|-------|--------|
| Product breakdown (scope locked **and** split into one-PR stories) | `docs/mvp/` (narrative, epics, non-goals) + `docs/stories/STORY-xx.md` + refresh `docs/stories/index.md` |
| Stack | `docs/architecture/` |
| Process / framework | `.cursor/CONTEXT.md` and skills as decided — **no** `STORY-xx` |

`STORY-xx` files only on product breakdown. Naming: `STORY-01.md`, `STORY-02.md`, … (scan highest existing, increment). One file = one PR; split before persist if it would not fit. Format: `docs/stories/index.md`. Acceptance criteria live **only** on the story file.

Only a product grill **creates** new `STORY-xx`. `/generate-docs` may update existing files only.
