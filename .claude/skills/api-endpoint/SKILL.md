---
name: api-endpoint
description: Add or change an endpoint in the .NET API (api/), with its validation, authorisation, envelope responses, migration and tests. Use for any work under api/src or api/db.
---

# Add an endpoint to the .NET API

Read `api/CLAUDE.md` first: its invariants are not optional.

1. **Shape it around the task, not a table.** For example `GET /me/today` returns resolved classes, not raw routine rows. Check the endpoint list in the UX review doc ("Effect on the .NET API"). An endpoint not listed there is a product decision, so say so.
2. **Place it in a feature folder** (`Auth/`, `CurrentUser/`, or a new one) as a static `MapXxxEndpoints(this RouteGroupBuilder api)`, and register it in `Program.cs` under `/api/v1`.
3. **Authorise explicitly.** Use `.RequireAuthorization()` unless the endpoint is truly public. Check scope in the handler: a CR may act only on their own section, and a department admin only on their own department. Missing rights return `403 FORBIDDEN`.
4. **Validate input by hand** at the top of the handler. Return `ApiResponse.Fail(http, 400, ErrorCodes.X, "message a student understands")`. Add new codes to `ErrorCodes`.
5. **Respond** with `ApiResponse.Ok(http, "message", data)`. Records serialise as camelCase.
6. **Schema change?** Add `api/db/migrations/NNNN_name.sql` and map any new columns in `Data/`. Run `python3 scripts/check-migrations.py`.
7. **Abuse limits.** Anything that sends SMS or checks a secret gets a rate-limit policy, either per IP (`RateLimitOptions`) or per subject (in the database, like `OtpService.SendLimitReachedAsync`).
8. **Tests (required)** in `api/tests/UniSync.Api.Tests`:
   - Integration tests use `[Collection(DatabaseTests.Name)]`, `ApiFactory`, and `Seed`.
   - Cover the happy path, invalid input, unauthenticated access, wrong-scope access (403), and every side effect, asserted in the database.
   - Break the rule you're testing once, confirm a test fails, then restore it.
9. **Clients.** Regenerate or update the TypeScript client from `/openapi/v1.json`, and update the app screens that use it.
10. Run `scripts/check-all.sh migrations api` with `UNISYNC_TEST_DB` set, before saying it's done.
