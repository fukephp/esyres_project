Generate or update project documentation.

Follow `.cursor/CONTEXT.md`. Product truth is `docs/mvp/`. Architecture truth is `docs/architecture/`. Do not invent a new stack or later-phase features.

If the user named files or topics after this command, use that as the scope. Otherwise:

1. Read `README.md`, `docs/mvp/`, and `docs/architecture/` if the change is technical.
2. Decide whether the change belongs in `docs/mvp/` (product scope), `docs/architecture/` (stack, data, Docker), `docs/stories/` (existing `STORY-xx` only), `docs/diagrams/`, or `README.md` (repo status / how to run).
3. Update existing files in place. Do not invent new `STORY-xx` files (only a product grill creates those). Do not add other new doc files unless the user asked, or the existing sets are the wrong place. Do not restore `docs/tasks/`.
4. Keep current-phase vs later-phase explicit. Match the tone and structure of the surrounding docs.
5. If code exists, document only behavior that is true in the repo. If there is still no app code, say so in `README.md`. Do not pretend infrastructure folders exist until they do.

When done, list the files you changed and a one-line summary per file.
