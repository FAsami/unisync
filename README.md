# UniSync

A full-stack university scheduling and notification platform: a mobile app, an admin web dashboard, a REST API server and Hasura GraphQL.

## 🏗️ Architecture

```
unisync/
├── mobile/          # Expo / React Native app (students, teachers, CRs)
├── web/             # Next.js admin dashboard + landing page
├── api/             # New ASP.NET Core API (replacing server/ and Hasura)
├── server/          # Legacy Express API: auth, sessions, OTP, push, Hasura webhooks
├── hasura/          # Postgres migrations + GraphQL metadata/permissions
├── docs/            # VitePress documentation site
├── scripts/         # Repo-wide checks (check-all.sh, Hasura metadata guard)
└── docker-compose.yml
```

Each app has its own `yarn.lock`. Run `yarn` inside the app directory; there is no root package.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (22 recommended) and Yarn 1
- Docker & Docker Compose
- [Hasura CLI](https://hasura.io/docs/latest/hasura-cli/install-hasura-cli/)
- Python 3 with PyYAML (only for `scripts/check-hasura-metadata.py`)

### 1. Start Postgres and Hasura

```bash
docker-compose up -d
```

- PostgreSQL: `localhost:9200`
- Hasura: http://localhost:9203 (dev admin secret: `123`)

### 2. Apply the schema and metadata

```bash
cd hasura
export HASURA_GRAPHQL_ENDPOINT=http://localhost:9203 HASURA_GRAPHQL_ADMIN_SECRET=123
hasura migrate apply --database-name default
hasura metadata apply
```

### 3. Start the API server

```bash
cd server
cp env.example .env
yarn install
yarn dev            # http://localhost:9201/api/v1/health
```

`SERVER_AUTH_SECRET` in `server/.env` must match the value in `docker-compose.yml`. Hasura sends it on every webhook call.

### 3b. Start the new .NET API (optional while the migration runs)

```bash
cd api
dotnet run --project src/UniSync.Api -- migrate   # once, after step 2
dotnet run --project src/UniSync.Api              # http://localhost:9202/api/v1/health
```

Needs the [.NET 10 SDK](https://dotnet.microsoft.com/download). In Development, sign-in codes are printed to the log instead of sent by SMS. See `api/CLAUDE.md`.

### 4. Start the web dashboard

```bash
cd web
cp .env.example .env.local
yarn install
yarn dev            # http://localhost:3000
```

### 5. Start the mobile app

```bash
cd mobile
cp .env.example .env    # use your LAN IP instead of localhost on a real device
yarn install
yarn start
```

## ✅ Checks and tests

```bash
scripts/check-all.sh          # everything CI runs
cd server && yarn test        # API tests (no database needed)
```

CI (`.github/workflows/ci.yml`) runs the following on every PR:
- api: .NET build, tests against Postgres 17, Docker image
- server: typecheck, tests, build
- web: lint, typecheck, Prettier, build
- mobile: lint, typecheck
- Hasura metadata guardrails

Server deploys to Fly.io only after the same checks pass.

## 🔧 Code generation

With Hasura running:

```bash
cd server && yarn codegen
cd mobile && yarn generate-types
```

## 🤖 Working with Claude Code

`CLAUDE.md` describes the architecture and rules. `.claude/` contains:
- project skills: `/check`, `/api-endpoint`, `/server-endpoint`, `/hasura-change`, `/consistency-audit`
- a `security-reviewer` agent
- hooks that install dependencies in cloud sessions, block edits to migrations, generated code, secrets and lockfiles, and format web files

Known issues and their status are tracked in `AUDIT.md`.

## 📞 Support

- Contact: foysal.developer@gmail.com
