# STORY-51 — Salon edit name and address

| Field | Value |
|-------|--------|
| ID | STORY-51 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-50 |

## User story

As an owner, I want to edit a salon’s name and address on `/owner/salons/:id`, so that the catalog has a place for the rest of the profile to land.

## Acceptance criteria

- `/owner/salons/:id` is salon edit for a salon the session owns (same owner overlay + OwnerNav Saloni as STORY-50). No `/edit` suffix. Foreign or missing id is forbidden / not found (same owner policy as other salon mutations). Catalog row navigates here.
- Owner can save **name** and **address** (both required, cannot blank). Guests still omit address on the profile when it is missing (shops that never had one). No geocode, no `lat`/`lng`.
- Hours, services, and workers are not on this page yet (STORY-53–55). `/create-salon` unchanged.

## Out of scope

- Add salon (STORY-52)
- Hours / cancel window UI (STORY-53)
- Services UI (STORY-54)
- Workers UI (STORY-55)
- Delete salon; DND; photos; reschedule cap
