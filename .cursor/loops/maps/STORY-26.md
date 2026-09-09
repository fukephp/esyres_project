# Story map: STORY-26

> Wayfinder-lite planning artifact. Copy from `MAP_TEMPLATE.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-26 |
| Source | `docs/stories/STORY-26.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-26.md` |

## Destination

Owner home stays pending queue + Worker Availability Panel. A chat tab lists in-flight assistant conversations that have not become a request yet, with a badge for that count. After send, the object is the booking — not an open chat as home.

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/` (02, 03, 04, 06, 08), `docs/architecture/` (03, 04, 05, 08 #10 #35), `docs/stories/STORY-26.md` plus STORY-21 / 25 / 27, `docs/glossary.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`
- Skills: grill-with-docs (app code exists); custom-feature-skills; playbook plan-gate until this map compiles
- Code today (`esyres_app/`): guest chat is **client-only React state** on `/salon/:id` (`AssistantIntake`). Refresh loses the thread. No Conversation / intake table. `createBooking` has no origin. `/owner` is lazy queue + panel; dark left nav is salon switcher + `Zahtjevi` label — **no destinations**. Routes: `/owner`, `/owner/requests/:id`. Reverb exists for `bookingCustomerResponded` only. Behat is GraphQL-over-HTTP. Vitest covers lib helpers. No Playwright. Backend rule “no chat in MVP” means WhatsApp-style messaging; product Epic 10 + STORY-21 already deferred a Conversation table to this story.
- STORY-21 lock: “No Conversation table this PR (STORY-26).” Persistence is this story’s job if the owner tab is real.
- STORY-25: assistant-originated **requests** land in the same pending queue. Out of scope there: “a second owner inbox for chat” (meaning a second booking inbox). This tab is for **not-yet-requests**, not a parallel queue of bookings.
- Sibling walls: STORY-25 origin/transcript on Request Detail; STORY-27 Take over / after hours / DND; STORY-28 unknown/ping; STORY-24 send-gate polish.
- Standing preferences:
  - Do not invent a second API (not REST, not a chat microservice, not an LLM)
  - Do not expand the `createBooking` status machine
  - Do not auto-page the owner on every chat
  - Do not add worker-facing chat
  - Do not replace `/owner` home with chat

## Decisions so far

- STORY-26 only: owner tab + list + badge for in-flight chats. Not Take over (STORY-27). Not origin tag / transcript on Request Detail (STORY-25).
- Owner home stays pending queue + Worker Availability Panel (`docs/mvp/02`, `03`, `04`; story AC).
- Chat is a tab with a badge, not screen 1 after login.
- The tab lists conversations that have **not yet** become a request.
- After send, the object is the booking (not an open chat as home). Transcript on Request Detail is STORY-25.
- No auto-page on every chat. No worker-facing chat. Workers are not users.
- Salon context stays the existing `?salon=` switcher. Lists do not mix salons.
- Stack: existing Lighthouse `/graphql`, Sanctum cookies, Behat, Vitest/typecheck/build. Assistant v1 still adds no LLM / WhatsApp stack piece (architecture decision 35).
- Bosnian-first (`bs`, no switcher). Design 2 owner dense: dark left nav is where primary destinations live on desktop; phone stacks.
- **Persist (2026-09-09):** salon-scoped intake/conversation table + GraphQL. Guest upsert, owner list. Same `/graphql`. Behat on the owner query (and guest upsert / convert as needed).
- **In-flight starts (2026-09-09):** first chip or native control that changes intake. Opening the CTA alone does not create a row or bump the badge.
- **Guest identity (2026-09-09):** unauthenticated upsert allowed, scoped to `salonId`, bound to a guest cookie / returned id. Owner row: customer name if logged in, otherwise `Gost`. Login not required to appear in the tab.
- **Chrome (2026-09-09):** `/owner` unchanged (home). New `/owner/chats` for the list. Nav link + badge on desktop aside; same link stacked on phone. Keep `?salon=`. Login on `/owner` still lands on queue+panel, not chats. No settings/stats links.
- **After send (2026-09-09):** successful chat `createBooking` attaches `booking_id` (or equivalent) and that row leaves the in-flight list. Owner is not routed to chat. Guest success stays existing salon-profile copy. Transcript on Request Detail stays STORY-25.
- **Owner interaction (2026-09-09):** list only. No `/owner/chats/:id`. No owner messages. Badge = count of listed rows; hide at zero.
- **Resume (2026-09-09):** one in-flight row per `(salon, guest token)` until convert. Cookie + returned token resume that row. Guest chat restores the snapshot from the server. Converted or stale token starts a new row on the next chip.
- **Token (2026-09-09):** bigint PK. Guest mutations/query use unguessable UUID `token`. Cookie stores the token. Owner list uses internal `id`. Guest cannot query the owner list or count.
- **Send attach (2026-09-09):** optional `intakeToken` on `CreateBookingInput`. Chat send includes it; picker omits it (even if a cookie exists). Valid in-flight token for that salon → set `booking_id`, exclude from the list. Missing/unknown/already-converted → booking still created, no error. Status machine unchanged. No origin/source field (STORY-25).
- **Live (2026-09-09):** refetch `inFlightIntakeCount` on mount of `/owner` and `/owner/chats`; refetch list on `/owner/chats` mount. No new Reverb channel. No `pollInterval`.
- **Stale (2026-09-09):** owner list + badge omit `updated_at` older than 24h. No scheduled job. Guest `assistantIntake(token)` of a stale/converted/unknown token returns null; next chip creates a new row.
- **Row + snapshot (2026-09-09):** `customerName` (`Gost` if no user), `updatedAt`, progress line = joined selected service names or current step if none. Upsert: `serviceIds`, optional `workerId`, `workerConfirmed`, `preferredDate`, `preferredTime`. Not bubbles, not a transcript.
- **Paging (2026-09-09):** `inFlightIntakes(salonId, limit, offset)` uses existing `ListPage` (default 20, max 50). Badge is `inFlightIntakeCount(salonId)` = total in-flight in the 24h window, not page length.
- **Copy (2026-09-09):** nav `Chat`; empty `Nema razgovora.`; home nav stays `Zahtjevi`.
- **GraphQL names (2026-09-09):** type `AssistantIntake`. `upsertAssistantIntake`. Guest read `assistantIntake(token)` (needed to restore). Owner `inFlightIntakes` + `inFlightIntakeCount`.
- **Implied (2026-09-09):** list newest `updatedAt` first. `/owner/chats` keeps `?salon=` switcher; no date picker (window is 24h activity, not a salon-day). Session user on upsert sets `customer_id` (`users.name`). SPA cookie per salon, token, Max-Age 24h, SameSite=Lax. Verifiers: Behat + Vitest; no Playwright; no screenshot human-only.

## Open decisions

<!-- empty -->

## Not yet specified

<!-- empty -->

## Out of scope

- Take over, after hours, DND (STORY-27)
- Auto-page on every chat
- Worker-facing chat
- Assistant-origin tag + collapsed transcript on Request Detail (STORY-25)
- A second pending queue for chat-originated **bookings**
- Changing `createBooking` status machine
- LLM / free-form NLU (Phase 2)
- Viber / WhatsApp / Instagram DM (Phase 2)
- Settings / stats owner screens
- Playwright, Pest, codegen, `vite-plugin-pwa`
