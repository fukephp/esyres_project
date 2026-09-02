# Answer key: STORY-04

> Epic 7 salon switcher chrome on existing owner routes. Selected salon drives queue + panel.
> Do not implement (Local or Cloud) until a human has approved this file.
> Map: `.cursor/loops/maps/STORY-04.md` (compiled).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-04 |
| Source | `docs/stories/STORY-04.md` — Salon switcher |
| Goal (one sentence) | A multi-salon owner can select which salon is in context on `/owner` via `?salon=`; queue and panel data are that salon’s; a single-salon owner still uses home with no switcher. |
| Branch name | `story/STORY-04-salon-switcher` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-09-02 |

## Pass/fail — product

- [ ] Helper: omit / garbage / unowned `salon` query → first owned id (`id` ASC); owned id in the list → that id; empty owned list → `null` — verify: Vitest
- [ ] Helper: `ownerQueuePath` omits `salon` when the salon is first owned (or there is only one); includes `salon` when it is not first; still omits `date` when the day is Sarajevo today; switching salon keeps an existing non-today `date` — verify: Vitest
- [ ] Existing owner GraphQL stays salon-scoped (`pendingBookings` / `occupyingBookings` / `me.salons`); no new active-salon field — verify: Behat
- [ ] `/owner` happy path: 2+ salons → native select in dark nav (desktop) and phone main header; one salon → static name, no select; Request Detail shows booking salon name (no select) — verify: human-only: PR screenshots desktop+mobile

## Pass/fail — architecture

Cite `docs/architecture/04-Frontend.md`, `05-Data-Model.md`, `08-Decisions.md` #10 #22.

- [ ] Lighthouse `/graphql` only; no REST; no GraphQL “active salon” field or mutation; `OwnerAccess` still forbids mixing salons — verify: schema unchanged for active-salon; Behat hits `/graphql`
- [ ] Not chain multi-location; workers/hours stay per `Salon` row; guest `/salon/:id` unchanged — verify: no shared-worker schema; customer routes untouched
- [ ] Owner chunks stay lazy; `?salon=` is client URL context only (no `localStorage`, no server preference) — verify: `esyres_app/frontend` routes + no localStorage salon key
- [ ] i18next `bs` only; no Playwright, Pest, GraphQL codegen, `vite-plugin-pwa` this PR — verify: `esyres_app/frontend/package.json`; no `pestphp` require

## Verify commands

Run from `esyres_app/` (app root in CONTEXT). Stack must be up (`docker compose up -d`). Every command must exit 0.

```text
docker compose up -d
docker compose exec -T php php artisan --version
docker compose exec -T php vendor/bin/behat
docker compose exec -T vite npm run typecheck
docker compose exec -T vite npm run test
docker compose exec -T vite npm run build
docker compose exec -T --workdir /app/marketing vite npm run build
```

## Out of scope

- Owner hours / services / workers settings screens
- QR reconnect / QR owner UI (STORY-34)
- Push payload `salonId` deep-link (STORY-31)
- In-flight chat tab (STORY-26)
- Chain multi-location / shared workers (Phase 2)
- Receptionist or manager roles (Phase 2)
- Public “Register salon”; customer-facing salon picker for owners
- `localStorage` last-used salon; GraphQL “active salon”
- Playwright, Pest, codegen, `vite-plugin-pwa`

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/glossary.md` (Salon switcher), `docs/stories/STORY-04.md`, `DESIGN.md`, `refs/design-2/DESIGN.md`, `docs/mvp/04-UI-Design-Goals.md`, and `docs/architecture/` (04, 05, 08). Follow `.cursor/skills/custom-feature-skills/SKILL.md`. UI: Design 2 owner dense; Bosnian-first.
2. Branch: `story/STORY-04-salon-switcher`.
3. **No backend schema this PR.** Do not add an active-salon field or mutation. Do not change `OwnerAccess`. Full Behat must stay green.
4. **Helpers** in `esyres_app/frontend/src/lib/owner.ts` (Vitest in `owner.test.ts`): `ownerSalonFromSearch(param, salons)` as in the product checks. Extend `ownerQueuePath` so it can take the resolved salon id and the first owned id; omit `salon` when they match; omit `date` when today; keep both when both differ. Existing date-only tests must still pass.
5. **`/owner`:** stop using `me.salons[0]` as context. Resolve via the helper from `?salon=` + `me.salons`. Queue, occupying, and `OWNER_SALON_QUERY` use that id. Owner gate: verified email + `me.salons.length > 0`. Native `<select>` of salon names only when length > 1: desktop in the dark left nav (replace static name); phone at top of main (`md:hidden`, where the name sits today). One salon: static name, no select. On change: write `salon` (omit if first owned), **keep** current `date`. Do not unhide the sidebar on phone. No bottom nav. No `localStorage`.
6. **`/owner/requests/:id`:** owner gate is `me.salons.length > 0`, not `salons[0]`. No select. Show the booking’s salon name. Back link uses `ownerQueuePath` with `booking.salon.id` (and today → omit `date`). Panel queries stay on `booking.salon.id`.
7. **i18n:** Bosnian label for the select (e.g. `owner.salon`). No language switcher.
8. Optional one-line on `docs/architecture/04-Frontend.md`: `/owner` salon context is `?salon=` when the owner has more than one salon; omit → first owned. Do not invent chain multi-location.
9. Do not add settings/QR screens, Playwright, Pest, codegen, or push deep-links.
10. Loop: implement → run every verify command from `esyres_app/` → fix. Cap 8. Same failure twice → escalate.
11. On success: PR linking this key; list commands run. **UI story** — embed desktop + mobile screenshots of `/owner` with 2+ salons (select visible) and note one-salon static name (Request Detail name-only if captured). Do not commit shot files. If capture/attach fails, open a **draft/blocked** PR.
12. On escalate: draft/blocked PR with failing checks and the human decision needed.
13. After PR: Bugbot; nits on same PR. If Bugbot contradicts this key, stop and ask.
