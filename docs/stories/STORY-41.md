# STORY-41 — Create salon and listed discovery

| Field | Value |
|-------|--------|
| ID | STORY-41 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-01, STORY-11, STORY-40 |

## User story

As a customer who has a salon, I want to create it on the same account and reach the panel, so that I do not wait for a founder invite.

## Acceptance criteria

- `/create-salon` is a registered guest-reachable route (not `/signup`, not under `/owner`). Sparse Design-1 form: brand link to `/`, AuthShell if logged out, email-verify gate if needed, then salon name. No homepage header/footer, no feature grid, no owner-panel chrome.
- Signed-in user with verified email creates a salon by name only (`createSalon`). Same `users` row. Defaults match today’s provisioned salon: closed all seven weekdays, `cancellation_notice_hours` = 24, empty services, empty workers, no address, no `lat`/`lng`. Then go to `/owner`. Local `APP_ENV=local` skip of the email gate unchanged.
- If the user already owns a salon: homepage Get your panel slot is Panel → `/owner`; `/create-salon` redirects to `/owner`. Does not create another salon from `/` or `/create-salon`.
- Nearby and Popular return only **listed** salons: at least one open weekday and at least one service. `/salon/:id` still works when unlisted (Instagram/QR). Nearby still requires coordinates. No geocoding.
- No waitlist, Formspree, or second owner account type.

## Out of scope

- Second salon from the homepage (salon switcher stays STORY-04)
- Owner address / `lat`/`lng` editor
- Hours, services, workers UI (already STORY-01–03)
- Deleting Design-2 / owner light nav (STORY-42)
- Public pricing page
- Invite-email onboarding UI
