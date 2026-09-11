# Only listed salons appear on discovery home

Public create salon would otherwise dump closed empty shops onto `/salons`. A salon is **listed** only when it has at least one open weekday, one service, and one worker — derived, no publish flag. `salonsNearby` and `popularInSarajevo` return listed rows only. `/salon/:id` still loads an unlisted shop if you have the URL. Seeded demo salons already qualify.
