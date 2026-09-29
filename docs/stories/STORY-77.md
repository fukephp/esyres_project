# STORY-77 — Design 2 tokens and fonts

| Field | Value |
|-------|--------|
| ID | STORY-77 |
| Epic | 3 — Zahtjevi & Time Proposal (Owner) |
| Loop | — |
| Depends on | STORY-42 |

## User story

As a salon owner or guest, I want the app to use the Design 2 pastel look (cream canvas, warm cards, friendly display type), so that it stops feeling empty and flat.

## Acceptance criteria

- `index.css` theme carries Design 2 tokens from `refs/design-2/DESIGN.md`: `page` `#FAF4EA` is the `html` background; `canvas` `#FFFCF6`; warm `hairline`, `surface-soft`, `surface-card`, `body`, `muted`; `pastel-pink` / `pastel-green` / `pastel-blue` / `pastel-yellow`; `status-pending` / `status-proposed` / `status-confirmed` / `status-done`.
- Busy tokens stay `#22c55e` / `#eab308` / `#ef4444`; `error-strong` stays `#dc2626`.
- Fonts: Bricolage Grotesque (display) and Manrope (body) are self-hosted through Fontsource variable packages. Cal Sans font-face and file are removed.
- Existing class names (`bg-canvas`, `text-ink`, `border-hairline`, …) keep working, so every page re-skins without layout changes.
- `designPack.test.ts` asserts the Design 2 tokens and fonts instead of Design 1.

## Out of scope

- Layout changes (owner shell, Prikaz, homepage sections are later stories).
