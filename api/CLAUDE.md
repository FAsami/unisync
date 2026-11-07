# api/

The ASP.NET Core (.NET 10) API that replaces Hasura and the Node server, built
around the flows in the UX review. It runs beside them on the same Postgres and
accepts the same tokens until the cut-over.

```
src/UniSync.Api/
  Program.cs            composition: options, data, auth, rate limits, endpoints
  Configuration/        typed options, validated at startup
  Data/                 EF Core entities mapped onto the existing schema, DbContext, MigrationRunner
  Common/               the response envelope, error codes, exception handler
  Auth/                 phone normalisation, one-time codes, tokens, sessions, /auth endpoints
  CurrentUser/          /me
  Academic/             /directory: public list of open departments, batches and sections
  AccessRequests/       request to join, plus the department admin queue (approve / reject)
  Health/               /health, /health/ready
  Sms/                  ISmsSender: BulkSMSBD (prod), console (Development only)
db/migrations/          schema changes owned by this API (NNNN_name.sql)
tests/UniSync.Api.Tests/
  Infrastructure/       PostgresFixture (throwaway DB), ApiFactory (real app, fake SMS), Seed
```

## Commands

```bash
cd api
dotnet build                     # warnings are errors (analyzers included)
dotnet test                      # unit tests; DB tests skip without UNISYNC_TEST_DB
UNISYNC_TEST_DB="Host=localhost;Port=9200;Username=postgres;Password=postgrespassword;Database=postgres" dotnet test
dotnet run --project src/UniSync.Api            # http://localhost:9202 (Development: codes print to the log)
dotnet run --project src/UniSync.Api -- migrate # apply db/migrations and exit
```

The database tests create and drop their own database. They need an admin
connection string, not your dev database's. CI sets `UNISYNC_REQUIRE_DB=1`, so a
missing database fails the run instead of skipping.

## Invariants (tests enforce these)

- **Every response is the envelope** `{ success, message, data, error: { code, message, details }, meta }`, including 401, 404, 429 and 500. Use `ApiResponse.Ok` and `ApiResponse.Fail`. Error codes live in `ErrorCodes` and are part of the contract with both apps.
- **Sign-in is passwordless and roster-only.** `/auth/code` sends a code only to an active, non-deleted account. Unknown numbers get `PHONE_NOT_REGISTERED`, so the app can offer "Request access".
- **One-time codes go through `OtpService`**, which enforces expiry, `MaxAttempts` and `MaxSendsPerHour`, and consumes a code atomically.
- **Sessions go through `SessionService`.** The row id equals the token's `sessionId`. Refresh rotates both tokens; replaying an old refresh token revokes the session.
- **Every authenticated request re-checks the session** (`BearerEvents`): a revoked session or a deleted account is refused immediately, not at token expiry.
- **Tokens stay compatible with the Node server**: HS256, the same secret, and claims `sessionId`, `userId`, `role`, `typ`, plus a unique `jti`. `TokenCompatibilityTests` builds Node-format tokens byte for byte.
- **Department admins are scoped.** An admin is role `admin` plus `account.managed_department_id`. Admin endpoints use `Policies.DepartmentAdmin` **and** filter by that department; another department's records answer 404. An admin with no department gets 403.
- **Codes are bound to their purpose** (`LOGIN`, `ACCESS_REQUEST`): a code sent for one flow can't complete another.
- **Never log codes, tokens or SMS gateway URLs.** The console SMS sender is refused at startup outside Development.

## Migrations

- `db/migrations/NNNN_short_name.sql`: next number, plain SQL, embedded in the assembly, applied once in name order by `MigrationRunner` and recorded in `api.schema_migrations`.
- **Never edit a committed migration**; add a new one. The guard hook blocks edits.
- The Hasura migrations in `hasura/migrations` are the frozen baseline. Tests apply them first; production already has them.
- No psql meta-commands and nothing in `hdb_catalog` (`scripts/check-hasura-metadata.py` checks both folders).

## Adding an endpoint

See the `/api-endpoint` skill.
