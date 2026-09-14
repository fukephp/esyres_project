# Story map: STORY-54

> Wayfinder-lite planning artifact. Copy to `.cursor/loops/maps/STORY-xx.md`.
> Clear fog and open decisions here; then compile into a **draft** answer key (no extra “OK to compile”).
> Do **not** invent pass/fail checks for areas still in fog.
> If a likely product check has no verifier (test, command, or `human-only: …`), keep it here — not on the key.
> This is not Matt Pocock’s full Wayfinder (no issue-tracker tickets).

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-54 |
| Source | `docs/stories/STORY-54.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-54.md` |

## Destination

Owners list, create, and update this salon’s services on `/owner/salons/:id` with STORY-02 fields (name, category, price, duration), using existing `createSalonService` / `updateSalonService`. No delete. Name/address/hours stay. Workers stay off (STORY-55).

## Notes

- Consult: `.cursor/CONTEXT.md`, `docs/mvp/`, `docs/architecture/04-Frontend.md`, `docs/architecture/05-Data-Model.md`, `docs/adr/0032-owner-salon-catalog.md`, `docs/stories/STORY-54.md`, `docs/stories/STORY-02.md`
- Skills: `.cursor/skills/custom-feature-skills/SKILL.md`; grilling rounds for open decisions
- Mutations and rejection codes already exist (`esyres_app/features/owner/salon_services.feature`)
- Standing preferences: PWA-only; dense owner chrome; no `<select>` on salon catalog/edit (STORY-50–53); prices in KM in UI, feninga in the model
- Grill 2026-09-14: Q1–Q5 approved as recommended

## Decisions so far

- Reuse GraphQL `createSalonService` / `updateSalonService`. No new mutation, resolver, schema field, or PHP. No delete/deactivate.
- STORY-02 fields: `name`, `category` (`HAIR` \| `MAKE_UP` \| `MASSAGE`), `priceFeninga` (int ≥ 0), `durationMinutes` (optional on create → 30; update required; ≥ 15 and 15-minute steps).
- Load this shop from `me.salons` only (same as STORY-51/53). Add `services { id name category durationMinutes priceFeninga }` on `ME_QUERY` `salons`. Do not query public `salon(id)` on edit.
- Keep name + address + weekly hours + cancel window + that one Spremi. Do not put workers, DND, photos, coords, or assignment matrix on this page.
- Server codes stay: `INVALID_NAME`, `INVALID_DURATION`, `INVALID_PRICE`, `DUPLICATE_SERVICE_NAME`, plus existing `FORBIDDEN` / `EMAIL_UNVERIFIED` / `UNAUTHENTICATED`.
- Reuse copy where it already exists: `salon.services` `Usluge`, `salon.emptyServices` `Nema usluga.`, `salon.duration` `{{n}} min`, `category.HAIR` / `MAKE_UP` / `MASSAGE`.
- `CreateSalon.tsx` and `OwnerSalonCreate.tsx` stay without services UI. Expected verify: frontend-only (PWA + loop docs).
- **Q1** Service writes are separate from the hours Spremi. Existing rows: each has Spremi → `updateSalonService`. Below the list, one add form + Dodaj → `createSalonService`. Empty list shows `salon.emptyServices`. Hours Spremi does not write services. After create/update, refetch `Me`.
- **Q2** Owner types KM. `kmToFeninga` (`Math.round(km * 100)`; accept `,` or `.` decimal). Seed with `priceFeninga / 100`. 2 decimals ok (`25.50` → 2550). `0` valid. Empty/NaN/negative → `owner.INVALID_PRICE`, do not call. No feninga field.
- **Q3** Duration is `type="number"` `step={15}` `min={15}`. No `<select>`. Create: empty omits `durationMinutes` (server 30). Update: always send int (seed from the row).
- **Q4** Category is three radios labeled `t('category.HAIR')` etc. Add default `HAIR`. No `<select>`.
- **Q5** New error keys; do not reuse `owner.INVALID_NAME` for a service. `INVALID_NAME` on service mutations → `owner.INVALID_SERVICE_NAME`. Also `owner.INVALID_DURATION`, `owner.INVALID_PRICE`, `owner.DUPLICATE_SERVICE_NAME`. Other codes → `salon.gate.fallback`. Reuse `owner.FORBIDDEN`.
- Field labels: `owner.serviceName` `Ime usluge`; `owner.duration` `Trajanje (min)`; `owner.price` `Cijena (KM)`; `owner.addService` `Dodaj`. Existing-row save stays `owner.save`.

## Open decisions

- (empty)

## Not yet specified

- (empty)

## Out of scope

- Delete / hide / deactivate service
- Worker↔service assignment matrix
- Workers UI (STORY-55)
- Service photos, descriptions, packages
- Changing `createSalonService` / `updateSalonService` rejection rules
- DND, photos, coordinates, holiday calendar, reschedule cap
- Add-salon / create-salon hours or services
- Playwright, RTL, Pest, GraphQL codegen, new npm
