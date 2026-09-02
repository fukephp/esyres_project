# Answer key: STORY-xx

> Copy this file to `.cursor/loops/answer-keys/STORY-xx.md` (use the real story id).
> Fill every section. Replace TBD after the app root named in CONTEXT has real verify commands.
> Do not implement (Local or Cloud) until a human has approved this file.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-xx |
| Source | Stories path from CONTEXT (cite section / title) |
| Goal (one sentence) | |
| Branch name | `story/STORY-xx-short-slug` |
| Iteration cap | 8 |
| Status | draft \| approved |
| Approved by / date | |

## Pass/fail — product

Each line must be objectively checkable and **name a verifier**. Prefer observable behavior over vibes.

Format: `- [ ] <behavior> — verify: <test | command | human-only: …>`

Cap **human-only** at 1–2 lines per key. If a check cannot name a verifier, it is still fog — do not put it here.

Do not reserve a human-only line for PR screenshots. UI ready is machine gates; visual review is merge (playbook **UI ready rule**).

- [ ] … — verify:
- [ ] … — verify:

## Pass/fail — architecture

Cite `docs/architecture/` constraints this story must not violate.

- [ ] …
- [ ] …

## Verify commands

Run from the **app root** named in `.cursor/CONTEXT.md` unless noted. Every command must exit 0 before the loop may open a ready PR.

```text
TBD after scaffold
```

Examples to replace TBD once the app exists (adjust to real scripts):

```text
# npm test
# npm run typecheck
# npm run lint
```

## Out of scope

Explicit non-goals for this PR (later phase, adjacent stories, refactors not required by the story).

- …

## Implementer instructions

1. Read this answer key and `.cursor/CONTEXT.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md` for product constraints.
2. Implement **only** what this key requires. Do not expand scope or invent stack.
3. Loop: implement → run every verify command → fix failures. Count each full implement→verify as one cycle.
4. Stop when all named-verifier product checks, architecture checks, and verify commands pass, **or** when the iteration cap is hit, **or** when the same failure repeats twice with no progress. Human-only checks (at most 1–2) are for the human at PR review unless the key says otherwise.
5. On success: open a PR whose body links this answer key and lists what was verified. UI stories use the same ready rule as non-UI (machine gates). Do not embed screenshots in the PR. Do not open a draft/blocked PR because shots are missing. Do not type credentials into the IDE browser or ask the human to attach shots.
6. On escalate: open a draft/blocked PR with failing checks, last command output summary, and the decision needed from a human. Do not keep spending cycles.
7. Do not mark the PR ready for merge solely because you believe the work is done — machine gates must pass.
8. After PR: trivial Bugbot nits on the same PR (do not burn the cap). If Bugbot contradicts this key, stop and ask.
