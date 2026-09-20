---
name: research
description: >-
  Investigate a question against high-trust primary sources and capture the
  findings as a Markdown file in the repo. Use when the user wants a topic
  researched, docs or API facts gathered, or reading legwork delegated to a
  background agent.
---

# Research

Vendored from [mattpocock/skills research](https://github.com/mattpocock/skills/blob/main/skills/engineering/research/SKILL.md) (MIT, Copyright (c) 2026 Matt Pocock). Do not rewrite the technique below. If it conflicts with this gate, the gate wins.

## Project gate (read first)

- Follow `.cursor/CONTEXT.md`. Product truth is `docs/mvp/`; architecture is `docs/architecture/`. Do not invent a stack or expand MVP.
- In-repo primary sources come first: `docs/mvp/`, `docs/architecture/`, `docs/glossary.md`, `docs/adr/`, and `esyres_app/` code. External docs still need the source that owns the claim.
- Application code lives in `esyres_app/`. Research notes stay at git-root `docs/research/<slug>.md`. Never write them into `esyres_app/`.
- Notes are not product or architecture truth. Do not update `docs/mvp/`, `docs/architecture/`, `docs/glossary.md`, or `docs/adr/` from research unless the user asks (grill-with-docs / domain-modeling owns glossary + ADRs).
- Background agent: Task tool. Keep working in this chat.

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it to `docs/research/<slug>.md` (create the folder if needed). Tell the user the path.
