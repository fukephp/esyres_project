# STORY-56 — Exclusive chips on salon edit

| Field | Value |
|-------|--------|
| ID | STORY-56 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | `STORY-56` |
| Depends on | STORY-51, STORY-53, STORY-54, STORY-55 |

## User story

As an owner, I want salon edit split into exclusive sections, so I can edit one chunk at a time on a full-width page instead of a stacked skinny form.

## Acceptance criteria

- `/owner/salons/:id` stays salon edit (no `/edit` suffix, no nested `/hours` routes, no `?tab=` / hash). Catalog and add-salon still land here. Salon title stays above the chips.
- Four exclusive in-page chips under the title, Bosnian: **Informacije** / **Radno vrijeme** / **Usluge** / **Radnici**. One panel visible at a time. Land and refresh → Informacije (React state only). Phone: same four as a wrapping row. Chip look matches OwnerNav (active `font-semibold text-ink`, idle `text-body`). Not a second OwnerNav in the aside. No pills, underline bar, or badges on these chips.
- Informacije: name + address (required, cannot blank); save writes name+address only. Radno vrijeme: existing weekly hours + cancel window; save writes hours + cancel window only. Usluge and Radnici keep create/update by name (no delete). Switching chips does not save and does not warn; typed values stay in memory.
- Drop `max-w-md`. The visible panel is one hairline box spanning owner `main` (overlay inner stays unconstrained). Existing hours/services/workers editors stay; do not restyle hours into a week grid.

## Out of scope

- `?tab=` / hash / nested salon-edit routes
- Dirty-leave modal; auto-save on chip change
- Fifth chip (photos, map, guest-preview, Breaks-as-its-own-tab) or a setup wizard
- Delete / deactivate; assignment matrix; DND; photos; coords; reschedule cap
- New GraphQL mutations (reuse STORY-51–55)
