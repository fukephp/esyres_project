# STORY-94 — Hide Chat

| Field | Value |
|-------|--------|
| ID | STORY-94 |
| Epic | 7 — Salon & Service Management (Owner Onboarding) |
| Loop | — |
| Depends on | STORY-71, STORY-78, STORY-26 |

## User story

As an owner, I want a Chat switch on Postavke, default off, so that the menu hides a tab I am not using.

## Acceptance criteria

- `users.chat_enabled` is a non-null boolean, default false, including existing accounts. GraphQL `User.chatEnabled: Boolean!` and `updateChatEnabled(enabled: Boolean!): User!`. A guest is `UNAUTHENTICATED`. Any signed-in person may set it. It is not per salon.
- Postavke shows a `Chat` switch with **Prikaz**. Off until the owner turns it on. The change saves immediately. An error keeps the previous value.
- Off: the rail, the expanded labels, the phone tabs, and the loading ghost omit the Chat icon and the count badge. Other icons keep their order. `/owner/chats` redirects to Zahtjevi for the salon already in context. Stored threads are not deleted.
- On: the Chat icon, badge, and `/owner/chats` match today.
- Request Detail transcripts stay either way. The guest salon profile still has no Pitaj salon.

STORY-94 supersedes the always-present Chats icon in STORY-85 while the switch is off. That file stays as history.

## Out of scope

- Deleting chats or the assistant API
- Take-over, DND, or after-hours rules
- A per-salon switch
