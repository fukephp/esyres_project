# Answer key: STORY-xx

> Copy this file to `.cursor/loops/answer-keys/STORY-xx.md` (use the real story id).
> Fill every section. Replace TBD after `esyres_app/` has real verify commands.
> Do not start a Cloud Agent until a human has approved this file.

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-xx |
| Source | `docs/mvp/07-Stories.md` (cite section / title) |
| Goal (one sentence) | |
| Branch name | `story/STORY-xx-short-slug` |
| Iteration cap | 8 |
| Status | draft \| approved |
| Approved by / date | |

## Pass/fail — product

Each line must be objectively checkable. Prefer observable behavior over vibes.

- [ ] …
- [ ] …

## Pass/fail — architecture

Cite `docs/architecture/` constraints this story must not violate.

- [ ] …
- [ ] …

## Verify commands

Run from `esyres_app/` unless noted. Every command must exit 0 before the loop may open a ready PR.

```text
TBD after scaffold
```

Examples to replace TBD once the app exists (adjust to real scripts):

```text
# vendor/bin/behat
# npm run typecheck
# npm run lint
```

## Out of scope

Explicit non-goals for this PR (Phase 2, adjacent stories, refactors not required by the story).

- …

## Cloud Agent instructions

1. Read this answer key and `.cursor/CONTEXT.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md` for product constraints.
2. Implement **only** what this key requires. Do not expand MVP or invent stack.
3. Loop: implement → run every verify command → fix failures. Count each full implement→verify as one cycle.
4. Stop when all product/architecture checks and verify commands pass, **or** when the iteration cap is hit, **or** when the same failure repeats twice with no progress.
5. On success: open a PR whose body links this answer key and lists what was verified.
6. On escalate: open a draft/blocked PR with failing checks, last command output summary, and the decision needed from a human. Do not keep spending cycles.
7. Do not mark the PR ready for merge solely because you believe the work is done — machine gates must pass.
