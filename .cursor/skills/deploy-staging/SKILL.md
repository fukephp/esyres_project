---
name: deploy-staging
description: Deploy to the staging environment. Use when the user asks to deploy, ship, or release to staging, or mentions staging URLs, preview deploys, or a staging checklist.
---

# Deploy staging

No application deploy pipeline is assumed in this framework. Follow what is actually in the repo and in `docs/architecture/`. Do not invent hosting, secrets, or extra services. Ask if a step is missing.

## Instructions

1. Read `.cursor/CONTEXT.md`. Confirm the change belongs on staging (current phase only unless asked).
2. Run `/run-tests` (or the project's real test command once one exists). Do not deploy on a red suite.
3. Check git status: no leftover debug, no `.env` / credentials in the commit.
4. Identify the real staging path from the repo (CI workflow, host dashboard, scripts). If none exists, stop and report that — do not improvise production-like infra.
5. Deploy only to staging. Never production unless the user names production.
6. Smoke the core user path after deploy (as documented in `docs/mvp/`). Note anything that cannot be verified yet.

## Staging checklist

- [ ] Tests pass (or explicitly none exist)
- [ ] Secrets not committed
- [ ] Target is staging, not production
- [ ] Smoke path recorded in the reply

## After deploy

Reply with: what shipped, staging URL if known, smoke results, and follow-ups. Do not claim a deploy succeeded without a command or dashboard result.
