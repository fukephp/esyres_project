# Story map: STORY-110

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-110 |
| Source | `docs/stories/STORY-110.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-110.md` |

## Destination

The first salon stays pending until the seeded admin approves it. The admin signs in on Prijava, lands on Pregled, and approves or rejects from Na odobrenju. An approved owner adds later shops immediately. Existing owned salons stay owned.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/adr/0051-first-salon-waits-for-admin.md`, `docs/stories/STORY-110.md`
- Grill 2026-10-05: user approved every recommended answer

## Decisions so far

- `/create-salon` stays the owner door. Email verify still required; local skip unchanged. Name-only defaults. One pending at a time. (story)
- Any booking this account sent blocks submit with **Ovaj račun već ima zahtjeve.** Favorites, ratings, and phone bookings do not. (story)
- Pending salon: user owns zero salons. Get your panel, Panel, and `/owner` land on `/create-salon` with **Salon čeka odobrenje.** That line wins after a later booking. They may book elsewhere. (story)
- Pending salon is absent from discovery. `/salon/:id` and `/qr/{id}` do not resolve. (story)
- Reject removes it. No booking → name form plus **Salon nije odobren.** (clears on a new submit). Has a booking → booker line. (story)
- Approve sets ownership. Profile and QR work. Discovery still waits for one open weekday and one service. Later add salon does not wait. No email, push, or SMS. (story)
- Existing owned salons stay. No screen to add another admin. Seed: **Emina Softić**, `admin@esyres.test`, password `password`, no salon. (story)
- Login on any AuthShell lands on `/admin/dashboard`. `/admin` redirects there. `/owner`, `/create-salon`, `/my-profile`, `/my-profile/settings`, and `/bookings` send this account there. `/` and `/salons` stay open. (story)
- Admin shell is the owner shell frame: black rail on desktop, phone header plus bottom tabs, only Pregled then Na odobrenju. No salon switcher and no pending-count chip. (grill)
- Browse only on open pages. Nav is greeting, Odjava, and a link to Pregled. No Profil, Moje rezervacije, or Get your panel / Panel. No Pošalji zahtjev, Sačuvaj, or rating. Those mutations refuse this account. (grill)
- Na odobrenju rows are oldest submission first. (grill)
- Odobri and Odbij are one tap. No dialog. The row drops and Pregled counts update. The list stays open. (grill)
- Counts on Pregled are not links: pending salons, salons with an owner, every booking. (story)
- assumed: `users.is_admin` boolean. `salons.submitted_by` plus nullable `owner_id` while pending. Mutations `approveSalon` / `rejectSalon`. Reject hard-deletes.

## Open decisions

## Not yet specified

## Out of scope

- Popular-service and best-rated charts
- A table of every salon
- Customer and owner lists and filters
- A screen to create another admin
- Email, push, or SMS on approve or reject
- Re-approving a salon that already has an owner
