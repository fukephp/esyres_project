# STORY-34 — QR reconnect

| Field | Value |
|-------|--------|
| ID | STORY-34 |
| Epic | 8 — Trust Signal Data Foundations |
| Loop | — |
| Depends on | STORY-11 |

## User story

As an owner, I want to see when a returning customer physically scanned my QR code and verified, so that I know they’re a real repeat visitor, not just a remote favorite.

## Acceptance criteria

- Scanning the existing salon QR sets a guest cookie (~7 days, last salon wins) without a second sticker or popup.
- At verification, reconcile: favorite that salon, mark visited on owner customer history, store a scan row, then clear the cookie.
- Guest browse from QR still has no login wall.

## Out of scope

- Trust badge display (Phase 2)
- QR scan conversion stats UI (STORY-37)
- A second “reconnect” QR product
