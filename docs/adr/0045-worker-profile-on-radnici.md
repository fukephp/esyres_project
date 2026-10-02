# Worker profile on Radnici

Each worker on salon edit Radnici gets an optional **worker profile**: a profile photo (initials avatar when missing), O radniku, Godine iskustva, Portfolio / Instagram, Održavanje, five free-text lists (Talenti, Specijalizacije, Certifikati, Obrazovanje, Brendovi i proizvodi), and up to five **Najjače usluge**. The photo follows the salon main image rules from `docs/adr/0037-salon-media-on-informacije.md`: jpeg/png/webp, 5 MB, Laravel public disk, GraphQL multipart, immediate upload/remove. The lists are JSON columns on `workers`. They have no categories and no separate tables.

Najjače usluge is a display-only pivot between workers and this salon’s services. It is not a worker↔service matrix. It does not filter guest worker radios, owner assign, counter-propose, Telefon, availability, or quarter starts. That rule stays locked.

Only the owner sees the profile this slice. Public `salon` GraphQL and the guest `/salon/:id` page stay unchanged, and the avatar shows on Radnici rows only.

Rejected: structured certificate and education rows (name, institution, year), certificate file uploads, a real matrix that gates booking, guest display in the same story, and a separate worker edit page or modal instead of the Radno vrijeme-style accordion. STORY-96.
