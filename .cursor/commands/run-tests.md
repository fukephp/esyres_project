Run the Esyres test suite and report results.

Follow `.cursor/CONTEXT.md`.

If the user named a target after this command (file, folder, or test name), run only that. Otherwise run the default project suite.

1. Detect how tests actually run in this repo (package script, Makefile, CI config, language tooling). Do not assume a stack.
2. If no test runner exists yet, say so and stop. Do not scaffold a framework unless the user asked.
3. Run the tests in the project root. Do not skip failing tests.
4. Report: command used, pass/fail counts, and the first failure with file and assertion.
5. If tests fail because of a change in this session, fix the failure and re-run. If they fail for missing product code, report that instead of inventing implementations.
