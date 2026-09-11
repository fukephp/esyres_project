# Company pitch lives in the PWA; there is no sibling marketing site

Superseded by [ADR 0025](0025-homepage-named-discovery.md) for the same-URL overlay (`/` was pitch then discovery). The no-sibling-marketing-site rule still holds.

Typed `/` needs a short company explanation before live discovery, without a second Vite app or a public owner waitlist. The company pitch is one screen in the React PWA on the same `/` as discovery home; `esyres_app/marketing/` goes away. Rejected: a permanent SaaS long-scroll at `/`, a separate `/welcome`, keeping static HTML for a company site, and an owner Formspree waitlist (owners stay invite-only). Design 1 tokens apply only to that one screen; discovery, salon, and `/owner` stay Design 2. Verify no longer builds a marketing package.
