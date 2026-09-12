# Esyres — agent context

This file is the source of truth for everything under `.cursor/`. Read it before applying rules, skills, commands, or hooks. Product scope lives in `docs/mvp/`. Target architecture lives in `docs/architecture/`. Application code lives in `esyres_app/` (Laravel 13 + React TypeScript PWA placeholder). App commands and Docker Compose run from `esyres_app/`, not the git root. See `AGENTS.md`.

## Product (locked)

Two-sided salon reservation PWA for Sarajevo. Customer picks service(s), optional worker, and a preferred **day and time**. Two guest paths, one contract: picker (primary CTA) or scripted salon-profile chat (Epic 10, after the picker/panel loop). Both create `requested`. Owner accepts preferred time or counter-proposes. Status: `requested → confirmed` (accept), `requested → declined` (owner decline), or `requested → time_proposed → confirmed | declined` (counter-propose). A confirmed booking may become `cancelled` (customer cancel; late is a warning, not a hard block).

- Customer: typed `/` is the homepage (shared top-nav with the homepage slot, existing hero, simple footer). Pronađi salon goes to `/salons`. Idle `/salons` is a short card teaser from nearby or Popular in Sarajevo; a category chip, name search, or show-all opens the hairline results list (name, today’s busy, categories, address). Shared top-nav also on `/salons`, `/salon/:id`, `/create-salon`, `/bookings` (per-route slot; salon/discovery = Moje rezervacije, not Prijava/Get your panel). Guest routes share one ~1200px inner column so nav and main align; owner overlay inner stays unconstrained. Day-level busy badge (🟢/🟡/🔴), simple date+time picker (no slot grid). Chat is the messy-intent alternate on the salon profile (salon-branded Bosnian, live salon data only, coarse 1–3 time suggestions, same email+phone OTP to send). Email+password login (not a homepage wall). Verified email + phone OTP required to **send a request**, **respond to a counter-proposal**, **ask to reschedule**, and **cancel** a confirmed booking (skipped when `APP_ENV=local`; staging and production keep the gates).
- Owner: self-serve create salon on `/create-salon` (same account). Owner routes overlay the same top-nav (name + Odjava) above aside + OwnerNav. Pending queue (shows preferred date/time), Worker Availability Panel (one-tap accept + drag-to-counter-propose + tap fallback) is home. In-flight chat tab + badge; optional Take over (pause that intake, not live owner messages; guest waits only after that tap; after hours / DND assistant always finishes). Salon switcher if they own more than one salon. Complexity stays on this side. A confirmed booking may carry an in-progress reschedule overlay; the original slot stays occupied until the owner accepts.
- MVP captures trust data (response time, no-show, QR scan, QR visit, verification). Owner marks no-show after start (stay `confirmed`). Cancel and no-show increment salon + customer counters. Badge **display** is Phase 2.
- Not MVP: native apps, in-app payments, worker logins, reviews, Viber/WhatsApp/Instagram DM messaging, LLM NLU, chain multi-location, receptionist roles, sibling marketing site, public owner waitlist, public pricing page.

Bosnian-first UI. Prices in KM (integer feninga in the data model). QR sticker is `/qr/{id}` then the salon profile (hold cookie); Instagram-bio and organic `/salon/:id` do not set the hold and never show the homepage. Preserve that browse → request path.

## Architecture (locked)

See `docs/architecture/`. Short version: Laravel + Lighthouse GraphQL + MySQL + Redis + Reverb, one React TypeScript PWA, Sanctum cookies, same origin via Nginx. Slim Docker Compose (`php` + `vite` + `mysql` + `reverb`) lives in `esyres_app/`; nginx, redis, queue worker, and mailpit are not written yet.

Do not invent a different stack. Do not expand the scaffold into product features unless the user asks.

**Local verify** (from `esyres_app/`): `docker compose up -d`; `docker compose exec -T php php artisan --version`; `docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure` (Behat loads `.env.behat`, DB `esyres_test` only — never `esyres`); frontend `typecheck` / `test` / `build`. Never `docker compose run` for verify or servers; reuse :5173/:8000/:8080. See `esyres_app/README.md`. Backend gate is Behat, not `php artisan test`. Behat flags are CLI-only (same flags on `--suite owner|guest`); do not put them in `behat.yml`. A green run still means the full selected suite passed.

**Cloud Agent verify:** If `docker` is missing or dockerd is nested (apt-install `docker.io` inside the VM), do **not** start Compose MySQL that way — Behat becomes ~14× slower. Same as STORY-36: host PHP + host MySQL, still `.env.behat` / `esyres_test` only. Do not `migrate:fresh` or seed `esyres`. Do not `compose down -v`.

## Folder map

| Path | Role |
|------|------|
| `esyres_app/` | Application (Laravel + PWA). Commands (`composer`, `php artisan`, `npm`, `docker compose`, Behat) run here. |
| `esyres_app/frontend/` | Product PWA (Vite + React + TypeScript). Typed `/` is the homepage; Pronađi salon goes to discovery. |
| `docs/stories/` | One-PR story inventory (`STORY-xx.md` + `index.md`). what-next and story-loop read this, not `docs/mvp/07-Stories.md`. |
| `docs/glossary.md` | Domain glossary (lazy; domain-modeling via grill-with-docs). Not `.cursor/CONTEXT.md`. |
| `docs/adr/` | ADRs (lazy; domain-modeling via grill-with-docs). If an ADR changes a locked stack choice, also update `docs/architecture/08-Decisions.md`. |
| `DESIGN.md` | Index for **one** pack — Design 1 Cal (homepage, discovery, salon, owner). Shared top-nav; hero/footer on `/` only. Read before UI. |
| `refs/design-1/` | Design 1 pack: Cal tokens + composition (homepage + product chrome; busy/cell tokens live here) |
| `rules/frontend/` | UI/PWA conventions when frontend files are in play |
| `rules/backend/` | Booking, API, and data conventions when backend files are in play |
| `hooks/` | Scripts wired in `hooks.json` (session injects this file) |
| `skills/custom-feature-skills/` | How to add a feature against epics/stories |
| `skills/story-loop/` | Story-sized Loop Engineering: answer key → Hybrid implement → Bugbot |
| `skills/deploy-staging/` | How to ship to staging |
| `skills/grilling/` | Default interview engine (rounds/frontier); auto before locking a plan |
| `skills/domain-modeling/` | Glossary + ADRs as they lock (via grill-with-docs) |
| `skills/grill-me/` | User-invoked grilling + end-of-topic persist (`/grill-me`) |
| `skills/grill-with-docs/` | User-invoked grilling against the codebase; glossary + ADRs as they lock; product/stories end-batch (`/grill-with-docs`) |
| `skills/new-story/` | Incremental product story; grilling then always persist `STORY-xx` (`/new-story`; no diverge; existing epic only) |
| `skills/tailwindcss/` | Tailwind for the PWA (vendored MengTo; Esyres gate) |
| `skills/design-first-ui-prompting/` | Spec-driven UI prompts for the PWA (vendored MengTo; Esyres gate) |
| `skills/landing-page/` | Esyres **homepage** on `/` only — not discovery, salon, or `/owner` |
| `skills/pricing-page/` | Not MVP — do not invent public pricing; not salon KM prices |
| `skills/build-awwwards-quality-sites/` | Company-pitch polish only when explicitly asked — never discovery, salon, or `/owner` |
| `loops/` | Story-loop playbook, Wayfinder-lite maps, answer-key template, and per-story keys |
| `commands/` | Slash workflows (`/generate-docs`, `/run-tests`, `/story-loop`, `/grill-me`, `/grill-with-docs`, `/new-story`) |

## How to follow this file

1. Prefer `docs/mvp/` over inventing product behavior.
2. Prefer `docs/architecture/` over inventing a stack.
3. Do not expand MVP into Phase 2 work unless the user asks.
4. Update this file when a locked product or architecture decision lands.
5. Before UI work, read root `DESIGN.md`, then `refs/design-1/DESIGN.md`. Discovery / salon / `/owner` still follow `docs/mvp/04-UI-Design-Goals.md` and `rules/frontend/` for product UX (dense owner panel, sparse customer). Homepage hero/footer stay on `/` only; the top-nav is shared (STORY-43). Does not override `docs/mvp/` or `rules/frontend/`.
6. MengTo UI skills live in `.cursor/skills/`. `landing-page` runs only when the user explicitly asks for the homepage / Esyres landing on `/`. `pricing-page` stays unused (no public pricing). `build-awwwards-quality-sites` only when the user explicitly asks for homepage polish — never discovery, salon, or `/owner`. Code lives in `esyres_app/frontend/`. Never scaffold a `marketing/` folder.
7. Story loops (Loop Engineering): use `skills/story-loop/` and `loops/PLAYBOOK.md`. Runtime is Hybrid: Local default; Cloud on `unattended` (short paste, no `briefs/` folder). Coding story loops run verify from `esyres_app/` (`docker compose up -d` then `exec -T`; Behat is `vendor/bin/behat --format=progress --stop-on-failure`; see `esyres_app/README.md`). Cloud Agent: if Docker is missing or nested, host PHP + host MySQL (STORY-36) — do not apt-install dockerd; Behat still `esyres_test` only. Clear fog with **grilling** rounds; user starts `/grill-with-docs` so glossary and ADRs land on disk. Do not run unattended whole-MVP gauntlets. Foggy stories use Wayfinder-lite maps under `loops/maps/` before answer keys; sharp stories may skip the map. UI stories: ready on machine gates; visual review is you at merge (no PR screenshot gate). See playbook **UI ready rule**.

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
- `docs/stories/index.md` (`STORY-xx.md` inventory)

**Architecture**

- `docs/architecture/01-Overview-and-Stack.md`
- `docs/architecture/02-System-Context.md`
- `docs/architecture/03-Backend.md`
- `docs/architecture/04-Frontend.md`
- `docs/architecture/05-Data-Model.md`
- `docs/architecture/06-Auth-Notifications-Realtime.md`
- `docs/architecture/07-Docker-and-Local-Dev.md`
- `docs/architecture/08-Decisions.md`
