# STORY-79 — Prikaz setting

| Field | Value |
|-------|--------|
| ID | STORY-79 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-71, STORY-78 |

## User story

As an owner, I want to choose in Postavke whether I see Zahtjevi and Zapisi as a calendar or as a kanban board, and have that follow me to every device, so that the panel matches how I think about my day.

## Acceptance criteria

- `users.owner_view` column, `calendar` or `kanban`, default `calendar`, not null.
- GraphQL `User.ownerView: OwnerView!` (`CALENDAR | KANBAN`) and `updateOwnerView(view: OwnerView!): User!`. Guest gets `UNAUTHENTICATED`. Any signed-in person may set it (it is a person preference, not a salon policy).
- Postavke shows **Prikaz** above the password form: a segmented toggle Kalendar | Kanban with the current value selected. Tapping the other segment saves immediately and shows the new selection; an error keeps the old one.
- `ME_QUERY` carries `ownerView`.
- Behat: default is `CALENDAR`; set to `KANBAN` then `me` returns `KANBAN` in a new session; guest is rejected.

## Out of scope

- The Kalendar and Kanban layouts themselves (STORY-80).
- Per-salon or per-device preferences.
