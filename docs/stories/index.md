# Stories

Inventory for what-next and story-loop. **Not** `docs/mvp/07-Stories.md` (narrative only).

One file = one PR. IDs are `STORY-01` … `STORY-95` in demo order: Epic **7 → 1 → 2 → 3 → 4 → 10 → 5 → 6 → 8 → 9**, then STORY-40–97. Acceptance criteria live **only** on the story file.

Existing loop maps/keys keep `E*` / `MKT-*` / `SCAFFOLD-*` names until a later rename. Historical `MKT-*` keys (separate marketing site) are obsolete; they are not in this inventory. Scaffold keys are not in this inventory.

## File format

Each `STORY-xx.md`:

| Field | Value |
|-------|--------|
| ID | `STORY-xx` |
| Epic | Number and name from `docs/mvp/06-Epics.md` |
| Loop | `.cursor/loops` slug if a map/key exists, else `—` |
| Depends on | Hard deps (`STORY-nn`, …) or `—` |

Then: **User story** (from `docs/mvp/07-Stories.md`), **Acceptance criteria**, **Out of scope**.

## Catalog

| ID | Title | Epic | Loop | Depends on |
|----|--------|------|------|------------|
| STORY-01 | Owner hours, breaks, cancel window | 7 | `E7-hours-breaks-cancel` | — |
| STORY-02 | Owner services and prices | 7 | `E7-services-prices` | STORY-01 |
| STORY-03 | Owner workers | 7 | `E7-workers` | STORY-01 |
| STORY-04 | Salon switcher | 7 | — | STORY-01 |
| STORY-05 | Nearby and Popular in Sarajevo | 1 | `E1-nearby` | STORY-01 |
| STORY-06 | Search and filter | 1 | `E1-search-filter` | STORY-05 |
| STORY-07 | Salon profile | 1 | `E1-salon-profile` | STORY-05, STORY-01, STORY-02 |
| STORY-08 | Multi-service request | 2 | `E2-multi-service` | STORY-07 |
| STORY-09 | Worker pick | 2 | `E2-worker-pick` | STORY-08, STORY-03 |
| STORY-10 | Email and password | 2 | `E2-email-password` | STORY-08 |
| STORY-11 | Email verify | 2 | `E2-email-verify` | STORY-10 |
| STORY-12 | Phone OTP | 2 | `E2-phone-otp` | STORY-10 |
| STORY-13 | Pending queue | 3 | `E3-pending-queue` | STORY-08, STORY-01 |
| STORY-14 | One-tap accept | 3 | `E3-one-tap-accept` | STORY-13, STORY-09 |
| STORY-15 | Drag counter-propose | 3 | `E3-drag-propose` | STORY-13, STORY-03 |
| STORY-16 | Tap fallback | 3 | `E3-tap-fallback` | STORY-15 |
| STORY-17 | Decline request | 3 | `E3-decline` | STORY-13 |
| STORY-18 | My Bookings | 4 | `E4-my-bookings` | STORY-10 |
| STORY-19 | Time proposed respond | 4 | `E4-time-proposed` | STORY-18, STORY-15 |
| STORY-20 | Owner sees customer respond | 4 | — | STORY-19 |
| STORY-21 | Assistant chat on profile | 10 | — | STORY-08, STORY-19 |
| STORY-22 | Assistant time suggestions | 10 | — | STORY-21 |
| STORY-23 | Assistant salon voice and live data | 10 | — | STORY-21 |
| STORY-24 | Assistant send gates | 10 | — | STORY-21, STORY-11, STORY-12 |
| STORY-25 | Assistant requests in queue | 10 | — | STORY-21, STORY-13 |
| STORY-26 | Owner chat tab | 10 | — | STORY-21 |
| STORY-27 | Take over | 10 | — | STORY-26 |
| STORY-28 | Assistant unknown and ping | 10 | — | STORY-21 |
| STORY-29 | Reschedule confirmed | 5 | — | STORY-14 |
| STORY-30 | Cancel with late warning | 5 | — | STORY-18, STORY-01 |
| STORY-31 | Owner push notifications | 6 | — | STORY-13 |
| STORY-32 | Customer SMS fallback | 6 | — | STORY-12, STORY-19 |
| STORY-33 | Reminder email | 6 | — | STORY-11, STORY-14 |
| STORY-34 | QR reconnect | 8 | — | STORY-11 |
| STORY-35 | Trust data capture | 8 | `STORY-35` | STORY-14 |
| STORY-36 | Basic stats | 9 | — | STORY-14 |
| STORY-37 | QR conversion stats | 9 | — | STORY-34 |
| STORY-38 | Local demo seed | 7 | — | STORY-03, STORY-04, STORY-05, STORY-13, STORY-15, STORY-18 |
| STORY-39 | Company pitch on `/` (superseded by STORY-40) | 1 | `STORY-39` | STORY-05 |
| STORY-40 | Homepage on `/`; discovery at `/salons` | 1 | `STORY-40` | STORY-05, STORY-10, STORY-39 |
| STORY-41 | Create salon and listed discovery | 7 | — | STORY-01, STORY-11, STORY-40 |
| STORY-42 | One Design 1 pack; owner Cal chrome | 3 | `STORY-42` | STORY-13, STORY-40 |
| STORY-43 | Shared Cal top-nav | 1 | `STORY-43` | STORY-07, STORY-18, STORY-40, STORY-41, STORY-42 |
| STORY-44 | Discovery teaser and richer results | 1 | `STORY-44` | STORY-06, STORY-07, STORY-40, STORY-41, STORY-43 |
| STORY-45 | Guest column: nav and main align | 1 | `STORY-45` | STORY-43, STORY-44 |
| STORY-46 | Person name at register; Rezervacije vs Panel | 2 | `STORY-46` | STORY-10, STORY-11, STORY-40, STORY-41, STORY-43 |
| STORY-47 | Salon profile address, header CTA, tappable hours | 1 | `STORY-47` | STORY-07, STORY-08, STORY-21, STORY-45 |
| STORY-48 | Salon Pošalji zahtjev chrome | 1 | `STORY-48` | STORY-47 |
| STORY-49 | Current job on occupying cells | 3 | `STORY-49` | STORY-14, STORY-15 |
| STORY-50 | Salon catalog and OwnerNav Saloni | 7 | `STORY-50` | STORY-01, STORY-04, STORY-41, STORY-43 |
| STORY-51 | Salon edit name and address | 7 | `STORY-51` | STORY-50 |
| STORY-52 | Add salon | 7 | `STORY-52` | STORY-50, STORY-51 |
| STORY-53 | Hours on salon edit | 7 | `STORY-53` | STORY-01, STORY-51 |
| STORY-54 | Services on salon edit | 7 | `STORY-54` | STORY-02, STORY-51 |
| STORY-55 | Workers on salon edit | 7 | `STORY-55` | STORY-03, STORY-51 |
| STORY-56 | Exclusive chips on salon edit | 7 | `STORY-56` | STORY-51, STORY-53, STORY-54, STORY-55 |
| STORY-57 | Odjava as Cal destructive button | 1 | `STORY-57` | STORY-43 |
| STORY-58 | Owner service categories | 7 | `STORY-58` | STORY-54, STORY-56, STORY-07, STORY-08, STORY-06, STORY-44 |
| STORY-59 | One idle Pošalji zahtjev; md+ booking sidebar | 1 | `STORY-59` | STORY-47, STORY-48 |
| STORY-60 | Radno vrijeme exclusive accordion | 7 | `STORY-60` | STORY-53, STORY-56 |
| STORY-61 | Owner day card (hours down, worker columns) | 3 | `STORY-61` | STORY-13, STORY-14, STORY-15, STORY-16, STORY-42, STORY-49 |
| STORY-62 | Day-first salon chrome; homepage Moje rezervacije | 1 | — | STORY-43, STORY-47, STORY-48, STORY-59, STORY-21 |
| STORY-63 | Salon chat overlay chrome | 10 | `STORY-63` | STORY-62, STORY-21 |
| STORY-64 | Native date/time must not trap Pitaj salon | 10 | `STORY-64` | STORY-63 |
| STORY-65 | Send under selected hours row; modal names the day | 1 | `STORY-65` | STORY-62 |
| STORY-66 | Dobrodošli + person name in every top-nav | 1 | `STORY-66` | STORY-43, STORY-46, STORY-62 |
| STORY-67 | Zahtjevi month navigator and selected-day list | 3 | `STORY-67` | STORY-13, STORY-14, STORY-15, STORY-16, STORY-17, STORY-42, STORY-49, STORY-61 |
| STORY-68 | Salon catalog boxed shops, Uredi, header plus | 7 | `STORY-68` | STORY-50, STORY-51, STORY-52 |
| STORY-69 | Description, main image, and gallery on Informacije | 7 | `STORY-69` | STORY-56 |
| STORY-70 | Request Detail Cal card | 3 | `STORY-70` | STORY-16, STORY-67 |
| STORY-71 | Owner settings password | 7 | `STORY-71` | STORY-10, STORY-50 |
| STORY-72 | Request Detail memory | 8 | — | STORY-35, STORY-70 |
| STORY-73 | Zahtjevi diary day list | 3 | `STORY-73` | STORY-67 |
| STORY-74 | Phone booking | 3 | `STORY-74` | STORY-01, STORY-02, STORY-03, STORY-67, STORY-70, STORY-72 |
| STORY-75 | Zapisi | 3 | — | STORY-74, STORY-25 |
| STORY-76 | Telefon modal | 3 | `STORY-76` | STORY-74 |
| STORY-77 | Design 2 tokens and fonts | 3 | — | STORY-42 |
| STORY-78 | Owner shell | 3 | — | STORY-77, STORY-50, STORY-71 |
| STORY-79 | Prikaz setting | 3 | — | STORY-71, STORY-78 |
| STORY-80 | Kalendar and Kanban on Zahtjevi and Zapisi | 3 | — | STORY-79, STORY-67, STORY-75, STORY-76 |
| STORY-81 | Homepage sections and guest re-skin | 1 | — | STORY-77, STORY-40, STORY-44 |
| STORY-82 | Skeleton loading | 3 | `STORY-82` | STORY-77, STORY-78, STORY-80, STORY-81 |
| STORY-83 | Sarajevo clock labels | 4 | — | STORY-18, STORY-29, STORY-70, STORY-75, STORY-80 |
| STORY-84 | Guest quarter starts | 2 | — | STORY-08, STORY-09, STORY-65 |
| STORY-85 | Zahtjevi progress and icon menu | 3 | — | STORY-78, STORY-80, STORY-82, STORY-83 |
| STORY-86 | Same-day service block | 2 | — | STORY-08, STORY-19, STORY-21, STORY-29 |
| STORY-87 | Pending jump | 3 | — | STORY-13, STORY-76, STORY-80 |
| STORY-88 | Owner rail toggle | 3 | — | STORY-85 |
| STORY-89 | Always-on Pošalji zahtjev | 2 | `STORY-89` | STORY-65, STORY-84, STORY-08 |
| STORY-90 | Request Detail modal | 3 | `STORY-90` | STORY-70, STORY-75, STORY-80 |
| STORY-91 | Assign worker | 3 | STORY-91 | STORY-14, STORY-90 |
| STORY-92 | Day-only request | 2 | STORY-92 | STORY-89, STORY-84, STORY-13 |
| STORY-93 | U toku column | 3 | STORY-93 | STORY-80, STORY-85 |
| STORY-94 | Hide Chat | 7 | STORY-94 | STORY-71, STORY-78, STORY-26 |
| STORY-95 | Telefon past start | 3 | `STORY-95` | STORY-76 |
| STORY-96 | Worker profile on Radnici | 7 | — | STORY-55, STORY-56, STORY-60, STORY-69 |
| STORY-97 | Request Detail aside | 3 | — | STORY-90, STORY-91 |
