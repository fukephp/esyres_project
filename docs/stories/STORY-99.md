# STORY-99 — Customer card system

| Field | Value |
|-------|--------|
| ID | STORY-99 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | — |
| Depends on | — |

## User story

As a customer, I want the public pages to share one calm card system, so that the homepage, discovery, a salon, and my bookings feel like the same product.

## Acceptance criteria

- Customer routes `/`, `/salons`, `/salon/:id`, and `/bookings` use the customer card pack. Owner routes and `/create-salon` stay Design 2. AuthShell stays the centered box it is today.
- Tokens: canvas `#E8EEF3`, card `#FFFFFF`, ink `#14181F`, muted `#5C6770`, line `#E3E7EB`, blue `#2F6FED` for stars only (no stars on these pages yet), black pill primary, white label, card radius 20px, shadow `0 8px 30px rgba(20,24,31,0.06)`. Type is Inter.
- Homepage sections stay: split hero, Kako radi, Za goste / Za salone, Popularno u Sarajevu, FAQ, dark footer. Chrome only. The Zahtjevi picture in the hero may stay a picture of the owner queue.
- Odjava stays the red pill (`error-strong` fill, white label, Panel size, `rounded-full`, press darker, no hover, no confirm).
- Booking, discovery, and salon behavior stay as they are. No new routes. No rating block. No Sačuvaj. No Profil link.
- No photo header, revenue row, public URL, support toggle, or device logout.

## Out of scope

- `/my-profile` and `/my-profile/settings` (STORY-100, STORY-101)
- Favorites, suggested salons, ratings
- Owner shell, salon edit, AuthShell redesign
