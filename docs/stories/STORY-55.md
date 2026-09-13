# STORY-55 — Workers on salon edit

| Field | Value |
|-------|--------|
| ID | STORY-55 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-03, STORY-51 |

## User story

As an owner, I want to add and edit workers by name on salon edit, so that guests can request them without a separate workers home.

## Acceptance criteria

- Salon edit lists that salon’s workers and can create/update a worker **name** (STORY-03 rules: verified owner, non-empty, unique on the salon). Workers still are not users and still inherit salon hours.
- Rename/update only. No delete or deactivate. No worker↔service matrix. No worker login.

## Out of scope

- Worker login (Phase 2)
- Per-worker shifts, vacation, photos, bios
- Assignment matrix (later)
- Sentinel “no preference” worker row
- Delete / deactivate
