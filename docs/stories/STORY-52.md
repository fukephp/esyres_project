# STORY-52 — Add salon

| Field | Value |
|-------|--------|
| ID | STORY-52 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `STORY-52` |
| Depends on | STORY-50, STORY-51 |

## User story

As an owner, I want to add another salon I own from `/owner/salons/create` with name and address, so that I do not reuse `/create-salon` as a second factory.

## Acceptance criteria

- `/owner/salons/create` is add salon: already an owner; **name and address both required** (written line, not geocode). Catalog has an add control that goes here. Success navigates to salon edit `/owner/salons/:id` for the new shop.
- New shop defaults match today’s `createSalon`: closed all seven weekdays, `cancellation_notice_hours` = 24, empty services, empty workers, no `lat`/`lng`. It is not listed until hours + one service exist (unchanged listed rule).
- Zero salons on this URL: same not-owner treatment as `/owner`. `/create-salon` stays name-only; already-owner redirect stays. Public create does not start requiring address.

## Out of scope

- Changing `/create-salon` copy, fields, or redirect (ADR 0025)
- Hours / services / workers on the create form (those are salon edit)
- Chain multi-location / shared workers
- Worker login
