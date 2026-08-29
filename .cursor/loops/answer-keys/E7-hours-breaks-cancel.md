# Answer key: E7-hours-breaks-cancel

> Epic 7 working hours / breaks / cancellation notice. Backend vertical.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E7-hours-breaks-cancel.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E7-hours-breaks-cancel |
| Source | `docs/mvp/07-Stories.md` Epic 7 — “As an owner, I want to set my working hours, breaks, and cancellation notice window, so that the system reflects how my salon actually runs.” |
| Goal (one sentence) | An owner can persist weekly working hours, breaks, and `cancellation_notice_hours` on a salon they own, via GraphQL, with Behat as the owner. |
| Branch name | `story/E7-hours-breaks-cancel` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-29 |

## Pass/fail — product

- [x] GraphQL `login(email, password)` for an existing user starts a Sanctum session cookie (CSRF like the SPA). Wrong password fails. No public register and no “register salon” — verify: Behat
- [x] A newly provisioned salon is closed all seven weekdays and has `cancellation_notice_hours` = 24 — verify: Behat
- [x] A verified-email owner who owns the salon can replace the weekly template in one mutation: each Mon–Sun day is `closed` or one `opens_at`/`closes_at` (Sarajevo local, 15-minute steps, `closes_at` exclusive) plus optional one break that lies inside that day’s open interval; they can also set `cancellation_notice_hours`; they can query the salon back and see the same values — verify: Behat
- [x] Mutation is rejected when: guest or other user; owner email unverified; break on a closed day or outside the open interval; times not on 15-minute steps; overnight (`closes_at` ≤ `opens_at`) — verify: Behat

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `07-Docker-and-Local-Dev.md`, `08-Decisions.md`, `docs/adr/0001-mysql-in-slim-compose.md`.

- [x] Lighthouse `/graphql` is the API; no public REST resource for hours — verify: Behat hits `/graphql`; no new hours REST routes
- [x] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass — verify: Behat login steps; no `actingAs` / magic token in app code
- [x] Slim compose has `php` + `node` + `mysql`; Behat uses a dedicated MySQL test DB and migrate-fresh per scenario; no nginx, redis, reverb, mailpit this PR — verify: `esyres_app/docker-compose.yml`; Behat config / env
- [x] No Pest; backend gate remains `vendor/bin/behat` (not `php artisan test`) — verify: no `pestphp` require; Behat features exist
- [x] No `/owner` UI, no React Router, no Apollo, no `vite-plugin-pwa`; PWA stays the throwaway placeholder — verify: `esyres_app/frontend/package.json` and app entry
- [x] No holiday calendar, reschedule cap, services, workers, or public salon profile query this PR — verify: schema / migrations / Behat (those types/fields absent or unused)

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). MySQL must be up. Every command must exit 0.

```text
docker compose up -d mysql
docker compose run --rm php php artisan --version
docker compose run --rm php vendor/bin/behat
docker compose run --rm --workdir /app/frontend node npm run typecheck
docker compose run --rm --workdir /app/frontend node npm run test
docker compose run --rm --workdir /app/frontend node npm run build
docker compose run --rm --workdir /app/marketing node npm run build
```

## Out of scope

- Owner settings UI (`/owner`), React Router, Apollo, i18next, Design 2 chrome
- Public customer salon profile / discovery (Epic 1)
- Worker Availability Panel (Epic 3)
- Services, workers, salon switcher
- Holiday calendar, reschedule cap
- Public customer register; invite-email onboarding UI
- Redis, nginx, Reverb, Mailpit, Vite in compose
- Native apps, payments, worker logins, Pest, Inertia

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, `docs/adr/0001-mysql-in-slim-compose.md`, and `docs/architecture/` (03, 05, 06, 07, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Branch: `story/E7-hours-breaks-cancel`.
3. Add **mysql** to `esyres_app/docker-compose.yml` (healthcheck; php `depends_on` healthy mysql). App DB + dedicated Behat database. Point php/Behat at MySQL. Update `esyres_app/.env.example` and `esyres_app/README.md` verify notes (`docker compose up -d mysql` before Behat). Not Sail.
4. Install Lighthouse + Sanctum. Expose `/graphql`. Session + CSRF as the SPA will: cookie, not Bearer.
5. `Salon` belongs to a user (`owner_id`). Persist weekly hours + optional per-day break + `cancellation_notice_hours` (default 24). New salon: all days closed. Times are Sarajevo local clock `HH:MM` on 15-minute steps; do not store JS `Date`. Minimal other salon columns only as required to insert a row (name/placeholder ok). No holidays, reschedule cap, services, workers, photos this PR.
6. GraphQL (names may match this intent): `login`; owner mutation that **replaces** the week + notice window; owner query to read them back. Policies: verified email + owns the salon. English GraphQL errors as machine codes.
7. Behat: English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF, migrate-fresh + per-scenario fixtures (create user+salon in Gherkin, not a shared seed). Cover the product checks above. No Mink. No GraphQL booking features.
8. Do not add Pest. Do not add product PWA routes or owner UI.
9. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
10. On success: PR linking this key; list commands run. **Not a UI story** — skip playbook screenshots. Do not commit shot files.
11. On escalate: draft/blocked PR with failing checks and the human decision needed.
12. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
