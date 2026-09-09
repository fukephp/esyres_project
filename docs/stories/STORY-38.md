# STORY-38 — Local demo seed

| Field | Value |
|-------|--------|
| ID | STORY-38 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-03, STORY-04, STORY-05, STORY-13, STORY-15, STORY-18 |

## User story

As a founder running the PWA locally, I want owners, salons, and bookings already provisioned, so I can log in as owner and as customer and see data without writing Gherkin.

## Acceptance criteria

- `DatabaseSeeder` throws when `APP_ENV` is not `local`.
- After `migrate:fresh --seed` with `APP_ENV=local`: `owner@esyres.test`, `guest@esyres.test`, and `owner2@esyres.test` exist; password is `password`; `owner@` owns two salons; `owner2@` owns one; `guest@` owns none.
- All three salons have both coordinates (Sarajevo), a non-closed weekly template, at least one worker, and services; categories across the set include hair, make-up, and massage. Names/prices are fixed literals, not Faker.
- The primary salon of `owner@` has exactly four bookings for `guest@`, dates relative to now (Sarajevo): two `requested`, one `time_proposed` (`proposed_starts_at` + `proposed_worker_id`), one `confirmed` (`worker_id`).
- The second salon of `owner@` has zero bookings.
- Newly provisioned salons outside this seeder stay closed / empty services / empty workers (do not change factory or creating defaults).
- Behat: one scenario runs `LocalDemoSeeder` after truncate and asserts the shape above. Remaining features do not use this seed.
- `esyres_app/README.md` lists the three logins and `migrate:fresh --seed`.

## Out of scope

- Staging/prod seed
- Behat shared seeded DB
- Invite-email UI; public “Register salon”
- Assistant intakes
- Photos, QR, push
- Declined / expired rows
- Changing invite-only owner onboarding
