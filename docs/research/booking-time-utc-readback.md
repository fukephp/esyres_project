# Booking time stored UTC, read as Sarajevo

**Not product or architecture truth.** Diagnosis of the 2-hour-early clock on Telefon and guest Zahtjev. Architecture intent stays in [docs/architecture/05-Data-Model.md](../architecture/05-Data-Model.md) and decision 19 in [docs/architecture/08-Decisions.md](../architecture/08-Decisions.md): instants are stored UTC; `APP_TIMEZONE=Europe/Sarajevo`.

## Symptom

Picking 15:00 (or 14:45) in owner Telefon or the guest request picker saved a time two hours earlier on the board. September 2026 is CEST (UTC+2). In winter the same bug is one hour.

## Evidence

Local `esyres` rows, read before the fix (tinker):

| id | origin | raw `preferred_starts_at` | API ISO |
|----|--------|---------------------------|---------|
| 17 | phone | `2026-09-30 12:45:00` | `2026-09-30T10:45:00+00:00` |

The caller picked 14:45. The column is the correct UTC wall clock. Eloquent's `datetime` cast read that string in `Europe/Sarajevo`, then `Booking::preferredStartsAtIso()` called `->utc()` again. The board (`formatSarajevoTime`) showed 12:45.

Writers that return `$local->utc()`: `PreferredClock::parse`, `CreateBooking`, `CreatePhoneBooking`, `ProposeTime`. `CreatePhoneBooking` already compensated overlap with an `$asStored` parse back into the app timezone.

`RequestReschedule` did the opposite: `PreferredClock::parse(...)->timezone('Europe/Sarajevo')`, so the overlay column held a Sarajevo wall clock. GraphQL happened to be right (`16:00` local → `2026-08-31T14:00:00+00:00`). Raw was `15:00:00` for a `15:00` ask, not `13:00:00`.

## Cause

Eloquent `datetime` writes `format('Y-m-d H:i:s')` in the Carbon's own timezone and reads the string in `APP_TIMEZONE`. A UTC Carbon therefore round-trips as "UTC digits treated as Sarajevo", then a second `->utc()` on the way out shifts again.

## Fix

`App\Casts\UtcDatetime` on `preferred_starts_at`, `proposed_starts_at`, and `reschedule_starts_at`:

- set: any instant → UTC `Y-m-d H:i:s`
- get: parse that string as UTC, then `APP_TIMEZONE`

`created_at` and the other timestamps stay on the default cast. They already round-trip in the app timezone.

Dropped the `$asStored` overlap hack. `RequestReschedule` stores the UTC instant from `PreferredClock` and lets the cast write it. `SalonWeekStats` reads the cast attribute (it is a `Booking` model, not a raw UTC string). Seeders and Behat fixtures pass Sarajevo Carbons; the cast converts them on write, so existing hour assertions stay local.

Existing preferred and proposed rows need no migration: their raw values were already UTC. Reschedule overlays written before this cast were local wall clocks. Local `esyres` had none (`reschedule_starts_at` count 0). Behat rebuilds `esyres_test`.

## Loop

Red, then green, on three Behat scenarios (phone, guest `createBooking`, reschedule) at `15:00`:

- before: phone and guest ISO `T11:00:00+00:00`; reschedule raw `15:00:00`
- after: ISO `T13:00:00+00:00` and raw `13:00:00` for all three

After the cast, booking 17 reads `iso=2026-09-30T12:45:00+00:00` from the same raw `12:45:00`, which is 14:45 in Sarajevo.
