# Story map: STORY-94

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-94 |
| Source | `docs/stories/STORY-94.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-94.md` |

## Destination

Postavke has a Chat switch, default off. Off hides the Chat icon everywhere in the owner shell, including the loading ghost. `/owner/chats` redirects to Zahtjevi.

## Notes

- Consult: `docs/stories/STORY-94.md`
- Grill Q4 = option 1

## Decisions so far

- `users.chat_enabled` is a non-null boolean, default false, including existing accounts. `User.chatEnabled` and `updateChatEnabled(enabled)`. A guest is `UNAUTHENTICATED`. Any signed-in person may set it. Not per salon.
- Assumed: the switch sits in the Prikaz card, under the radios, label `Chat`. A failed save keeps the previous value and shows `Chat nije sačuvan. Pokušaj ponovo.`
- The loading ghost always omits Chat (rail and phone tabs). After `me`, Chat shows only when the switch is on. No browser copy of the flag.
- Off: `/owner/chats` redirects to Zahtjevi for the salon already in context. Threads stay. Request Detail transcripts stay.

## Open decisions

## Not yet specified

## Out of scope

- Deleting chats or the assistant API
- Take-over, DND, or after-hours rules
- A per-salon switch
