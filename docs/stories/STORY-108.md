# STORY-108 — Customer bounce from owner routes

| Field | Value |
|-------|--------|
| ID | STORY-108 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-78, STORY-82, STORY-107 |

## User story

As a customer who opens an owner route by URL, bookmark, or an old link, I want to be sent straight back to where I was, so that I never see an owner panel skeleton or a "not an owner" page.

## Acceptance criteria

- Applies to every `/owner*` route: `/owner`, `/owner/chats`, `/owner/stats`, `/owner/requests/:id`, `/owner/salons`, `/owner/salons/create`, `/owner/salons/:id`, `/owner/settings`, `/owner/zapisi`, `/owner/phone`.
- A logged-in non-owner (owns no salon) is bounced: browser history back one step when this tab has an earlier in-app page; otherwise replace the URL with `/`. Bounce happens whether or not their email is verified.
- The bounce is silent: no toast, no message, no "Nisi vlasnik salona." page. The `notOwner` block and **Napravi salon** link on the owner pages are removed, and the `owner.notOwner` string is deleted.
- A customer never sees `OwnerShell`, the ghost `OwnerShell`, or any owner skeleton. While `me` is unknown (cold load), the route shows only the plain page background. When `me` is already cached (in-app navigation), the decision is immediate with no blank moment.
- Once `me` shows an owner, owner loading is unchanged (ghost `OwnerShell` + per-route preset skeleton), and an owner with an unverified email still sees the Panel email-verify panel.
- A logged-out guest on `/owner*` still gets the Panel AuthShell. After auth there, an owner stays on that route; a customer is bounced the same way (back, else `/`).
- `/create-salon` and the homepage Panel CTA (non-owner → `/create-salon`) are unchanged.
- Frontend only, so verify is frontend npm (no Behat).

## Out of scope

- Server-side route guards or GraphQL authorization changes
- Any customer-facing explanation of the owner panel
- Changes to `/my-profile` owner redirect (STORY-107)
