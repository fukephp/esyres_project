# Epics

*High-level groupings of the MVP feature set. Each maps to a chunk of work that could reasonably be built and demoed as a unit. Architecture/data-model breakdown is intentionally excluded — product scope only.*

## Epic 1 — Salon Discovery & Profile Browsing
Guest-accessible discovery flow: Bosnian homepage on typed `/` (top-nav homepage slot + hero + Pronađi salon → `/salons`), shared Cal top-nav on guest and owner routes (per-route slot; salon/discovery = Profil then Moje rezervacije, not homepage CTAs; logged-in with person name shows `Dobrodošli, {name}` in every top-nav slot — create-salon greeting only, `/` greeting then Profil then Moje rezervacije then Odjava; logged-in Odjava is the red destructive button, same size as Panel), guest inner column ~1200px so nav and main align (owner bar inner unconstrained), location-based "near you" with "Popular in Sarajevo" fallback (listed salons only). A saved municipality is that nearby point and skips the browser prompt; an empty place keeps the prompt and the fallback. Search/filter (discovery chips Kosa / Šminka / Masaža), idle discovery teaser then richer results (name, today’s busy, that salon’s service category names, address), salon profile page with services grouped under owner category headings (`md+` jump list when ≥2 groups), prices, busy-level badge, address when set, read-only weekly hours, and one `Pošalji zahtjev` after that list (opens the request modal; `md+` empty sticky aside). Customer routes `/`, `/salons`, `/salon/:id`, and `/bookings` use the customer card pack; owner routes and `/create-salon` stay Design 2. Logged-in customer nav adds Profil before Moje rezervacije. `/my-profile` may show up to three suggested listed salons that share a migrate-only discovery chip with one of the customer’s bookings. QR and `/salon/:id` skip the homepage page.

## Epic 2 — Booking Request Flow (Customer)
Service selection (multi-service), worker selection (specific or "no preference"), Danas / Sutra / Drugi dan and quarter starts inside the request modal (Zauzet when occupying). On an open day the guest may send with no quarter (`Možeš poslati i bez vremena.`); a closed day cannot send. Login or register happens in that modal when logged out, before the form. The profile does not offer chat. Email+password account with person name at register, Rezervacije vs Panel on the auth shell (one centered box with Prijava / Registracija tabs and forgot password on every surface), verified email + phone OTP at request submit, pending state. A day-only row stays `requested` with no clock until the owner counter-proposes on that same day.

## Epic 3 — Zahtjevi & Time Proposal (Owner)
The core owner scheduling surface on `/owner` (Zahtjevi), in the owner’s Prikaz. Kalendar is a week of occupying cards plus the selected day’s pending pile. Kanban is **U toku**, Zahtjevi, Predloženo, Potvrđeno, Završeno i otkazano, with two account checkboxes (default visible) that hide **U toku** and **Završeno i otkazano**. One-tap accept when the guest named a worker. A no-preference request that already has a time is confirmed by tapping a free worker (the guest is not asked). Counter-propose and decline stay on Request Detail, a right aside over Zahtjevi or Zapisi (no URL change; X, backdrop, and Escape close it; actions leave it open). A day-only request shows **Bez vremena** and is counter-proposed on that same day. **Telefon** on Zahtjevi writes a phone booking (born confirmed, caller is not a user). **Zapisi** lists that salon’s bookings by origin and day and uses the same Prikaz and the same Request Detail aside. No 15-minute worker board and no drag. Workers stay non-users.

## Epic 4 — Booking Lifecycle & Customer Response
Time-Proposed screen (Approve / Reject / Ask for a different day or time on the **same** booking row — only when owner counter-proposes), status transitions through `requested → confirmed` (accept) or `requested → time_proposed → confirmed/declined` (counter-propose), My Bookings list. Logged-in `/my-profile` shows the newest booking of any status and a link to that list.

## Epic 5 — Reschedule & Cancellation
Reschedule flow for confirmed bookings (original stays protected until new time approved), cancellation with owner-configurable notice window, reschedule cap enforcement.

## Epic 6 — Notifications
Web push (owner real-time events, customer time-critical events) + SMS fallback (iOS/undelivered push) for status changes; email channel for day-before/hour-before reminders, including the email verification requirement this introduces.

## Epic 7 — Salon & Service Management (Owner Onboarding)
Salon profile setup (first salon submitted on the same account — `/create-salon`, name only — and pending until an admin approves it, Epic 12), owner salon catalog (`/owner/salons`, boxed shops with open now, Uredi, plus under the title), add salon (`/owner/salons/create`, name and address), salon edit (`/owner/salons/:id`: exclusive Informacije / Radno vrijeme / Usluge / Radnici chips; name, address, optional salon description, optional main image, optional gallery of extra images on Informacije — guest profile still photoless; full weekly hours including cancel window — Radno vrijeme is a one-column exclusive accordion, land all collapsed; create/edit service categories and services and workers by name; delete a category only when empty; no delete of services or workers, no assignment matrix), owner settings (`/owner/settings`, OwnerNav **Postavke**, Prikaz, password, and a **Chat** switch default off that hides the Chat tab), salon switcher if the owner has more than one salon.

## Epic 8 — Trust Signal Data Foundations
QR Reconnect Loop (scan → ~7 day guest cookie → reconcile at verification → Favorite and QR visit data), response-time tracking, no-show/cancellation counters, email + phone verification status — all captured at MVP even though badge **display** is Phase 2. A logged-in customer may save or unsave a salon from `/salon/:id`. Unsave leaves the QR visit. Owner memory is other confirmed bookings and the no-show mark on Request Detail. No customers screen.

## Epic 9 — Basic Stats & Owner Insights
Bookings per week, busiest hours/days, cancellation rate, day-level busy %, QR scan and conversion stats — feeds both the owner's Basic Stats screen and the customer-facing busy-level indicator.

## Epic 10 — Salon Booking Assistant (scripted intake)
In-PWA scripted chat, not offered on the salon profile (STORY-89). Same `createBooking` / `requested` contract, same OTP gates, coarse time suggestions only. Owner: chat tab + badge for in-flight conversations, optional take-over (guest waits only after Take over; after hours / DND the assistant always finishes), transcript on Request Detail. Not in the first demo — ships after Epics 2–4 exist. Not WhatsApp, not an LLM, not worker-facing.

## Epic 11 — Visit ratings
A customer gives one rating, an integer 1–5, of one salon, from `/salon/:id` after Usluge. No finished visit is required. One score per customer per salon. They may replace the score and the optional comment (at most 500 characters). They cannot delete the rating. An empty comment leaves replies. Email and phone gates match cancel. An owner cannot rate a salon they own. The score is of the salon, not of a worker. The salon profile shows the mean to one decimal, the count, and a 5-star glyph. No ratings yet means the block is absent. Discovery, the homepage, and Statistika do not show them. A guest sees only the average, the count, and the glyph. A logged-in customer also sees each row: person name, score, comment, the Sarajevo day they rated, and replies, newest rating first. Never the email, the worker, or the service names. A reply exists only under a non-empty comment. Any other logged-in customer may post one, except the author and an owner of that salon. They may replace it and may not delete it. The same gates as cancel apply. The owner reads those rows as read-only Ocjene at the bottom of salon edit Informacije, and cannot edit, hide, delete, or reply. No reviews nav. No rate control on Moji zahtjevi. The customer’s own ratings are listed on `/my-profile`. No push, SMS, or email. Not a Favorite. See `docs/adr/0048-rating-is-one-score-per-salon.md`.

## Epic 12 — Admin
One seeded admin on the same account table, not a public register choice and not a second login. The first salon submitted on `/create-salon` (name only, same account) is a pending salon: the submitter owns nothing and has no owner panel, the salon is absent from discovery, and `/salon/:id` and `/qr/{id}` do not resolve. A person who already sent a booking cannot submit. Approve makes them the owner; listing still needs one open weekday and one service. Reject removes the pending salon. Add salon by an approved owner does not wait. Existing salons stay owned. The admin signs in on the existing Prijava and lands on `/admin/dashboard` (Pregled: counts of salons waiting, salons with an owner, and every booking). `/admin` redirects there. Na odobrenju is `/admin/na-odobrenju` (person name, salon name, approve or reject). No email, push, or SMS. Not a public waitlist and not a receptionist. Follow-ons named only, no story yet: popular-service and best-rated charts, a table of all salons, and customer and owner lists with filters. See `docs/adr/0051-first-salon-waits-for-admin.md`.

---

## Explicitly Deferred Epics (Phase 2 — not scoped for now)

- Trust Badge Display UI
- Viber/WhatsApp Marketing & Re-engagement Messaging (and Instagram DM as an assistant channel — same booking contract later)
- LLM / free-form NLU for the assistant (v1 stays scripted)
- Native App
- Referral Incentive Mechanic
- Worker Self-Service Login
- Chain multi-location / Receptionist Roles / Waitlists / Package Deals

## PM Note

I'd suggest building in roughly this order for a first working demo: **Epic 7 → Epic 1 → Epic 2 → Epic 3 → Epic 4.** Reasoning: an owner needs a salon set up (7) before there's anything to discover (1); the request/propose/respond loop (2–4) is the core value loop and should be proven end-to-end before anything else. **Epic 10 (assistant) comes next**, once that loop is real — it writes into the same inbox and must not ship as a fake. Then **Epic 5 → Epic 6 → Epic 8/9**. Flagging the later ordering as a suggestion, not a locked decision — happy to reorder 5/6/8/9 if you see it differently. Epic 10 after 2–4 is locked.
