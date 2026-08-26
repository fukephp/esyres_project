# ADR format

ADRs live in `docs/adr/` and use sequential numbering: `0001-slug.md`, `0002-slug.md`.

Create `docs/adr/` lazily — only when the first ADR is needed.

## Template

```md
# {Short title of the decision}

{1-3 sentences: what's the context, what did we decide, and why.}
```

An ADR can be a single paragraph. Record *that* a decision was made and *why*, not a form with empty sections.

## Optional sections

Only when they add value. Most ADRs will not need them.

- **Status** frontmatter (`proposed | accepted | deprecated | superseded by ADR-NNNN`)
- **Considered Options** — only when rejected alternatives are worth remembering
- **Consequences** — only when non-obvious downstream effects need calling out

## Numbering

Scan `docs/adr/` for the highest existing number and increment by one.

## When to offer an ADR

All three must be true:

1. **Hard to reverse** — the cost of changing your mind later is meaningful
2. **Surprising without context** — a future reader will look at the code and wonder why
3. **The result of a real trade-off** — genuine alternatives, picked for specific reasons

If it is easy to reverse, skip it. If it is not surprising, skip it. If there was no real alternative, skip it.

### What qualifies

- Architectural shape (monorepo, event-sourced write model, …)
- Integration patterns between contexts
- Technology choices with lock-in (database, auth, deploy target — not every library)
- Boundary and scope decisions, including explicit no-s
- Deliberate deviations from the obvious path
- Constraints not visible in the code
- Rejected alternatives when the rejection is non-obvious

If `docs/architecture/` already has a Decisions file, append or update the matching numbered item there when this ADR changes a locked stack choice. Do not leave two conflicting truths.
