---
name: check
description: Run UniSync's guardrails (migration rules, .NET API build and tests, web lint, typecheck, format and API types, mobile lint, typecheck, tests and API types) and fix whatever fails. Use before committing, after any change that crosses packages, or when asked whether the project is healthy.
---

# Run the project guardrails

1. Run the same checks CI runs (`.github/workflows/ci.yml`):

   ```bash
   scripts/check-all.sh                 # everything
   scripts/check-all.sh api mobile      # only what you touched (migrations|api|web|mobile)
   ```

   For the API's database tests set `UNISYNC_TEST_DB` (see `api/CLAUDE.md`); without it they're skipped, and CI runs them with `UNISYNC_REQUIRE_DB=1`. A package with no `node_modules` is skipped and the output says how to install it. In cloud sessions `.claude/hooks/session-start.sh` installs everything.

2. For each failure, find the cause and fix it. Never weaken the check to get green: no skipping tests, no `eslint-disable` without a reason in the comment, no loosening `tsconfig` or analyzer rules.

   | Failure | Usual cause |
   |---|---|
   | `api: build` → `CA....` error | Analyzers run as errors. Fix the code; suppress only with a justification attribute. |
   | `OpenApiContractTests` fails | An endpoint changed. Refresh the spec: `UPDATE_OPENAPI=1 dotnet test --filter OpenApi`, then run `yarn api:types` in `mobile/` and `web/`. |
   | `mobile/web: api types current` | `api/openapi/v1.json` changed but the client wasn't regenerated: `yarn api:types`. |
   | `migrations: guardrails` | A migration has a psql meta-command, touches `hdb_catalog`, uses a session-level `SET`, or is misnamed. |
   | `web: format` | Run `cd web && yarn format`. The PostToolUse hook formats files Claude edits. |
   | `mobile: typecheck` → cannot find module | Usually wrong letter case in an import path. Linux CI and EAS are case-sensitive. |

3. Re-run only the failing target until it passes, then run everything once more.

4. Report what failed, what you changed, and the final output. Say plainly if something is still red.
