---
name: custom-feature-skills
description: Add or change a product feature against MVP epics and stories. Use when implementing a feature, story, or product change, or when the user mentions a new capability or epic.
---

# Custom feature skills

## Instructions

1. Read `.cursor/CONTEXT.md`, then `docs/mvp/` and the matching `docs/stories/STORY-xx.md`.
2. Classify the work:
   - **In current scope** → implement against the story; do not expand.
   - **Later phase / explicit non-goal** → stop and confirm with the user before coding.
   - **Not in docs** → write the gap in the reply; do not silently invent product behavior.
3. Prefer the smallest change that ships the story. Follow `docs/architecture/` for stack; do not invent a second API style.
4. Respect surfaces and constraints documented in CONTEXT.md and `docs/mvp/`.
5. If docs are still stubs only, use **grill-me** (persist at end of topic) before inventing behavior. If app code exists, use **grill-with-docs**.

## Feature checklist

- [ ] Story cited from `docs/stories/STORY-xx.md`; epic cited from `docs/mvp/`
- [ ] Surfaces and auth rules from docs respected
- [ ] Architecture conventions followed
- [ ] UI verified in the browser when the change is user-visible; attach desktop + mobile screenshots in the PR description (not committed to the repo)

## Examples

- "Add X from story Y" → implement only what the story requires.
- "Add something not in docs" → report the gap; do not invent.
- "Build a Phase 2 idea" → confirm with the user before coding.
