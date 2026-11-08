# Installation

Run the whole stack on your machine: PostgreSQL, the API, the mobile app and
the web dashboard.

## Prerequisites

- [.NET SDK 10](https://dotnet.microsoft.com/download) (the exact version is in `api/global.json`)
- Docker with Docker Compose, for PostgreSQL
- Node.js 22 and Yarn 1, for the mobile app, web and docs. Each app has its own
  `yarn.lock`: run `yarn` inside the app's directory, since there is no root `package.json`.
- For the mobile app on a device: Expo Go, or an Android/iOS development build

## 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

PostgreSQL listens on `localhost:9200` (user `postgres`, password
`postgrespassword`, database `unisync`). That matches the API's
`appsettings.Development.json`.

## 2. Create the schema

```bash
cd api
dotnet run --project src/UniSync.Api -- migrate
```

`migrate` applies every file in `api/db/migrations` that hasn't run yet and
records it in `api.schema_migrations`. On an empty database it starts with
`0000_baseline.sql`. On a database that already has that schema, it records the
baseline without running it.

## 3. Run the API

```bash
dotnet run --project src/UniSync.Api     # http://localhost:9202/api/v1/health
```

In Development:

- **SMS isn't sent.** The sign-in code is printed to the API's console instead, as
  "… to +8801…: 123456 is your UniSync sign-in code".
- **Push delivery is off** (`Push:Enabled=false`). Notices still reach the inbox.
- The JWT secret is a development value from `appsettings.Development.json`.

Configuration uses the standard ASP.NET Core keys. Set them in
`appsettings.*.json` or as environment variables with `__` between levels, for
example `ConnectionStrings__Default`, `Auth__JwtSecret`, `Sms__Provider`,
`Push__Enabled` and `Push__FcmServiceAccountJson`.

## 4. Create the first department admin

Only the command line can create the first admin. After that, everything is
done in the dashboard.

```bash
dotnet run --project src/UniSync.Api -- create-admin \
  --phone 01712345678 --first-name Ada --last-name Rahman \
  --department-code CSE --department-name "Computer Science and Engineering"
```

- If the department doesn't exist, it is created.
- The number becomes an admin managing that department.
- Running the command again changes nothing.
- If the code already exists, `--department-name` must match that department's name exactly.

## 5. Run the web dashboard

```bash
cd web
cp .env.example .env.local      # set API_URL to http://localhost:9202
yarn install
yarn dev                        # http://localhost:3000
```

The browser only ever talks to the Next.js server. That server forwards API
calls to `API_URL` and keeps the session tokens in httpOnly cookies. Sign in at
`/auth/login` with the admin's number and the code from the API console.

## 6. Run the mobile app

```bash
cd mobile
cp .env.example .env            # API_URL=http://localhost:9202
yarn install
yarn start
```

`API_URL` is the API's origin, with no `/api/v1`. On a physical phone use your
computer's LAN address instead of `localhost`.

To see the screens without a device, `mobile/web-preview` renders the app in a
phone-sized browser against a running API; see `mobile/CLAUDE.md`.

## Tests and checks

```bash
# API: unit tests, plus database tests when a Postgres admin connection is given
cd api
UNISYNC_TEST_DB="Host=localhost;Port=9200;Username=postgres;Password=postgrespassword;Database=postgres" dotnet test

# Mobile
cd mobile && yarn lint && yarn typecheck && yarn test

# Web
cd web && yarn lint && yarn typecheck && yarn build

# Everything CI runs
scripts/check-all.sh
```

The database tests create and drop their own throwaway databases, which is why
they need an admin connection string.

## When the API changes

The contract `api/openapi/v1.json` is committed, and a test fails if it drifts
from the code. After changing an endpoint:

```bash
cd api && UPDATE_OPENAPI=1 dotnet test --filter OpenApi   # rewrite the spec
cd mobile && yarn api:types                               # regenerate lib/api/generated.ts
cd web && yarn api:types                                  # regenerate the web client
```
