# Salon-owned service categories

A **service category** is a salon-owned named group. A service belongs to exactly one, required. This replaces the locked HAIR / MAKE_UP / MASSAGE enum. Discovery chips stay Kosa / Šminka / Masaža until a later story; they match a migrate-only, non-editable legacy key. Owner-created names do not. The owner never sees that key. No platform catalog and no secret map of owner names onto the old enum.

Owner Usluge: list of this salon’s groups, services of the **selected** group, add-category then add-service into that group. Rename yes. Empty groups allowed. Delete only when empty. Duplicate group names on the same salon rejected. Create order, no drag. Move a service by picking another of this salon’s groups. Duplicate service names stay salon-wide (not per group).

Guest `/salon/:id` idle and picker: one column, heading per group; `md+` a side list that jumps to that heading (not an exclusive filter — multi-service across groups stays visible). Guest lists only groups that have ≥1 service; owner still sees empty groups. One visible group: still show the heading, hide the jump list. Chat stays a flat name list. `/salons` result rows show that salon’s group **names**. One product story under Epic 7. Profile search, Detaljnije, drag reorder, photos, dynamic chips, chat grouping, and delete-with-services are out.

Migrate: per salon, one group per distinct enum actually used (names Kosa / Šminka / Masaža + legacy key). A salon with no services gets no groups. One story covers owner + guest grouping + migrate + chips still working.

Rejected: free group string; nicknames over the three buckets; dual taxonomy; disabling chip filter; always seeding three groups; dumping every service into “Usluge”; Booksy search/Detaljnije; guest sidebar as a second scroll column on a phone; owner-only first PR.
