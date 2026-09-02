# STORY-03 — Owner workers

| Field | Value |
|-------|--------|
| ID | STORY-03 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `E7-workers` |
| Depends on | STORY-01 |

## User story

As an owner, I want to add workers to my salon, so that customers can request them specifically or leave it open. Workers follow the salon’s hours.

## Acceptance criteria

- A newly provisioned salon has an empty workers list.
- A verified-email owner who owns the salon can create a named worker and query the salon’s workers.
- That owner can update a worker they own and read back the new name.
- Create/update is rejected when: guest or other user; owner email unverified; empty name; duplicate name on the same salon.
- A worker is not a user (no login) and inherits salon hours (no per-worker hours).

## Out of scope

- Owner settings UI (`/owner`)
- Worker pick on the guest profile (STORY-09)
- Worker Availability Panel (Epic 3)
- Worker↔service assignment, salon switcher
- Delete / deactivate; per-worker shifts or vacation
- Worker photos, bios; sentinel “no preference” worker row
- Worker logins (Phase 2)
