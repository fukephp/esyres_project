# Esyres — agent context

This file is the source of truth for everything under `.cursor/`. Read it before applying rules, skills, commands, or hooks. Product scope lives in `docs/mvp/`. Target architecture lives in `docs/architecture/`. Application code lives in `esyres_app/` (Laravel 13 + React TypeScript PWA placeholder). App commands and Docker Compose run from `esyres_app/`, not the git root. See `AGENTS.md`.

## Product (locked)

Two-sided salon reservation PWA for Sarajevo. Customer picks service(s), optional worker, and a preferred **day and time**. Two guest paths, one contract: picker (primary CTA) or scripted salon-profile chat (Epic 10, after the picker/panel loop). Both create `requested`. Owner accepts preferred time or counter-proposes. Status: `requested → confirmed` (accept), `requested → declined` (owner decline), or `requested → time_proposed → confirmed | declined` (counter-propose).

- Customer: guest discovery, day-level busy badge (🟢/🟡/🔴), simple date+time picker (no slot grid). Chat is the messy-intent alternate on the salon profile (salon-branded Bosnian, live salon data only, coarse 1–3 time suggestions, same email+phone OTP to send). Email+password login (not a homepage wall). Verified email + phone OTP required to **send a request**.
- Owner: invite-only. Pending queue (shows preferred date/time), Worker Availability Panel (one-tap accept + drag-to-counter-propose + tap fallback) is home. In-flight chat tab + badge; optional Take over (guest waits only after that tap; after hours / DND assistant always finishes). Salon switcher if they own more than one salon. Complexity stays on this side.
- MVP captures trust data (response time, no-show, QR visit, verification). Badge **display** is Phase 2.
- Not MVP: native apps, in-app payments, worker logins, reviews, Viber/WhatsApp/Instagram DM messaging, LLM NLU, chain multi-location, receptionist roles.

Bosnian-first UI. Prices in KM (integer feninga in the data model). Preserve QR / Instagram-bio → browse → request.

## Architecture (locked)

See `docs/architecture/`. Short version: Laravel + Lighthouse GraphQL + MySQL + Redis + Reverb, one React TypeScript PWA, Sanctum cookies, same origin via Nginx. Slim Docker Compose (`php` + `node` + `mysql`) lives in `esyres_app/`; nginx, redis, reverb, and the rest of the full list are not written yet.

Do not invent a different stack. Do not expand the scaffold into product features unless the user asks.

**Local verify** (from `esyres_app/`): `docker compose up -d mysql`; `docker compose run --rm php php artisan --version`; `docker compose run --rm php vendor/bin/behat`; frontend `typecheck` / `test` / `build`; marketing `build`. See `esyres_app/README.md`. Backend gate is Behat, not `php artisan test`.

## Folder map

| Path | Role |
|------|------|
| `esyres_app/` | Application (Laravel + PWA). Commands (`composer`, `php artisan`, `npm`, `docker compose`, Behat) run here. |
| `esyres_app/frontend/` | Product PWA (Vite + React + TypeScript). Placeholder until product stories. |
| `esyres_app/marketing/` | Design 1 static marketing site (Vite + HTML/CSS). Sibling under the Laravel root — not under `public/`, not in the PWA bundle. Commands: `npm run dev` from `esyres_app/marketing/`. |
| `docs/glossary.md` | Domain glossary (lazy; grill-with-docs). Not `.cursor/CONTEXT.md`. |
| `docs/adr/` | ADRs (lazy; grill-with-docs). If an ADR changes a locked stack choice, also update `docs/architecture/08-Decisions.md`. |
| `DESIGN.md` | Index for **two** packs — Design 1 marketing, Design 2 PWA. Shared Cal tokens; separate by surface. Read before UI. |
| `refs/design-1/` | Design 1 pack: marketing landing spec (Cal-adapted; see DESIGN.md) |
| `refs/design-2/` | Design 2 pack: Cal PWA tokens + composition + `panel-ref.jpg` (owner skeleton only) |
| `rules/frontend/` | UI/PWA conventions when frontend files are in play |
| `rules/backend/` | Booking, API, and data conventions when backend files are in play |
| `hooks/` | Scripts wired in `hooks.json` (session injects this file) |
| `skills/custom-feature-skills/` | How to add a feature against epics/stories |
| `skills/story-loop/` | Story-sized Loop Engineering: answer key → Hybrid implement → Bugbot |
| `skills/deploy-staging/` | How to ship to staging |
| `skills/grill-me/` | Relentless interview of a plan or design; writes nothing |
| `skills/grill-with-docs/` | Same interview against the codebase; writes `docs/glossary.md` + `docs/adr/` as terms/decisions lock |
| `skills/tailwindcss/` | Tailwind for the PWA (vendored MengTo; Esyres gate) |
| `skills/design-first-ui-prompting/` | Spec-driven UI prompts for the PWA (vendored MengTo; Esyres gate) |
| `skills/landing-page/` | Esyres **marketing site** landing only — not the PWA |
| `skills/pricing-page/` | Esyres **marketing site** pricing only — not salon KM prices |
| `skills/build-awwwards-quality-sites/` | Esyres **marketing site** polish only — never `/` or `/owner` |
| `loops/` | Story-loop playbook, Wayfinder-lite maps, answer-key template, and per-story keys |
| `commands/` | Slash workflows (`/generate-docs`, `/run-tests`, `/story-loop`, `/grill-with-docs`) |

## How to follow this file

1. Prefer `docs/mvp/` over inventing product behavior.
2. Prefer `docs/architecture/` over inventing a stack.
3. Do not expand MVP into Phase 2 work unless the user asks.
4. Update this file when a locked product or architecture decision lands.
5. Before UI work, read root `DESIGN.md`. Marketing → `refs/design-1/DESIGN.md`. PWA → `refs/design-2/DESIGN.md`, then `docs/mvp/04-UI-Design-Goals.md` and `rules/frontend/` for product UX. Same Cal tokens; do not mix marketing IA with product chrome. Does not override `docs/mvp/` or `rules/frontend/`.
6. MengTo UI skills live in `.cursor/skills/`. `landing-page`, `pricing-page`, and `build-awwwards-quality-sites` run only when the user explicitly says marketing site, Esyres landing, Esyres pricing page, or marketing homepage (Design 1). Marketing site lives in `esyres_app/marketing/` (Design 1 only — sibling to Laravel/PWA; never under `public/` or in the product SPA bundle).
7. Story loops (Loop Engineering): use `skills/story-loop/` and `loops/PLAYBOOK.md`. Runtime is Hybrid: Local default; Cloud on `unattended` (short paste, no `briefs/` folder). Coding story loops run verify from `esyres_app/` (see `esyres_app/README.md`). Use **grill-with-docs** (`/grill-with-docs`) so glossary and ADRs land on disk. Do not run unattended whole-MVP gauntlets. Foggy stories use Wayfinder-lite maps under `loops/maps/` before answer keys; sharp stories may skip the map.

## Docs index

**Product**

- `docs/mvp/01-Overview-and-Goals.md`
- `docs/mvp/02-Target-Users.md`
- `docs/mvp/03-Key-Features.md`
- `docs/mvp/04-UI-Design-Goals.md`
- `docs/mvp/05-Success-Goals.md`
- `docs/mvp/06-Epics.md`
- `docs/mvp/07-Stories.md`
- `docs/mvp/08-Improvements-and-Open-Questions.md`

**Architecture**

- `docs/architecture/01-Overview-and-Stack.md`
- `docs/architecture/02-System-Context.md`
- `docs/architecture/03-Backend.md`
- `docs/architecture/04-Frontend.md`
- `docs/architecture/05-Data-Model.md`
- `docs/architecture/06-Auth-Notifications-Realtime.md`
- `docs/architecture/07-Docker-and-Local-Dev.md`
- `docs/architecture/08-Decisions.md`
