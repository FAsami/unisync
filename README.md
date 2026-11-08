# UniSync

UniSync runs a university department's class routine:

- A department admin sets up batches, sections, courses, teachers, the student
  roster and the weekly routine on the **web**.
- Students and teachers use the **mobile app** on the day. They see "My day" and
  the week, a teacher or class representative cancels, moves or re-rooms a class
  in two taps, and every student in the section gets a notice in their inbox and
  as a push.

Sign-in is passwordless: a code is sent by SMS to the number on the
department's roster.

## Layout

```
unisync/
├── api/       # The backend: ASP.NET Core 10, EF Core + PostgreSQL, SQL migrations, xUnit tests
├── mobile/    # Expo (React Native) app: students, teachers, class representatives
├── web/       # Next.js dashboard for department admins, plus the landing page
├── docs/      # VitePress documentation, published to GitHub Pages
└── scripts/   # check-all.sh (everything CI runs) and repo guardrails
```

There is one backend, the API. Its contract, `api/openapi/v1.json`, is
committed and drift-checked, and both apps generate typed clients from it.
Each app has its own `yarn.lock`: run `yarn` inside the app's directory.

## Quick start

You need the .NET 10 SDK, Docker, and Node.js 22 with Yarn 1.

```bash
docker-compose up -d postgres                       # PostgreSQL on localhost:9200

cd api
dotnet run --project src/UniSync.Api -- migrate     # build the schema
dotnet run --project src/UniSync.Api -- create-admin --phone 01712345678 \
  --first-name Ada --last-name Rahman --department-code CSE --department-name "Computer Science and Engineering"
dotnet run --project src/UniSync.Api                # http://localhost:9202/api/v1/health

cd web && cp .env.example .env.local && yarn install && yarn dev   # http://localhost:3000
cd mobile && cp .env.example .env && yarn install && yarn start    # set API_URL to your LAN IP on a phone
```

In Development, sign-in codes are printed to the API's console instead of
being sent by SMS, and push delivery is off. Sign in to the web at
`/auth/login` with the admin's number.

The full guide is at https://fasami.github.io/unisync/ (source in `docs/`).

## Checks

```bash
scripts/check-all.sh    # what CI runs: API build and tests, web and mobile lint, typecheck and tests, contract checks
cd api && UNISYNC_TEST_DB="Host=localhost;Port=9200;Username=postgres;Password=postgrespassword;Database=postgres" dotnet test
```

## Production

| Part | Where |
| --- | --- |
| API | Fly.io app `unisync-api` (`api/fly.toml`, `.github/workflows/deploy-api.yml`) |
| Web | Vercel (www.uni-sync.site) |
| Docs | GitHub Pages |
| Mobile | EAS builds to the app stores |

Production previously ran on Hasura Cloud and a Node server. `CUTOVER.md` is
the runbook for switching it to the API, step by step, with how to undo each step.

## Working with Claude Code

`CLAUDE.md` (plus `api/CLAUDE.md` and `mobile/CLAUDE.md`) describes the
architecture and the rules. `.claude/` holds:

- project skills: `/check`, `/api-endpoint`, `/consistency-audit`
- a `security-reviewer` agent
- hooks that install dependencies in cloud sessions, block edits to committed
  migrations, generated code, secrets and lockfiles, and format web files

Known issues and follow-ups are tracked in `AUDIT.md`.

## Support

Contact: foysal.developer@gmail.com
