# STORY-73 — Zahtjevi diary day list

| Field | Value |
|-------|--------|
| ID | `STORY-73` |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | `STORY-73` |
| Depends on | STORY-67 |

## User story

As an owner, I want that selected-day list to read as a diary (one clock gutter, hairline occupying rows, Inter day heading), so that I can scan start times down one column.

## Acceptance criteria

- `/owner` selected-day list keeps STORY-67 order, till-pile collapse, soon heading, empty copy, closed-day copy, mutations, and occupancy rules. This story changes row chrome only.
- One clock gutter on the left of the list column. Pending cards and occupying rows sit to the right of that same column. Times use the existing 2-digit `HH:mm` formatters.
- Day heading (Bosnian weekday + numeric date) is Inter 600 at the current size. The month title stays Cal Sans. Month grid, dots, and selected-day ink state stay.
- **Pending** stays a `{colors.surface-soft}` rounded hairline card. Gutter is the preferred start, or the reschedule start when that overlay is on. Meta line is duration and worker (or Bez preferencije), with the time only in the gutter. Initial, tags (`Uskoro` / `Premještaj` / `Asistent`), and `Prihvati` / `Predloži` / `Odbi` (including reschedule `Prihvati` / `Zadrži stari`) stay on the card.
- **Occupying** has no box. A hairline runs under the full row (gutter and content). Gutter is the start. Meta is `–{end} · {worker}` using the same en-dash as today’s range, start not repeated. No worker name: the meta is `–{end}` only. Worker dot, current job (service snapshot names), `Predloženo vrijeme`, and the no-show tag stay. Tap still opens Request Detail.
- **Pauza** and **Zatvoreno** stay muted lines with no clock gutter.
- Phone and `md+` use the same row chrome. The month-left / list-right split (stacked on phone) stays.

## Out of scope

- Homepage `/`, OwnerNav, and Request Detail chrome
- Month navigator pixels, including the Cal Sans month title
- A clock gutter on Pauza or Zatvoreno
- Staff-column board, drag, and a new end-time word
- Mutations, occupancy rules, and list order
