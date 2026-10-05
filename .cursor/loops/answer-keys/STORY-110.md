# Answer key: STORY-110

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-110 |
| Source | `docs/stories/STORY-110.md` — Admin gate for the first salon |
| Goal (one sentence) | A first salon stays pending until the seeded admin approves it, so naming a shop does not open the owner panel. |
| Branch name | `batch/STORY-109-110` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | chat / 2026-10-05 |

## Pass/fail — product

- [ ] `createSalon` stores name-only defaults with `owner_id` null and `submitted_by` set; a second submit throws `PENDING_SALON`; any booking this user sent throws `HAS_BOOKINGS`; an existing owner throws `ALREADY_OWNER`; an admin throws `FORBIDDEN`; favorites and ratings do not block — verify: Behat `features/guest/create_salon.feature`
- [ ] Pending salon is missing from discovery, `salon(id)` is null, and `GET /qr/{id}` does not resolve; approve sets `owner_id` and then profile and QR resolve; discovery still requires an open weekday and a service; `addSalon` is owned immediately — verify: Behat `features/guest/create_salon.feature` and `features/owner/admin_salon.feature`
- [ ] Reject deletes the pending row; non-admin `approveSalon` / `rejectSalon` throw `FORBIDDEN`; no customer push on approve or reject — verify: Behat `features/owner/admin_salon.feature`
- [ ] `adminOverview` counts pending salons, salons with an owner, and every booking; `pendingSalons` is person name plus salon name, oldest `created_at` first — verify: Behat `features/owner/admin_salon.feature`
- [ ] Local demo seed includes `admin@esyres.test` / Emina Softić / password `password` with `is_admin` and no salon, and still seeds the existing demo salons — verify: Behat `features/owner/local_demo_seed.feature`
- [ ] Admin shell routes `/admin` → `/admin/dashboard` and `/admin/na-odobrenju`; nav is Pregled then Na odobrenju only; customer routes in the story redirect this account to the dashboard — verify: vitest source test
- [ ] Admin top-nav is greeting, Odjava, and Pregled; no Profil, Moje rezervacije, or Panel; salon profile hides Pošalji zahtjev, Sačuvaj, and rating for `isAdmin` — verify: vitest `homepage.test.ts` and a salon source test
- [ ] Create-salon copy is **Salon čeka odobrenje.**, **Ovaj račun već ima zahtjeve.**, and **Salon nije odobren.**; empty admin list is **Nema salona na čekanju.**; Odobri and Odbij are buttons with no confirm dialog — verify: vitest source test
- [ ] Login of an admin from AuthShell navigates to `/admin/dashboard` — verify: vitest source test on the auth success path

## Pass/fail — architecture

- [ ] One `users` table; admin is a flag, not a second account type (`docs/architecture/06-Auth-Notifications-Realtime.md`, `docs/adr/0051-first-salon-waits-for-admin.md`)
- [ ] GraphQL mutations, Sanctum session, Design 2 owner shell chrome (`docs/architecture/04-Frontend.md`)
- [ ] No email, push, or SMS on approve or reject

## Verify commands

Run the CONTEXT **frontend-only classifier** first (union of untracked + unstaged + staged + `master...HEAD`). Skip Behat only if every `esyres_app/` path is under `esyres_app/frontend/`.

**If skipped** — from `esyres_app/frontend/`:

```text
npm run typecheck
npm run test
npm run build
```

**If Behat runs** — from `esyres_app/`:

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Charts, salon tables, customer or owner lists
- A screen to create another admin
- Email, push, or SMS on approve or reject
- Re-approving a salon that already has an owner

## Implementer instructions

1. Read this answer key and `.cursor/CONTEXT.md`. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Implement only what this key requires.
3. Loop: implement → CONTEXT frontend-only classifier → matching verify → fix. One cycle is one full verify.
4. Stop when the named checks and verify commands pass, or at cap 8, or when the same failure repeats twice.
5. On success: commit on `batch/STORY-109-110`. Message names `STORY-110` and the story title. Do not open a PR.
6. On the cap or a repeated failure: return the worktree to the last commit on this branch, including untracked files this story added, record STORY-110 as left out, and leave the PR to the batch skill.
