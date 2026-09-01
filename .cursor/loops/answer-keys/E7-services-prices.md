# Answer key: E7-services-prices

> Epic 7 add/edit services with durations and prices. Backend vertical.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E7-services-prices.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E7-services-prices |
| Source | `docs/mvp/07-Stories.md` Epic 7 — “As an owner, I want to add/edit services with durations and prices, so that customers see accurate options.” |
| Goal (one sentence) | A verified owner can create and update named services on a salon they own (category, duration, price in feninga) via GraphQL, with Behat as the owner. |
| Branch name | `story/E7-services-prices` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-29 |

## Pass/fail — product

- [x] A newly provisioned salon has an empty `services` list — verify: Behat
- [x] A verified-email owner who owns the salon can `createSalonService` with `name`, `category` (`HAIR` \| `MAKE_UP` \| `MASSAGE`), `priceFeninga`, and optional `durationMinutes` (omit → 30); they can query `salon { services }` and see the same values — verify: Behat
- [x] That owner can `updateSalonService` on a service they own and read back the new name, category, duration, and price — verify: Behat
- [x] Create/update is rejected when: guest or other user; owner email unverified; duration not on 15-minute steps or below 15; negative `priceFeninga`; empty name; duplicate name on the same salon — verify: Behat

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`.

- [x] Lighthouse `/graphql` is the API; no public REST resource for services — verify: Behat hits `/graphql`; no new services REST routes
- [x] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass — verify: Behat login steps; no `actingAs` / magic token in app code
- [x] Money is integer feninga (`Int`); duration is integer minutes — verify: schema / Behat (no float price)
- [x] No Pest; backend gate remains `vendor/bin/behat` (not `php artisan test`) — verify: no `pestphp` require; Behat features exist
- [x] No `/owner` UI, no React Router, no Apollo, no `vite-plugin-pwa`; PWA stays the throwaway placeholder — verify: `esyres_app/frontend/package.json` and app entry
- [x] No delete/deactivate mutation, no worker assignment, no `BookingService`, no public salon profile query this PR — verify: schema / migrations / Behat (those types/fields absent or unused)

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Owner settings UI (`/owner`), React Router, Apollo, i18next, Design 2 chrome
- Public customer salon profile / discovery (Epic 1)
- Booking / `BookingService` snapshots (Epic 2)
- Worker Availability Panel (Epic 3)
- Workers, worker↔service assignment, salon switcher
- Delete / deactivate / hide service
- Service photos, descriptions, packages
- Public customer register; invite-email onboarding UI
- Redis, nginx, Reverb, Mailpit, Vite in compose (beyond what hours already added)
- Native apps, payments, worker logins, Pest, Inertia

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, and `docs/architecture/` (03, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Branch: `story/E7-services-prices`.
3. Add `services` table + `Service` model + factory. `Salon::services()`. Columns: `salon_id`, `name`, `category`, `duration_minutes` (default 30), `price_feninga` (unsigned integer, 0 allowed). Unique `(salon_id, name)`. No soft deletes, no `active` flag, no photos this PR.
4. GraphQL: enum `ServiceCategory` (`HAIR`, `MAKE_UP`, `MASSAGE`); type `Service`; `createSalonService(salonId, input)` and `updateSalonService(id, input)`; owner `salon { services }`. `durationMinutes` optional on create (default 30). Policies: verified email + owns the salon (create) / owns the service’s salon (update). English GraphQL errors as machine codes (`UNAUTHENTICATED`, `EMAIL_UNVERIFIED`, `FORBIDDEN`, plus codes for invalid duration, negative price, empty name, duplicate name).
5. Duration must be an integer ≥ 15 on 15-minute steps. Price must be an integer ≥ 0. Name unique per salon.
6. Behat: English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF, migrate-fresh + per-scenario fixtures. Cover the product checks above. Reuse existing login / owner fixture steps. No Mink. No GraphQL booking features.
7. Do not add Pest. Do not add product PWA routes or owner UI.
8. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
9. On success: PR linking this key; list commands run. **Not a UI story** — skip playbook screenshots. Do not commit shot files.
10. On escalate: draft/blocked PR with failing checks and the human decision needed.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
