Run one Esyres MVP story through Loop Engineering (map → draft answer key → you approve → Hybrid implement → Bugbot).

Follow `.cursor/skills/story-loop/SKILL.md` and `.cursor/loops/PLAYBOOK.md` exactly. Those files are the source of truth.

If the user named a story id or title after this command, use that as the unit of work. Otherwise ask which story from `docs/mvp/07-Stories.md`.

Do not invent product scope or architecture. Do not implement (Local) or emit a Cloud paste until an answer key is approved and `esyres_app/` has concrete verify commands. Draft the key when fog is clear; ask for key approval, not compile OK. Prefer grill-me when decisions are still open and there is no app code; prefer grill-with-docs once `esyres_app/` has real code.
