Grill a plan or design until shared understanding. Persist decided docs at end of topic (mvp, stories, architecture, CONTEXT as decided).

Follow `.cursor/skills/grill-me/SKILL.md` exactly. That skill is the source of truth. The interview engine is grilling (`.cursor/skills/grilling/SKILL.md`). On a product MVP breakdown or a new story/feature not already in `docs/stories/`, the wrapper runs diverge first (`.cursor/skills/diverge/SKILL.md`), then grilling locks.

If the user named a plan, feature, or change after this command, use that as the subject. Otherwise ask what to grill.

Phrases: `/grill-me` (default). Opt-in `no-human-grilling` and/or `no-human-review` (order-independent; same as `story-loop … unattended`). Product persist only; refuse flags on a full MVP breakdown; process/stack → flags are no-ops. At most one incremental `STORY-xx`. Never diverge under flags.

Do not invent product scope or architecture. Do not implement until the user confirms shared understanding (skip that wait when `no-human-review`). If application code exists, use grill-with-docs instead.
