---
name: check
description: Run UniSync's guardrails (server tests and typecheck, web lint, typecheck and format, mobile lint and typecheck, Hasura metadata rules) and fix whatever fails. Use before committing, after any change that crosses packages, or when asked whether the project is healthy.
---

# Run the project guardrails

1. Run the same checks CI runs (`.github/workflows/ci.yml`):

   ```bash
   scripts/check-all.sh                 # everything
   scripts/check-all.sh server hasura   # only what you touched
   ```

   A package with no `node_modules` is skipped and the output says how to install it. In cloud sessions `.claude/hooks/session-start.sh` installs everything.

2. For each failure, find the cause and fix it. Never weaken the check to get green: no skipping tests, no `eslint-disable` without a reason in the comment, no loosening `tsconfig`, no allow-listing a column in `scripts/check-hasura-metadata.py`.

   | Failure | Usual cause |
   |---|---|
   | `server: test` → `fakeHasura: no handler registered for operation "X"` | The code sends a new GraphQL operation. Register it in the test with `fakeHasura.on("X", ...)`. |
   | `graphql-documents.test.ts` | A query declares a variable it doesn't use, or uses one it doesn't declare. Hasura rejects both at runtime. |
   | `hasura: ... can select secret column` | A role was given `password`, `access_token`, `refresh_token` or `otp_hash`. Remove the column from that role's permission. |
   | `hasura: tables.yaml includes X which does not exist` | A table file was deleted or renamed without updating `tables.yaml`. |
   | `web: format` | Run `cd web && yarn format`. The PostToolUse hook formats files Claude edits. |
   | `mobile: typecheck` → cannot find module | Usually wrong letter case in an import path. Linux CI and EAS are case-sensitive. |

3. Re-run only the failing target until it passes, then run everything once more.

4. Report what failed, what you changed, and the final output. Say plainly if something is still red.
