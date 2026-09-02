# Decisions

Short ADRs so later sessions do not re-litigate the stack. Product patches live in `docs/mvp/` when a decision changed scope. After `esyres_app/` exists, **grill-with-docs** also writes `docs/adr/`; if that ADR changes a locked stack choice, update this file too.

1. **Same origin via Nginx** — SPA + GraphQL + Reverb. Avoids CORS and cookie issues for a solo PWA.
2. **Sanctum cookies, not Bearer** — httpOnly session; tokens later for native.
3. **One users table + roles** — same human can book and own salons. Workers are not users.
4. **Email+password login** — phone is not the username. Guest browse stays open.
5. **Phone OTP required to send a request and to respond to a counter-proposal, optional at register** — SMS fallback and owner trust; less funnel pain than OTP-as-login. Phone stored as E.164, any country (see `docs/adr/0006-phone-e164-any-country.md`). Customer respond mutations share the `createBooking` gates (`docs/adr/0011-customer-respond-same-verify-gates.md`). Exception: `APP_ENV=local` treats phone as verified for gates and GraphQL fields; timestamps stay null (`docs/adr/0013-local-skip-verification-gates.md`).
6. **Email verified before request or owner panel** — reminders and fake-owner protection. Exception: `APP_ENV=local` treats email as verified for gates and GraphQL fields; timestamps stay null (`docs/adr/0013-local-skip-verification-gates.md`).
7. **Invite-only owners** — first 15–20 salons are provisioned, not self-serve.
8. **Lighthouse code-first, one endpoint** — PHP is the contract; codegen introspects local schema. Exception: email verification completes via Laravel signed GET (`verification.verify`), not a GraphQL mutation. See `docs/adr/0003-email-verify-signed-get.md`.
9. **Redis from day one** — OTP, queues, cache, Reverb. Slim Compose still has no redis service (ADR 0001 / #36). OTP codes and throttle use Laravel Cache until Redis is the cache driver; see `docs/adr/0005-otp-in-laravel-cache.md`.
10. **One PWA, lazy owner routes** — one QR host, one cookie, one service worker.
11. **Apollo + codegen** — subscriptions and typed operations.
12. **Tailwind, not Bootstrap** — two surfaces (funnel vs dense grid) without a generic kit.
13. **No map SDK** — geo-sorted list is enough for Sarajevo density.
14. **Laravel Storage, GraphQL multipart** — few salon photos; no Spatie.
15. **i18next, `bs` only** — no language switcher at MVP.
16. **Busy-level on the server** — one place for thresholds.
17. **Behat + Vitest + Playwright** — Behat-only backend gate (no Pest, no parallel PHPUnit suite). Behat is GraphQL-over-HTTP, not Mink; verify with `vendor/bin/behat`. Playwright remains frontend E2E. No Storybook.
18. **SMS as an interface** — vendor not contracted in docs.
19. **Sarajevo dates, UTC datetimes** — day-level booking must not shift at midnight UTC.
20. **Integer feninga** — no float money.
21. **Bigint IDs** — no UUID PK at this size.
22. **Owner salon switcher** — many `Salon` rows, each a separate customer profile. Not chain multi-location (shared workers). Receptionist roles still Phase 2.
23. **VAPID web push** — no OneSignal.
24. **Ask other day or time = same booking row** — no duplicate busy-level.
25. **QR guest cookie ~7 days** — last salon wins; reconcile at verify.
26. **Full local compose list** — nginx, php, mysql, redis, worker, reverb, vite, mailpit.
27. **Expire → declined** — no fifth status; TTL numbers placeholder.
28. **OTP throttle in cache** — no CAPTCHA. Same Laravel Cache store as codes (Redis when that service lands). See ADR 0005.
29. **@dnd-kit** — same mutation as tap fallback.
30. **Limit/offset pagination** — cap `perPage`.
31. **Introspection local-only**.
32. **Per-service duration, 15-min grid** — Phase 2 “salon-wide duration only” is revoked.
33. **Proposal holds the slot** — `requested` does not.
34. **Workers inherit salon hours** — per-worker vacation still Phase 2.
35. **Assistant v1 is scripted UI + existing GraphQL** — deterministic salon-profile chat (service → worker → day/busy → 1–3 preferred times → confirm → OTP) calling the same `createBooking` as the picker. No LLM vendor, no GoHighLevel, no Meta/WhatsApp/Viber in v1. Those are explicit later decisions. `requested` still does not hold a slot.
36. **App root is `esyres_app/`** — Laravel at that folder, product PWA at `esyres_app/frontend/`, marketing at `esyres_app/marketing/`. No git-root `backend/` or `frontend/`. Slim Compose in `esyres_app/` is `php` + **vite** + **mysql** + **reverb** (Behat dedicated test DB). Verify is `docker compose up -d` then `exec -T`, not `compose run`. Decision 26’s remaining services (nginx, redis, worker, mailpit) stay the target. See `docs/adr/0001-mysql-in-slim-compose.md`, `docs/adr/0012-long-lived-slim-compose.md`, and `docs/adr/0014-reverb-in-slim-compose.md`.
