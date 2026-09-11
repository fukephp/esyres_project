---
name: project-skills
description: Index of project skills under .cursor/skills. Use when choosing which skill to apply, or when the user asks what skills exist.
---

# Project skills

Follow `.cursor/CONTEXT.md` first. Then open the matching skill folder.

## Product and shipping

| Skill | When to use |
|-------|-------------|
| [grilling](grilling/SKILL.md) | **Default** interview engine (rounds/frontier); auto before locking a plan |
| [diverge](diverge/SKILL.md) | Isolated option-space before a product MVP or new-story grill (wrappers only; no slash command) |
| [grill-me](grill-me/SKILL.md) | User-invoked grilling; persist at end of topic (`/grill-me`) |
| [grill-with-docs](grill-with-docs/SKILL.md) | User-invoked grilling against a **codebase**; glossary + ADRs as they lock; product/stories end-batch (`/grill-with-docs`) |
| [domain-modeling](domain-modeling/SKILL.md) | Glossary + ADRs as terms/decisions lock (loaded by grill-with-docs) |
| [scaffold-project](scaffold-project/SKILL.md) | New sibling project from this framework layout (`/scaffold-project`) |
| [sync-framework](sync-framework/SKILL.md) | Propagate allowlisted Cursor defaults into one existing sibling (`/sync-framework`) |
| [story-loop](story-loop/SKILL.md) | Story-sized Loop Engineering: answer key → Hybrid implement → Bugbot (`/story-loop`) |
| [what-next](what-next/SKILL.md) | Read-only orientation: status counts, in-flight with links, top-3 next picks with one Recommended (`/what-next`) |
| [custom-feature-skills](custom-feature-skills/SKILL.md) | Adding or changing a product feature against MVP epics/stories |
| [deploy-staging](deploy-staging/SKILL.md) | Deploying or preparing a staging release |

## UI (vendored from MengTo/Skills, MIT)

| Skill | When to use |
|-------|-------------|
| [tailwindcss](tailwindcss/SKILL.md) | Tailwind classes, layout, theming |
| [design-first-ui-prompting](design-first-ui-prompting/SKILL.md) | Spec-driven UI prompts before generating screens |
| [landing-page](landing-page/SKILL.md) | Company pitch on `/` (when the user asks) |
| [pricing-page](pricing-page/SKILL.md) | Not MVP — no public pricing |
| [build-awwwards-quality-sites](build-awwwards-quality-sites/SKILL.md) | Pitch polish / motion (only when the user asks) |

Do not invent a parallel workflow. If the task is a slash command (`/generate-docs`, `/run-tests`, `/scaffold-project`, `/sync-framework`, `/story-loop`, `/what-next`, `/grill-me`, `/grill-with-docs`), use `.cursor/commands/` instead.
