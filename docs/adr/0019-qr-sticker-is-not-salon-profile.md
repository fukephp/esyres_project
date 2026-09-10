# QR sticker is not the salon profile URL

The counter sticker must record a physical scan without treating an Instagram-bio or organic salon-profile visit as a QR visit. `GET /qr/{salonId}` sets the `esyres_qr` hold cookie (~7 days, last salon wins) and redirects to `/salon/{id}`. A missing salon redirects to `/` with no cookie. Rejected: a `?qr=` query on the profile (easy to copy as a “scan”) and setting the cookie on every `/salon/:id` hit (a remote favorite would look like a visit).
