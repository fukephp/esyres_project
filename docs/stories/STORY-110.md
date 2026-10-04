# STORY-110 — Admin gate for the first salon

| Field | Value |
|-------|--------|
| ID | STORY-110 |
| Epic | 12 — Admin |
| Loop | — |
| Depends on | STORY-38, STORY-41, STORY-78, STORY-108 |

## User story

As a person with no booking on this account, I want my first salon to stay pending until an admin approves it, so that naming a shop does not open the owner panel.

## Acceptance criteria

- `/create-salon` stays the owner door on the same account. Logged out, the page is the Panel AuthShell; the check runs once there is a session. Email verify is still required before the name submits. `APP_ENV=local` still skips that gate.
- The name form is the same name-only submit as today: closed all week, cancellation notice 24 hours, empty services, empty workers, no address, no coordinates. One pending salon at a time. A second submit is refused.
- Any booking this account sent (`requested`, `time_proposed`, `confirmed`, `declined`, `cancelled`) blocks a new submit. Favorites, ratings, and phone bookings do not. The page shows **Ovaj račun već ima zahtjeve.** and no name form. Homepage **Get your panel** stays and lands there.
- No booking and no pending salon: the name form.
- A pending salon means this user owns zero salons. **Get your panel**, **Panel**, and `/owner` land on `/create-salon` with **Salon čeka odobrenje.** That line wins even if they have since sent a booking. They may book at other salons; the pending salon stays.
- The pending salon is absent from discovery. `/salon/:id` and `/qr/{id}` do not resolve. The public salon query does not return it.
- Reject removes the pending salon. If that account still has no booking, the name form returns with **Salon nije odobren.** That line clears when they submit a new name. If they have a booking, they get the booker line.
- Approve makes them the owner. The profile and the QR sticker work. Discovery still waits for one open weekday and one service. `/create-salon` and **Panel** go to `/owner`. A later add salon does not wait. No email, push, or SMS.
- Salons that already have an owner stay owned and keep their profile and QR sticker. There is no screen to add another admin. Production is one manual user with that mark.
- Local demo seed keeps the existing demo salons and adds one admin: **Emina Softić**, `admin@esyres.test`, password `password`, no salon. Same password as `owner@esyres.test`. That account is the only admin the seed creates.
- The admin signs in on the existing Prijava (homepage and every other AuthShell). There is no admin login URL and no `/admin` page. A successful login lands on `/admin/dashboard`. `/admin` redirects there. `/owner`, `/create-salon`, `/my-profile`, `/my-profile/settings`, and `/bookings` send them to `/admin/dashboard`. `/` and `/salons` stay open. This account does not create a salon and does not use the customer profile.
- The admin shell is Design 2: greeting when they have a person name, Odjava, and two items. **Pregled** is first.
- **Pregled** at `/admin/dashboard` shows three counts, not links. **Na čekanju** is pending salons. **Saloni** is salons that have an owner, including current ones. **Rezervacije** is every booking.
- **Na odobrenju** at `/admin/na-odobrenju` lists person name, salon name, **Odobri**, and **Odbij**. Empty line: **Nema salona na čekanju.** The row drops and the Pregled counts refresh. The page stays open.
- No Zahtjevi, Zapisi, Chat, Statistika, or Postavke on this shell.

## Out of scope

- Popular-service and best-rated charts
- A table of every salon
- Customer and owner lists, and filters on those lists
- A screen to create another admin
- Email, push, or SMS on approve or reject
- Re-approving a salon that already has an owner
