# STORY-105 — Rating replies

| Field | Value |
|-------|--------|
| ID | STORY-105 |
| Epic | 11 — Visit ratings |
| Loop | — |
| Depends on | STORY-104 |

## User story

As a logged-in customer, I want to leave one reply under another customer’s comment, so that I can respond without starting a thread.

## Acceptance criteria

- A reply exists only under a non-empty comment. One per other logged-in customer. Not the author. Not an owner of that salon.
- They may replace it and may not delete it. At most 500 characters. Email and phone gates match cancel. Skipped when `APP_ENV=local`.
- The reply shows on the salon row with the rating. Clearing or replacing the comment leaves the replies.
- No reply box on Moji zahtjevi. No push, SMS, or email.
- Backend files change, so verify is full Behat.

## Out of scope

- A thread of many replies
- The author replying to themselves
- An owner reply
- Owner Ocjene (STORY-106)
