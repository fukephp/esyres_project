# STORY-58 — Owner service categories

| Field | Value |
|-------|--------|
| ID | STORY-58 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-54, STORY-56, STORY-07, STORY-08, STORY-06, STORY-44 |

## User story

As an owner, I want to create named service categories and attach services to the selected category, so that the guest menu matches my real cjenovnik instead of locked hair / make-up / massage.

## Acceptance criteria

- A **service category** belongs to one salon. A service belongs to exactly one, required. The HAIR / MAKE_UP / MASSAGE enum is gone from Service. See `docs/adr/0033-salon-service-categories.md`.
- Verified owner who owns the salon can create a service category (name only), rename it, and delete it **only when it has no services**. Empty name and duplicate name on the same salon are rejected. Create order, no drag reorder.
- Usluge: list of that salon’s categories; services of the **selected** category; add category, then add service into the selected one. Zero categories → add-category only (no add-service). Move a service by picking another of this salon’s categories. Duplicate service names stay salon-wide. Same duration/price rejection as STORY-02.
- Guest `/salon/:id` idle and picker share one column with a heading per category that has ≥1 service. `md+` jump list (right) only when **≥2** visible categories; one visible category still shows the heading, no jump list. Empty categories are hidden on guest, visible on owner. Chat stays a flat name list. Multi-select across categories stays on one page (jump is not an exclusive filter).
- `/salons` teaser/results show that salon’s service category **names** (not enum labels). Discovery chips stay Kosa / Šminka / Masaža and still filter; they match a migrate-only, non-editable legacy key (`HAIR` / `MAKE_UP` / `MASSAGE`). Owner never sees or sets the key. Owner-created names with no key do not hit those chips.
- Migrate: per salon, one category per distinct enum actually used (names Kosa / Šminka / Masaža + that legacy key); point those services at it. Salon with no services gets no categories. Demo seed follows the same model.

## Out of scope

- Dynamic discovery chips (still open in mvp 08)
- Profile service search, Detaljnije, drag reorder, photos, descriptions, packages
- Chat grouped by category
- Delete category that still has services; delete/deactivate service
- Platform category catalog; dual taxonomy (hidden enum on the service)
- Worker↔service assignment matrix
