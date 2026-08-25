---
name: story-loop
description: >-
  Run an Esyres MVP story through Loop Engineering: fog gate → optional
  Wayfinder-lite map → compile/approve answer key → Cloud Agent brief
  (implement/verify with iteration cap) → Bugbot on PR. Use when the user
  wants a story loop, Cloud Agent feature run, or answer-key-driven
  implementation.
---

# Story loop

Follow `.cursor/loops/PLAYBOOK.md`. Product constraints while implementing: `.cursor/skills/custom-feature-skills/SKILL.md`.

## Preconditions

1. Read `.cursor/CONTEXT.md`.
2. **Verify gate:** Detect whether `esyres_app/` has a real local verify runner (package scripts, PHPUnit / Pest, CI config, language tooling). If `esyres_app/` is still only a placeholder (e.g. `.gitkeep` only), or no test/typecheck/lint runner exists:
   - Say that story coding loops are blocked until scaffold + local verify exist.
   - Offer plan-gate prep only (map and/or answer key). Do **not** start or brief a coding Cloud Agent. Do not scaffold the app unless the user asked.
3. Unit of work is **one MVP story** from `docs/mvp/07-Stories.md` → one PR. Refuse multi-epic / whole-MVP gauntlets.

## Plan gate (Wayfinder-lite)

### Fog gate

After the story is picked, decide whether fog is **non-trivial**:

- More than **3** open decisions, **or**
- Story touches **auth**, **booking status transitions**, or a **new customer/owner surface**

**If non-trivial:** create or update `.cursor/loops/maps/STORY-xx.md` from `.cursor/loops/MAP_TEMPLATE.md`. Work the map before any answer key.

**If sharp:** skip the map; draft the answer key after a short grill (see Answer key below).

### Work the map

1. Fill Destination and Notes; list Open decisions and Not yet specified honestly.
2. Use grill-me style: resolve **one open decision at a time** with a recommended answer. Prefer exploring the codebase and `docs/mvp/` / `docs/architecture/` over guessing.
3. Move each locked answer into **Decisions so far**. Graduate fog into Open decisions only when the question is sharp enough to ask.
4. Do **not** compile an answer key while **Not yet specified** or **Open decisions** still have items.
5. When both are empty, set Status to `ready-to-compile` and ask the user for explicit OK to compile. Do not auto-compile.

### Compile answer key

Only after fog empty + opens cleared + **user OK**:

1. Draft or update `.cursor/loops/answer-keys/STORY-xx.md` from `.cursor/loops/ANSWER_KEY_TEMPLATE.md`.
2. Derive Goal, pass/fail product/architecture checks, and Out of scope from the map’s Destination, Decisions so far, and Out of scope. Do not invent checks for areas that were never decided.
3. Fill verify commands (concrete when a runner exists; else leave TBD and stay on plan-gate prep).
4. Set map Status to `compiled`. Leave answer key Status as `draft` until the user approves the key.

### Answer key approval

1. Leave answer key **Status** as `draft` until the user explicitly approves.
2. Do **not** emit a Cloud Agent coding brief until:
   - The key file exists under `.cursor/loops/answer-keys/`, and
   - The user has approved it (Status `approved`, or clear chat approval), and
   - Verify commands in the key are concrete (not still `TBD after scaffold`) when a coding run is requested, and
   - If a map was used: it is `compiled` with empty fog and empty open decisions.

## Cloud Agent brief

When preconditions and approval are met, emit a brief the user can paste into a Cloud Agent (or Automation). Include:

- **Branch:** from the answer key (e.g. `story/STORY-xx-short-slug`)
- **Answer key path:** `.cursor/loops/answer-keys/STORY-xx.md`
- **Map path** (if used): `.cursor/loops/maps/STORY-xx.md`
- **Instructions:** implement only the key; follow `custom-feature-skills`; run every verify command from `esyres_app/`; implement→verify loop; **iteration cap 5–8** (use the key’s cap if set); stop early if the same failure repeats twice with no progress; open a PR on success or a draft/blocked PR on escalate; do not expand scope
- **After PR:** remind the user to run **Bugbot** on the PR, then human review and merge

Do not invent a second unattended critic loop.

## After the PR exists

Remind: Bugbot → human merge. Machine gates already passed; Bugbot is the lightweight checker.

## Related

- Playbook: `.cursor/loops/PLAYBOOK.md`
- Map template: `.cursor/loops/MAP_TEMPLATE.md`
- Maps: `.cursor/loops/maps/`
- Answer key template: `.cursor/loops/ANSWER_KEY_TEMPLATE.md`
- Tests: `.cursor/commands/run-tests.md`
- Grill-me: `.cursor/skills/grill-me/SKILL.md`
