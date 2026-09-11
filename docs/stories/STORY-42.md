# STORY-42 — One Design 1 pack; owner Cal chrome

| Field | Value |
|-------|--------|
| ID | STORY-42 |
| Epic | 3 — Worker Availability Panel & Time Proposal (Owner) |
| Loop | `STORY-42` |
| Depends on | STORY-13, STORY-40 |

## User story

As an owner, I want the panel to use the same Cal look as the homepage, so that Esyres is one visual language.

## Acceptance criteria

- Design 1 is the only pack. Move busy-badge and owner panel cell tokens into `refs/design-1`. Delete `refs/design-2` (including `panel-ref.jpg` after any density note that still belongs in Design 1). Update root `DESIGN.md`, `.cursor/rules/frontend/design-system.mdc`, and CONTEXT pointers so agents do not open a second pack.
- `/owner` (queue, chats, stats, request detail) keeps dense queue + 15-minute grid. Drop dark nav for Cal light chrome (white canvas, black CTAs, Cal Sans + Inter). Not a marketing hero/footer on the panel.
- Discovery and salon profile keep their current layout (sparse customer). They inherit the shared tokens; do not restyle them as homepage IA.
- Status colors stay functional and separate from brand chrome (customer 🟢/🟡/🔴 vs owner cell tokens).

## Out of scope

- Homepage IA on `/salons` or `/salon/:id`
- Changing panel interactions (accept, drag, tap fallback)
- Public pricing page
- Awwwards / GSAP / Three.js
- New owner IA (KPI cards, mini-calendar, dashboard clone)
