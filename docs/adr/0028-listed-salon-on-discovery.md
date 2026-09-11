# Discovery lists only listed salons

Self-serve create would otherwise dump closed empty shops into Popular in Sarajevo (that query returns every salon). Nearby and Popular omit a salon until it has at least one open weekday and at least one service. `/salon/:id` still works so Instagram and QR are not blocked. Nearby still requires coordinates; this topic does not add geocoding. Rejected: list on create, and 404 on the profile until listed.
