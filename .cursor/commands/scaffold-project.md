Scaffold a new project from the esy_framework Cursor/docs layout.

Follow `.cursor/skills/scaffold-project/SKILL.md` exactly. That skill is the source of truth.

If the user named a project after this command (e.g. `/scaffold-project my_app`), use that as the folder name. Otherwise ask for the name before copying.

Do not invent product scope, architecture, or application code. After a successful copy, tell the user to open the new folder as the workspace and run grill-me (product grill persist writes mvp + `docs/stories/STORY-xx.md`).
