---
name: story-loop
description: >-
  Run one product story through Loop Engineering: fog gate → optional
  Wayfinder-lite map → draft/approve answer key → Hybrid implement
  (Local default in this chat; Cloud on unattended with a short paste)
  with iteration cap → Bugbot on PR. Use when the user wants a story
  loop or answer-key-driven implementation.
---

# Story loop

Follow `.cursor/loops/PLAYBOOK.md`. Product constraints while implementing: `.cursor/skills/custom-feature-skills/SKILL.md`.

## Phrases

- **Local (default):** `story-loop STORY-xx` (or “run story-loop for STORY-xx”) — implement in this chat.
- **Cloud (opt-in):** `story-loop STORY-xx unattended` (or a clear “Cloud Agent for STORY-xx”) — emit a short paste block only.

Do **not** emit a Cloud Agent brief unless the user opted into Cloud. Do not write files under `briefs/`.

## Preconditions

1. Read `.cursor/CONTEXT.md`.
2. Resolve from CONTEXT (when locked):
   - **Stories source** — path to the project’s stories doc or folder (e.g. under `docs/mvp/` or `docs/stories/`). If unset, ask which source to use; do not invent stories.
   - **App root** — folder where application commands and verify runners live. If unset or still a placeholder with no real runner, coding loops are blocked.
3. **Verify gate:** Detect whether the app root has a real local verify runner (tests, typecheck, lint, CI scripts the agent can fail). If there is no app root, only a placeholder, or no runner:
   - Say that story coding loops are blocked until scaffold + local verify exist.
   - Offer plan-gate prep only (map and/or answer key). Do **not** start coding or emit a Cloud paste. Do not scaffold the app unless the user asked.
4. Unit of work is **one story** from the stories source → one PR. Refuse multi-epic / whole-MVP gauntlets.

## Plan gate (Wayfinder-lite)

### Fog gate

After the story is picked, decide whether fog is **non-trivial**:

- More than **3** open decisions, **or**
- Story touches any item in the project’s **domain trigger list** (see CONTEXT and `PLAYBOOK.md`; empty until the project fills it), **or**
- Likely product checks do not yet have obvious verifiers (test, command, or `human-only: …`)

**If non-trivial:** create or update `.cursor/loops/maps/STORY-xx.md` from `.cursor/loops/MAP_TEMPLATE.md`. Work the map before any answer key.

**If sharp** (≤3 opens, no domain trigger, and every likely product check already has an obvious verifier): skip the map; draft the answer key after a short grill (see Answer key below).

### Work the map

1. Fill Destination and Notes; list Open decisions and Not yet specified honestly.
2. Use grill-me style: resolve **one open decision at a time** with a recommended answer. Prefer exploring the codebase and `docs/mvp/` / `docs/architecture/` / `docs/stories/` over guessing. If app code exists, use **grill-with-docs** so glossary/ADRs land on disk.
3. Move each locked answer into **Decisions so far**. Graduate fog into Open decisions only when the question is sharp enough to ask.
4. Do **not** compile an answer key while **Not yet specified** or **Open decisions** still have items. If a likely product check has no verifier, leave it there.
5. When both are empty, compile the **draft** key in the same turn (set map Status to `compiled`). Ask for **key** approval, not compile OK.

### Compile answer key

Only after fog empty + opens cleared (no extra compile OK):

1. Draft or update `.cursor/loops/answer-keys/STORY-xx.md` from `.cursor/loops/ANSWER_KEY_TEMPLATE.md`.
2. Derive Goal, pass/fail product/architecture checks, and Out of scope from the map’s Destination, Decisions so far, and Out of scope. Do not invent checks for areas that were never decided. Every product check must name a verifier; cap human-only at 1–2.
3. Fill verify commands (concrete when a runner exists; else leave TBD and stay on plan-gate prep). Cite the app root from CONTEXT.
4. Set map Status to `compiled`. Leave answer key Status as `draft` until the user approves the key.

### Answer key approval

1. Leave answer key **Status** as `draft` until the user explicitly approves.
2. Do **not** implement (Local) or emit a Cloud paste until:
   - The key file exists under `.cursor/loops/answer-keys/`, and
   - The user has approved it (Status `approved`, or clear chat approval), and
   - Every product check names a verifier (human-only capped at 1–2), and
   - Verify commands in the key are concrete (not still `TBD after scaffold`) when a coding run is requested, and
   - If a map was used: it is `compiled` with empty fog and empty open decisions.

## Hybrid implement

When preconditions and approval are met:

### Local (default)

Implement in this chat against the answer key:

- Branch from the key (e.g. `story/STORY-xx-short-slug`)
- Follow **Implementer instructions** in the key and `.cursor/skills/custom-feature-skills/SKILL.md`
- Run every verify command from the app root named in CONTEXT
- Implement→verify loop; **iteration cap 5–8** (use the key’s cap if set); stop early if the same failure repeats twice with no progress
- Open a PR on success or a draft/blocked PR on escalate; do not expand scope
- Do **not** capture or attach screenshots
- After PR: remind the user to run **Bugbot**, then human review and merge

### Cloud (opt-in only)

If the user said `unattended` or clearly asked for a Cloud Agent, emit this paste block and stop (do not implement here, do not write a file):

```text
Branch: <from answer key>
Answer key: .cursor/loops/answer-keys/STORY-xx.md
Follow Implementer instructions in that key.
Run every verify command from the app root named in CONTEXT. Iteration cap from key.
Open PR on pass; draft/blocked on escalate. Do not expand scope.
Do not capture or attach screenshots.
```

Do not invent a second unattended critic loop.

## After the PR exists

Remind: Bugbot → human merge. Machine gates already passed; Bugbot is the lightweight checker.

- Trivial nits: fix on the same PR; do not burn the iteration cap.
- Findings that contradict the approved key: stop and ask. Do not silently rewrite the key.

## Related

- Playbook: `.cursor/loops/PLAYBOOK.md`
- Map template: `.cursor/loops/MAP_TEMPLATE.md`
- Maps: `.cursor/loops/maps/`
- Answer key template: `.cursor/loops/ANSWER_KEY_TEMPLATE.md`
- Tests: `.cursor/commands/run-tests.md`
- Grill-me: `.cursor/skills/grill-me/SKILL.md`
- Grill-with-docs: `.cursor/skills/grill-with-docs/SKILL.md`
