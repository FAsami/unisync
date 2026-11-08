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
  Schedule/             /me/today, /me/week (resolved classes); /classes/{routineId}/{date}/cancel|move|room and undo
  Notifications/        inbox (/me/notifications), devices (/me/devices), sending (/notifications), AudienceService
  Setup/                department setup for web: /department, /batches, /sections, /courses, /teachers,
                        /students (+ /import, CR mark), /offerings, /routines, /buildings, /rooms; create-admin CLI
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
# The first department admin (nobody else can create one; safe to re-run):
dotnet run --project src/UniSync.Api -- create-admin --phone 01712345678 --first-name Ada --last-name Rahman \
  --department-code CSE --department-name "Computer Science and Engineering"
```

In production run the same against the published DLL (`dotnet UniSync.Api.dll create-admin ...`, for example
over `fly ssh console`). It creates the department if the code is new, and makes the number an admin managing it.

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
- **Time is campus time.** Class times are campus-local (`event.routine` start/end are plain `time`, Asia/Dhaka). "Now" and "today" come only from `CampusClock`, never from UTC or `DateTime.Now`. Tests set `Factory.CampusTime`.
- **One class change per occurrence** (`event.routine_exception`, mapped as `ClassChange`): `cancellation`, `reschedule` (new date and times, optional room) or `room_change`. The database checks the fields match the type. A move shows on both slots: `moved_away` on the old one, `moved` on the new one.
- **Who may change a class**: its teacher, an active CR of its section, or the admin of its department (`ClassChangeService.CanChangeAsync`). A move is refused on a section, teacher or room clash; a room change only on a room clash. The latest decision replaces the previous one.
- **Every class change notifies its section in the same transaction** by inserting into `notification.log`. Until the inbox slice lands, the legacy Hasura event trigger turns that row into a push (via the Node server). `data` values must be strings (FCM).
- **Audiences have one definition**: `AudienceService` decides who is in an audience (inbox and counts) and who may address it. A department admin may address their department, its batches and its sections; a teacher, the sections they teach; a CR, their own section. Nobody sends university-wide (no role decided). Never write audience rules anywhere else.
- **Every notification carries its own id** in `data.notificationId`, so a push opens it. `data` values are strings.
- **A push token belongs to one person**: registering a token removes it from anyone else. Logout with `deviceId` deactivates that device in the same call.
- **Codes are bound to their purpose** (`LOGIN`, `ACCESS_REQUEST`): a code sent for one flow can't complete another.
- **Never log codes, tokens or SMS gateway URLs.** The console SMS sender is refused at startup outside Development.
- **Setup routes use `MapDepartmentAdminGroup`** (`Setup/SetupScope.cs`): the DepartmentAdmin policy plus a filter that resolves the admin's department once (403 if none). Handlers read `SetupScope.DepartmentId(http)` and filter every query by it, so another department's records answer 404. Buildings and rooms are university-wide: anyone signed in lists them, any department admin edits them.
- **People are deactivated, not deleted**, and deactivating (or changing a number) revokes their sessions. Structure (batches, sections, courses, offerings, rooms) is deleted only when nothing uses it; otherwise `409 IN_USE` and the screen offers "mark inactive".
- **The roster import is all-or-nothing and idempotent on phone.** Any bad row → `400 VALIDATION_FAILED` with the full per-row result in `error.details` and nothing written; `dryRun: true` checks without writing. Students and teachers each get a profile (names for `/me`); a teacher also gets a `user.faculty` row in the department.
- **Weekly routine slots are refused on a section, teacher (any department) or room clash** on the same weekday with overlapping times and terms. Editing a slot is a `PUT` of the whole slot; deleting one also deletes its class changes. CR is a mark (`PUT/DELETE /students/{id}/class-representative`), never a role; moving a student to another section ends it.
- **Filter EF queries on entities, then project.** EF can't translate a `Where` on a record built by its constructor (that was a 500); use member-init rows (`RosterRow`, `TeacherRow`) or filter first. `AsNoTracking()` anywhere in a composed query makes the whole query untracked.

## Migrations

- `db/migrations/NNNN_short_name.sql`: next number, plain SQL, embedded in the assembly, applied once in name order by `MigrationRunner` and recorded in `api.schema_migrations`.
- **Never edit a committed migration**; add a new one. The guard hook blocks edits.
- The Hasura migrations in `hasura/migrations` are the frozen baseline. Tests apply them first; production already has them.
- No psql meta-commands and nothing in `hdb_catalog` (`scripts/check-hasura-metadata.py` checks both folders).

## Adding an endpoint

See the `/api-endpoint` skill.
