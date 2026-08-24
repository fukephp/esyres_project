---
name: deploy-staging
description: Deploy Esyres to the staging environment. Use when the user asks to deploy, ship, or release to staging, or mentions staging URLs, preview deploys, or a staging checklist.
---

# Deploy staging

No application deploy pipeline exists in this repo yet. Target stack is documented in `docs/architecture/` (Laravel, React PWA, Docker). Do not invent hosting, secrets, or extra services. Follow what is actually in the repo; ask if a step is missing.

## Instructions

1. Read `.cursor/CONTEXT.md`. Confirm the change belongs on staging (MVP only unless asked).
2. Run `/run-tests` (or the project's real test command once one exists). Do not deploy on a red suite.
3. Check git status: no leftover debug, no `.env` / credentials in the commit.
4. Identify the real staging path from the repo (CI workflow, host dashboard, scripts). If none exists, stop and report that — do not improvise production-like infra.
5. Deploy only to staging. Never production unless the user names production.
6. Smoke the booking loop after deploy: guest discover → request (day only) → owner propose → customer confirm. Note anything that cannot be verified yet.

## Staging checklist

- [ ] Tests pass (or explicitly none exist)
- [ ] Secrets not committed
- [ ] Target is staging, not production
- [ ] Smoke path recorded in the reply

## After deploy

Reply with: what shipped, staging URL if known, smoke results, and follow-ups. Do not claim a deploy succeeded without a command or dashboard result.
