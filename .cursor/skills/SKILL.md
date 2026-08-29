---
name: project-skills
description: Index of project skills under .cursor/skills. Use when choosing which skill to apply, or when the user asks what skills exist.
---

# Project skills

Follow `.cursor/CONTEXT.md` first. Then open the matching skill folder.

## Product and shipping

| Skill | When to use |
|-------|-------------|
| [grill-me](grill-me/SKILL.md) | **Default** when there is no app code; user says "grill me"; writes nothing |
| [grill-with-docs](grill-with-docs/SKILL.md) | Same interview against a **codebase**; writes glossary + ADRs (`/grill-with-docs`) |
| [scaffold-project](scaffold-project/SKILL.md) | New sibling project from this framework layout (`/scaffold-project`) |
| [sync-framework](sync-framework/SKILL.md) | Propagate allowlisted Cursor defaults into one existing sibling (`/sync-framework`) |
| [story-loop](story-loop/SKILL.md) | Story-sized Loop Engineering: answer key → Hybrid implement → Bugbot (`/story-loop`) |
| [what-next](what-next/SKILL.md) | Read-only orientation: classified inventory + top-3 next picks with one Recommended (`/what-next`) |
| [custom-feature-skills](custom-feature-skills/SKILL.md) | Adding or changing a product feature against MVP epics/stories |
| [deploy-staging](deploy-staging/SKILL.md) | Deploying or preparing a staging release |

## UI (vendored from MengTo/Skills, MIT)

| Skill | When to use |
|-------|-------------|
| [tailwindcss](tailwindcss/SKILL.md) | Tailwind classes, layout, theming |
| [design-first-ui-prompting](design-first-ui-prompting/SKILL.md) | Spec-driven UI prompts before generating screens |
| [landing-page](landing-page/SKILL.md) | Marketing landing pages (when the user asks) |
| [pricing-page](pricing-page/SKILL.md) | Marketing pricing pages (when the user asks) |
| [build-awwwards-quality-sites](build-awwwards-quality-sites/SKILL.md) | Marketing polish / motion-rich sites (when the user asks) |

Do not invent a parallel workflow. If the task is a slash command (`/generate-docs`, `/run-tests`, `/scaffold-project`, `/sync-framework`, `/story-loop`, `/what-next`, `/grill-with-docs`), use `.cursor/commands/` instead.
