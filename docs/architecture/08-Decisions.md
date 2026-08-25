# Decisions

Short ADRs so later sessions do not re-litigate the stack. Product patches live in `docs/mvp/` when a decision changed scope.

1. **Same origin via Nginx** — SPA + GraphQL + Reverb. Avoids CORS and cookie issues for a solo PWA.
2. **Sanctum cookies, not Bearer** — httpOnly session; tokens later for native.
3. **One users table + roles** — same human can book and own salons. Workers are not users.
4. **Email+password login** — phone is not the username. Guest browse stays open.
5. **Phone OTP required to send a request, optional at register** — SMS fallback and owner trust; less funnel pain than OTP-as-login.
6. **Email verified before request or owner panel** — reminders and fake-owner protection.
7. **Invite-only owners** — first 15–20 salons are provisioned, not self-serve.
8. **Lighthouse code-first, one endpoint** — PHP is the contract; codegen introspects local schema.
9. **Redis from day one** — OTP, queues, cache, Reverb.
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
24. **Ask other day = same booking row** — no duplicate busy-level.
25. **QR guest cookie ~7 days** — last salon wins; reconcile at verify.
26. **Full local compose list** — nginx, php, mysql, redis, worker, reverb, vite, mailpit.
27. **Expire → declined** — no fifth status; TTL numbers placeholder.
28. **OTP throttle in Redis** — no CAPTCHA.
29. **@dnd-kit** — same mutation as tap fallback.
30. **Limit/offset pagination** — cap `perPage`.
31. **Introspection local-only**.
32. **Per-service duration, 15-min grid** — Phase 2 “salon-wide duration only” is revoked.
33. **Proposal holds the slot** — `requested` does not.
34. **Workers inherit salon hours** — per-worker vacation still Phase 2.
