# UniSync

University scheduling, routine and notification platform. A monorepo with **no root package.json**: each app has its own `yarn.lock`, so always run yarn inside the app directory.

| Dir | What | Stack | Dev port |
|---|---|---|---|
| `api/` | **New** .NET API replacing Hasura + `server/` (see api/CLAUDE.md) | ASP.NET Core 10, EF Core + Npgsql, xUnit | 9202 (`/api/v1`) |
| `server/` | Legacy REST API: auth, sessions, OTP, push, Hasura webhooks | Express 5, TypeScript (strict), zod, graphql-request | 9201 (`/api/v1`) |
| `hasura/` | Postgres schema, migrations, GraphQL permissions | Hasura v2 metadata v3 | 9203 (Postgres 9200) |
| `web/` | Admin dashboard and landing page | Next.js 15 (App Router), antd, Apollo 4, Tailwind 4 | 3000 |
| `mobile/` | Student and teacher app | Expo SDK 53, expo-router, Apollo 3, gluestack, NativeWind | 8081 |
| `docs/` | VitePress site, deployed to GitHub Pages | | |

## Migration in progress

The backend is moving from Hasura + `server/` to `api/` (.NET), feature by feature, shaped by the UX review decisions:
- passwordless sign-in for students on a department roster
- a "My day" home screen
- web for setup, mobile for day-of-class actions
- a real notification inbox
- roles student / teacher / department admin, with CR as a mark on a student

**New backend work goes in `api/`.** Change `server/` or Hasura only to keep today's apps working. All three share one Postgres and one JWT secret until the cut-over.

Done in `api/`: health, `/auth/code`, `/auth/verify`, `/auth/refresh`, `/auth/logout`, `/me`, `/directory`, and access requests (`/access-requests/code`, submit, plus the department admin queue with approve and reject). Next up: `/me/today`, the inbox, and class changes. The apps still call the legacy stack; switching them over is a separate step.

## How the pieces talk (legacy stack)

- Clients call the **server** for auth: `/auth/login`, `/auth/register(/verify)`, `/auth/session/{guest,refresh}`, `/auth/logout`, `/auth/reset-password(/verify)`, `/auth/account/delete`, and `/otp/{send,verify}`.
- Clients call **Hasura** directly for data, sending `x-hasura-access-token: <server JWT>`. Hasura asks the server to resolve the role through its auth webhook `POST /api/v1/auth/webhook/authorize`.
- Hasura calls the **server** for event triggers (`/webhook/events/*`) and actions. It authenticates with the `SERVER-AUTH-SECRET` header, which `requireServerSecret` checks. The `SERVER_AUTH_SECRET` value must be identical in Hasura's and the server's environments.
- The server talks to Hasura with the admin secret. Push notifications go through FCM; SMS goes through BulkSMSBD. The SMS provider is chosen from the `settings.config` row `OTP_PROVIDER`.

## Commands

```bash
scripts/check-all.sh            # every guardrail CI runs (api/server/web/mobile/hasura)
cd api && dotnet test           # .NET API; set UNISYNC_TEST_DB for database tests
docker-compose up -d            # Postgres + Hasura

cd server && yarn dev           # API on :9201 (copy env.example to .env)
cd server && yarn test          # vitest + supertest, no DB needed
cd server && yarn typecheck
cd web    && yarn dev | yarn lint | yarn typecheck | yarn format
cd mobile && yarn start | yarn lint | yarn typecheck
python3 scripts/check-hasura-metadata.py
```

## Rules

- **Run `scripts/check-all.sh` (or `/check`) before saying work is done.** CI runs the same checks, and `deploy-server` will not deploy a red server.
- **Server changes need tests** in `server/tests/`. They use the in-memory Hasura fake; see `/server-endpoint`.
- **OTP checks go through `checkAndConsumeOTP()`. Sessions go through `issueSession()`.** See `server/CLAUDE.md` for why.
- **Hasura:** never edit a committed migration, keep secret columns away from non-admin roles, and remember that `guest-consumer` means "anyone". See `/hasura-change`.
- **Generated files are read-only:** `server/src/types/generated.ts` and `mobile/lib/graphql/generated.ts`. Regenerate them with codegen.
- **Never log tokens, OTPs, passwords or request bodies.** Never commit `.env` files. Update the `env.example` / `.env.example` templates instead.
- Import paths are case-sensitive on CI and EAS, even though macOS is not.
- When changing an endpoint's path or response shape, update **both** clients (`web/src`, `mobile/lib|utils|app`).

`.claude/hooks/guard-files.py` blocks edits to migrations, generated code, secrets, lockfiles and build output. `.claude/hooks/format-web.sh` runs Prettier on edited web files.

## Known sharp edges (see AUDIT.md for the full list)

- Both axios clients use `validateStatus: () => true`, so axios never throws. Always check `response.status`.
- The server returns errors in two shapes: REST `{success:false,error:{message,code}}`, and action-style `{message,extensions:{code}}` from `/otp/*` and `/auth/account/delete`. On web, read them with `getApiErrorMessage`.
- Users with role `admin` map to Hasura's built-in **superuser** `admin` role, which bypasses all permissions. The manage and dashboard screens currently depend on this.
- `mobile/lib/auth.ts` and `mobile/utils/token.ts` duplicate the refresh logic and each has its own event emitter.

## Skills and agents

- `/check`: run and fix the guardrails.
- `/api-endpoint`: add or change an endpoint in the .NET API, with tests.
- `/server-endpoint`: change the legacy Node server (keep-alive fixes only), with tests.
- `/hasura-change`: schema, permission and migration workflow, plus codegen.
- `/consistency-audit`: find cross-layer mismatches and update AUDIT.md.
- Agent `security-reviewer`: review auth, session, OTP and permission diffs.
