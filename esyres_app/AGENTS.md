# Esyres app

See the git root [`AGENTS.md`](../AGENTS.md) and [`.cursor/CONTEXT.md`](../.cursor/CONTEXT.md).

Commands and verify run from this folder. Product PWA is `frontend/`. Backend gate is one tagged or multi-path Behat process (`docker compose exec -T php vendor/bin/behat --tags=@<area> --format=progress --stop-on-failure`), not `php artisan test` and not an unfiltered suite. Do not pass `--suite`. PWA-only diffs skip Behat/php/mysql — see `.cursor/CONTEXT.md` frontend-only classifier. When Behat runs: slim Compose (`php` + `vite` + `mysql` + `reverb`), `up -d` then `exec -T`.
