Grill one incremental product story until shared understanding, then always persist new `STORY-xx` file(s).

Follow `.cursor/skills/new-story/SKILL.md` exactly. That skill is the source of truth. The interview engine is grilling (`.cursor/skills/grilling/SKILL.md`). **Never** run diverge.

If the user named a feature or change after this command, use that as the subject. Otherwise ask what to grill.

Refuse (no new file) if the topic is process/stack, already a `STORY-xx`, or no existing epic fits. Attach to an existing epic only.

If application code exists, use grill-with-docs interview rules (read the codebase; glossary + ADRs as they lock). Persist still **forces** `STORY-xx`. Do not implement after persist.
