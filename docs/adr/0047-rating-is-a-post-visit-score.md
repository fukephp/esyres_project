# A rating is a post-visit 1–5

Superseded by `docs/adr/0048-rating-is-one-score-per-salon.md`.

A salon score has to be something a customer gives after a real visit, or it collapses into trust data the product already stores. A rating is that customer's integer from 1 to 5 on one confirmed booking, once the occupied end has passed. Favorite, a QR visit, a no-show, and owner response time stay their own facts and never feed the average.

Rejected: a single **preporučujem** count, a second public number beside the stars, and treating a return visit as the score. Also rejected: letting an owner or a phone-booking caller rate, and charting the average on Statistika.
