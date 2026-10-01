# Day-first salon booking chrome

Guest day-first chrome is superseded by `docs/adr/0042-always-on-posalji-zahtjev.md` (STORY-89): hours are read-only, and `Pošalji zahtjev` sits after the list. Logged-in `/` still adds Moje rezervacije between name and Odjava.

Idle `Pošalji zahtjev` on load (under the title / sticky sidebar) competed with Radno vrijeme. Guests then picked an open weekday first; the pill sat under that selected hours row and opened a picker modal. The `md+` aside stayed an empty sticky gutter. Pitaj salon opened a picker-like native dialog overlay, not an on-page thread and not LLM NLU. Rejected at the time: instant modal on day tap; inline picker scroll; filling the aside; a second send-icon under the row. STORY-65 superseded STORY-62 on pill-after-list and modal title-only. STORY-63 superseded STORY-62 on-page messenger chrome. STORY-62 superseded STORY-43/47/59 chrome ACs. See `docs/adr/0029-shared-top-nav.md` (homepage slot still not cloned onto `/salon/:id`).
