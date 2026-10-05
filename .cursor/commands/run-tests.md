Run the project test suite and report results.

Follow `.cursor/CONTEXT.md`.

If the user named a target after this command (file, folder, or test name), run only that. Otherwise run the default project suite.

1. Detect how tests actually run in this repo (package script, Makefile, CI config, language tooling, or an application folder if one exists). Do not assume a stack.
2. If no test runner exists yet, or there is still no application code, say so and stop. Do not scaffold a framework unless the user asked.
3. Run the tests from the application folder when one exists (not the git root), unless the project documents otherwise.
   - If the user asked for Behat, named an `@tag`, or named one or more `.feature` files: one Behat process from `esyres_app/`. Named tag: `docker compose exec -T php vendor/bin/behat --tags=@<area> --format=progress --stop-on-failure` (comma-OR when they named several). Named files: the same flags with those paths in that one command and no `--tags`. Do not pass `--suite`. Do not loop the files in bash.
   - Else if the user named a frontend file/folder/test: run that Vitest (or npm script) from `esyres_app/frontend/`.
   - Else (default): run the CONTEXT **frontend-only classifier**. If it passes, from `esyres_app/frontend/` run `npm run typecheck`, `npm run test`, `npm run build` (host npm; `docker compose exec -T vite` only if that container is already up). Do not start php/mysql. If it fails, one tagged or multi-path Behat process for what changed and what that change can affect, plus those frontend commands. Do not run an unfiltered suite.
   - Fail-fast is not skipping; do not omit failures inside the selection. A green run means that selection passed. Bare `vendor/bin/behat` (pretty, unfiltered) is not the agent gate.
4. Report: command used, pass/fail counts, classifier result (skipped Behat vs ran Behat), and the first failure with file and assertion (stop-on-failure: that first red is enough).
5. If tests fail because of a change in this session, fix the failure and re-run. If they fail for missing product code, report that instead of inventing implementations.
