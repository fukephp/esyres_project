# Owner worker photo shows as broken image

**Not product or architecture truth.**

## Symptom

On `/owner/salons/:id` → Radnici, a worker with an uploaded photo (Lejla) renders an empty/broken circle instead of the image. Workers without a photo show initials fine.

## Evidence

- File exists: `storage/app/public/salons/1/workers/1-<ulid>.png` (php container).
- `WorkerProfile.photoUrl` returns `/storage/<path>` (`SalonImages::publicUrl`).
- `GET http://localhost:8000/storage/salons/1/workers/…png` → **403**.
- `php` container `public/` had no `storage` entry.
- Vite (`vite.config.ts`) proxies `/storage` to `php:8000`, so the PWA got the 403 too.

Side finding: a different project's host Vite (`packiyo-app`) listens on `[::1]:5173`, so `localhost:5173` probes from PowerShell hit that server and return its HTML. Use `127.0.0.1:5173` when probing.

## Cause

`php artisan storage:link` was never run in this environment. Laravel's `public` disk serves through the `public/storage` → `storage/app/public` symlink. Without it, every `/storage/*` URL fails. That includes the salon main and gallery images.

## Fix

`docker compose exec -T php php artisan storage:link` (already listed in `esyres_app/README.md` setup). After running it, `127.0.0.1:5173/storage/…png` returns `200 image/png`. No code change.
