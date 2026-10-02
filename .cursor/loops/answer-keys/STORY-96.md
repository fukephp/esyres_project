# Answer key: STORY-96

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-96 |
| Source | `docs/stories/STORY-96.md` — Worker profile on Radnici |
| Goal (one sentence) | Each worker on Radnici gets an optional owner-only profile in a Radno vrijeme-style accordion. |
| Branch name | `batch/STORY-96-97` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-02 (batch grill, all recommended) |

## Pass/fail — product

- [ ] `updateSalonWorker` saves name, `about` (≤1000, whitespace-only → null), `experienceYears` (0–60), `portfolioUrl` (`http://` / `https://` only), `maintenance` (≤300), and five lists (≤20 rows, ≤80 chars, blank rows dropped, order kept). Name stays required and unique on the salon. Bad input returns a client error and saves nothing — verify: Behat `features/owner/salon_workers.feature`
- [ ] `strongestServiceIds` accepts up to 5 services of this salon. A 6th or a foreign service is refused. Deleting a service drops its pick — verify: Behat `features/owner/salon_workers.feature`
- [ ] `uploadWorkerPhoto` accepts jpeg/png/webp ≤5 MB on the public disk, replacing deletes the old file; HEIC/GIF/SVG or oversize keeps no file; `removeWorkerPhoto` deletes it. A foreign worker is FORBIDDEN — verify: Behat `features/owner/salon_workers.feature`
- [ ] Owner salon query returns every new field so the form round-trips; public `salon` GraphQL has no new worker fields — verify: Behat `features/owner/salon_workers.feature` + Vitest source test that guest `SalonProfile.tsx` / public query are untouched
- [ ] Radnici is an exclusive accordion, all collapsed; collapsed row shows avatar + name; field order matches the story; one Spremi; closing drops the draft; initials helper (`Joe Doe` → `JD`, one word → one letter); with no services `Salon još nema usluga.`; checkboxes disabled at 5; `Spremljeno.` after save — verify: Vitest `workerProfile.test.ts` (initials helper, list trim) and `ownerSalons.source.test.ts` (accordion, field order, copy)
- [ ] Add worker stays name-only — verify: existing Behat `salon_workers.feature` scenarios stay green

## Pass/fail — architecture

Cite `docs/adr/0045-worker-profile-on-radnici.md` and `docs/adr/0037-salon-media-on-informacije.md`.

- [ ] One migration, no Spatie, no new npm or Composer package; no change to booking, assign, availability, or Telefon resolvers — verify: `git diff --name-only master...HEAD`
- [ ] Classifier fails (PHP), so Behat runs. Do not change `behat.yml` — verify: CONTEXT classifier

## Verify commands

Behat runs. From `esyres_app/`:

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat --format=progress --stop-on-failure
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
```

## Out of scope

- Guest display / public GraphQL of the profile
- Worker↔service matrix
- Certificate uploads, structured rows, drag-reorder, crop
- Avatar outside Radnici

## Implementer instructions

1. Read this key, the map, `.cursor/CONTEXT.md`, the story, and ADR 0045. Follow `.cursor/skills/custom-feature-skills/SKILL.md`.
2. Work on `batch/STORY-96-97`.
3. Commit on the batch branch when verify passes (`STORY-96 — Worker profile on Radnici`). On the cap or a repeated failure, stop this story and leave the PR to batch-stories.
