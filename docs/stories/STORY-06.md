# STORY-06 — Search and filter

| Field | Value |
|-------|--------|
| ID | STORY-06 |
| Epic | 1 — Salon Discovery & Profile Browsing |
| Loop | `E1-search-filter` |
| Depends on | STORY-05 |

## User story

As a customer, I want to filter by service type (hair / make-up / massage) or search by name, so that I can find a relevant salon quickly.

## Acceptance criteria

- A guest can pass a category on nearby and Popular and get only salons that have at least one service in that category; salons with no matching services are omitted.
- A guest can pass a name and get salons whose name contains that string case-insensitively; a matching service name does not pull in the salon.
- Category and name together AND: both constraints apply.
- Omitted category and omitted/empty/whitespace name leave the unfiltered nearby-or-popular list.
- Nearby with filters still omits salons missing coordinates and stays nearest-first.
- Paging still defaults to 20 / cap 50.
- Guest `/` shows three category chips plus a name field; filtered empty is distinct from unfiltered empty.

## Out of scope

- A third list query or search engine (Scout / Meilisearch)
- Request picker (STORY-08)
- Map SDK
- Dynamic chips from registered services vs fixed set (still open in mvp 08; this story uses hair / make-up / massage)
