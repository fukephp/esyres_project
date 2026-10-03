# A rating is one score per salon

Supersedes `docs/adr/0047-rating-is-a-post-visit-score.md`.

A score tied to a finished visit kept the average honest, and it also kept a customer from rating a salon they already knew. A rating is now that customer's integer from 1 to 5 of one salon, given from the salon page, with no finished visit required. One score per customer per salon. Favorite, a QR visit, a no-show, and owner response time still never feed the average. An owner still cannot rate a salon they own.

Rejected: keeping the post-visit booking score, scoring a worker, and a reviews screen for the owner.
