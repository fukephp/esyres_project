# STORY-104 — Salon rating

| Field | Value |
|-------|--------|
| ID | STORY-104 |
| Epic | 11 — Visit ratings |
| Loop | — |
| Depends on | STORY-100 |

## User story

As a customer, I want to give a salon one score from its page, so that the average reflects that salon and not one finished visit.

## Acceptance criteria

- One integer 1–5 per customer per salon, from `/salon/:id`, after Usluge. No finished visit is required. The `md+` aside stays empty.
- Optional comment, at most 500 characters. The customer may replace the score and the comment and cannot delete the rating. Replacing with an empty comment leaves any replies.
- Email and phone gates match cancel. Skipped when `APP_ENV=local`. An owner cannot rate a salon they own. The form shows their current score when they already have one.
- A guest sees the mean to one decimal, the count, and a 5-star glyph filled to the nearest star. No ratings: the block is absent. Discovery and `/` do not show stars.
- A logged-in customer also sees each row under that average: person name, score, comment, the Sarajevo day they rated. Newest rating first. Never the email, the worker, or the service names. Replies are STORY-105.
- `/my-profile` lists **Moje ocjene**: salon name, score, comment, link to `/salon/:id`. Empty copy when there are none.
- Moji zahtjevi has no rate control. Not Statistika. No push, SMS, or email.
- Backend files change, so verify is full Behat.

## Out of scope

- Replies (STORY-105)
- Owner Ocjene (STORY-106)
- A score of a worker
- Stars on discovery or the homepage
