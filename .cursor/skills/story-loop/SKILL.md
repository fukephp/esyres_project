---
name: story-loop
description: >-
  Run an Esyres MVP story through Loop Engineering: grill-me/plan → approve
  answer key → Cloud Agent brief (implement/verify with iteration cap) → Bugbot
  on PR. Use when the user wants a story loop, Cloud Agent feature run, or
  answer-key-driven implementation.
---

# Story loop

Follow `.cursor/loops/PLAYBOOK.md`. Product constraints while implementing: `.cursor/skills/custom-feature-skills/SKILL.md`.

## Preconditions

1. Read `.cursor/CONTEXT.md`.
2. **Verify gate:** Detect whether `esyres_app/` has a real local verify runner (package scripts, PHPUnit / Pest, CI config, language tooling). If `esyres_app/` is still only a placeholder (e.g. `.gitkeep` only), or no test/typecheck/lint runner exists:
   - Say that story coding loops are blocked until scaffold + local verify exist.
   - Offer to draft or refine an answer key only (plan gate prep).
   - Do **not** start or brief a coding Cloud Agent. Do not scaffold the app unless the user asked.
3. Unit of work is **one MVP story** from `docs/mvp/07-Stories.md` → one PR. Refuse multi-epic / whole-MVP gauntlets.

## Plan gate (answer key)

1. If no answer key path is given, draft one from `.cursor/loops/ANSWER_KEY_TEMPLATE.md` into `.cursor/loops/answer-keys/STORY-xx.md` using grill-me or a short plan chat until fog is cleared. Prefer exploring the codebase and `docs/mvp/` / `docs/architecture/` over guessing.
2. Leave **Status** as `draft` until the user explicitly approves.
3. Do **not** emit a Cloud Agent coding brief until:
   - The key file exists under `.cursor/loops/answer-keys/`, and
   - The user has approved it (Status `approved`, or clear chat approval), and
   - Verify commands in the key are concrete (not still `TBD after scaffold`) when a coding run is requested.

## Cloud Agent brief

When preconditions and approval are met, emit a brief the user can paste into a Cloud Agent (or Automation). Include:

- **Branch:** from the answer key (e.g. `story/STORY-xx-short-slug`)
- **Answer key path:** `.cursor/loops/answer-keys/STORY-xx.md`
- **Instructions:** implement only the key; follow `custom-feature-skills`; run every verify command from `esyres_app/`; implement→verify loop; **iteration cap 5–8** (use the key’s cap if set); stop early if the same failure repeats twice with no progress; open a PR on success or a draft/blocked PR on escalate; do not expand scope
- **After PR:** remind the user to run **Bugbot** on the PR, then human review and merge

Do not invent a second unattended critic loop.

## After the PR exists

Remind: Bugbot → human merge. Machine gates already passed; Bugbot is the lightweight checker.

## Related

- Playbook: `.cursor/loops/PLAYBOOK.md`
- Template: `.cursor/loops/ANSWER_KEY_TEMPLATE.md`
- Tests: `.cursor/commands/run-tests.md`
- Grill-me: `.cursor/skills/grill-me/SKILL.md`
