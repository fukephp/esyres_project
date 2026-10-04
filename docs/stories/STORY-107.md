# STORY-107 — Customer pages redesign

| Field | Value |
|-------|--------|
| ID | STORY-107 |
| Epic | 4 — Booking Lifecycle & Customer Response |
| Loop | — |
| Depends on | STORY-100, STORY-101 |

## User story

As a customer, I want my profile and my bookings to read at a glance, so that I see what is waiting on the salon and what already happened without scrolling one long list.

## Acceptance criteria

- `/my-profile` opens with a header card: initials circle, person name, saved place when set, Omiljeni and Ocjene counts, and a round gear button (**Postavke**) top-right. Below, `md+` is two columns: left the newest booking (**Vidi sve**) and **Moje ocjene**; right **Predloženi saloni** and **Omiljeni saloni**. Phone is one column in the same order.
- The gear opens Postavke as a right Aside over `/my-profile` (white full-height panel, ~440px `md+`, full width on phone, dim backdrop, slide in, reduced motion fades only). X, backdrop, and Escape close it. `/my-profile/settings` opens the profile with the Aside open; closing goes to `/my-profile`. Saving keeps it open.
- An owner (owns at least one salon) does not see **Profil** in the top-nav. `/my-profile` and `/my-profile/settings` redirect an owner to `/owner`.
- Login or register from the homepage lands an owner on `/owner` and a customer on `/my-profile`. Other AuthShells (salon picker modal, assistant, page shells) do not redirect.
- `/bookings` shows **Na čekanju** first (`requested` and `time_proposed`, full cards with actions). Then **Zadnje potvrđeno** and **Zadnje odbijeno** side by side (newest of each; hidden when none; the confirmed one keeps Pomjeri / Otkaži). Then **Historija**: compact rows for every other booking; a row that still has actions expands in place.
- On customer routes every link and enabled button shows a pointer cursor. Every non-primary button has a visible border (pill); icon buttons are bordered circles.
- Frontend only, so verify is frontend npm (no Behat).

## Out of scope

- Avatar photo upload
- New profile data fields
- Owner routes and `/create-salon` styling
