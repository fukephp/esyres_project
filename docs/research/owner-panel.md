# Owner panel research

**Not product or architecture truth.** Do not treat this file as a lock. Product stays in `docs/mvp/`; architecture stays in `docs/architecture/`. This repo has **no salon-owner interview transcripts**. Jobs below come from locked MVP target users plus first-party competitor pages. Competitor claims are tagged `competitor` and are **not** Esyres scope unless you later persist them via `/new-story` or `/grill-with-docs`.

## 1. Owner jobs

### Esyres-locked (`esyres-mvp`)

From [docs/mvp/02-Target-Users.md](../mvp/02-Target-Users.md): Sarajevo make-up / hair / massage owners (solo or small team). They currently use a paper notebook, a phone, or a group chat, and they reply to Instagram DMs and calls. They want:

- One inbox of incoming requests (picker and chat both land as `requested`).
- Control over the exact appointment time (not fully auto-booked).
- 24/7 intake so guests are not waiting on Instagram while the owner is with a client.
- Simple management of services, prices, working hours, and workers.
- A visible time-saving reason to send customers to Esyres (guest writes; owner accepts or counter-proposes from Request Detail).

Dashboard complexity belongs on Panel, not the guest surface. Home after login is Zahtjevi (month navigator + selected-day list). Chat is a tab with a badge. Workers are not login users at MVP.

Success signals the owner should *feel* (from [docs/mvp/05-Success-Goals.md](../mvp/05-Success-Goals.md)): response speed, QR scan → verified-visit conversion, cancellation / no-show / decline rates. Badge **display** is still Phase 2.

### Competitor first-party (`competitor` — not Esyres truth)

Booksy names itself the incumbent Esyres is differentiating against ([docs/mvp/04-UI-Design-Goals.md](../mvp/04-UI-Design-Goals.md) §5: Bosnian-first vs “a foreign-feeling incumbent (Booksy)”).

| Job | Booksy Biz | Fresha for business | Treatwell Connect |
|-----|------------|---------------------|-------------------|
| Fill the calendar without phone tag | 24/7 self-booking, Marketplace, Reserve with Google, Instagram/Facebook Book Now ([biz.booksy.com/en-gb](https://biz.booksy.com/en-gb)) | Calendar + Marketplace + Google / social booking links ([fresha.com/for-business/features](https://www.fresha.com/for-business/features)) | Widgets on Google, social, website, Treatwell app ([treatwell.co.uk/partners/solutions/salon-software](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |
| Keep control of the book | Custom booking rules, optional **manual appointment confirmation**, block clients, working hours / breaks / time off / buffers ([biz.booksy.com/features/calendar-scheduling](https://biz.booksy.com/features/calendar-scheduling)) | Staff hours, breaks, time off, service permissions; deposits / card confirmation ([fresha.com/en-GB/for-business/features/scheduling](https://www.fresha.com/en-GB/for-business/features/scheduling)) | Reschedule/cancel, block time for breaks or time off, multi-location switch ([Treatwell Connect](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |
| Cut no-shows | SMS reminders; deposits; card-on-file cancellation fees; waitlist to refill ([biz.booksy.com/features/no-show-protection](https://biz.booksy.com/features/no-show-protection)) | Reminders (SMS/email/app); payment policy / deposits; intelligent waitlist ([Fresha features](https://www.fresha.com/for-business/features), [scheduling](https://www.fresha.com/en-GB/for-business/features/scheduling)) | Unlimited client reminders; waiting list ([Treatwell Connect](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |
| Know the client | Client database: contact, booking history, photos, notes ([calendar-scheduling](https://biz.booksy.com/features/calendar-scheduling)) | Profiles: appointments, allergies, patch tests, forms, notes, wallet ([Fresha features](https://www.fresha.com/for-business/features)) | Log client history: treatments, preferences, notes; consultation forms ([Treatwell Connect](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |
| Run the team | Staff logins, shift/rota, annual leave, commissions, granular permissions ([en-gb FAQ](https://biz.booksy.com/en-gb); extra users on [pricing](https://biz.booksy.com/pricing)) | Individual accounts, custom permissions, scheduled shifts, commissions, timesheets ([Fresha features](https://www.fresha.com/for-business/features)) | Staff portfolios, rotas, calendar access, flexible staff pricing ([Treatwell Connect](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |
| Get paid in-shop | Tap to Pay, card reader, Stripe, next-day payouts ([en-gb](https://biz.booksy.com/en-gb), [pricing](https://biz.booksy.com/pricing)) | POS, terminals, tap to pay, merchant accounts, tips/splits ([Fresha features](https://www.fresha.com/for-business/features)) | POS, Tap to Pay, product/voucher checkout ([Treatwell Connect](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |
| Market without a second app | SMS & email blasts, rebooking reminders, loyalty stamps, gift cards, packages, review requests ([en-gb](https://biz.booksy.com/en-gb); listed on [pricing](https://biz.booksy.com/pricing)) | Email campaigns, deals, loyalty, two-way inbox, reviews, Google review push ([Fresha features](https://www.fresha.com/for-business/features)) | Rebook invites, last-minute discounts, automated review requests ([Treatwell Connect](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |
| See if the shop is working | “Detailed reports”, inventory, staff performance ([en-gb](https://biz.booksy.com/en-gb)) | Business / sales / finance / client / team reports ([Fresha features](https://www.fresha.com/for-business/features)) | Sales reports, acquisition and retention, accounting data ([Treatwell Connect](https://www.treatwell.co.uk/partners/solutions/salon-software/)) |

**Not found on those first-party pages (do not invent):** a WhatsApp or Viber product as the booking channel. Fresha lists two-way messaging and Meta Pixel; Booksy lists SMS/email. Esyres already parks Viber/WhatsApp/Instagram DM as Phase 2 ([docs/mvp/03-Key-Features.md](../mvp/03-Key-Features.md) “Explicitly Phase 2”).

**Esyres already chose a different booking contract than the incumbents’ default:** guest picks a preferred day+time (no live slot grid); owner accepts or counter-proposes. Booksy’s calendar page also offers **manual appointment confirmation** so “no one gets on your books without your approval” — that is the closest competitor analogue to Esyres `requested → confirmed`, not Fresha’s “instant booking” marketplace default.

## 2. What Panel already does

Routes in [esyres_app/frontend/src/App.tsx](../../esyres_app/frontend/src/App.tsx) and [docs/architecture/04-Frontend.md](../architecture/04-Frontend.md):

| Route | What the owner can do |
|-------|------------------------|
| `/owner` | Zahtjevi: month navigator (occupying worker-colored dots) + selected-day list (pending till-pile, occupying, Predloženo vrijeme, titled Pauza / Zatvoreno). One-tap accept; decline; Predloži → Request Detail. |
| `/owner/requests/:id` | Request Detail Cal card: accept / decline / counter-propose; occupying read-only; assistant transcript. |
| `/owner/chats` | In-flight intakes, badge, Take over / Release, **DND toggle** ([OwnerChats.tsx](../../esyres_app/frontend/src/pages/OwnerChats.tsx)). |
| `/owner/stats` | Last-7-day bookings, busy %, cancellation rate, late cancels, busiest hours; all-time QR scan / visit / conversion ([OwnerStats.tsx](../../esyres_app/frontend/src/pages/OwnerStats.tsx); STORY-36, STORY-37). |
| `/owner/salons` | Catalog: boxed shops, open now, Uredi, plus to add. |
| `/owner/salons/create` | Add salon (name + address). |
| `/owner/salons/:id` | Informacije / Radno vrijeme / Usluge / Radnici. Description + main image + gallery on Informacije (guest profile still photoless — STORY-69). Weekly hours + cancel window. Categories/services. Workers by name. |

Salon switcher: `?salon=` on queue / chats / stats only.

**OwnerNav today** ([OwnerNav.tsx](../../esyres_app/frontend/src/components/OwnerNav.tsx)): Zahtjevi, Razgovori, Statistika, Saloni. `active` is `'queue' \| 'chats' \| 'stats' \| 'salons'`. **No Postavke.** **No `/owner/settings` route** in `App.tsx`. Architecture 04 already specifies that page; the inventory file is [docs/stories/STORY-71.md](../stories/STORY-71.md).

Trust capture without Panel chrome: `markNoShow` exists in GraphQL ([esyres_app/graphql/schema.graphql](../../esyres_app/graphql/schema.graphql)); PWA documents are banned from selecting it ([trustCapture.test.ts](../../esyres_app/frontend/src/graphql/trustCapture.test.ts)). QR sticker is `GET /qr/{id}` (not a React route). There is **no `holiday` string in `esyres_app/`**. Architecture 05 lists holidays on Salon and “workers inherit … holiday holes”; glossary **Working hours** is explicitly “not a holiday calendar”; STORY-53 AC: “No holiday calendar.”

## 3. Ranked gap list

Rank is owner-benefit for a Sarajevo shop that already has Zahtjevi, not “how impressive vs Booksy.” Tags:

- `mvp-missing-story` — locked in MVP, no `STORY-xx` → `/new-story` after you pick
- `story-exists` — already inventoried → implement; do not re-file
- `mvp-deferred-ui` — mutation/data exists, no chrome
- `existing-epic` — could attach to epics 3 / 7 / 8 / 9 / 10 if you expand MVP
- `needs-new-epic` — `/grill-with-docs` first (`/new-story` cannot invent an epic)

| Rank | Gap | Tag | Why it matters | Persist |
|------|-----|-----|----------------|---------|
| 1 | **Customer History screen** — booking history, no-show tracking, notes, QR “visited” ([03-Key-Features](../mvp/03-Key-Features.md) Owner-Facing). STORY-34 writes the visit marker; there is no `/owner/customers` (or similar). | `mvp-missing-story` | Owner job “know this guest” is locked and still invisible. Treatwell/Fresha/Booksy all sell client history as core Panel. | `/new-story` → Epic 8 |
| 2 | **Mark no-show UI** — ADR [0021](../adr/0021-owner-marks-no-show-after-start.md); mutation shipped; STORY-35 out of scope for PWA. | `mvp-deferred-ui` (no dedicated story) | Without a tap, counters and Customer History stay empty. Closest competitor analogue is *recording* a no-show; Booksy/Fresha then *charge* a fee (`needs-new-epic`, payments). | `/new-story` → Epic 8 (same or split from #1) |
| 3 | **Owner settings (Postavke)** | `story-exists` — [STORY-71](../stories/STORY-71.md) | Password rotate without a founder. Already specified. **Do not invent STORY-72.** | Implement STORY-71 |
| 4 | **QR sticker for the owner** — `GET /qr/{id}` exists; no panel download/print/share. Booksy onboarding: “grab your custom QR code” ([en-gb](https://biz.booksy.com/en-gb)). | `mvp-missing-story` (sticker is locked product; owner chrome is not a story) | Cold-start metric in 05 is QR scan → visit. Owner cannot promote what they cannot print. | `/new-story` → Epic 8 (or 7 if you treat it as salon tools) |
| 5 | **Guest-visible photos / description** | `existing-epic` — STORY-69 out of scope; later Epic 1 | Owner already uploads; guests still photoless. Booksy Profile portfolio + reviews is how they compete. | `/new-story` → Epic 1 (do not duplicate STORY-69) |
| 6 | **Holiday / one-off closed day** | `existing-epic` | Architecture 05 names holidays; hours UI forbids a holiday calendar (STORY-53). Glossary: working hours ≠ holiday calendar. A Sarajevo shop needs 1. maj / Bajram without rewriting the weekly template. | `/new-story` → Epic 7 if you expand MVP |
| 7 | **Owner-created / walk-in booking** | `existing-epic` | [STORY-67](../stories/STORY-67.md) out of scope: “Empty-cell create booking; owner-created appointments.” Treatwell Pro App Store copy: walk-in customers. Paper notebook replacement is incomplete if only guests can create rows. | `/new-story` → Epic 3 if you expand MVP |
| 8 | **Client notes** (part of locked Customer History copy) | `mvp-missing-story` (same feature as #1 unless split) | Fresha/Treatwell: notes/allergies on the client. Esyres 08 also flags “intake/allergy notes” as deferred. | Prefer one Customer History story; split if it would not fit one PR |
| 9 | **Delete / deactivate service or worker** | `existing-epic` | Salon edit: no delete of services or workers ([03-Key-Features](../mvp/03-Key-Features.md), ADR 0032). Owners will hire/fire and retire a cjenovnik line. | `/new-story` → Epic 7 |
| 10 | **Worker ↔ service matrix** | `existing-epic` | Explicitly “later, not this slice.” Competitors assign services per staff so the guest only sees bookable people. | `/new-story` → Epic 7 |
| 11 | **Per-worker time off / shifts / buffer** | `needs-new-epic` *or* stretch Epic 7 | Phase 2 in 03; architecture 08 #34: workers inherit salon hours. Booksy/Fresha/Treatwell all sell rotas and time off. | `/grill-with-docs` unless you explicitly attach to Epic 7 |
| 12 | **Waitlist** | `needs-new-epic` | Phase 2 in 03 and 06. All three competitors sell automated waitlists as the refill loop after a cancel. | `/grill-with-docs` |
| 13 | **Deposits / no-show fees / in-app payments / POS** | `needs-new-epic` | Phase 2: in-app payments not MVP. Booksy No-Show Protection and Fresha payment policy are the incumbents’ answer to flake. Esyres today: late cancel is a **warning**, not a charge ([glossary](../glossary.md) Cancellation notice window). | `/grill-with-docs` |
| 14 | **Worker self-service login** | `needs-new-epic` | Phase 2; 02-Target-Users: workers are not users. Booksy extra user $20/mo ([pricing](https://biz.booksy.com/pricing)); Fresha individual accounts. | `/grill-with-docs` |
| 15 | **Reviews / ratings** | `needs-new-epic` | Phase 2. Booksy/Fresha/Treatwell all request reviews after visits. | `/grill-with-docs` |
| 16 | **Viber / WhatsApp / Instagram DM** | `needs-new-epic` | Phase 2; channel not decided (08). Not claimed as the booking product on the first-party pages fetched above. | `/grill-with-docs` |
| 17 | **LLM / free-form NLU** | `needs-new-epic` | Phase 2. Assistant v1 stays scripted (Epic 10). | `/grill-with-docs` |
| 18 | **Revenue / commissions / inventory / gift cards / packages / group bookings / chain multi-location / receptionist roles** | `needs-new-epic` | 08 deferred + 03 Phase 2. Incumbents sell the full shop OS; Esyres MVP is a two-sided request loop. | `/grill-with-docs` |
| 19 | **Trust badge display** | `needs-new-epic` (Phase 2 UI; data is Epic 8) | Capture exists (STORY-35). Display is parked. | `/grill-with-docs` when you want guest-visible badges |
| 20 | **Richer stats** (revenue, occupancy by worker, 90-day trends) | `existing-epic` | STORY-36/37 already cover the locked Basic Stats slice. Extra charts would expand Epic 9. | `/new-story` → Epic 9 only if you expand |

## 4. Recommended first 5

For a Sarajevo owner **before** matching Booksy’s shop OS. Benefit vs complexity vs locks:

1. **Customer History** (`mvp-missing-story`, Epic 8) — locked copy, zero screen. Highest “Panel feels like a salon tool” gap. Include QR visited + booking list; notes if they fit one PR.
2. **Mark no-show UI** (`mvp-deferred-ui`, Epic 8) — mutation already paid for; stats and history stay fiction without the tap. Can be the same PR as #1 or the next `STORY-xx`.
3. **Ship STORY-71 Postavke** (`story-exists`) — specified, missing from nav and `App.tsx`. Do not re-file.
4. **Owner QR sticker** (`mvp-missing-story`, Epic 8) — acquisition loop the founder onboarding plan depends on ([05-Success-Goals](../mvp/05-Success-Goals.md) QR conversion).
5. **Holiday closed days** (`existing-epic`, Epic 7) — small, weekly-hours-shaped, and the first thing a real shop hits that the weekly template cannot express. Only if you accept expanding MVP past STORY-53’s “no holiday calendar.”

**Do not start with** payments, worker logins, waitlist, or WhatsApp. Those are the incumbents’ differentiators **and** Esyres Phase 2. They need `/grill-with-docs` (new epic) after the locked inbox is complete.

## 5. Sources

### In-repo

- [docs/mvp/02-Target-Users.md](../mvp/02-Target-Users.md)
- [docs/mvp/03-Key-Features.md](../mvp/03-Key-Features.md)
- [docs/mvp/04-UI-Design-Goals.md](../mvp/04-UI-Design-Goals.md)
- [docs/mvp/05-Success-Goals.md](../mvp/05-Success-Goals.md)
- [docs/mvp/06-Epics.md](../mvp/06-Epics.md)
- [docs/mvp/07-Stories.md](../mvp/07-Stories.md)
- [docs/mvp/08-Improvements-and-Open-Questions.md](../mvp/08-Improvements-and-Open-Questions.md)
- [docs/stories/index.md](../stories/index.md), [STORY-34](../stories/STORY-34.md), [STORY-35](../stories/STORY-35.md), [STORY-36](../stories/STORY-36.md), [STORY-37](../stories/STORY-37.md), [STORY-53](../stories/STORY-53.md), [STORY-67](../stories/STORY-67.md), [STORY-69](../stories/STORY-69.md), [STORY-71](../stories/STORY-71.md)
- [docs/architecture/04-Frontend.md](../architecture/04-Frontend.md), [05-Data-Model.md](../architecture/05-Data-Model.md), [08-Decisions.md](../architecture/08-Decisions.md)
- [docs/glossary.md](../glossary.md) (Working hours, Break, QR visit, Cancellation notice window)
- [docs/adr/0021-owner-marks-no-show-after-start.md](../adr/0021-owner-marks-no-show-after-start.md), [0022](../adr/0022-trust-counters-increment-on-event.md), [0032](../adr/0032-owner-salon-catalog.md), [0035](../adr/0035-zahtjevi-month-and-selected-day-list.md)
- [esyres_app/frontend/src/App.tsx](../../esyres_app/frontend/src/App.tsx), [OwnerNav.tsx](../../esyres_app/frontend/src/components/OwnerNav.tsx), [OwnerChats.tsx](../../esyres_app/frontend/src/pages/OwnerChats.tsx), [OwnerStats.tsx](../../esyres_app/frontend/src/pages/OwnerStats.tsx), [trustCapture.test.ts](../../esyres_app/frontend/src/graphql/trustCapture.test.ts)
- [esyres_app/graphql/schema.graphql](../../esyres_app/graphql/schema.graphql) (`markNoShow`)
- Grep: no `holiday` in `esyres_app/`; no `/owner/settings` in frontend `src`

### External (first-party only)

- https://biz.booksy.com/en-gb
- https://biz.booksy.com/pricing
- https://biz.booksy.com/features/no-show-protection
- https://biz.booksy.com/features/calendar-scheduling
- https://www.fresha.com/for-business/features
- https://www.fresha.com/en-GB/for-business/features/scheduling
- https://www.treatwell.co.uk/partners/solutions/salon-software/

Fetched 2026-09-21. Secondary reviews (Beauty Playbook, Pabau, DoTheBeauty) were search hits only — **not used as claims**.

## Persist (after human pick)

This research turn does **not** write `STORY-xx` or start `/story-loop`.

| Pick | What to run |
|------|-------------|
| Fits an existing epic (Customer History, no-show UI → 8; holidays / delete worker → 7; guest photos → 1; walk-in → 3) | `/new-story` (grill, one file = one PR) |
| Needs a new epic (payments, worker login, reviews, WhatsApp, waitlist product, POS, inventory, …) | `/grill-with-docs` to add the epic, then `/new-story` |
| Already `STORY-xx` (STORY-71 Postavke) | Point at the file; do not re-file |
