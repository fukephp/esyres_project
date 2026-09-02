---
name: grilling
description: >-
  Grill the user relentlessly about a plan, decision, or idea. Use when the
  user wants to stress-test their thinking, uses any 'grill' trigger phrases,
  or before locking a plan or design.
---

# Grilling

Adapted from [mattpocock/skills grilling](https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md) (MIT, Copyright (c) 2026 Matt Pocock).

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Format a round like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>

---

❓ **Q2** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

Explore the repo, `docs/mvp/`, `docs/architecture/`, `docs/stories/`, `docs/glossary.md`, and `docs/adr/` instead of asking.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not implement until the user confirms you have reached a shared understanding.

## After shared understanding (persist)

When the user confirms shared understanding, persist — do not implement. Read only the persist section of the matching wrapper (do not re-run the interview):

- **No application code** → [grill-me persist](../grill-me/SKILL.md)
- **Application code exists**, or this is a docs session (`/grill-with-docs`) → [grill-with-docs persist](../grill-with-docs/SKILL.md) (glossary + ADRs already land via [domain-modeling](../domain-modeling/SKILL.md) as they lock)
