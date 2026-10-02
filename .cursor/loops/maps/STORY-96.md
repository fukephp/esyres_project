# Story map: STORY-96

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-96 |
| Source | `docs/stories/STORY-96.md` |
| Status | compiled |
| Answer key path | `.cursor/loops/answer-keys/STORY-96.md` |

## Destination

Radnici is a one-column exclusive accordion. Each worker has an optional profile (photo or initials, O radniku, experience, portfolio, five lists, Najjače usluge, Održavanje) saved by one Spremi, photo uploaded immediately. Owner-only.

## Notes

- Consult: `docs/stories/STORY-96.md`, `docs/adr/0045-worker-profile-on-radnici.md`, `docs/adr/0037-salon-media-on-informacije.md`
- Batch `batch/STORY-96-97`; grill round answered "all recommended"

## Decisions so far

- Initials avatar is one fixed pastel (the pink used by the rail collapse circle).
- Closing a row drops the draft; reopening shows saved server values.
- Photo upload/remove refreshes the avatar only; unsaved text in the open row stays.
- Spremi: button spinner, inline `Spremljeno.` on success, `Alert` with Bosnian copy on failure; row stays open.
- No services: muted `Salon još nema usluga.`, no checkboxes. With 5 picked, the other checkboxes are disabled; server also refuses a 6th.
- Deleting a service cascades its strongest-service pivot rows.
- Backend: one migration (worker columns `photo_path`, `about`, `experience_years`, `portfolio_url`, `maintenance`, JSON lists `talents`, `specializations`, `certificates`, `education`, `brands`) + `worker_strongest_services` pivot. `updateSalonWorker` input grows; new `uploadWorkerPhoto` / `removeWorkerPhoto`. Reuse salon image storage rules. Behat in `features/owner/salon_workers.feature`.

## Open decisions

## Not yet specified

## Out of scope

- Guest display / public GraphQL of the profile
- Worker↔service matrix gating booking
- Certificate uploads, structured rows, drag-reorder, crop
- Avatar outside Radnici
