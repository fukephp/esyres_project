# Owner picks a Prikaz: Kalendar or Kanban

Owners could not see the week or the pipeline on Zahtjevi. Instead of one compromise layout, the owner picks a **Prikaz** in Postavke: **Kalendar** (week grid of occupying bookings + the selected day's Zahtjevi pile) or **Kanban** (the selected day's bookings in four status columns: Zahtjevi `requested`, Predloženo `time_proposed`, Potvrđeno upcoming `confirmed`, Završeno i otkazano `declined` / `cancelled` / past `confirmed`). The choice drives Zahtjevi and Zapisi; other owner pages only get the shell.

It is stored on the person account (`users.owner_view`, `calendar` default) so it follows the owner across devices, and set with `updateOwnerView`. It is a person preference, not a salon setting: one owner with two salons sees both the same way.

Kanban is day-scoped (day chips for the visible week) so Potvrđeno and Završeno do not grow unbounded. Neither template adds drag, a now-line, or a 15-minute board; counter-propose stays on Request Detail; accept stays one tap.

Supersedes the Zahtjevi layout in `docs/adr/0035-zahtjevi-month-and-selected-day-list.md` (month navigator + selected-day list).

Rejected: per-device localStorage (owner uses phone and laptop), per-salon setting, a third "list" template, worker-column Kanban.
