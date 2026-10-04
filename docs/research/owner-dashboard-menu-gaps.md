# Owner dashboard menu gaps

**Not product or architecture truth.** Do not treat this file as a lock. Product stays in [`docs/mvp/`](../mvp/03-Key-Features.md). Architecture stays in `docs/architecture/`. This note does not add a story or an epic.

**Source of the comparison:** a Tasklify-style owner dashboard screenshot (sidebar: Dashboard, Tasks, Calendar, Chat, Reporting, Workflow; Tools: Notifications, Members, Inbox, Integrations, Help Center, Settings; header search, bell, Create; view switcher Kanban / Timeline / Spreadsheet / Calendar; priority pills and comment counts on cards). Compared to the live owner rail and the MVP lock. [`docs/research/owner-panel.md`](owner-panel.md) is older and still says Postavke and ratings are missing — do not copy it.

## Menu today

Owner rail items, in order, from [`OwnerNav.tsx`](../../esyres_app/frontend/src/components/OwnerNav.tsx): Zahtjevi, Zapisi, Chat (only when the Chat switch is on), Statistika, Saloni, Postavke. Labels are in [`i18n.ts`](../../esyres_app/frontend/src/i18n.ts). The same list is the locked owner menu in [`03-Key-Features.md`](../mvp/03-Key-Features.md) (Owner menu). Chat is omitted while the Postavke Chat switch is off, and that switch defaults off.

There is no Dashboard, Workflow, Notifications, Members, Inbox, Integrations, or Help Center item on that rail.

## Already covered

These screenshot items already have an Esyres equivalent. Do not re-propose them.

| Screenshot | Esyres | Source |
|------------|--------|--------|
| Tasks, Inbox, Kanban, Calendar | Zahtjevi and Zapisi. Prikaz is Kalendar (week grid plus the selected day’s pending pile) or Kanban (U toku / Zahtjevi / Predloženo / Potvrđeno / Završeno i otkazano). | [`03-Key-Features.md`](../mvp/03-Key-Features.md) Zahtjevi, Kanban columns, Zapisi |
| Chat | Chat tab and badge for in-flight intakes. Off until the owner turns the switch on. | Owner menu; In-flight chat tab |
| Reporting | Statistika: bookings per week, busiest hours/days, cancellation rate, day-level busy %, QR scan and scan→visit. Richer revenue charts stay a later stretch of that stats page, not a new menu item. | Basic Stats; [`08-Improvements`](../mvp/08-Improvements-and-Open-Questions.md) “Lightweight revenue tracking” |
| Settings | Postavke: Prikaz, Chat switch, password. | Owner settings |
| Create | Telefon on Zahtjevi writes a phone booking. Not a generic task. | Phone booking |
| Members | Workers live on salon edit Radnici. They are not login users. Worker self-service login is already Phase 2. | Staff/Worker Management; Explicitly Phase 2 |
| Integrations | Viber, WhatsApp, and Instagram DM are already Phase 2. | Explicitly Phase 2 |
| AI banner | Scripted assistant is MVP. LLM / free-form NLU is already Phase 2. | Salon Booking Assistant; Explicitly Phase 2 |
| Priority pills, Under Review | Statuses are `requested`, `time_proposed`, `confirmed`, `declined`, `cancelled`. That is the board. A task-priority model (Urgent / Low / Medium) and an Under Review column do not fit. | Zahtjevi; Kanban columns |

Workflow on the screenshot is a generic process builder. Esyres already has one status path (`requested` → `confirmed` or `declined`, or `requested` → `time_proposed` → `confirmed` or `declined`). A second workflow editor is not a gap.

## Future improvements

Only items with no rail entry and no Phase 2 bullet.

### Obavijesti

The screenshot Tools group has Notifications with an unread count. Esyres specifies web push for new requests, customer responses, and reschedule requests ([`03-Key-Features.md`](../mvp/03-Key-Features.md) owner Notifications). The PWA subscribes in [`push.ts`](../../esyres_app/frontend/src/lib/push.ts) (`useOwnerPush`, `subscribePush`) and a click opens `/owner?salon=`. The rail has no list of past alerts. The Chat badge counts in-flight chats. **Na čekanju · {n}** counts pending rows and jumps the day. Neither is a notification inbox.

### Pomoć

The screenshot has Help Center. The owner rail has no help route. MVP and the Phase 2 list in [`03-Key-Features.md`](../mvp/03-Key-Features.md) and [`06-Epics.md`](../mvp/06-Epics.md) do not mention one.

### Pretraga

The screenshot header is a search field. Owner routes have no search across guest name, phone booking, or day. Name search (`Ime salona`) is the guest discovery field only ([`03-Key-Features.md`](../mvp/03-Key-Features.md) Discovery home).

### Timeline and Spreadsheet

The screenshot view switcher has Kanban, Timeline, Spreadsheet, and Calendar. Esyres Prikaz has Kalendar and Kanban only ([`03-Key-Features.md`](../mvp/03-Key-Features.md) Owner menu, Kanban columns). A spreadsheet of the day (or an export) sits next to the already parked “Lightweight revenue tracking” line in [`08-Improvements-and-Open-Questions.md`](../mvp/08-Improvements-and-Open-Questions.md). Call it out so it is not treated as a new idea. Timeline is the new feature below, not a copy of that spreadsheet.

### Share

The screenshot has a share control beside the view switcher. No owner screen shares a day or a booking. QR is a sticker URL (`/qr/{id}`), not a share of the board ([`03-Key-Features.md`](../mvp/03-Key-Features.md) QR Reconnect Loop).

## One new feature

**Dnevni trak po radniku.** A read-only third Prikaz: the selected day, one row per worker, each booking as a bar on the clock (start to end). Breaks and Zatvoreno stay labeled rows, same as today.

Why this and not another column: Kanban groups by status. The week grid is day cards. Neither shows who is in the chair from 10:00 to 12:00. The owner still accepts, assigns, and counter-proposes from the existing cards and Request Detail.

It stays read-only. Zahtjevi already locks “No 15-minute worker board. No drag.” ([`03-Key-Features.md`](../mvp/03-Key-Features.md) Zahtjevi). This trak does not add drag, slot picking, or a guest-facing grid.

It is not the Phase 2 line “Buffer time between bookings, per-worker off/vacation days / hourly shifts.” Those change when a worker can be booked. The trak only draws bookings that already exist. Workers still inherit salon hours ([`03-Key-Features.md`](../mvp/03-Key-Features.md) Staff/Worker Management).

## Sources

- Screenshot: Tasklify-style dashboard (Dashboard / Overview, Tools, Kanban with Urgent / Low / Medium, Timeline, Spreadsheet, Calendar).
- [`esyres_app/frontend/src/components/OwnerNav.tsx`](../../esyres_app/frontend/src/components/OwnerNav.tsx)
- [`esyres_app/frontend/src/i18n.ts`](../../esyres_app/frontend/src/i18n.ts) (`owner.title`, `zapisi`, `chat`, `stats`, `salons`, `settings`)
- [`esyres_app/frontend/src/lib/push.ts`](../../esyres_app/frontend/src/lib/push.ts)
- [`docs/mvp/03-Key-Features.md`](../mvp/03-Key-Features.md)
- [`docs/mvp/06-Epics.md`](../mvp/06-Epics.md) Explicitly Deferred Epics
- [`docs/mvp/08-Improvements-and-Open-Questions.md`](../mvp/08-Improvements-and-Open-Questions.md)
