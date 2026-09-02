---
name: domain-modeling
description: >-
  Build and sharpen a project's domain model. Use when grilling against a
  codebase, discussing terminology, writing or editing docs/glossary.md, or
  recording or editing an ADR.
---

# Domain modeling

Adapted from [mattpocock/skills domain-modeling](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md) (MIT, Copyright (c) 2026 Matt Pocock).

Actively build and sharpen the project's domain model as you design. This is the *active* discipline: challenging terms, inventing edge-case scenarios, and writing the glossary and decisions down the moment they crystallise. (Merely *reading* `.cursor/CONTEXT.md` for agent OS is not this skill. This skill is for when you're changing the model, not just consuming it.)

`.cursor/CONTEXT.md` is agent OS in this framework — **not** the glossary. Do not turn it into a ubiquitous-language file.

## File structure

Most projects have a single glossary:

```
/
├── .cursor/CONTEXT.md          ← agent OS (not the glossary)
├── docs/
│   ├── glossary.md             ← domain language (lazy)
│   └── adr/
│       ├── 0001-event-sourced-orders.md
│       └── 0002-postgres-for-write-model.md
```

If `docs/CONTEXT-MAP.md` exists, the repo has multiple contexts. The map points to where each glossary lives. Infer which context the current topic belongs to; ask if unclear. Otherwise use the single `docs/glossary.md`.

Create files lazily: only when you have something to write. If no `docs/glossary.md` exists, create it when the first term is resolved. If no `docs/adr/` exists, create it when the first ADR is needed.

## During the session

### Challenge against the glossary

When the user uses a term that conflicts with `docs/glossary.md` or product language in `docs/mvp/`, call it out immediately. "Your glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"

### Sharpen fuzzy language

When the user uses vague or overloaded terms, propose a precise canonical term. "You're saying 'account': do you mean the Customer or the User? Those are different things."

### Discuss concrete scenarios

When domain relationships are being discussed, stress-test them with specific scenarios. Invent scenarios that probe edge cases and force the user to be precise about the boundaries between concepts.

### Cross-reference with code and docs

When the user states how something works, check whether the code agrees. Also check `docs/mvp/`, `docs/architecture/`, `docs/stories/`, `docs/glossary.md`, and `docs/adr/`. If you find a contradiction, surface it: which is right?

### Update the glossary inline

When a term is resolved, update `docs/glossary.md` right there. Don't batch these up: capture them as they happen. Use the format in [GLOSSARY-FORMAT.md](GLOSSARY-FORMAT.md).

The glossary should be totally devoid of implementation details. Do not treat it as a spec, a scratch pad, or a repository for implementation decisions. It is a glossary and nothing else.

Never write the glossary into `.cursor/CONTEXT.md`. If a locked term changes the product/architecture summary, patch `.cursor/CONTEXT.md` in place (one-paragraph truth only).

### Offer ADRs sparingly

Only offer to create an ADR when all three are true:

1. **Hard to reverse**: the cost of changing your mind later is meaningful
2. **Surprising without context**: a future reader will wonder "why did they do it this way?"
3. **The result of a real trade-off**: there were genuine alternatives and you picked one for specific reasons

If any of the three is missing, skip the ADR. Use the format in [ADR-FORMAT.md](ADR-FORMAT.md).

- Create `docs/adr/` lazily: `NNNN-slug.md` (scan for the highest number, increment).
- If `docs/architecture/` already has a Decisions file and this ADR changes a locked stack choice, update that file too so architecture truth does not fork.

Do **not** create `STORY-xx` files while interviewing. Product/stories wait for end-of-topic persist on the grill wrapper.
