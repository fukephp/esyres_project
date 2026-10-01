# STORY-88 — Owner rail toggle

| Field | Value |
|-------|--------|
| ID | STORY-88 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-85 |

## User story

As an owner, I want a button to collapse and expand the menu, so that I can use icons or read the labels.

## Acceptance criteria

- Laptop rail only, on every owner route that uses `OwnerShell`. This replaces the STORY-85 outcome that the rail does not expand. STORY-85 stays as written.
- The toggle sits at the bottom of the rail, above Odjava. Collapsed is today’s narrow icon rail. Expanded widens the rail in the layout (main shifts) and shows the existing labels: Zahtjevi, Zapisi, Chat, Statistika, Saloni, Postavke. Odjava stays an icon. Active link stays the light pill. Chats keeps the count badge. Link targets, `?salon=`, and `?date=` stay as they are.
- Accessible names: **Proširi izbornik** when collapsed, **Sklopi izbornik** when expanded.
- This browser remembers the choice. Nothing saved means collapsed. The ghost `OwnerShell` uses the saved width, and the narrow rail when nothing is saved. Placeholders stay untappable until `me` lands.
- Phone header and bottom tabs stay as they are.

## Out of scope

- A phone control that hides the bottom tabs
- A word on Odjava
- A rail that floats over the page
- New nav items, or a change to the Zahtjevi progress bar
