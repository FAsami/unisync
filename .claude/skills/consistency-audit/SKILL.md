---
name: consistency-audit
description: Audit UniSync for cross-layer inconsistencies, where the .NET API, its OpenAPI contract, the web and mobile clients, env/config and docs disagree, and record findings in AUDIT.md. Use when asked what is broken, to review project health, or before a release.
---

# Cross-layer consistency audit

UniSync has three layers that must agree: `api/` (ASP.NET Core, the only backend), `web/` (Next.js, department admin setup) and `mobile/` (Expo, day-of-class). The contract between them is `api/openapi/v1.json`; both clients generate types from it. Most real bugs live where the types can't see: behaviour, error codes, config and docs.

Run `scripts/check-all.sh` first, so tooling failures are separated from logic bugs.

## Contract checks

1. **Spec is current and complete.** `OpenApiContractTests` passes, every endpoint declares `.Returns<T>()`, and no two public types share a schema name. Both clients' `generated.ts` are current.
2. **Every client call exists.** List calls with `grep -rn "api\.\(GET\|POST\|PUT\|PATCH\|DELETE\)(" web/src mobile/lib mobile/app mobile/components mobile/contexts` and check each path and body against the spec. Look for paths built by string concatenation that bypass the typed client.
3. **Error handling.** Clients read the envelope (`success`, `error.code`, `error.message`) and branch on `ErrorCodes` values that the API actually returns for that endpoint (e.g. `PHONE_NOT_REGISTERED`, `IN_USE`, `ALREADY_EXISTS`, `SESSION_REVOKED`). Show `error.message`: it is written for people.
4. **Auth.** Mobile: tokens only in `lib/api/session.ts`, single in-flight refresh, sign-out deactivates the device. Web: tokens only in httpOnly cookies, the same-origin proxy refreshes once and rotates cookies, middleware guards `/dashboard`, non-admins are turned away.
5. **Rules live in one place.** Audience rules only in `AudienceService`, class-change permission only in `ClassChangeService`, department scoping via `SetupScope`. Clients may hide buttons using API hints like `canChange`, but must not re-implement the rule.
6. **Time.** Class times are campus-local (`CampusClock`, Asia/Dhaka). Clients must not convert them from UTC.
7. **Env and config.** Every setting the API reads is documented in `api/fly.toml` (secrets list) and `api/src/UniSync.Api/appsettings*.json`; every `process.env.X` in a client appears in its `.env.example`; ports agree with `docker-compose.yml` (Postgres 9200, API 9202) and the docs.
8. **Dependencies.** Expo SDK alignment (`cd mobile && npx expo install --check`), Next and `eslint-config-next` majors match, no unused dependencies.
9. **Docs.** Commands in `README.md`, `CLAUDE.md` files, `CUTOVER.md` and `docs/` actually run, and linked files exist.

## Output

Update `AUDIT.md`:
- Move fixed items to "Fixed", with the commit hash.
- Add new findings under the right severity, using the format `file:line`, then what goes wrong, then the concrete consequence, then the suggested fix.

Verify every finding with evidence (code, a test, or a command) before listing it. Never list a finding you only suspect.
