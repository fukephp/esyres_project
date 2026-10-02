# Answer key: STORY-97

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-97 |
| Source | `docs/stories/STORY-97.md` — Request Detail aside |
| Goal (one sentence) | Request Detail opens in a reusable right Aside over the board without a URL change. |
| Branch name | `batch/STORY-96-97` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-02 (batch grill, all recommended) |

## Pass/fail — product

- [ ] Booking cards on Zahtjevi (Kalendar, Kanban) and Zapisi are buttons that open the Aside in place; no `to={\`/owner/requests/` links remain on the boards; opening does not navigate — verify: Vitest `requestAside.source.test.ts`
- [ ] `components/Aside.tsx` is a native `<dialog>` with `showModal`, right-anchored full-height white panel ~440px `md+` / full width phone, backdrop fade + slide-in ~250ms ease-out, reverse on close, `motion-reduce` fades only; X with aria-label `Zatvori`, backdrop click and Escape close — verify: Vitest `requestAside.source.test.ts`
- [ ] Request Detail no longer uses `SALON_PICKER_DIALOG_CLASS` and has no Nazad; header has customer name + mode clock + X; form / read / bounce modes and actions unchanged; loading stays uncarded; FORBIDDEN / missing shows bounce in the Aside — verify: Vitest `requestAside.source.test.ts` + existing owner source tests stay green
- [ ] `/owner/requests/:id` replace-redirects to `/owner?date=…&salon=…` with the id in router state; Zahtjevi opens the Aside from state and clears it (refresh closed) — verify: Vitest `requestAside.source.test.ts` (route + `replace: true` + state cleared)
- [ ] Salon switcher hidden while the Aside is open; mutations keep it open and refetch the board — verify: Vitest `requestAside.source.test.ts`
- [ ] Layout and motion feel — verify: human-only: merge visual review (UI ready rule)

## Pass/fail — architecture

- [ ] No backend change, no new npm package — verify: `git diff --name-only` for this commit lists only `esyres_app/frontend/` plus docs
- [ ] Behat runs because the batch branch contains STORY-96 PHP — verify: CONTEXT classifier

## Verify commands

Same set as STORY-96 (full Behat + frontend typecheck/test/build from `esyres_app/`).

## Out of scope

- Telefon and guest picker stay modals
- Other owner modals moving to the Aside
- Booking rule changes
- Reopening after refresh

## Implementer instructions

1. Read this key, the map, `.cursor/CONTEXT.md`, and the story.
2. Work on `batch/STORY-96-97` after STORY-96's commit.
3. Commit on the batch branch when verify passes (`STORY-97 — Request Detail aside`). On the cap or a repeated failure, stop and leave the PR to batch-stories.
