# Answer key: STORY-92

## Meta

| Field | Value |
|-------|--------|
| Story ID | STORY-92 |
| Source | `docs/stories/STORY-92.md` — Day-only request |
| Goal (one sentence) | An open day can be sent with no quarter, and the owner answers that day with Predloži or Odbi. |
| Branch name | `batch/STORY-90-91-92-93-94` |
| Iteration cap | 8 |
| Status | approved |
| Approved by / date | Faruk / 2026-10-01 |

## Pass/fail — product

- [ ] With a service and a known open day, Send is enabled when no quarter is selected. A closed day keeps Send off and `Salon je zatvoren taj dan.` An open day with nothing tappable keeps `Nema slobodnog termina.` and Send on. When quarters are visible and none is selected, `Možeš poslati i bez vremena.` shows; a selected quarter hides it — verify: Vitest `salonProfile.source.test.ts` and `guestQuarter.test.ts` or `salonHours.test.ts`
- [ ] `createBooking` with no `preferredTime` on an open day stores `requested`, `preferred_date`, null `preferred_starts_at`, and the service-sum duration. It still counts in `busyLevel`. A closed day is `SALON_CLOSED`. A provided time is unchanged. An intake token that will attach still rejects a missing time. Phone create still requires a time — verify: Behat `features/guest/day_only_request.feature`
- [ ] Pending queue: rows with `COALESCE(reschedule_starts_at, preferred_starts_at)` come first, soonest then `created_at`; null clocks follow, oldest `created_at` first — verify: Behat `features/owner/pending_queue.feature` (one new scenario) or `day_only_request.feature`
- [ ] Pending card and My Bookings render the date and `Bez vremena` when `preferredStartsAt` is null, not a clock. Assign taps stay absent without a start. Predloži remains the same-day form. My Bookings has no Approve / Reject until `time_proposed` — verify: Vitest `owner.test.ts` and `bookings` source or unit test
- [ ] GraphQL `preferredStartsAt` and `preferredStartsAtLabel` are nullable. Null label is not a fake clock — verify: Behat asserts null `preferredStartsAt`

## Pass/fail — architecture

Cite `docs/adr/0043-day-only-request.md` and `docs/architecture/05-Data-Model.md` (`preferred_starts_at` nullable). `requested` still does not occupy a clock.

- [ ] Nullable column via a migration. No new npm package — verify: migration under `esyres_app/database/migrations/`
- [ ] Classifier fails (PHP), so Behat runs — verify: CONTEXT classifier at verify time

## Verify commands

Same classifier and command sets as STORY-90. Expected: **Behat runs.**

## Out of scope

- Several times at once
- A counter-proposal on another day
- Assistant sends with no time
- Push, SMS, or email

## Implementer instructions

1. Read this key, `.cursor/CONTEXT.md`, `docs/stories/STORY-92.md`, and `docs/adr/0043-day-only-request.md`.
2. Stay on `batch/STORY-90-91-92-93-94`.
3. Make `preferred_starts_at` nullable. `CreateBookingInput.preferredTime` optional. Skip the picker block when the time is absent. Reject a missing time when an intake will attach. Keep phone input required.
4. Sort the pending query so null clocks are last. UI copy `Bez vremena` (`owner.noTime` and the bookings list). Send rules in the picker only.
5. Behat plus the Vitest checks. Set Loop to `STORY-92` on the story and the index.
6. On verify exit 0: commit. Message is the `# STORY-92 — …` line. Do not open a PR.
7. On the cap or a repeated failure: restore this branch to the last commit, including untracked files this story added.
