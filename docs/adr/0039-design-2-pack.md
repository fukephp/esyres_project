# Design 2 pastel pack replaces Design 1 Cal

Supersedes `docs/adr/0026-one-design-1-pack.md`.

Owners found the Cal look empty and flat, owner navigation was three stacked layers (top-nav, aside, OwnerNav), and nothing on screen carried status color. The product now uses one **Design 2** pack adapted from the Intelly dashboard: cream `page` canvas with warm-white cards, pastel status fills (pink requested, blue proposed, yellow confirmed, grey done), one black primary pill, Bricolage Grotesque display + Manrope body (self-hosted via Fontsource, OFL). Owner routes share one `OwnerShell`: black sidebar on `md+`, black bottom tabs on phone, display greeting in the header. The homepage gains Kako radi, audience cards, a live Popularno u Sarajevu strip, FAQ, and a dark footer.

Guest busy badges keep 🟢/🟡/🔴 and are never pastels. Guest route structure (day-gated send, empty `md+` aside, photoless discovery) is unchanged; they are re-skinned only. Customer routes later leave this pack for the customer card pack (`docs/adr/0049-customer-card-pack.md`). Owner routes and `/create-salon` stay here.

Rejected: keeping Cal and borrowing layout only (does not fix "empty"), Intelly look on `/owner` only (two visual languages again), licensed Acorn + TT Commons (paid), 3D inflatable art (marketing, not product UI).
