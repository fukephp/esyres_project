---
name: diverge
description: >-
  Isolated option-space before a product MVP or new-feature grill
  (grill-me / grill-with-docs only; never /new-story). Three parallel
  generator branches, critic in the parent chat, then stop so grilling
  can lock. Wrappers invoke this; do not run it yourself.
disable-model-invocation: true
---

# Diverge

Widen the option space **before** grilling locks. Complement, not a replacement: this skill generates clusters and a shortlist; [grilling](../grilling/SKILL.md) still interviews to shared understanding.

Loop adapted from the ADHD method ([Udit Akhouri](https://github.com/UditAkhourii/adhd), MIT): isolated generator branches, then a separate critic. Not a copy of that skill. No `/adhd`. No deepen pass.

**Only** [grill-me](../grill-me/SKILL.md) and [grill-with-docs](../grill-with-docs/SKILL.md) load this, after they classify the topic. If you were not sent here by a wrapper, **stop** and do not fan out. There is no `/diverge` command. [new-story](../new-story/SKILL.md) never loads this.

## Who runs this

| Caller | Run? |
|--------|------|
| `/grill-me` or `/grill-with-docs` after classify = product MVP breakdown, or a new story/feature not already in `docs/stories/` | Yes |
| Wrapper classified closed or unsure | No — wrapper skips this skill |
| [story-loop](../story-loop/SKILL.md), [what-next](../what-next/SKILL.md), [custom-feature-skills](../custom-feature-skills/SKILL.md), [new-story](../new-story/SKILL.md), grilling as a subroutine | **Never** |

## Phase 0 — Fact pack (parent)

The parent gathers facts. Do not ask the user for anything you can read.

Same pack for every branch:

- Problem P (the grill subject, in the user's words)
- Current `docs/mvp/` narrative, epics, non-goals (if any)
- `docs/stories/` inventory (ids + titles; empty is a fact)
- Named constraints already locked (`docs/architecture/`, glossary, ADRs) — as facts, not as the answer

Do **not** include other branches' ideas, a recommended product bet, or "the obvious MVP".

## Phase 1 — Diverge (no critic)

Spawn **3 parallel** `Task` calls in **one** turn. Isolated: each call gets only the fact pack plus **one** frame from the table below. Do not serialize. Do not pass one branch's output into another. Branches that see each other collapse to a wider single thought.

Each Task prompt:

> You are in DIVERGENT mode. You are a generator, not a critic.
> Generate 4 short distinct ideas under this frame. Each idea is one
> phrase or one sentence. Do not evaluate. Do not rank. Do not hedge.
> The first three obvious answers everyone would give are banned.
> Push past them into the awkward middle.
> You have no tools. Do not read the repo. Use only the fact pack below.
> Output a JSON array only. No prose before or after.
> `[{"text": "...", "rationale": "..."}, ...]`
>
> Frame: \<vantage prompt\>
>
> Fact pack:
> \<paste the same pack\>

| Frame | Vantage prompt |
|-------|----------------|
| **Smallest slice** | One-PR / one-session bet that still proves the product. What is the smallest slice that could be true or false after one story? |
| **Refuse / non-goals** | What we explicitly do not build. Which tempting features, users, or platforms must this MVP refuse so the rest can ship? |
| **Existing-user workaround** | Serve someone who already copes (spreadsheet, WhatsApp, paper, a rival). Not a net-new audience. What do they already do, and what is the smallest lift that replaces the workaround? |

If a Task returns prose or fewer than 4 ideas, keep whatever parseable ideas exist; do not re-run the whole fan-out for polish.

## Phase 2 — Focus (critic in this chat)

After all three return, **you** (the parent) score and cluster. Do not spawn more Tasks. Do not deepen survivors into sketches.

1. **Score.** Each idea, 0–10: novelty (distance from the textbook MVP), viability (could it persist as real stories), fit (addresses P). Attractive-but-broken ideas are **traps** — one-line reason each.
2. **Cluster.** Group into 3–6 clusters by underlying **angle**, not keywords. Label the angle ("refuse a second persona", "replace the WhatsApp thread", "one happy-path slice").
3. **Shortlist.** Weighted score: novelty 0.35 + viability 0.40 + fit 0.25. Drop traps. Take **2–4** ideas. Mark the non-obvious-but-viable pick with ★. Keep one **safe default** (the competent textbook slice) on the list as contrast even if novelty is low.

## Output shape

Render in this order, then **stop**. The wrapper's grilling round 1 is cluster-pick. Do not start locking product decisions here. Do not persist.

1. **Brief.** One or two lines: P, and that this is option-space not a lock.
2. **Wide set.** Clusters by angle. Each idea one phrase, with score chips `[N7 V8 F9]`.
3. **Traps.** Each with the one-line reason.
4. **Shortlist.** 2–4 ideas. ★ on the non-obvious viable pick. Name the safe default as contrast. Why each is on the list.

## Anti-patterns

- **Convergence disguised as divergence.** Ten variants of one MVP is not breadth. If every candidate shares the same user, surface, and cut-line, you have not diverged.
- **Simulating isolation in one context.** Writing three frames sequentially in this chat is not this skill. Use parallel Task calls.
- **Deepen / implement / persist.** Skip sketches, answer keys, and docs. Grilling locks; wrappers persist.
- **Running without a wrapper.** If story-loop, what-next, or a coding task reached this file, abort.
- **Weird-for-weird's-sake.** Clusters and a shortlist are the point. Do not dump 12 unsorted phrases and walk away.
