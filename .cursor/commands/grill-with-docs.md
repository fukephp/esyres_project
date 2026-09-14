Grill a plan or design against the codebase. Write glossary terms / ADRs as they lock. Persist product/stories at end of topic (same routing as grill-me).

Follow `.cursor/skills/grill-with-docs/SKILL.md` exactly. That skill is the source of truth. The interview engine is grilling; glossary/ADRs are domain-modeling. On a product MVP breakdown or a new story/feature not already in `docs/stories/`, the wrapper runs diverge first (`.cursor/skills/diverge/SKILL.md`), then grilling locks.

If the user named a plan, feature, or change after this command, use that as the subject. Otherwise ask what to grill.

Phrases: `/grill-with-docs` (default). Opt-in `no-human-grilling` and/or `no-human-review` (order-independent; same as `story-loop … unattended`). Product persist only; refuse flags on a full MVP breakdown; process/stack → flags are no-ops. At most one incremental `STORY-xx`. Never diverge under flags. Ignore the tokens when this skill is a story-loop subroutine.

Do not invent product scope or architecture. Do not implement until the user confirms shared understanding (skip that wait when `no-human-review`). If there is no application code yet and the user did not insist on this skill, use grill-me instead.
