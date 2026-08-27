Run one product story through Loop Engineering (map → answer key → Hybrid implement → Bugbot).

Follow `.cursor/skills/story-loop/SKILL.md` and `.cursor/loops/PLAYBOOK.md` exactly. Those files are the source of truth.

If the user named a story id or title after this command, use that as the unit of work. Otherwise ask which story from the stories source named in `.cursor/CONTEXT.md`.

Do not invent product scope or architecture. Do not implement (Local) or emit a Cloud paste until an answer key is approved and the app root has concrete verify commands. Draft the key when fog is clear; ask for key approval, not compile OK. Prefer grill-me when decisions are still open and there is no app code; prefer grill-with-docs once a codebase exists.
