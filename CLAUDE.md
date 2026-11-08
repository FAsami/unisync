# UniSync

University scheduling, routine and notification platform. A monorepo with **no root package.json**: each app has its own `yarn.lock` (or .NET solution), so run commands inside the app directory.

| Dir | What | Stack | Dev port |
|---|---|---|---|
| `api/` | The backend: sign-in, data, setup, class changes, inbox, push (see api/CLAUDE.md) | ASP.NET Core 10, EF Core + Npgsql, xUnit | 9202 (`/api/v1`) |
| `web/` | Department admin dashboard (setup) and landing page | Next.js 15 (App Router), antd, Tailwind 4 | 3000 |
| `mobile/` | Student and teacher app (day-of-class) | Expo SDK 53, expo-router, gluestack, NativeWind | 8081 |
| `docs/` | VitePress site, deployed to GitHub Pages | | |

Postgres runs on 9200 (`docker-compose up -d postgres`).

## How it fits together

- **One backend.** Both apps call only the API. The contract is `api/openapi/v1.json`, committed and drift-checked; each app generates a typed client from it (`yarn api:types`).
- **Roles:** student, teacher, department admin; CR is a mark on a student. Sign-in is passwordless by SMS code, and only for numbers on a department's roster (others can request access).
- **Web is for setup** (department, batches, sections, courses, teachers, roster import, offerings, weekly routine, rooms, access requests). **Mobile is for the day** ("My day", schedule, cancel/move/change room, inbox, sending notices).
- **The API owns the schema** (`api/db/migrations`, applied by `migrate`), sends SMS through BulkSMSBD and pushes through FCM (`PushDispatcher`).

## Production

- API: Fly app `unisync-api` (`api/fly.toml`, `.github/workflows/deploy-api.yml`, inert until `API_DEPLOY_ENABLED`). Web: Vercel (www.uni-sync.site). Docs: GitHub Pages.
- **Production still runs the old Hasura + Node stack until `CUTOVER.md` is done.** That runbook is ordered and each step has an undo; push delivery in the API stays off (`Push:Enabled=false`) until its step 5, or every notification is pushed twice.

## Commands

```bash
scripts/check-all.sh            # every guardrail CI runs (migrations/api/web/mobile)
docker-compose up -d postgres   # Postgres on 9200 (or `docker-compose up -d` for Postgres + API)
cd api && dotnet test           # set UNISYNC_TEST_DB for database tests (api/CLAUDE.md)
cd api && dotnet run --project src/UniSync.Api                 # :9202, codes print to the log
cd api && dotnet run --project src/UniSync.Api -- create-admin ...  # first department admin
cd web    && yarn dev | yarn lint | yarn typecheck | yarn format | yarn api:types
cd mobile && yarn start | yarn lint | yarn typecheck | yarn test | yarn api:types
python3 scripts/check-migrations.py
```

## Rules

- **Run `scripts/check-all.sh` (or `/check`) before saying work is done.** CI runs the same checks.
- **API changes need tests** (`/api-endpoint`). Every endpoint declares its responses so the OpenAPI spec stays complete; refresh it with `UPDATE_OPENAPI=1`, then run `yarn api:types` in **both** `web/` and `mobile/`.
- **Never edit a committed migration**; add the next `NNNN_name.sql`. The guard hook blocks edits.
- **Generated files are read-only:** `mobile/lib/api/generated.ts` and `web/src/lib/api/generated.ts`. Regenerate them.
- **Never log tokens, codes, passwords or request bodies.** Never commit `.env` files or credentials. Update the `.env.example` templates, `appsettings*.json` (non-secret defaults only) and the secrets list in `api/fly.toml` instead.
- **Tokens:** mobile reads them only through `mobile/lib/api/session.ts`; web keeps them in httpOnly cookies and calls the API through its same-origin proxy, never from client JavaScript.
- Rules live in one place in the API: audiences in `AudienceService`, who may change a class in `ClassChangeService`, department scoping in `SetupScope`. Clients only hide buttons using API hints such as `canChange`.
- Import paths are case-sensitive on CI and EAS, even though macOS is not.

`.claude/hooks/guard-files.py` blocks edits to migrations, generated code, secrets, lockfiles and build output. `.claude/hooks/format-web.sh` runs Prettier on edited web files.

## Skills and agents

- `/check`: run and fix the guardrails.
- `/api-endpoint`: add or change an endpoint in the API, with tests.
- `/consistency-audit`: find cross-layer mismatches and update AUDIT.md.
- Agent `security-reviewer`: review auth, session, code, scoping and secret-handling diffs.
