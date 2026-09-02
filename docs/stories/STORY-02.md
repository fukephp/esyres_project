# STORY-02 — Owner services and prices

| Field | Value |
|-------|--------|
| ID | STORY-02 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `E7-services-prices` |
| Depends on | STORY-01 |

## User story

As an owner, I want to add/edit services with durations and prices, so that customers see accurate options.

## Acceptance criteria

- A newly provisioned salon has an empty services list.
- A verified-email owner who owns the salon can create a service with name, category (hair / make-up / massage), price in feninga, and optional duration (omit → 30 minutes); they can query the salon’s services and see the same values.
- That owner can update a service they own and read back the new name, category, duration, and price.
- Create/update is rejected when: guest or other user; owner email unverified; duration not on 15-minute steps or below 15; negative price; empty name; duplicate name on the same salon.

## Out of scope

- Owner settings UI (`/owner`)
- Public customer salon profile / discovery (Epic 1)
- Booking / service snapshots (Epic 2)
- Workers, worker↔service assignment, salon switcher
- Delete / deactivate / hide service
- Service photos, descriptions, packages
