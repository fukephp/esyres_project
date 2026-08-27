# Esyres story-loop playbook

Loop Engineering for Esyres means: clear fog, approve a pass/fail answer key, implement and verify on a branch with a hard iteration cap, run Bugbot on the PR, then you merge.

**Runtime is Hybrid.** Default is Local Agent in this chat. Cloud Agent is opt-in only (`story-loop STORY-xx unattended`, or a clear “Cloud Agent for STORY-xx”). There is no `briefs/` folder; the answer key is the contract.

This is **not** an unattended gauntlet that builds the whole MVP from a vague prompt.

## Wayfinder-lite (plan gate only)

Foggy stories use a **light story map** (Destination, Decisions so far, Open decisions, Not yet specified, Out of scope) before the answer key. That borrows Wayfinder’s fog discipline without Matt Pocock’s full skill, issue-tracker maps, claiming, or research/prototype ticket types.

- Maps: `.cursor/loops/maps/` (template: `MAP_TEMPLATE.md`)
- Keys: `.cursor/loops/answer-keys/` (template: `ANSWER_KEY_TEMPLATE.md`)

## When to loop vs prompt

**Loop** when all of these are true:

- Work is **one MVP story** (or a thin vertical slice of one story) → one PR
- Product fog is cleared (map compiled or sharp-path grill; answer key approved)
- An **approved** answer key exists under `.cursor/loops/answer-keys/`
- `esyres_app/` has a real local verify runner (tests and/or typecheck/lint the agent can fail)

**Prompt turn-by-turn** when:

- Scaffolding the app, or `esyres_app/` is still a placeholder
- Product or architecture decisions are still open (stay on the map / grill)
- The task is one-off, exploratory, or not machine-verifiable
- You would need the agent to invent “quality” without a pass/fail key

## Contract (locked)

| Decision | Choice |
|----------|--------|
| Job | Ship features with less coding babysitting (plan gates stay) |
| Stop rule | You approve answer key → machine gates → you review PR |
| Unit of work | One MVP story → one PR |
| Ready when | Scaffold + local verify commands exist |
| Runtime | Hybrid: Local Agent default (implement in chat); Cloud Agent on `unattended` (short paste, no file) |
| Answer key | Per-story markdown under `.cursor/loops/answer-keys/` |
| Hard stop | 5–8 implement→verify cycles, then escalate |
| Plan gate | Fog check → optional map → draft key → you approve → implement |
| Checker | Bugbot on the PR (nits on same PR; key conflicts escalate; no second critic) |

## Fog gate

Use a story map when fog is **non-trivial**:

- More than **3** open decisions, **or**
- Story touches **auth**, **booking status transitions**, or a **new customer/owner surface**, **or**
- Likely product checks do not yet have **obvious verifiers** (test, command, or `human-only: …`)

Otherwise skip the map: short grill → draft answer key directly. Sharp means all of: ≤3 opens, no domain trigger, and every likely product check already has an obvious verifier. Keep the number 3.

If a likely product check cannot name a verifier, it stays on the map (Not yet specified or Open decisions). It is not a pass/fail line yet.

## Compile rule

Compile map → **draft** answer key when **both** of these are true:

1. **Not yet specified** is empty
2. **Open decisions** are empty (all moved into Decisions so far)

There is no separate “OK to compile.” The agent drafts the key in the same turn. You only approve the key.

Then set map Status to `compiled`. Do not invent pass/fail checks for leftover fog.

## Pass/fail

Every product check on the key must name a verifier: a test, a command, or `human-only: …`. Cap human-only at **1–2** lines per key. Architecture checks cite `docs/architecture/` constraints this story must not violate.

## Flow

1. Pick a story from `docs/mvp/07-Stories.md`.
2. Apply the **fog gate**. If non-trivial: create/update `.cursor/loops/maps/STORY-xx.md` from `MAP_TEMPLATE.md`.
3. Grill **one open decision at a time** (grill-me style; **grill-with-docs** once `esyres_app/` has real code); update the map. Graduate fog into open decisions only when the question is sharp.
4. When fog and opens are clear, **compile a draft** `.cursor/loops/answer-keys/STORY-xx.md` from Decisions so far + Out of scope + named verifiers. (Sharp path: draft the key without a map.)
5. **You approve** the answer key (Status `approved`; every product check names a verifier).
6. Use the `story-loop` skill. Default (`story-loop STORY-xx`): implement in this chat against the key. Opt-in Cloud (`story-loop STORY-xx unattended`): emit a short paste block only — do not write a brief file.
7. Implementer (Local or Cloud) follows **Implementer instructions** in the key; runs verify from `esyres_app/`; retries while under the iteration cap.
8. On pass: open a PR. On cap / stuck: open a draft or blocked PR with what failed — do not burn more cycles.
9. Run Bugbot on the PR. Trivial nits: fix on the same PR (do not burn the cap). Findings that contradict the key: stop and ask. Do not silently rewrite the key.
10. You review and merge.

## Gates

1. **Plan gate** — fog cleared (map or sharp path); answer key approved by you; agent does not invent the key mid-run.
2. **Machine gate** — every verify command in the answer key exits 0 (plus at most 1–2 named human-only product checks).
3. **Checker gate** — Bugbot on the PR (lightweight second opinion). Nits stay on the PR; key conflicts escalate to you.
4. **Merge gate** — you review and merge.

## Hard stop

- Default iteration cap: **5–8** implement→verify cycles.
- If the **same failure** repeats twice with no meaningful progress, stop early and escalate.
- Escalation = leave a PR (or draft) titled/blocked with the failing check, last commands, and what a human must decide. Do not continue the loop.

## Out of scope

- Unattended whole-MVP or multi-epic gauntlet
- Coding loops before `esyres_app/` has a real verify runner
- Docs-only “loops” that check markdown checklists with no runnable app
- A second long unattended critic agent (Bugbot + human review is enough for MVP stories)
- A `briefs/` folder or a mandatory Cloud Agent brief as a lifecycle step
- Porting Claude Code `/goal` or viral gauntlet prompts verbatim
- Full Wayfinder (issue-tracker maps, ticket claiming, research/prototype labels)

## Related

- Map template: `.cursor/loops/MAP_TEMPLATE.md`
- Maps: `.cursor/loops/maps/`
- Answer key template: `.cursor/loops/ANSWER_KEY_TEMPLATE.md`
- Keys: `.cursor/loops/answer-keys/`
- Skill: `.cursor/skills/story-loop/SKILL.md`
- Product constraints while implementing: `.cursor/skills/custom-feature-skills/SKILL.md`
- Tests command: `.cursor/commands/run-tests.md`
- Grill-me: `.cursor/skills/grill-me/SKILL.md`
- Grill-with-docs: `.cursor/skills/grill-with-docs/SKILL.md`
