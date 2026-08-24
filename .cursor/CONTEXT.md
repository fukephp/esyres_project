# Esyres — agent context

This file is the source of truth for everything under `.cursor/`. Read it before applying rules, skills, commands, or hooks. Product scope lives in `docs/mvp/`. Target architecture lives in `docs/architecture/`. There is no application code yet; `esyres_app/` is the reserved app folder (placeholder until scaffolded). App commands run from `esyres_app/`, not the git root. See `AGENTS.md`.

## Product (locked)

Two-sided salon reservation PWA for Sarajevo. Customer picks service(s), optional worker, and a **day**. Owner proposes an exact time. Status: `requested → time_proposed → confirmed | declined`.

- Customer: guest discovery, day-level busy badge (🟢/🟡/🔴). Email+password login (not a homepage wall). Verified email + phone OTP required to **send a request**. No time grid.
- Owner: invite-only. Pending queue, Worker Availability Panel (drag-to-propose + tap fallback). Salon switcher if they own more than one salon. Complexity stays on this side.
- MVP captures trust data (response time, no-show, QR visit, verification). Badge **display** is Phase 2.
- Not MVP: native apps, in-app payments, worker logins, reviews, messaging, chain multi-location, receptionist roles.

Bosnian-first UI. Prices in KM (integer feninga in the data model). Preserve QR / Instagram-bio → browse → request.

## Architecture (locked)

See `docs/architecture/`. Short version: Laravel + Lighthouse GraphQL + MySQL + Redis + Reverb, one React TypeScript PWA, Sanctum cookies, same origin via Nginx, Docker Compose (not written yet).

Do not invent a different stack. Do not scaffold app code unless the user asks.

## Folder map

| Path | Role |
|------|------|
| `esyres_app/` | Application (Laravel + PWA). Empty placeholder until scaffolded. App commands run here, not at the git root. |
| `rules/frontend/` | UI/PWA conventions when frontend files are in play |
| `rules/backend/` | Booking, API, and data conventions when backend files are in play |
| `hooks/` | Scripts wired in `hooks.json` (session injects this file) |
| `skills/custom-feature-skills/` | How to add a feature against epics/stories |
| `skills/deploy-staging/` | How to ship to staging |
| `skills/grill-me/` | Relentless interview of a plan or design until shared understanding |
| `commands/` | Slash workflows (`/generate-docs`, `/run-tests`) |

## How to follow this file

1. Prefer `docs/mvp/` over inventing product behavior.
2. Prefer `docs/architecture/` over inventing a stack.
3. Do not expand MVP into Phase 2 work unless the user asks.
4. Update this file when a locked product or architecture decision lands.

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
