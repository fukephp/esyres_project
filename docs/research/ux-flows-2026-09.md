# Streamlined task flows — September 2026 (Design 2)

Not product truth. Companion to [`ux-audit-2026-09.md`](ux-audit-2026-09.md) and [`refs/design-2/wireframes.md`](../../refs/design-2/wireframes.md).

## Guest: find a salon and send a request (unchanged contract)

```mermaid
flowchart LR
  Home["/ split hero"] -->|"Pronađi salon"| Salons["/salons"]
  Home -->|"Popularno strip card"| Salon["/salon/:id"]
  Qr["/qr/:id"] --> Salon
  Salons --> Salon
  Salon --> Day["tap open weekday row"]
  Day --> Pill["Pošalji zahtjev under that row"]
  Pill --> Picker["picker modal"]
  Picker --> Gate["email + phone OTP"]
  Gate --> Requested["requested"]
  Salon --> Chat["Pitaj salon card"] --> Gate
```

Change vs today: the homepage adds a second, shorter door (Popularno strip → salon) and a visible owner door (Za salone card → `/create-salon` or `/owner`). Steps after the salon profile are untouched.

## Owner: land, triage, confirm

```mermaid
flowchart TD
  Login["owner login"] --> Shell["Design 2 shell: sidebar or bottom tabs"]
  Shell --> Zahtjevi
  Zahtjevi -->|"Prikaz = Kalendar"| Week["week grid + Zahtjevi pile for selected day"]
  Zahtjevi -->|"Prikaz = Kanban"| Board["Zahtjevi / Predloženo / Potvrđeno / Završeno i otkazano"]
  Week -->|"tap card"| Detail["Request Detail"]
  Week -->|"Prihvati on pending card"| Confirmed["confirmed"]
  Board -->|"Prihvati on Zahtjevi column"| Confirmed
  Board -->|"tap card"| Detail
  Detail -->|"Predloži"| Proposed["time_proposed"]
  Shell --> Postavke["Postavke"]
  Postavke -->|"Prikaz: Kalendar / Kanban"| Zahtjevi
  Zahtjevi -->|"Telefon"| Phone["Telefon modal"] --> Confirmed
```

Taps saved:

- Nav: one sidebar (md+) or one bottom tab bar (phone) instead of TopNav + aside + repeated OwnerNav.
- Week at a glance: Kalendar shows seven days of occupying cards in one view; no day-by-day tapping.
- Pipeline: Kanban shows counts per status column for the selected day.

## Owner: Zapisi

- Kalendar: the selected day as a time-ordered timeline of pastel status cards (origin chip filters stay).
- Kanban: the same day grouped in the four status columns.
- Tap any card → Request Detail (Nazad returns to Zapisi, as today).

## Owner: switch view

Postavke → **Prikaz** segmented toggle (Kalendar | Kanban) → saves immediately to the account (`updateOwnerView`) → Zahtjevi and Zapisi render that template on every device.
