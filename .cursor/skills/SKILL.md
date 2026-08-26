---
name: esyres-skills
description: Index of Esyres project skills under .cursor/skills. Use when choosing which skill to apply, or when the user asks what skills exist.
---

# Esyres skills

Follow `.cursor/CONTEXT.md` first. Then open the matching skill folder.

## Product and shipping

| Skill | When to use |
|-------|-------------|
| [custom-feature-skills](custom-feature-skills/SKILL.md) | Adding or changing a product feature against MVP epics/stories |
| [story-loop](story-loop/SKILL.md) | Story-sized Loop Engineering: answer key → Hybrid implement → Bugbot |
| [deploy-staging](deploy-staging/SKILL.md) | Deploying or preparing a staging release |
| [grill-me](grill-me/SKILL.md) | Stress-testing a plan or design; user says "grill me" |

## UI (vendored from MengTo/Skills, MIT)

PWA work uses the first two. The last three fire **only** on explicit Esyres-the-company marketing language: “marketing site”, “Esyres landing”, “Esyres pricing page”, “marketing homepage”. They must not run on salon pages, `/owner`, or service prices in KM. Do not scaffold a marketing site unless asked.

| Skill | When to use |
|-------|-------------|
| [tailwindcss](tailwindcss/SKILL.md) | Tailwind in the React PWA (or future marketing site). No GSAP/Three.js/WebGL in the app. |
| [design-first-ui-prompting](design-first-ui-prompting/SKILL.md) | Spec-driven UI prompts. Calm PWA; cinematic style only with marketing triggers. |
| [landing-page](landing-page/SKILL.md) | Esyres marketing landing only |
| [pricing-page](pricing-page/SKILL.md) | Esyres marketing pricing only (not salon KM prices; not MVP public pricing unless asked) |
| [build-awwwards-quality-sites](build-awwwards-quality-sites/SKILL.md) | Esyres marketing polish only. Never on the PWA. |

Do not invent a parallel workflow. If the task is a slash command (`/generate-docs`, `/run-tests`), use `.cursor/commands/` instead.
