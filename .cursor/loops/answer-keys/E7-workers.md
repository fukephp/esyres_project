# Answer key: E7-workers

> Epic 7 add workers to a salon. Backend vertical.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/E7-workers.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | E7-workers |
| Source | `docs/mvp/07-Stories.md` Epic 7 — “As an owner, I want to add workers to my salon, so that customers can request them specifically or leave it open. Workers follow the salon’s hours.” |
| Goal (one sentence) | A verified owner can create and update named workers on a salon they own via GraphQL, with Behat as the owner. |
| Branch name | `story/E7-workers` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-08-29 |

## Pass/fail — product

- [x] A newly provisioned salon has an empty `workers` list — verify: Behat
- [x] A verified-email owner who owns the salon can `createSalonWorker` with `name`; they can query `salon { workers }` and see the same value — verify: Behat
- [x] That owner can `updateSalonWorker` on a worker they own and read back the new name — verify: Behat
- [x] Create/update is rejected when: guest or other user; owner email unverified; empty name; duplicate name on the same salon — verify: Behat

## Pass/fail — architecture

Cite `docs/architecture/03-Backend.md`, `05-Data-Model.md`, `06-Auth-Notifications-Realtime.md`, `08-Decisions.md`.

- [x] Lighthouse `/graphql` is the API; no public REST resource for workers — verify: Behat hits `/graphql`; no new workers REST routes
- [x] Sanctum cookies, not Bearer; Behat does not use a test-only auth bypass — verify: Behat login steps; no `actingAs` / magic token in app code
- [x] Worker is not a User (no `user_id`, no login) and inherits salon hours (no hours columns or worker-hours mutation) — verify: schema / migrations / Behat
- [x] No Pest; backend gate remains `vendor/bin/behat` (not `php artisan test`) — verify: no `pestphp` require; Behat features exist
- [x] No `/owner` UI, no React Router, no Apollo, no `vite-plugin-pwa`; PWA stays the throwaway placeholder — verify: `esyres_app/frontend/package.json` and app entry
- [x] No delete/deactivate/`active` flag, no worker↔service pivot, no booking `worker_id`, no public salon profile query this PR — verify: schema / migrations / Behat (those types/fields absent or unused)

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
- Booking / worker pick UI / `worker_id` on bookings (Epic 2)
- Worker Availability Panel (Epic 3)
- Worker↔service assignment, salon switcher
- Delete / deactivate / `active` flag
- Per-worker hours, shifts, vacation
- Worker photos, bios, mini-profiles
- Sentinel “no preference” worker row
- Public customer register; invite-email onboarding UI
- Redis, nginx, Reverb, Mailpit, Vite in compose (beyond what hours already added)
- Native apps, payments, worker logins, Pest, Inertia

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md`, and `docs/architecture/` (03, 05, 06, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Branch: `story/E7-workers`.
3. Add `workers` table + `Worker` model + factory. `Salon::workers()`. Columns: `salon_id`, `name`. Unique `(salon_id, name)`. No `user_id`, no hours, no soft deletes, no `active` flag, no photos this PR.
4. GraphQL: type `Worker`; `createSalonWorker(salonId, input)` and `updateSalonWorker(id, input)`; owner `salon { workers }`. Input: `name`. Policies: verified email + owns the salon (create) / owns the worker’s salon (update). English GraphQL errors as machine codes (`UNAUTHENTICATED`, `EMAIL_UNVERIFIED`, `FORBIDDEN`, `INVALID_NAME`, `DUPLICATE_WORKER_NAME`).
5. Name unique per salon; trim; reject empty.
6. Behat: English Gherkin, GraphQL-over-HTTP, Sanctum cookie + CSRF, migrate-fresh + per-scenario fixtures. Cover the product checks above. Reuse existing login / owner fixture steps. No Mink. No GraphQL booking features.
7. Do not add Pest. Do not add product PWA routes or owner UI.
8. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
9. On success: PR linking this key; list commands run. **Not a UI story** — skip playbook screenshots. Do not commit shot files.
10. On escalate: draft/blocked PR with failing checks and the human decision needed.
11. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
