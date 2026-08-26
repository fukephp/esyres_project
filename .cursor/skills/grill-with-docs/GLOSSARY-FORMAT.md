# Glossary format

Domain glossary lives at `docs/glossary.md`. Create it lazily when the first term is resolved.

This is the framework remap of Matt Pocock’s root `CONTEXT.md` glossary. Do **not** put this content in `.cursor/CONTEXT.md`.

## Structure

```md
# {Project or context name}

{One or two sentences: what this context is and why it exists.}

## Language

**Order**:
{A one or two sentence description of the term}
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request
```

## Rules

- **Be opinionated.** When several words mean the same thing, pick one and list the rest under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what it **is**, not what it does.
- **Domain terms only.** No timeouts, error types, or general programming concepts.
- **No implementation.** No stack, file paths, API shapes, or spec-like prose.
- Group terms under subheadings when natural clusters emerge.

## Multi-context (rare)

If `docs/CONTEXT-MAP.md` exists, it lists bounded contexts and where each glossary lives. Infer which context the current topic belongs to; ask if unclear. Otherwise use the single `docs/glossary.md`.
